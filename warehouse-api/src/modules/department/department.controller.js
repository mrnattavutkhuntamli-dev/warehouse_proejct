import * as deptService from "./department.service.js";
import { successResponse } from "../../utils/response.js";

export const getAll = async (req, res, next) => {
  try { successResponse(res, await deptService.getAll(), "Departments retrieved"); } catch (e) { next(e); }
};
export const getById = async (req, res, next) => {
  try { successResponse(res, await deptService.getById(req.params.id), "Department retrieved"); } catch (e) { next(e); }
};
export const create = async (req, res, next) => {
  try { successResponse(res, await deptService.create(req.body), "Department created", 201); } catch (e) { next(e); }
};
export const update = async (req, res, next) => {
  try { successResponse(res, await deptService.update(req.params.id, req.body), "Department updated"); } catch (e) { next(e); }
};
export const remove = async (req, res, next) => {
  try { successResponse(res, await deptService.remove(req.params.id), "Department deleted"); } catch (e) { next(e); }
};
