import { Router } from "express";
import * as matController from "../modules/material/material.controller.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { categorySchema, createMaterialSchema, updateMaterialSchema } from "../modules/material/material.schema.js";

const router = Router();
router.use(authenticate);

// Categories
router.get("/categories", matController.getAllCategories);
router.post("/categories", authorize("ADMIN", "MANAGER"), validate(categorySchema), matController.createCategory);
router.put("/categories/:id", authorize("ADMIN", "MANAGER"), validate(categorySchema), matController.updateCategory);
router.delete("/categories/:id", authorize("ADMIN"), matController.deleteCategory);

// Low stock alert
router.get("/low-stock", matController.getLowStock);

// Materials CRUD
router.get("/", matController.getAll);
router.get("/:id", matController.getById);
router.post("/", authorize("ADMIN", "MANAGER"), validate(createMaterialSchema), matController.create);
router.put("/:id", authorize("ADMIN", "MANAGER"), validate(updateMaterialSchema), matController.update);
router.delete("/:id", authorize("ADMIN"), matController.remove);

export default router;
