import * as dashService from "./dashboard.service.js";
import { successResponse } from "../../utils/response.js";

export const getOverview = async (req, res, next) => {
  try {
    successResponse(res, await dashService.getOverview(), "Overview retrieved");
  } catch (e) { next(e); }
};

export const getInventoryValue = async (req, res, next) => {
  try {
    successResponse(res, await dashService.getInventoryValue(), "Inventory value retrieved");
  } catch (e) { next(e); }
};

export const getTopIssuedMaterials = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const days = parseInt(req.query.days) || 30;
    successResponse(res, await dashService.getTopIssuedMaterials(limit, days), "Top issued materials retrieved");
  } catch (e) { next(e); }
};

export const getSupplierStats = async (req, res, next) => {
  try {
    successResponse(res, await dashService.getSupplierStats(), "Supplier stats retrieved");
  } catch (e) { next(e); }
};

export const getStockMovementTrend = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    successResponse(res, await dashService.getStockMovementTrend(days), "Stock movement trend retrieved");
  } catch (e) { next(e); }
};

export const getToolUtilization = async (req, res, next) => {
  try {
    successResponse(res, await dashService.getToolUtilization(), "Tool utilization retrieved");
  } catch (e) { next(e); }
};
