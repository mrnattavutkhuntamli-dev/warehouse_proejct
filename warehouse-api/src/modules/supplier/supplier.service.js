import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/errorMiddleware.js";
import { getPagination, buildPaginationMeta } from "../../utils/pagination.js";

export const getAll = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { code: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.isActive !== undefined) where.isActive = query.isActive !== "false";

  const [data, total] = await prisma.$transaction([
    prisma.supplier.findMany({ where, skip, take: limit, orderBy: { name: "asc" } }),
    prisma.supplier.count({ where }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

export const getById = async (id) => {
  const s = await prisma.supplier.findUnique({ where: { id } });
  if (!s) throw new AppError("Supplier not found", 404);
  return s;
};

export const create = async (data) => prisma.supplier.create({ data });

export const update = async (id, data) => {
  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) throw new AppError("Supplier not found", 404);
  return prisma.supplier.update({ where: { id }, data });
};

export const remove = async (id) => {
  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) throw new AppError("Supplier not found", 404);
  return prisma.supplier.update({ where: { id }, data: { isActive: false } });
};
