import * as barcodeService from "./barcode.service.js";
import { successResponse } from "../../utils/response.js";

export const getMaterialBarcode = async (req, res, next) => {
  try {
    successResponse(res, await barcodeService.getMaterialBarcode(req.params.id), "Barcode data generated");
  } catch (e) { next(e); }
};

export const getLocationBarcode = async (req, res, next) => {
  try {
    successResponse(res, await barcodeService.getLocationBarcode(req.params.id), "Barcode data generated");
  } catch (e) { next(e); }
};

export const getToolBarcode = async (req, res, next) => {
  try {
    successResponse(res, await barcodeService.getToolBarcode(req.params.id), "Barcode data generated");
  } catch (e) { next(e); }
};

export const resolveScan = async (req, res, next) => {
  try {
    const result = await barcodeService.resolveScan(req.body.barcodeData);
    successResponse(res, result, `Resolved: ${result.resolvedType}`);
  } catch (e) { next(e); }
};

export const getBulkBarcodes = async (req, res, next) => {
  try {
    const result = await barcodeService.getBulkBarcodes(req.body);
    successResponse(res, result, `Generated ${result.length} barcodes`);
  } catch (e) { next(e); }
};
