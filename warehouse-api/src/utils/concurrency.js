/**
 * Concurrency Control Utilities
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ปัญหา: มีคน 2 คนกดเบิกวัสดุชิ้นเดียวกันพร้อมกัน
 *
 *   User A อ่าน stock = 10, ต้องการเบิก 8  → ตรวจผ่าน
 *   User B อ่าน stock = 10, ต้องการเบิก 7  → ตรวจผ่าน
 *   User A UPDATE stock = 10 - 8 = 2        → OK
 *   User B UPDATE stock = 10 - 7 = 3        → ❌ ผิด! ควรได้ 2-7 = -5 (ติดลบ)
 *
 * แก้ได้ 2 แนวทาง:
 *
 * 1. Pessimistic Locking  → SELECT ... FOR UPDATE (lock row ก่อน)
 *    ข้อดี: ป้องกันได้ 100%  ข้อเสีย: อาจ deadlock ถ้า lock นาน
 *
 * 2. Optimistic Locking   → ใช้ version number เปรียบเทียบตอน UPDATE
 *    ข้อดี: performance ดีกว่า  ข้อเสีย: ต้อง retry เมื่อ conflict
 *
 * เราใช้ Pessimistic สำหรับ stock (critical) + Optimistic สำหรับเอกสาร
 * ─────────────────────────────────────────────────────────────────────────────
 */

import prisma from "../config/prisma.js";
import { AppError } from "../middleware/errorMiddleware.js";

// ── PESSIMISTIC LOCKING: SELECT FOR UPDATE ─────────────────────────────────────

/**
 * เบิกวัสดุด้วย Pessimistic Lock
 * ใช้ raw SQL "SELECT ... FOR UPDATE" เพื่อ lock row ใน transaction
 *
 * @param {string} materialId
 * @param {string} locationId
 * @param {number} quantityToDeduct
 * @param {string} userId
 * @param {string} referenceId  - เช่น materialIssueId
 * @param {string} note
 * @param {Object} auditMeta    - { ipAddress, userAgent }
 */
export const deductStockWithLock = async (
  materialId,
  locationId,
  quantityToDeduct,
  userId,
  referenceId,
  note = "",
  auditMeta = {}
) => {
  return prisma.$transaction(
    async (tx) => {
      // 1. Lock แถว stock ด้วย SELECT FOR UPDATE
      //    ถ้ามี transaction อื่น lock อยู่ → จะรอจนกว่าจะปลดล็อก
      const locked = await tx.$queryRaw`
        SELECT id, quantity::float AS quantity
        FROM stock
        WHERE material_id = ${materialId}::uuid
          AND location_id = ${locationId}::uuid
        FOR UPDATE
      `;

      if (!locked || locked.length === 0) {
        throw new AppError("Stock record not found", 404);
      }

      const currentQty = Number(locked[0].quantity);

      // 2. ตรวจสอบ stock เพียงพอหลัง lock (ป้องกัน race condition)
      if (currentQty < quantityToDeduct) {
        throw new AppError(
          `Insufficient stock. Available: ${currentQty}, Requested: ${quantityToDeduct}`,
          400
        );
      }

      const newQty = currentQty - quantityToDeduct;

      // 3. UPDATE stock
      await tx.$executeRaw`
        UPDATE stock
        SET quantity = ${newQty}, updated_at = NOW()
        WHERE material_id = ${materialId}::uuid
          AND location_id = ${locationId}::uuid
      `;

      // 4. สร้าง StockTransaction
      const txRecord = await tx.stockTransaction.create({
        data: {
          materialId,
          locationId,
          type: "OUT",
          quantity: quantityToDeduct,
          referenceId,
          note,
          createdBy: userId,
        },
      });

      return { stockRecord: { materialId, locationId, oldQty: currentQty, newQty }, txRecord };
    },
    {
      isolationLevel: "Serializable", // ระดับ isolation สูงสุด
      timeout: 10000,                 // timeout 10 วิ
    }
  );
};

/**
 * รับสินค้าเข้า stock พร้อม lock (ป้องกันการรับซ้ำ)
 */
