import { Router } from "express";
import * as barcodeController from "../modules/barcode/barcode.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { scanSchema, bulkBarcodeSchema } from "../modules/barcode/barcode.schema.js";

const router = Router();
router.use(authenticate);

// Scan (Mobile App → API: resolve barcode to entity)
router.post("/scan", validate(scanSchema), barcodeController.resolveScan);

// Bulk generate for label printing
router.post("/bulk", validate(bulkBarcodeSchema), barcodeController.getBulkBarcodes);

// Individual entity barcode data
router.get("/material/:id", barcodeController.getMaterialBarcode);
router.get("/location/:id", barcodeController.getLocationBarcode);
router.get("/tool/:id", barcodeController.getToolBarcode);

export default router;
