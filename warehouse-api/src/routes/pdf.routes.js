import { Router } from "express";
import * as pdfController from "../modules/pdf/pdf.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();
router.use(authenticate);

// Download PDFs — response is application/pdf binary
router.get("/purchase-orders/:id", pdfController.downloadPO);
router.get("/material-issues/:id", pdfController.downloadMaterialIssue);
router.get("/goods-receipts/:id", pdfController.downloadGoodsReceipt);

export default router;