export const addStockWithLock = async (
  materialId,
  locationId,
  quantityToAdd,
  userId,
  referenceId,
  note = ""
) => {
  return prisma.$transaction(
    async (tx) => {
      // Lock หรือสร้าง stock row
      await tx.$executeRaw`
        INSERT INTO stock (id, material_id, location_id, quantity, updated_at)
        VALUES (gen_random_uuid(), ${materialId}::uuid, ${locationId}::uuid, 0, NOW())
        ON CONFLICT (material_id, location_id) DO NOTHING
      `;

      await tx.$queryRaw`
        SELECT id FROM stock
        WHERE material_id = ${materialId}::uuid
          AND location_id = ${locationId}::uuid
        FOR UPDATE
      `;

      await tx.$executeRaw`
        UPDATE stock
        SET quantity = quantity + ${quantityToAdd}, updated_at = NOW()
        WHERE material_id = ${materialId}::uuid
          AND location_id = ${locationId}::uuid
      `;

      const txRecord = await tx.stockTransaction.create({
        data: { materialId, locationId, type: "IN", quantity: quantityToAdd, referenceId, note, createdBy: userId },
      });

      return txRecord;
    },
    { isolationLevel: "Serializable", timeout: 10000 }
  );
};

// ── OPTIMISTIC LOCKING: VERSION-BASED ─────────────────────────────────────────

/**
 * อัปเดตสถานะเอกสาร (PO, MaterialIssue) ด้วย Optimistic Locking
 * ใช้ updatedAt เป็น version token
 *
 * @param {string} model         - prisma model name เช่น "purchaseOrder"
 * @param {string} id
 * @param {string} expectedVersion - updatedAt ที่ client อ่านมา (ISO string)
 * @param {Object} updateData    - ข้อมูลที่ต้องการ update
 * @param {number} [maxRetries=3]
 */
export const updateWithOptimisticLock = async (
  model,
  id,
  expectedVersion,
  updateData,
  maxRetries = 3
) => {
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;

    // ตรวจว่า record ยังเป็น version ที่ client รู้จักอยู่ไหม
    const current = await prisma[model].findUnique({ where: { id } });
    if (!current) throw new AppError("Record not found", 404);

    const currentVersion = current.updatedAt.toISOString();
    if (currentVersion !== expectedVersion) {
      if (attempt >= maxRetries) {
        throw new AppError(
          `Concurrency conflict: Record was modified by another user. ` +
          `Please refresh and try again. (attempt ${attempt}/${maxRetries})`,
          409 // 409 Conflict
        );
      }
      // รอสั้นๆ ก่อน retry (exponential backoff)
      await sleep(50 * Math.pow(2, attempt));
      continue;
    }

    try {
      // เพิ่มเงื่อนไข updatedAt เข้าไปใน WHERE เพื่อ atomic check
      const updated = await prisma[model].updateMany({
        where: {
          id,
          updatedAt: current.updatedAt, // ถ้ามีคนแก้ไปแล้ว WHERE นี้จะ match 0 row
        },
        data: updateData,
      });

      if (updated.count === 0) {
        // มีคนอื่นแก้ไปแล้วพอดี → retry
        if (attempt >= maxRetries) {
          throw new AppError(
            "Concurrency conflict after update attempt. Please try again.",
            409
          );
        }
        await sleep(50 * Math.pow(2, attempt));
        continue;
      }

      // คืน record ที่อัปเดตแล้ว
      return prisma[model].findUnique({ where: { id } });
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw err;
    }
  }
};

// ── DISTRIBUTED LOCK (Redis-ready stub) ───────────────────────────────────────

/**
 * Simple in-memory lock สำหรับ single-instance (production ควรใช้ Redis Redlock)
 * ป้องกัน request เดียวกันถูก process ซ้ำในเวลาสั้นๆ
 */
const locks = new Map();

export const acquireLock = (key, ttlMs = 5000) => {
  if (locks.has(key)) {
    return false; // locked
  }
  locks.set(key, Date.now());
  setTimeout(() => locks.delete(key), ttlMs); // auto-release
  return true;
};

export const releaseLock = (key) => {
  locks.delete(key);
};

/**
 * Wrapper สำหรับ critical section ที่ต้องการ mutex
 * @example
 *   await withLock(`issue:${issueId}`, async () => { ... })
 */
export const withLock = async (key, fn, ttlMs = 5000) => {
  const acquired = acquireLock(key, ttlMs);
  if (!acquired) {
    throw new AppError(
      "Another operation is currently processing this resource. Please try again.",
      429 // Too Many Requests
    );
  }
  try {
    return await fn();
  } finally {
    releaseLock(key);
  }
};

// ── HELPERS ────────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
