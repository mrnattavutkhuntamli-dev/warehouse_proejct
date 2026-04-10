import { Router } from "express";
import * as whController from "../modules/warehouse/warehouse.controller.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  createLocationSchema,
  updateLocationSchema,
} from "../modules/warehouse/warehouse.schema.js";

const router = Router();
router.use(authenticate);

// Warehouse locations
router.get("/locations", whController.getAllLocations);
router.get("/locations/:id", whController.getLocationById);
router.post("/locations", authorize("ADMIN", "MANAGER"), validate(createLocationSchema), whController.createLocation);
router.put("/locations/:id", authorize("ADMIN", "MANAGER"), validate(updateLocationSchema), whController.updateLocation);
router.delete("/locations/:id", authorize("ADMIN"), whController.removeLocation);

// Warehouses
router.get("/", whController.getAll);
router.get("/:id", whController.getById);
router.post("/", authorize("ADMIN", "MANAGER"), validate(createWarehouseSchema), whController.create);
router.put("/:id", authorize("ADMIN", "MANAGER"), validate(updateWarehouseSchema), whController.update);
router.delete("/:id", authorize("ADMIN"), whController.remove);

export default router;
