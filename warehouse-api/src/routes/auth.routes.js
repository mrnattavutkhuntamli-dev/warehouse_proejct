import { Router } from "express";
import * as authController from "../modules/auth/auth.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { loginSchema, changePasswordSchema } from "../modules/auth/auth.schema.js";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.get("/profile", authenticate, authController.getProfile);
router.patch("/change-password", authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;
