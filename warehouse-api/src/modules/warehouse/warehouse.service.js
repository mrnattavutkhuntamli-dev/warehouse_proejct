import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/errorMiddleware.js";

// ── WAREHOUSES ───────────────────────────────────────────────────────────────

export const getAll = async () =>
  prisma.warehouse.findMany({
    include: { _count: { select: { locations: true, stockCounts: true } } },
    orderBy: { code: "asc" },
  });

export const getById = async (id) => {
  const wh = await prisma.warehouse.findUnique({
    where: { id },
    include: { locations: { where: { isActive: true } } },
  });
  if (!wh) throw new AppError("Warehouse not found", 404);
  return wh;
};

export const create = async (data) => prisma.warehouse.create({ data });

export const update = async (id, data) => {
  const existing = await prisma.warehouse.findUnique({ where: { id } });
  if (!existing) throw new AppError("Warehouse not found", 404);
  return prisma.warehouse.update({ where: { id }, data });
};

export const remove = async (id) => {
  const existing = await prisma.warehouse.findUnique({ where: { id } });
  if (!existing) throw new AppError("Warehouse not found", 404);
  return prisma.warehouse.update({ where: { id }, data: { isActive: false } });
};

// ── LOCATIONS ────────────────────────────────────────────────────────────────

export const getAllLocations = async (warehouseId) => {
  const where = { isActive: true };
  if (warehouseId) where.warehouseId = warehouseId;
  return prisma.warehouseLocation.findMany({
    where,
    include: { warehouse: { select: { id: true, name: true, code: true } } },
    orderBy: { code: "asc" },
  });
};

export const getLocationById = async (id) => {
  const loc = await prisma.warehouseLocation.findUnique({
    where: { id },
    include: { warehouse: true, stocks: { include: { material: true } } },
  });
  if (!loc) throw new AppError("Location not found", 404);
  return loc;
};

export const createLocation = async (data) => {
  const wh = await prisma.warehouse.findUnique({ where: { id: data.warehouseId } });
  if (!wh) throw new AppError("Warehouse not found", 404);
  return prisma.warehouseLocation.create({ data, include: { warehouse: true } });
};

export const updateLocation = async (id, data) => {
  const existing = await prisma.warehouseLocation.findUnique({ where: { id } });
  if (!existing) throw new AppError("Location not found", 404);
  return prisma.warehouseLocation.update({ where: { id }, data, include: { warehouse: true } });
};

export const removeLocation = async (id) => {
  const existing = await prisma.warehouseLocation.findUnique({ where: { id } });
  if (!existing) throw new AppError("Location not found", 404);
  return prisma.warehouseLocation.update({ where: { id }, data: { isActive: false } });
};
