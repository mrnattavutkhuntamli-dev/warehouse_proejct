import * as supplierService from "./supplier.service.js";
import { successResponse, paginatedResponse } from "../../utils/response.js";

export const getAll = async (req, res, next) => {
  try {
    const { data, pagination } = await supplierService.getAll(req.query);
    paginatedResponse(res, data, pagination);
  } catch (e) { next(e); }
};
export const getById = async (req, res, next) => {
  try { successResponse(res, await supplierService.getById(req.params.id)); } catch (e) { next(e); }
};
export const create = async (req, res, next) => {
  try { successResponse(res, await supplierService.create(req.body), "Supplier created", 201); } catch (e) { next(e); }
};
export const update = async (req, res, next) => {
  try { successResponse(res, await supplierService.update(req.params.id, req.body), "Supplier updated"); } catch (e) { next(e); }
};
export const remove = async (req, res, next) => {
  try { successResponse(res, await supplierService.remove(req.params.id), "Supplier deactivated"); } catch (e) { next(e); }
};
