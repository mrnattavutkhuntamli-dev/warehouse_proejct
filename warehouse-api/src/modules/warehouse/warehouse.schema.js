import { z } from "zod";

export const createWarehouseSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["MAIN", "SUB", "OUTDOOR"]).default("MAIN"),
});

export const updateWarehouseSchema = createWarehouseSchema.partial().omit({ code: true }).extend({
  isActive: z.boolean().optional(),
});

export const createLocationSchema = z.object({
  code: z.string().min(1),
  description: z.string().optional(),
  warehouseId: z.string().uuid(),
});

export const updateLocationSchema = createLocationSchema.partial().omit({ code: true, warehouseId: true }).extend({
  isActive: z.boolean().optional(),
});
