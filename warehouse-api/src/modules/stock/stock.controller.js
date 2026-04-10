import * as stockService from "./stock.service.js";
import { successResponse, paginatedResponse } from "../../utils/response.js";

export const getStocks = async (req, res, next) => {
  try {
    const { data, pagination } = await stockService.getStocks(req.query);
    paginatedResponse(res, data, pagination, "Stock retrieved");
  } catch (e) { next(e); }
};

export const getTransactions = async (req, res, next) => {
  try {
    const { data, pagination } = await stockService.getTransactions(req.query);
    paginatedResponse(res, data, pagination, "Transactions retrieved");
  } catch (e) { next(e); }
};

export const createTransaction = async (req, res, next) => {
  try {
    const tx = await stockService.createTransaction(req.body, req.user.id);
    successResponse(res, tx, "Transaction created", 201);
  } catch (e) { next(e); }
};

export const getAllCounts = async (req, res, next) => {
  try {
    const { data, pagination } = await stockService.getAllCounts(req.query);
    paginatedResponse(res, data, pagination, "Stock counts retrieved");
  } catch (e) { next(e); }
};

export const getCountById = async (req, res, next) => {
  try { successResponse(res, await stockService.getCountById(req.params.id)); } catch (e) { next(e); }
};

export const createCount = async (req, res, next) => {
  try {
    const sc = await stockService.createCount(req.body, req.user.id);
    successResponse(res, sc, "Stock count created", 201);
  } catch (e) { next(e); }
};

export const updateCount = async (req, res, next) => {
  try {
    const sc = await stockService.updateCount(req.params.id, req.body);
    successResponse(res, sc, "Stock count updated");
  } catch (e) { next(e); }
};
