import { Router } from "express";
import * as stockController from "../modules/stock/stock.controller.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  stockTransactionSchema,
  createStockCountSchema,
  updateStockCountSchema,
} from "../modules/stock/stock.schema.js";

const router = Router();
router.use(authenticate);

// Stock levels
router.get("/", stockController.getStocks);

// Transactions
router.get("/transactions", stockController.getTransactions);
router.post("/transactions", authorize("ADMIN", "MANAGER", "STAFF"), validate(stockTransactionSchema), stockController.createTransaction);

// Stock counts
router.get("/counts", stockController.getAllCounts);
router.get("/counts/:id", stockController.getCountById);
router.post("/counts", authorize("ADMIN", "MANAGER", "STAFF"), validate(createStockCountSchema), stockController.createCount);
router.put("/counts/:id", authorize("ADMIN", "MANAGER", "STAFF"), validate(updateStockCountSchema), stockController.updateCount);

export default router;
