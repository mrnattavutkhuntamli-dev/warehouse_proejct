import { Router } from "express";
import * as userController from "../modules/user/user.controller.js";
import * as deptController from "../modules/department/department.controller.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { createUserSchema, updateUserSchema } from "../modules/user/user.schema.js";
import { departmentSchema } from "../modules/department/department.schema.js";

const router = Router();
router.use(authenticate);

// Departments
router.get("/departments", deptController.getAll);
router.get("/departments/:id", deptController.getById);
router.post("/departments", authorize("ADMIN", "MANAGER"), validate(departmentSchema), deptController.create);
router.put("/departments/:id", authorize("ADMIN", "MANAGER"), validate(departmentSchema), deptController.update);
router.delete("/departments/:id", authorize("ADMIN"), deptController.remove);

// Users
router.get("/", authorize("ADMIN", "MANAGER"), userController.getAll);
router.get("/:id", userController.getById);
router.post("/", authorize("ADMIN"), validate(createUserSchema), userController.create);
router.put("/:id", authorize("ADMIN", "MANAGER"), validate(updateUserSchema), userController.update);
router.delete("/:id", authorize("ADMIN"), userController.remove);

export default router;
