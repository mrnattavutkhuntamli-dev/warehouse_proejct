import { Router } from "express";
import * as procController from "../modules/procurement/procurement.controller.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  createPOSchema,
  updatePOStatusSchema,
  createGoodsReceiptSchema,
  createMaterialIssueSchema,
  updateIssueStatusSchema,
} from "../modules/procurement/procurement.schema.js";

const router = Router();
router.use(authenticate);

// Purchase Orders
router.get("/purchase-orders", procController.getAllPOs);
router.get("/purchase-orders/:id", procController.getPOById);
router.post("/purchase-orders", authorize("ADMIN", "MANAGER", "STAFF"), validate(createPOSchema), procController.createPO);
router.patch("/purchase-orders/:id/status", authorize("ADMIN", "MANAGER"), validate(updatePOStatusSchema), procController.updatePOStatus);

// Goods Receipts
router.get("/goods-receipts", procController.getAllGRs);
router.get("/goods-receipts/:id", procController.getGRById);
router.post("/goods-receipts", authorize("ADMIN", "MANAGER", "STAFF"), validate(createGoodsReceiptSchema), procController.createGR);

// Material Issues
router.get("/material-issues", procController.getAllIssues);
router.get("/material-issues/:id", procController.getIssueById);
router.post("/material-issues", validate(createMaterialIssueSchema), procController.createIssue);
router.patch("/material-issues/:id/status", authorize("ADMIN", "MANAGER"), validate(updateIssueStatusSchema), procController.updateIssueStatus);

export default router;
