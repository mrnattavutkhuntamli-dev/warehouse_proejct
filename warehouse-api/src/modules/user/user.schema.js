import { z } from "zod";

export const createUserSchema = z.object({
  employeeCode: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "MANAGER", "STAFF", "TECHNICIAN"]).default("STAFF"),
  departmentId: z.string().uuid().optional(),
  technician: z
    .object({
      skillLevel: z.enum(["JUNIOR", "MID", "SENIOR", "EXPERT"]).default("JUNIOR"),
      shift: z.enum(["MORNING", "AFTERNOON", "NIGHT"]).default("MORNING"),
      specialty: z.string().optional(),
    })
    .optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "MANAGER", "STAFF", "TECHNICIAN"]).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
  technician: z
    .object({
      skillLevel: z.enum(["JUNIOR", "MID", "SENIOR", "EXPERT"]).optional(),
      shift: z.enum(["MORNING", "AFTERNOON", "NIGHT"]).optional(),
      specialty: z.string().optional(),
    })
    .optional(),
});
