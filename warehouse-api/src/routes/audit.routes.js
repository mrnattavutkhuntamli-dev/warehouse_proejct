import { Router } from "express";
import * as auditController from "../modules/audit/audit.controller.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();
router.use(authenticate, authorize("ADMIN", "MANAGER"));

// Query logs
router.get("/", auditController.getLogs);
router.get("/stats", auditController.getStats);
// History ของ entity ใดเจาะจง เช่น GET /audit/history/MaterialIssue/uuid
router.get("/history/:entity/:entityId", auditController.getEntityHistory);

export default router;
