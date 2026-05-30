import express from "express";

import {
    createPermission,
    getAllPermissions,
    getSinglePermission,
    updatePermission,
    deletePermission
} from "../controllers/permission.controller.js";

import {
    verifyToken
} from "../middlewares/auth.middleware.js";

import {
    isAdmin,
    isSuperAdmin
} from "../middlewares/role.middleware.js";

const router = express.Router();


// ======================================
// CREATE PERMISSION
// ======================================
router.post(
    "/",
    verifyToken,
    isSuperAdmin,
    createPermission
);


// ======================================
// GET ALL PERMISSIONS
// ======================================
router.get(
    "/",
    verifyToken,
    isAdmin,
    getAllPermissions
);


// ======================================
// GET SINGLE PERMISSION
// ======================================
router.get(
    "/:id",
    verifyToken,
    isAdmin,
    getSinglePermission
);


// ======================================
// UPDATE PERMISSION
// ======================================
router.put(
    "/:id",
    verifyToken,
    isSuperAdmin,
    updatePermission
);


// ======================================
// DELETE PERMISSION
// ======================================
router.delete(
    "/:id",
    verifyToken,
    isSuperAdmin,
    deletePermission
);

export default router;