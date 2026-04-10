import { z } from "zod";

export const stockTransactionSchema = z.object({
  materialId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
  type: z.enum(["IN", "OUT", "TRANSFER", "ADJUST", "RETURN"]),
  quantity: z.number().positive(),
  referenceId: z.string().optional(),
  note: z.string().optional(),
});

export const createStockCountSchema = z.object({
  warehouseId: z.string().uuid(),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        materialId: z.string().uuid(),
        locationId: z.string().uuid(),
        systemQty: z.number().min(0),
        countedQty: z.number().min(0),
        note: z.string().optional(),
      })
    )
    .min(1),
});

export const updateStockCountSchema = z.object({
  status: z.enum(["DRAFT", "COUNTING", "COMPLETED"]).optional(),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        materialId: z.string().uuid(),
        locationId: z.string().uuid(),
        systemQty: z.number().min(0),
        countedQty: z.number().min(0),
        note: z.string().optional(),
      })
    )
    .optional(),
});
