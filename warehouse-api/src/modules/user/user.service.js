import bcrypt from "bcryptjs";
import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/errorMiddleware.js";
import { getPagination, buildPaginationMeta } from "../../utils/pagination.js";

const safeUser = {
  id: true,
  employeeCode: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  department: { select: { id: true, name: true } },
  technician: true,
};

export const getAll = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const where = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { employeeCode: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.role) where.role = query.role;
  if (query.isActive !== undefined) where.isActive = query.isActive === "true";
  if (query.departmentId) where.departmentId = query.departmentId;

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({ where, skip, take: limit, select: safeUser, orderBy: { createdAt: "desc" } }),
    prisma.user.count({ where }),
  ]);
  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

export const getById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id }, select: safeUser });
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const create = async (body) => {
  const { password, technician, ...userData } = body;
  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.user.create({
    data: {
      ...userData,
      passwordHash,
      ...(technician && userData.role === "TECHNICIAN"
        ? { technician: { create: technician } }
        : {}),
    },
    select: safeUser,
  });
};

export const update = async (id, body) => {
  const { technician, ...userData } = body;
  const existing = await prisma.user.findUnique({ where: { id }, include: { technician: true } });
  if (!existing) throw new AppError("User not found", 404);

  return prisma.user.update({
    where: { id },
    data: {
      ...userData,
      ...(technician
        ? {
            technician: existing.technician
              ? { update: technician }
              : { create: technician },
          }
        : {}),
    },
    select: safeUser,
  });
};

export const remove = async (id) => {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError("User not found", 404);
  return prisma.user.update({ where: { id }, data: { isActive: false }, select: safeUser });
};
