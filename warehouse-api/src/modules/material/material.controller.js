import * as matService from "./material.service.js";
import { successResponse, paginatedResponse } from "../../utils/response.js";

// Categories
export const getAllCategories = async (req, res, next) => {
  try { successResponse(res, await matService.getAllCategories(), "Categories retrieved"); } catch (e) { next(e); }
};
export const createCategory = async (req, res, next) => {
  try { successResponse(res, await matService.createCategory(req.body), "Category created", 201); } catch (e) { next(e); }
};
export const updateCategory = async (req, res, next) => {
  try { successResponse(res, await matService.updateCategory(req.params.id, req.body), "Category updated"); } catch (e) { next(e); }
};
export const deleteCategory = async (req, res, next) => {
  try { successResponse(res, await matService.deleteCategory(req.params.id), "Category deleted"); } catch (e) { next(e); }
};

// Materials
export const getAll = async (req, res, next) => {
  try {
    const { data, pagination } = await matService.getAll(req.query);
    paginatedResponse(res, data, pagination, "Materials retrieved");
  } catch (e) { next(e); }
};
export const getById = async (req, res, next) => {
  try { successResponse(res, await matService.getById(req.params.id), "Material retrieved"); } catch (e) { next(e); }
};
export const create = async (req, res, next) => {
  try { successResponse(res, await matService.create(req.body), "Material created", 201); } catch (e) { next(e); }
};
export const update = async (req, res, next) => {
  try { successResponse(res, await matService.update(req.params.id, req.body), "Material updated"); } catch (e) { next(e); }
};
export const remove = async (req, res, next) => {
  try { successResponse(res, await matService.remove(req.params.id), "Material deactivated"); } catch (e) { next(e); }
};
export const getLowStock = async (req, res, next) => {
  try { successResponse(res, await matService.getLowStock(), "Low stock materials retrieved"); } catch (e) { next(e); }
};
