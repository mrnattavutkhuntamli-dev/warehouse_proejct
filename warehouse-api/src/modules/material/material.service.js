import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/errorMiddleware.js";
import { getPagination, buildPaginationMeta } from "../../utils/pagination.js";

// ── CATEGORIES ──────────────────────────────────────────────────────────────

export const getAllCategories = async () =>
  prisma.materialCategory.findMany({
    include: { _count: { select: { materials: true } } },
    orderBy: { name: "asc" },
  });

export const createCategory = async (data) =>
  prisma.materialCategory.create({ data });

export const updateCategory = async (id, data) => {
  const existing = await prisma.materialCategory.findUnique({ where: { id } });
  if (!existing) throw new AppError("Category not found", 404);
  return prisma.materialCategory.update({ where: { id }, data });
};

export const deleteCategory = async (id) => {
  const existing = await prisma.materialCategory.findUnique({
    where: { id },
    include: { _count: { select: { materials: true } } },
  });
  if (!existing) throw new AppError("Category not found", 404);
  if (existing._count.materials > 0)
    throw new AppError("Cannot delete category with materials", 400);
  return prisma.materialCategory.delete({ where: { id } });
};

// ── MATERIALS ────────────────────────────────────────────────────────────────

export const getAll = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = { isActive: true };
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { code: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.isActive !== undefined) where.isActive = query.isActive !== "false";

  const [data, total] = await prisma.$transaction([
    prisma.material.findMany({
      where, skip, take: limit,
      include: { category: true, stocks: { include: { location: true } } },
      orderBy: { code: "asc" },
    }),
    prisma.material.count({ where }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

export const getById = async (id) => {
  const mat = await prisma.material.findUnique({
    where: { id },
    include: {
      category: true,
      stocks: { include: { location: { include: { warehouse: true } } } },
    },
  });
  if (!mat) throw new AppError("Material not found", 404);
  return mat;
};

export const create = async (data) => {
  const category = await prisma.materialCategory.findUnique({ where: { id: data.categoryId } });
  if (!category) throw new AppError("Category not found", 404);
  return prisma.material.create({
    data: { ...data, minStock: data.minStock ? data.minStock : undefined },
    include: { category: true },
  });
};

export const update = async (id, data) => {
  const existing = await prisma.material.findUnique({ where: { id } });
  if (!existing) throw new AppError("Material not found", 404);
  return prisma.material.update({ where: { id }, data, include: { category: true } });
};

export const remove = async (id) => {
  const existing = await prisma.material.findUnique({ where: { id } });
  if (!existing) throw new AppError("Material not found", 404);
  return prisma.material.update({ where: { id }, data: { isActive: false }, include: { category: true } });
};

export const getLowStock = async () => {
  const materials = await prisma.material.findMany({
    where: { isActive: true, minStock: { not: null } },
    include: { stocks: true, category: true },
  });
  return materials.filter((m) => {
    const totalStock = m.stocks.reduce((sum, s) => sum + Number(s.quantity), 0);
    return totalStock < Number(m.minStock);
  }).map((m) => ({
    ...m,
    totalStock: m.stocks.reduce((sum, s) => sum + Number(s.quantity), 0),
  }));
};
