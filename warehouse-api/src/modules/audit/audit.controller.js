import * as auditService from "./audit.service.js";
import { successResponse, paginatedResponse } from "../../utils/response.js";

export const getLogs = async (req, res, next) => {
  try {
    const { data, pagination } = await auditService.getLogs(req.query);
    paginatedResponse(res, data, pagination, "Audit logs retrieved");
  } catch (e) { next(e); }
};

export const getEntityHistory = async (req, res, next) => {
  try {
    const { entity, entityId } = req.params;
    const history = await auditService.getEntityHistory(entity, entityId);
    successResponse(res, history, `History for ${entity}:${entityId}`);
  } catch (e) { next(e); }
};

export const getStats = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    successResponse(res, await auditService.getStats(days), "Audit stats retrieved");
  } catch (e) { next(e); }
};
