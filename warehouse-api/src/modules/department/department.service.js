import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/errorMiddleware.js";

export const getAll = async () =>
  prisma.department.findMany({ include: { _count: { select: { users: true } } }, orderBy: { name: "asc" } });

export const getById = async (id) => {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: { users: { select: { id: true, name: true, employeeCode: true, role: true, isActive: true } } },
  });
  if (!dept) throw new AppError("Department not found", 404);
  return dept;
};

export const create = async (data) => prisma.department.create({ data });

export const update = async (id, data) => {
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) throw new AppError("Department not found", 404);
  return prisma.department.update({ where: { id }, data });
};

export const remove = async (id) => {
  const existing = await prisma.department.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
  if (!existing) throw new AppError("Department not found", 404);
  if (existing._count.users > 0) throw new AppError("Cannot delete department with active users", 400);
  return prisma.department.delete({ where: { id } });
};
