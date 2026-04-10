import { z } from "zod";

export const scanSchema = z.object({
  barcodeData: z.string().min(1, "barcodeData is required"),
});

export const bulkBarcodeSchema = z.object({
  type: z.enum(["material", "location", "tool"]),
  ids: z.array(z.string().uuid()).optional(),
});
