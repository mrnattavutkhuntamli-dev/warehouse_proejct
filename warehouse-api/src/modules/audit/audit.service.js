import prisma from "../../config/prisma.js";
import { getPagination, buildPaginationMeta } from "../../utils/pagination.js";

/**
 * คำนวณ diff ระหว่าง oldValues กับ newValues
 * คืนค่าเฉพาะ field ที่มีการเปลี่ยนแปลง
 */
export const computeDiff = (oldValues, newValues) => {
  if (!oldValues || !newValues) return null;
  const diff = {};
  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
  for (const key of allKeys) {
    const before = oldValues[key];
    const after = newValues[key];
    // เปรียบเทียบแบบ JSON string เพื่อรองรับ nested object
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      diff[key] = { before, after };
    }
  }
  return Object.keys(diff).length > 0 ? diff : null;
};

/**
 * บันทึก audit log
 * @param {Object} params
 * @param {string} params.userId      - UUID ของ user ที่ทำ action
 * @param {string} params.action      - AuditAction enum
 * @param {string} params.entity      - ชื่อ model เช่น "Stock", "MaterialIssue"
 * @param {string} params.entityId    - UUID ของ record ที่ถูกแก้ไข
 * @param {Object} [params.oldValues] - ข้อมูลก่อนเปลี่ยน
 * @param {Object} [params.newValues] - ข้อมูลหลังเปลี่ยน
 * @param {string} [params.ipAddress]
 * @param {string} [params.userAgent]
 * @param {string} [params.note]
 * @param {Object} [tx]               - Prisma transaction client (optional)
 */
export const log = async (
  { userId, action, entity, entityId, oldValues, newValues, ipAddress, userAgent, note },
  tx = prisma
) => {
  // ลบ field ที่ sensitive ออกก่อนบันทึก (เช่น password)
  const sanitize = (obj) => {
    if (!obj) return obj;
    const { passwordHash, password, ...rest } = obj;
    return rest;
  };

  const sanitizedOld = sanitize(oldValues);
  const sanitizedNew = sanitize(newValues);
  const diff = computeDiff(sanitizedOld, sanitizedNew);

  try {
    return await tx.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId,
        oldValues: sanitizedOld ? sanitizedOld : undefined,
        newValues: sanitizedNew ? sanitizedNew : undefined,
        diff: diff || undefined,
        ipAddress,
        userAgent,
        note,
      },
    });
  } catch (err) {
    // Audit log ไม่ควร throw error ไปรบกวน main flow
    console.error("[AuditLog] Failed to write audit:", err.message);
    return null;
  }
};

/**
 * ดู audit logs พร้อม pagination + filter
 */
export const getLogs = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};

  if (query.entity) where.entity = query.entity;
  if (query.entityId) where.entityId = query.entityId;
  if (query.userId) where.userId = query.userId;
  if (query.action) where.action = query.action;
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) where.createdAt.lte = new Date(query.to);
  }

  const [data, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, employeeCode: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

/**
 * ดู history ของ entity ใดเจาะจง
 */
export const getEntityHistory = async (entity, entityId) => {
  return prisma.auditLog.findMany({
    where: { entity, entityId },
    include: {
      user: { select: { id: true, name: true, employeeCode: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * สรุป audit stats
 */
export const getStats = async (days = 7) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await prisma.$queryRaw`
    SELECT
      action,
      entity,
      COUNT(*)::int AS count
    FROM audit_logs
    WHERE created_at >= ${since}
    GROUP BY action, entity
    ORDER BY count DESC
  `;

  const topUsers = await prisma.$queryRaw`
    SELECT
      u.id,
      u.name,
      u.employee_code,
      COUNT(a.id)::int AS action_count
    FROM audit_logs a
    JOIN users u ON u.id = a.user_id
    WHERE a.created_at >= ${since}
    GROUP BY u.id, u.name, u.employee_code
    ORDER BY action_count DESC
    LIMIT 10
  `;

  return {
    period: `Last ${days} days`,
    actionBreakdown: result,
    topActiveUsers: topUsers,
  };
};
