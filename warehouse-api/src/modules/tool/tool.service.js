import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/errorMiddleware.js";
import { getPagination, buildPaginationMeta } from "../../utils/pagination.js";

const toolInclude = {
  category: true,
  location: { include: { warehouse: { select: { id: true, name: true } } } },
};

// ── TOOL CATEGORIES ──────────────────────────────────────────────────────────

export const getAllCategories = async () =>
  prisma.toolCategory.findMany({
    include: { _count: { select: { tools: true } } },
    orderBy: { name: "asc" },
  });

export const createCategory = async (data) => prisma.toolCategory.create({ data });

export const updateCategory = async (id, data) => {
  const existing = await prisma.toolCategory.findUnique({ where: { id } });
  if (!existing) throw new AppError("Tool category not found", 404);
  return prisma.toolCategory.update({ where: { id }, data });
};

export const deleteCategory = async (id) => {
  const existing = await prisma.toolCategory.findUnique({
    where: { id },
    include: { _count: { select: { tools: true } } },
  });
  if (!existing) throw new AppError("Tool category not found", 404);
  if (existing._count.tools > 0) throw new AppError("Cannot delete category with tools", 400);
  return prisma.toolCategory.delete({ where: { id } });
};

// ── TOOLS ────────────────────────────────────────────────────────────────────

export const getAll = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { code: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.status) where.status = query.status;
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.isActive !== undefined) where.isActive = query.isActive !== "false";

  const [data, total] = await prisma.$transaction([
    prisma.tool.findMany({ where, skip, take: limit, include: toolInclude, orderBy: { code: "asc" } }),
    prisma.tool.count({ where }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

export const getById = async (id) => {
  const tool = await prisma.tool.findUnique({
    where: { id },
    include: {
      ...toolInclude,
      borrowRecords: {
        include: {
          borrower: { select: { id: true, name: true } },
          returner: { select: { id: true, name: true } },
        },
        orderBy: { borrowedAt: "desc" },
        take: 10,
      },
    },
  });
  if (!tool) throw new AppError("Tool not found", 404);
  return tool;
};

export const create = async (data) => prisma.tool.create({ data, include: toolInclude });

export const update = async (id, data) => {
  const existing = await prisma.tool.findUnique({ where: { id } });
  if (!existing) throw new AppError("Tool not found", 404);
  return prisma.tool.update({ where: { id }, data, include: toolInclude });
};

export const remove = async (id) => {
  const existing = await prisma.tool.findUnique({ where: { id } });
  if (!existing) throw new AppError("Tool not found", 404);
  return prisma.tool.update({ where: { id }, data: { isActive: false } });
};

// ── BORROW / RETURN ──────────────────────────────────────────────────────────

export const borrowTool = async (toolId, body) => {
  const tool = await prisma.tool.findUnique({ where: { id: toolId } });
  if (!tool) throw new AppError("Tool not found", 404);
  if (tool.status !== "AVAILABLE") throw new AppError("Tool is not available for borrowing", 400);

  return prisma.$transaction(async (tx) => {
    const record = await tx.toolBorrowRecord.create({
      data: {
        toolId,
        borrowedBy: body.borrowedBy,
        dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
        purpose: body.purpose,
        conditionOnBorrow: body.conditionOnBorrow,
        note: body.note,
      },
      include: {
        tool: true,
        borrower: { select: { id: true, name: true } },
      },
    });

    await tx.tool.update({ where: { id: toolId }, data: { status: "BORROWED" } });
    return record;
  });
};

export const returnTool = async (recordId, body, userId) => {
  const record = await prisma.toolBorrowRecord.findUnique({
    where: { id: recordId },
    include: { tool: true },
  });
  if (!record) throw new AppError("Borrow record not found", 404);
  if (record.returnedAt) throw new AppError("Tool already returned", 400);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.toolBorrowRecord.update({
      where: { id: recordId },
      data: {
        returnedBy: userId,
        returnedAt: new Date(),
        conditionOnReturn: body.conditionOnReturn,
        note: body.note,
      },
      include: {
        tool: true,
        borrower: { select: { id: true, name: true } },
        returner: { select: { id: true, name: true } },
      },
    });

    // Update tool status based on condition
    const newStatus = body.conditionOnReturn === "POOR" ? "MAINTENANCE" : "AVAILABLE";
    await tx.tool.update({
      where: { id: record.toolId },
      data: { status: newStatus, condition: body.conditionOnReturn },
    });

    return updated;
  });
};

export const getBorrowRecords = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.toolId) where.toolId = query.toolId;
  if (query.borrowedBy) where.borrowedBy = query.borrowedBy;
  if (query.active === "true") where.returnedAt = null;

  const [data, total] = await prisma.$transaction([
    prisma.toolBorrowRecord.findMany({
      where, skip, take: limit,
      include: {
        tool: { select: { id: true, code: true, name: true } },
        borrower: { select: { id: true, name: true } },
        returner: { select: { id: true, name: true } },
      },
      orderBy: { borrowedAt: "desc" },
    }),
    prisma.toolBorrowRecord.count({ where }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
};
