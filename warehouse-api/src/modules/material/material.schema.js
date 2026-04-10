import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export const createMaterialSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  unit: z.string().min(1),
  minStock: z.number().positive().optional(),
  categoryId: z.string().uuid(),
});

export const updateMaterialSchema = createMaterialSchema.partial().omit({ code: true });
