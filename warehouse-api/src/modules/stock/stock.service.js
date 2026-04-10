import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/errorMiddleware.js";
import { getPagination, buildPaginationMeta } from "../../utils/pagination.js";
import { generateCode } from "../../utils/generateCode.js";

// ── STOCK QUERY ───────────────────────────────────────────────────────────────

export const getStocks = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.materialId) where.materialId = query.materialId;
  if (query.locationId) where.locationId = query.locationId;

  const [data, total] = await prisma.$transaction([
    prisma.stock.findMany({
      where, skip, take: limit,
      include: {
        material: { select: { id: true, code: true, name: true, unit: true, minStock: true } },
        location: { include: { warehouse: { select: { id: true, name: true } } } },
      },
    }),
    prisma.stock.count({ where }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

// ── STOCK TRANSACTIONS ───────────────────────────────────────────────────────

export const getTransactions = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.materialId) where.materialId = query.materialId;
  if (query.locationId) where.locationId = query.locationId;
  if (query.type) where.type = query.type;

  const [data, total] = await prisma.$transaction([
    prisma.stockTransaction.findMany({
      where, skip, take: limit,
      include: {
        material: { select: { id: true, code: true, name: true } },
        location: { select: { id: true, code: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.stockTransaction.count({ where }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

export const createTransaction = async (data, userId) => {
  const { materialId, locationId, type, quantity, referenceId, note } = data;

  return prisma.$transaction(async (tx) => {
    // Create transaction record
    const txRecord = await tx.stockTransaction.create({
      data: { materialId, locationId, type, quantity, referenceId, note, createdBy: userId },
      include: { material: true, location: true },
    });

    // Update stock
    if (locationId) {
      const delta = ["IN", "RETURN"].includes(type) ? quantity : -quantity;
      await tx.stock.upsert({
        where: { materialId_locationId: { materialId, locationId } },
        update: { quantity: { increment: delta } },
        create: { materialId, locationId, quantity: delta > 0 ? delta : 0 },
      });
    }

    return txRecord;
  });
};

// ── STOCK COUNT ───────────────────────────────────────────────────────────────

export const getAllCounts = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.warehouseId) where.warehouseId = query.warehouseId;
  if (query.status) where.status = query.status;

  const [data, total] = await prisma.$transaction([
    prisma.stockCount.findMany({
      where, skip, take: limit,
      include: {
        warehouse: { select: { id: true, name: true } },
        counter: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.stockCount.count({ where }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

export const getCountById = async (id) => {
  const sc = await prisma.stockCount.findUnique({
    where: { id },
    include: {
      warehouse: true,
      counter: { select: { id: true, name: true } },
      items: {
        include: {
          material: { select: { id: true, code: true, name: true, unit: true } },
          location: { select: { id: true, code: true } },
        },
      },
    },
  });
  if (!sc) throw new AppError("Stock count not found", 404);
  return sc;
};

export const createCount = async (body, userId) => {
  const countNo = generateCode("SC");
  return prisma.stockCount.create({
    data: {
      countNo,
      warehouseId: body.warehouseId,
      countedBy: userId,
      note: body.note,
      items: { create: body.items },
    },
    include: { items: true, warehouse: true },
  });
};

export const updateCount = async (id, body) => {
  const existing = await prisma.stockCount.findUnique({ where: { id } });
  if (!existing) throw new AppError("Stock count not found", 404);
  if (existing.status === "COMPLETED") throw new AppError("Cannot update completed stock count", 400);

  const { items, ...data } = body;
  if (data.status === "COMPLETED") data.completedAt = new Date();

  return prisma.stockCount.update({
    where: { id },
    data: {
      ...data,
      ...(items
        ? {
            items: {
              deleteMany: {},
              create: items.map(({ id: _id, ...item }) => item),
            },
          }
        : {}),
    },
    include: { items: { include: { material: true, location: true } }, warehouse: true },
  });
};
