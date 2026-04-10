import { Router } from "express";
import * as toolController from "../modules/tool/tool.controller.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  toolCategorySchema,
  createToolSchema,
  updateToolSchema,
  borrowToolSchema,
  returnToolSchema,
} from "../modules/tool/tool.schema.js";

const router = Router();
router.use(authenticate);

// Categories
router.get("/categories", toolController.getAllCategories);
router.post("/categories", authorize("ADMIN", "MANAGER"), validate(toolCategorySchema), toolController.createCategory);
router.put("/categories/:id", authorize("ADMIN", "MANAGER"), validate(toolCategorySchema), toolController.updateCategory);
router.delete("/categories/:id", authorize("ADMIN"), toolController.deleteCategory);

// Borrow records
router.get("/borrow-records", toolController.getBorrowRecords);
router.patch("/borrow-records/:id/return", validate(returnToolSchema), toolController.returnTool);

// Tools CRUD
router.get("/", toolController.getAll);
router.get("/:id", toolController.getById);
router.post("/", authorize("ADMIN", "MANAGER"), validate(createToolSchema), toolController.create);
router.put("/:id", authorize("ADMIN", "MANAGER"), validate(updateToolSchema), toolController.update);
router.delete("/:id", authorize("ADMIN"), toolController.remove);

// Borrow
router.post("/:id/borrow", validate(borrowToolSchema), toolController.borrowTool);

export default router;
