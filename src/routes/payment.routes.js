import express from "express";

import {
    createPayment,
    getAllPayments,
    getMyPayments,
    getSinglePayment,
    verifyPayment,
    updatePaymentStatus,
    deletePayment
} from "../controllers/payment.controller.js";

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
// CREATE PAYMENT
// ======================================
router.post(
    "/",
    verifyToken,
    createPayment
);


// ======================================
// VERIFY PAYMENT
// ======================================
router.post(
    "/verify",
    verifyToken,
    verifyPayment
);


// ======================================
// GET ALL PAYMENTS
// ======================================
router.get(
    "/",
    verifyToken,
    isEmployee,
    getAllPayments
);


// ======================================
// GET MY PAYMENTS
// ======================================
router.get(
    "/my-payments",
    verifyToken,
    getMyPayments
);


// ======================================
// GET SINGLE PAYMENT
// ======================================
router.get(
    "/:id",
    verifyToken,
    getSinglePayment
);


// ======================================
// UPDATE PAYMENT STATUS
// ======================================
router.patch(
    "/update-status/:id",
    verifyToken,
    isAdmin,
    updatePaymentStatus
);


// ======================================
// DELETE PAYMENT
// ======================================
router.delete(
    "/:id",
    verifyToken,
    isSuperAdmin,
    deletePayment
);

export default router;