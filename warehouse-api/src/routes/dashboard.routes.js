import { Router } from "express";
import * as dashController from "../modules/dashboard/dashboard.controller.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();
router.use(authenticate);

// Overview
router.get("/overview", dashController.getOverview);

// Analytics
router.get("/inventory-value", authorize("ADMIN", "MANAGER"), dashController.getInventoryValue);
router.get("/top-issued-materials", dashController.getTopIssuedMaterials);
router.get("/supplier-stats", authorize("ADMIN", "MANAGER"), dashController.getSupplierStats);
router.get("/stock-movement", dashController.getStockMovementTrend);
router.get("/tool-utilization", dashController.getToolUtilization);

export default router;
