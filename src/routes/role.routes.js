import express from "express";

import {
    createRole,
    getAllRoles,
    getSingleRole,
    updateRole,
    deleteRole
} from "../controllers/role.controller.js";

import { verifyToken }   from "../middlewares/auth.middleware.js";
import { isAdmin, isSuperAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

// CREATE ROLE — super_admin only
router.post(
    "/",
    verifyToken,
    isSuperAdmin,
    createRole
);

// GET ALL ROLES — admin+
router.get(
    "/",
    verifyToken,
    isAdmin,
    getAllRoles
);

// GET SINGLE ROLE — admin+
router.get(
    "/:id",
    verifyToken,
    isAdmin,
    getSingleRole
);

// UPDATE ROLE — super_admin only
router.put(
    "/:id",
    verifyToken,
    isSuperAdmin,
    updateRole
);

// DELETE ROLE — super_admin only
router.delete(
    "/:id",
    verifyToken,
    isSuperAdmin,
    deleteRole
);

export default router;