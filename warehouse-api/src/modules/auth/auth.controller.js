import * as authService from "./auth.service.js";
import { successResponse } from "../../utils/response.js";

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    successResponse(res, result, "Login successful");
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    successResponse(res, user, "Profile retrieved");
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user.id, req.body);
    successResponse(res, null, "Password changed successfully");
  } catch (err) {
    next(err);
  }
};
