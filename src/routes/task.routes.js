import express from "express";

import {
    createTask,
    getAllTasks,
    getMyTasks,
    getSingleTask,
    updateTask,
    reassignTask,
    deleteTask
} from "../controllers/task.controller.js";

import {
    verifyToken
} from "../middlewares/auth.middleware.js";

import {
    isAdmin,
    isEmployee,
    isSuperAdmin
} from "../middlewares/role.middleware.js";

const router = express.Router();


// ======================================
// CREATE TASK
// ======================================

/*
    Admin/Super Admin only

    Task can be assigned
    to employee/admin.
*/
router.post(
    "/",
    verifyToken,
    isAdmin,
    createTask
);


// ======================================
// GET MY TASKS
// ======================================

/*
    Employee/Admin/Super Admin

    Employee:
    Assigned tasks only

    Admin:
    Created/assigned tasks
*/
router.get(
    "/my-tasks",
    verifyToken,
    isEmployee,
    getMyTasks
);


// ======================================
// GET ALL TASKS
// ======================================

/*
    Employee/Admin/Super Admin

    Employee:
    Only assigned tasks

    Admin/Super Admin:
    All tasks
*/
router.get(
    "/",
    verifyToken,
    isEmployee,
    getAllTasks
);


// ======================================
// GET SINGLE TASK
// ======================================

/*
    IMPORTANT:
    Ownership validation
    must exist inside controller.
*/
router.get(
    "/:id",
    verifyToken,
    isEmployee,
    getSingleTask
);


// ======================================
// UPDATE TASK
// ======================================

/*
    Employee:
    Can update own assigned task

    Admin:
    Can update any task
*/
router.patch(
    "/:id",
    verifyToken,
    isEmployee,
    updateTask
);


// ======================================
// REASSIGN TASK
// ======================================

/*
    Admin/Super Admin only
*/
router.patch(
    "/reassign/:id",
    verifyToken,
    isAdmin,
    reassignTask
);


// ======================================
// DELETE TASK
// ======================================

/*
    Super Admin only
*/
router.delete(
    "/:id",
    verifyToken,
    isSuperAdmin,
    deleteTask
);


export default router;