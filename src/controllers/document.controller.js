import {
    Document,
    Order
} from "../models/index.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
    uploadToCloudinary,
    deleteFromCloudinary
} from "../services/upload.service.js";


// ======================================
// UPLOAD DOCUMENT
// ======================================
export const uploadDocument = asyncHandler(async (req, res) => {

    const {
        order,
        documentType,
        notes
    } = req.body;

    // ======================================
    // CHECK FILE
    // ======================================

    if (!req.file) {
        throw new ApiError(
            400,
            "Document file is required"
        );
    }

    // ======================================
    // CHECK ORDER
    // ======================================

    const existingOrder = await Order.findById(order);

    if (!existingOrder) {
        throw new ApiError(
            404,
            "Order not found"
        );
    }

    // ======================================
    // CLIENT OWNERSHIP CHECK
    // ======================================

    if (
        req.user.role === "client" &&
        existingOrder.client.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Unauthorized document upload"
        );
    }

    // ======================================
    // EMPLOYEE ASSIGNMENT CHECK
    // ======================================

    if (
        req.user.role === "employee" &&
        (
            !existingOrder.assignedEmployee ||
            existingOrder.assignedEmployee.toString() !== req.user._id.toString()
        )
    ) {
        throw new ApiError(
            403,
            "You are not assigned to this order"
        );
    }

    // ======================================
    // UPLOAD FILE TO CLOUDINARY
    // ======================================

    const uploadedFile = await uploadToCloudinary(
        req.file.buffer,
        "cfi-v2/documents"
    );

    // ======================================
    // CREATE DOCUMENT
    // ======================================

    const document = await Document.create({
        order,
        uploadedBy: req.user._id,
        documentType,
        documentName: req.file.originalname,
        fileUrl: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        notes
    });

    const createdDocument = await Document.findById(document._id)
        .populate(
            "uploadedBy",
            "fullName email role"
        )
        .populate("order");

    return res.status(201).json(
        new ApiResponse(
            201,
            createdDocument,
            "Document uploaded successfully"
        )
    );
});


// ======================================
// GET ALL DOCUMENTS
// ======================================
export const getAllDocuments = asyncHandler(async (req, res) => {

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const query = {};

    // ======================================
    // EMPLOYEE CAN SEE ASSIGNED DOCUMENTS
    // ======================================

    if (req.user.role === "employee") {

        const assignedOrders = await Order.find({
            assignedEmployee: req.user._id
        }).select("_id");

        query.order = {
            $in: assignedOrders.map(order => order._id)
        };
    }

    const documents = await Document.find(query)
        .populate(
            "uploadedBy",
            "fullName email role"
        )
        .populate(
            "verifiedBy",
            "fullName email role"
        )
        .populate("order")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const totalDocuments = await Document.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                documents,
                pagination: {
                    totalDocuments,
                    currentPage: page,
                    totalPages: Math.ceil(totalDocuments / limit),
                    limit
                }
            },
            "Documents fetched successfully"
        )
    );
});


// ======================================
// GET MY DOCUMENTS
// ======================================
export const getMyDocuments = asyncHandler(async (req, res) => {

    const query = {};

    // ======================================
    // CLIENT DOCUMENTS
    // ======================================

    if (req.user.role === "client") {
        query.uploadedBy = req.user._id;
    }

    // ======================================
    // EMPLOYEE DOCUMENTS
    // ======================================

    if (req.user.role === "employee") {

        const assignedOrders = await Order.find({
            assignedEmployee: req.user._id
        }).select("_id");

        query.order = {
            $in: assignedOrders.map(order => order._id)
        };
    }

    const documents = await Document.find(query)
        .populate("order")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            documents,
            "Documents fetched successfully"
        )
    );
});


