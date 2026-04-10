import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import materialRoutes from "./material.routes.js";
import supplierRoutes from "./supplier.routes.js";
import warehouseRoutes from "./warehouse.routes.js";
import stockRoutes from "./stock.routes.js";
import procurementRoutes from "./procurement.routes.js";
import toolRoutes from "./tool.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import barcodeRoutes from "./barcode.routes.js";
import pdfRoutes from "./pdf.routes.js";

import auditRoutes from "./audit.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/materials", materialRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/warehouses", warehouseRoutes);
router.use("/stock", stockRoutes);
router.use("/procurement", procurementRoutes);
router.use("/tools", toolRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/barcode", barcodeRoutes);
router.use("/pdf", pdfRoutes);
router.use("/audit", auditRoutes);

export default router;
