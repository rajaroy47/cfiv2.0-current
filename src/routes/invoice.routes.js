import express from "express";

import {
    createInvoice,
    getAllInvoices,
    getMyInvoices,
    getSingleInvoice,
    updateInvoiceStatus,
    deleteInvoice
} from "../controllers/invoice.controller.js";

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
// CREATE INVOICE
// ======================================

/*
    Admin/Super Admin only

    Invoice generally created
    after payment/order confirmation
*/
router.post(
    "/",
    verifyToken,
    isAdmin,
    createInvoice
);


// ======================================
// GET MY INVOICES
// ======================================

/*
    Client:
    Own invoices

    Employee:
    Assigned order invoices
*/
router.get(
    "/my-invoices",
    verifyToken,
    getMyInvoices
);


// ======================================
// GET ALL INVOICES
// ======================================

/*
    Employee/Admin/Super Admin
*/
router.get(
    "/",
    verifyToken,
    isEmployee,
    getAllInvoices
);


// ======================================
// GET SINGLE INVOICE
// ======================================

/*
    IMPORTANT:
    Ownership validation
    must exist inside controller.
*/
router.get(
    "/:id",
    verifyToken,
    getSingleInvoice
);


// ======================================
// UPDATE INVOICE STATUS
// ======================================

/*
    Admin/Super Admin only
*/
router.patch(
    "/status/:id",
    verifyToken,
    isAdmin,
    updateInvoiceStatus
);


// ======================================
// DELETE INVOICE
// ======================================

/*
    Super Admin only
*/
router.delete(
    "/:id",
    verifyToken,
    isSuperAdmin,
    deleteInvoice
);


export default router;