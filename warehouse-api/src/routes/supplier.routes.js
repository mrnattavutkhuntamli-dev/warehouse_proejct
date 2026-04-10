import { Router } from "express";
import * as supplierController from "../modules/supplier/supplier.controller.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { createSupplierSchema, updateSupplierSchema } from "../modules/supplier/supplier.schema.js";

const router = Router();
router.use(authenticate);

router.get("/", supplierController.getAll);
router.get("/:id", supplierController.getById);
router.post("/", authorize("ADMIN", "MANAGER"), validate(createSupplierSchema), supplierController.create);
router.put("/:id", authorize("ADMIN", "MANAGER"), validate(updateSupplierSchema), supplierController.update);
router.delete("/:id", authorize("ADMIN"), supplierController.remove);

export default router;
