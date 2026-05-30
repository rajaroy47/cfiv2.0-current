import express from "express";

import {
    createOrder,
    getAllOrders,
    getMyOrders,
    getSingleOrder,
    assignEmployee,
    updateOrderStatus,
    deleteOrder
} from "../controllers/order.controller.js";

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
// CREATE ORDER
// ======================================
router.post(
    "/",
    verifyToken,
    createOrder
);


// ======================================
// GET MY ORDERS
// ======================================

/*
    Client:
    Gets own orders

    Employee/Admin:
    Can also use if controller supports it
*/
router.get(
    "/my-orders",
    verifyToken,
    getMyOrders
);


// ======================================
// GET ALL ORDERS
// ======================================

/*
    Employee/Admin/Super Admin
*/
router.get(
    "/",
    verifyToken,
    isEmployee,
    getAllOrders
);


// ======================================
// GET SINGLE ORDER
// ======================================

/*
    IMPORTANT:
    Ownership validation must exist
    inside controller.
*/
router.get(
    "/:id",
    verifyToken,
    getSingleOrder
);


// ======================================
// ASSIGN EMPLOYEE
// ======================================

/*
    Admin/Super Admin only
*/
router.patch(
    "/assign-employee/:id",
    verifyToken,
    isAdmin,
    assignEmployee
);


// ======================================
// UPDATE ORDER STATUS
// ======================================

/*
    Employee/Admin/Super Admin

    IMPORTANT:
    Employee assignment validation
    should exist inside controller.
*/
router.patch(
    "/update-status/:id",
    verifyToken,
    isEmployee,
    updateOrderStatus
);


// ======================================
// DELETE ORDER
// ======================================

/*
    Super Admin only
*/
router.delete(
    "/:id",
    verifyToken,
    isSuperAdmin,
    deleteOrder
);


export default router;