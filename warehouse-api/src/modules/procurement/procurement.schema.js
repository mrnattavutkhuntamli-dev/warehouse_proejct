import { z } from "zod";

const orderItemSchema = z.object({
  materialId: z.string().uuid(),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
});

export const createPOSchema = z.object({
  supplierId: z.string().uuid(),
  note: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

export const updatePOStatusSchema = z.object({
  status: z.enum(["APPROVED", "CANCELLED"]),
});

const receiptItemSchema = z.object({
  materialId: z.string().uuid(),
  locationId: z.string().uuid(),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0).default(0),
});

export const createGoodsReceiptSchema = z.object({
  supplierId: z.string().uuid(),
  poId: z.string().uuid().optional(),
  note: z.string().optional(),
  items: z.array(receiptItemSchema).min(1),
});

const issueItemSchema = z.object({
  materialId: z.string().uuid(),
  locationId: z.string().uuid(),
  quantity: z.number().positive(),
});

export const createMaterialIssueSchema = z.object({
  purpose: z.string().optional(),
  items: z.array(issueItemSchema).min(1),
});

export const updateIssueStatusSchema = z.object({
  status: z.enum(["APPROVED", "ISSUED", "CANCELLED"]),
});
