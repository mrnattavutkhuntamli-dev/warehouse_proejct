import { z } from "zod";

export const createSupplierSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial().omit({ code: true }).extend({
  isActive: z.boolean().optional(),
});
