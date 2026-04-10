import { z } from "zod";

export const toolCategorySchema = z.object({
  name: z.string().min(1),
});

export const createToolSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  status: z.enum(["AVAILABLE", "BORROWED", "MAINTENANCE", "BROKEN"]).default("AVAILABLE"),
  condition: z.enum(["GOOD", "FAIR", "POOR"]).default("GOOD"),
  categoryId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
});

export const updateToolSchema = createToolSchema.partial().omit({ code: true }).extend({
  isActive: z.boolean().optional(),
});

export const borrowToolSchema = z.object({
  borrowedBy: z.string().uuid(),
  dueAt: z.string().datetime().optional(),
  purpose: z.string().optional(),
  conditionOnBorrow: z.enum(["GOOD", "FAIR", "POOR"]).default("GOOD"),
  note: z.string().optional(),
});

export const returnToolSchema = z.object({
  conditionOnReturn: z.enum(["GOOD", "FAIR", "POOR"]),
  note: z.string().optional(),
});
