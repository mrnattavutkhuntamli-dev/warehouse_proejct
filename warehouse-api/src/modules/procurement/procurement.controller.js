import * as procService from "./procurement.service.js";
import { successResponse, paginatedResponse } from "../../utils/response.js";

const auditMeta = (req) => ({
  ipAddress: req.ip || req.headers["x-forwarded-for"],
  userAgent: req.headers["user-agent"],
});

// Purchase Orders
export const getAllPOs = async (req, res, next) => {
  try { const { data, pagination } = await procService.getAllPOs(req.query); paginatedResponse(res, data, pagination); } catch (e) { next(e); }
};
export const getPOById = async (req, res, next) => {
  try { successResponse(res, await procService.getPOById(req.params.id)); } catch (e) { next(e); }
};
export const createPO = async (req, res, next) => {
  try { successResponse(res, await procService.createPO(req.body, req.user.id, auditMeta(req)), "Purchase order created", 201); } catch (e) { next(e); }
};
export const updatePOStatus = async (req, res, next) => {
  try { successResponse(res, await procService.updatePOStatus(req.params.id, req.body, req.user.id, auditMeta(req)), "Status updated"); } catch (e) { next(e); }
};

// Goods Receipts
export const getAllGRs = async (req, res, next) => {
  try { const { data, pagination } = await procService.getAllGRs(req.query); paginatedResponse(res, data, pagination); } catch (e) { next(e); }
};
export const getGRById = async (req, res, next) => {
  try { successResponse(res, await procService.getGRById(req.params.id)); } catch (e) { next(e); }
};
export const createGR = async (req, res, next) => {
  try { successResponse(res, await procService.createGR(req.body, req.user.id, auditMeta(req)), "Goods receipt created", 201); } catch (e) { next(e); }
};

// Material Issues
export const getAllIssues = async (req, res, next) => {
  try { const { data, pagination } = await procService.getAllIssues(req.query); paginatedResponse(res, data, pagination); } catch (e) { next(e); }
};
export const getIssueById = async (req, res, next) => {
  try { successResponse(res, await procService.getIssueById(req.params.id)); } catch (e) { next(e); }
};
export const createIssue = async (req, res, next) => {
  try { successResponse(res, await procService.createIssue(req.body, req.user.id, auditMeta(req)), "Material issue created", 201); } catch (e) { next(e); }
};
export const updateIssueStatus = async (req, res, next) => {
  try { successResponse(res, await procService.updateIssueStatus(req.params.id, req.body, req.user.id, auditMeta(req)), "Status updated"); } catch (e) { next(e); }
};
