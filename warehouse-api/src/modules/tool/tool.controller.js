import * as toolService from "./tool.service.js";
import { successResponse, paginatedResponse } from "../../utils/response.js";

// Categories
export const getAllCategories = async (req, res, next) => {
  try { successResponse(res, await toolService.getAllCategories()); } catch (e) { next(e); }
};
export const createCategory = async (req, res, next) => {
  try { successResponse(res, await toolService.createCategory(req.body), "Category created", 201); } catch (e) { next(e); }
};
export const updateCategory = async (req, res, next) => {
  try { successResponse(res, await toolService.updateCategory(req.params.id, req.body), "Category updated"); } catch (e) { next(e); }
};
export const deleteCategory = async (req, res, next) => {
  try { successResponse(res, await toolService.deleteCategory(req.params.id), "Category deleted"); } catch (e) { next(e); }
};

// Tools
export const getAll = async (req, res, next) => {
  try {
    const { data, pagination } = await toolService.getAll(req.query);
    paginatedResponse(res, data, pagination, "Tools retrieved");
  } catch (e) { next(e); }
};
export const getById = async (req, res, next) => {
  try { successResponse(res, await toolService.getById(req.params.id)); } catch (e) { next(e); }
};
export const create = async (req, res, next) => {
  try { successResponse(res, await toolService.create(req.body), "Tool created", 201); } catch (e) { next(e); }
};
export const update = async (req, res, next) => {
  try { successResponse(res, await toolService.update(req.params.id, req.body), "Tool updated"); } catch (e) { next(e); }
};
export const remove = async (req, res, next) => {
  try { successResponse(res, await toolService.remove(req.params.id), "Tool deactivated"); } catch (e) { next(e); }
};

// Borrow/Return
export const borrowTool = async (req, res, next) => {
  try { successResponse(res, await toolService.borrowTool(req.params.id, req.body), "Tool borrowed", 201); } catch (e) { next(e); }
};
export const returnTool = async (req, res, next) => {
  try { successResponse(res, await toolService.returnTool(req.params.id, req.body, req.user.id), "Tool returned"); } catch (e) { next(e); }
};
export const getBorrowRecords = async (req, res, next) => {
  try {
    const { data, pagination } = await toolService.getBorrowRecords(req.query);
    paginatedResponse(res, data, pagination, "Borrow records retrieved");
  } catch (e) { next(e); }
};
