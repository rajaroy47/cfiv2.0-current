import express from "express";

import {
    uploadDocument,
    getAllDocuments,
    getMyDocuments,
    getDocumentsByOrder,
    getSingleDocument,
    verifyDocument,
    updateDocument,
    deleteDocument
} from "../controllers/document.controller.js";

import {
    verifyToken
} from "../middlewares/auth.middleware.js";

import {
    isEmployee,
    isSuperAdmin
} from "../middlewares/role.middleware.js";

import upload from "../middlewares/upload.middleware.js";

const router = express.Router();


// ======================================
// UPLOAD DOCUMENT
// ======================================
router.post(
    "/",
    verifyToken,
    upload.single("document"),
    uploadDocument
);


// ======================================
// GET ALL DOCUMENTS
// ======================================
router.get(
    "/",
    verifyToken,
    isEmployee,
    getAllDocuments
);


// ======================================
// GET MY DOCUMENTS
// ======================================
router.get(
    "/my-documents",
    verifyToken,
    getMyDocuments
);


// ======================================
// GET DOCUMENTS BY ORDER
// ======================================
router.get(
    "/order/:orderId",
    verifyToken,
    getDocumentsByOrder
);


// ======================================
// GET SINGLE DOCUMENT
// ======================================
router.get(
    "/:id",
    verifyToken,
    getSingleDocument
);


// ======================================
// VERIFY DOCUMENT
// ======================================
router.patch(
    "/verify/:id",
    verifyToken,
    isEmployee,
    verifyDocument
);


// ======================================
// UPDATE DOCUMENT
// ======================================
router.patch(
    "/:id",
    verifyToken,
    updateDocument
);


// ======================================
// DELETE DOCUMENT
// ======================================
router.delete(
    "/:id",
    verifyToken,
    isSuperAdmin,
    deleteDocument
);

export default router;