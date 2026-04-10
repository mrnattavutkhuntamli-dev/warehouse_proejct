import * as userService from "./user.service.js";
import { successResponse, paginatedResponse } from "../../utils/response.js";

export const getAll = async (req, res, next) => {
  try {
    const { data, pagination } = await userService.getAll(req.query);
    paginatedResponse(res, data, pagination, "Users retrieved");
  } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
  try {
    const user = await userService.getById(req.params.id);
    successResponse(res, user, "User retrieved");
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    successResponse(res, user, "User created", 201);
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const user = await userService.update(req.params.id, req.body);
    successResponse(res, user, "User updated");
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    const user = await userService.remove(req.params.id);
    successResponse(res, user, "User deactivated");
  } catch (err) { next(err); }
};