// ======================================
// GET DOCUMENTS BY ORDER
// ======================================
export const getDocumentsByOrder = asyncHandler(async (req, res) => {

    const order = await Order.findById(req.params.orderId);

    if (!order) {
        throw new ApiError(
            404,
            "Order not found"
        );
    }

    // ======================================
    // CLIENT OWNERSHIP CHECK
    // ======================================

    if (
        req.user.role === "client" &&
        order.client.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Unauthorized access"
        );
    }

    // ======================================
    // EMPLOYEE ASSIGNMENT CHECK
    // ======================================

    if (
        req.user.role === "employee" &&
        (
            !order.assignedEmployee ||
            order.assignedEmployee.toString() !== req.user._id.toString()
        )
    ) {
        throw new ApiError(
            403,
            "Unauthorized access"
        );
    }

    const documents = await Document.find({
        order: req.params.orderId
    })
        .populate(
            "uploadedBy",
            "fullName email role"
        )
        .populate(
            "verifiedBy",
            "fullName email role"
        )
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            documents,
            "Order documents fetched successfully"
        )
    );
});


// ======================================
// GET SINGLE DOCUMENT
// ======================================
export const getSingleDocument = asyncHandler(async (req, res) => {

    const document = await Document.findById(req.params.id)
        .populate(
            "uploadedBy",
            "fullName email role"
        )
        .populate(
            "verifiedBy",
            "fullName email role"
        )
        .populate("order");

    if (!document) {
        throw new ApiError(
            404,
            "Document not found"
        );
    }

    // ======================================
    // CLIENT OWNERSHIP CHECK
    // ======================================

    if (
        req.user.role === "client" &&
        document.uploadedBy._id.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Unauthorized access"
        );
    }

    // ======================================
    // EMPLOYEE ASSIGNMENT CHECK
    // ======================================

    if (
        req.user.role === "employee" &&
        (
            !document.order.assignedEmployee ||
            document.order.assignedEmployee.toString() !== req.user._id.toString()
        )
    ) {
        throw new ApiError(
            403,
            "Unauthorized access"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            document,
            "Document fetched successfully"
        )
    );
});


// ======================================
// VERIFY DOCUMENT
// ======================================
export const verifyDocument = asyncHandler(async (req, res) => {

    const {
        verificationStatus,
        verificationNotes
    } = req.body;

    const document = await Document.findById(req.params.id)
        .populate("order");

    if (!document) {
        throw new ApiError(
            404,
            "Document not found"
        );
    }

    // ======================================
    // EMPLOYEE ASSIGNMENT CHECK
    // ======================================

    if (
        req.user.role === "employee" &&
        (
            !document.order.assignedEmployee ||
            document.order.assignedEmployee.toString() !== req.user._id.toString()
        )
    ) {
        throw new ApiError(
            403,
            "Unauthorized verification access"
        );
    }

    document.verificationStatus = verificationStatus;

    document.verificationNotes = verificationNotes;

    document.verifiedBy = req.user._id;

    document.verifiedAt = new Date();

    await document.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            document,
            "Document verified successfully"
        )
    );
});


// ======================================
// UPDATE DOCUMENT
// ======================================
export const updateDocument = asyncHandler(async (req, res) => {

    const {
        documentName,
        notes
    } = req.body;

    const document = await Document.findById(req.params.id)
        .populate("order");

    if (!document) {
        throw new ApiError(
            404,
            "Document not found"
        );
    }

    // ======================================
    // CLIENT OWNERSHIP CHECK
    // ======================================

    if (
        req.user.role === "client" &&
        document.uploadedBy.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Unauthorized update access"
        );
    }

    // ======================================
    // EMPLOYEE ASSIGNMENT CHECK
    // ======================================

    if (
        req.user.role === "employee" &&
        (
            !document.order.assignedEmployee ||
            document.order.assignedEmployee.toString() !== req.user._id.toString()
        )
    ) {
        throw new ApiError(
            403,
            "Unauthorized update access"
        );
    }

    document.documentName =
        documentName || document.documentName;

    document.notes =
        notes || document.notes;

    await document.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            document,
            "Document updated successfully"
        )
    );
});


// ======================================
// DELETE DOCUMENT
// ======================================
export const deleteDocument = asyncHandler(async (req, res) => {

    const document = await Document.findById(req.params.id);

    if (!document) {
        throw new ApiError(
            404,
            "Document not found"
        );
    }

    // ======================================
    // DELETE FROM CLOUDINARY
    // ======================================

    if (document.publicId) {

        await deleteFromCloudinary(
            document.publicId
        );
    }

    // ======================================
    // DELETE FROM DATABASE
    // ======================================

    await document.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Document deleted successfully"
        )
    );
});