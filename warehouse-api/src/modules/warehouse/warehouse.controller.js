import * as whService from "./warehouse.service.js";
import { successResponse } from "../../utils/response.js";

export const getAll = async (req, res, next) => {
  try { successResponse(res, await whService.getAll()); } catch (e) { next(e); }
};
export const getById = async (req, res, next) => {
  try { successResponse(res, await whService.getById(req.params.id)); } catch (e) { next(e); }
};
export const create = async (req, res, next) => {
  try { successResponse(res, await whService.create(req.body), "Warehouse created", 201); } catch (e) { next(e); }
};
export const update = async (req, res, next) => {
  try { successResponse(res, await whService.update(req.params.id, req.body), "Warehouse updated"); } catch (e) { next(e); }
};
export const remove = async (req, res, next) => {
  try { successResponse(res, await whService.remove(req.params.id), "Warehouse deactivated"); } catch (e) { next(e); }
};

// Locations
export const getAllLocations = async (req, res, next) => {
  try { successResponse(res, await whService.getAllLocations(req.query.warehouseId)); } catch (e) { next(e); }
};
export const getLocationById = async (req, res, next) => {
  try { successResponse(res, await whService.getLocationById(req.params.id)); } catch (e) { next(e); }
};
export const createLocation = async (req, res, next) => {
  try { successResponse(res, await whService.createLocation(req.body), "Location created", 201); } catch (e) { next(e); }
};
export const updateLocation = async (req, res, next) => {
  try { successResponse(res, await whService.updateLocation(req.params.id, req.body), "Location updated"); } catch (e) { next(e); }
};
export const removeLocation = async (req, res, next) => {
  try { successResponse(res, await whService.removeLocation(req.params.id), "Location deactivated"); } catch (e) { next(e); }
};
