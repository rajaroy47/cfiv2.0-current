import express from "express";

import {
  createService,
  getAllServices,
  getSingleService,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

import {
  isAdmin,
  isSuperAdmin,
} from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * Public Routes
 */
router.get("/", getAllServices);
router.get("/:id", getSingleService);

/**
 * Admin Routes
 */
router.post(
  "/create",
  verifyToken,
  isAdmin,
  createService
);

router.put(
  "/:id",
  verifyToken,
  isAdmin,
  updateService
);

/**
 * Super Admin Routes
 */
router.delete(
  "/:id",
  verifyToken,
  isSuperAdmin,
  deleteService
);

export default router;