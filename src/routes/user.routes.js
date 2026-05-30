import express from "express";

import {
    getAllUsers,
    getSingleUser,
    getMyProfile,
    updateProfile,
    createEmployee,
    blockUser,
    unblockUser,
    deleteUser
} from "../controllers/user.controller.js";

import {
    verifyToken
} from "../middlewares/auth.middleware.js";

import {
    isAdmin
} from "../middlewares/role.middleware.js";

const router = express.Router();


// ======================================
// USER ROUTES
// ======================================


// GET MY PROFILE
router.get(
    "/get-me",
    verifyToken,
    getMyProfile
);


// UPDATE MY PROFILE
router.put(
    "/update-profile",
    verifyToken,
    updateProfile
);


// GET ALL USERS (ADMIN)
router.get(
    "/",
    verifyToken,
    isAdmin,
    getAllUsers
);


// GET SINGLE USER (ADMIN)
router.get(
    "/:id",
    verifyToken,
    isAdmin,
    getSingleUser
);


// ======================================
// EMPLOYEE MANAGEMENT
// ======================================


// CREATE EMPLOYEE
router.post(
    "/create-employee",
    verifyToken,
    isAdmin,
    createEmployee
);


// BLOCK USER
router.patch(
    "/block/:id",
    verifyToken,
    isAdmin,
    blockUser
);


// UNBLOCK USER
router.patch(
    "/unblock/:id",
    verifyToken,
    isAdmin,
    unblockUser
);


// DELETE USER
router.delete(
    "/:id",
    verifyToken,
    isAdmin,
    deleteUser
);


export default router;