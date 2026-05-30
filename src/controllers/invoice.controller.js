import {
    Invoice,
    Order,
    Payment
} from "../models/index.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// ======================================
// CREATE INVOICE
// ======================================
export const createInvoice = asyncHandler(async (req, res) => {

    const {
        orderId,
        dueDate,
        notes,
        taxAmount = 0
    } = req.body;

    // ======================================
    // CHECK ORDER
    // ======================================

    const order = await Order.findById(orderId)
        .populate("client")
        .populate("service")
        .populate("servicePlan")
        .populate("assignedEmployee");

    if (!order) {
        throw new ApiError(
            404,
            "Order not found"
        );
    }

    // ======================================
    // CHECK EXISTING INVOICE
    // ======================================

    const existingInvoice = await Invoice.findOne({
        order: orderId
    });

    if (existingInvoice) {
        throw new ApiError(
            400,
            "Invoice already exists"
        );
    }

    // ======================================
    // OPTIONAL PAYMENT CHECK
    // ======================================

    const payment = await Payment.findOne({
        order: orderId,
        paymentStatus: "paid"
    });

    // ======================================
    // CALCULATE TOTALS
    // ======================================

    const subtotal = order.amount;

    const totalAmount =
        Number(subtotal) + Number(taxAmount);

    // ======================================
    // CREATE INVOICE
    // ======================================

    const invoice = await Invoice.create({
        order: orderId,
        client: order.client._id,

        invoiceNumber: `INV-${Date.now()}`,

        subtotal,
        taxAmount,
        totalAmount,

        dueDate,
        notes,

        status: payment
            ? "paid"
            : "pending",

        createdBy: req.user._id
    });

    const createdInvoice = await Invoice.findById(invoice._id)
        .populate(
            "client",
            "fullName email phone"
        )
        .populate({
            path: "order",
            populate: [
                {
                    path: "service",
                    select: "title"
                },
                {
                    path: "servicePlan",
                    select: "title price salePrice"
                },
                {
                    path: "assignedEmployee",
                    select: "fullName email"
                }
            ]
        })
        .populate(
            "createdBy",
            "fullName email role"
        );

    return res.status(201).json(
        new ApiResponse(
            201,
            createdInvoice,
            "Invoice created successfully"
        )
    );
});


// ======================================
// GET ALL INVOICES
// ======================================
export const getAllInvoices = asyncHandler(async (req, res) => {

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const query = {};

    // ======================================
    // EMPLOYEE CAN SEE ASSIGNED INVOICES
    // ======================================

    if (req.user.role === "employee") {

        const assignedOrders = await Order.find({
            assignedEmployee: req.user._id
        }).select("_id");

        query.order = {
            $in: assignedOrders.map(order => order._id)
        };
    }

    const invoices = await Invoice.find(query)
        .populate(
            "client",
            "fullName email phone"
        )
        .populate({
            path: "order",
            populate: [
                {
                    path: "service",
                    select: "title"
                },
                {
                    path: "assignedEmployee",
                    select: "fullName email"
                }
            ]
        })
        .populate(
            "createdBy",
            "fullName email role"
        )
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const totalInvoices =
        await Invoice.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                invoices,
                pagination: {
                    totalInvoices,
                    currentPage: page,
                    totalPages: Math.ceil(
                        totalInvoices / limit
                    ),
                    limit
                }
            },
            "Invoices fetched successfully"
        )
    );
});


// ======================================
// GET MY INVOICES
// ======================================
export const getMyInvoices = asyncHandler(async (req, res) => {

    const query = {};

    // ======================================
    // CLIENT INVOICES
    // ======================================

    if (req.user.role === "client") {
        query.client = req.user._id;
    }

    // ======================================
    // EMPLOYEE INVOICES
    // ======================================

    if (req.user.role === "employee") {

        const assignedOrders = await Order.find({
            assignedEmployee: req.user._id
        }).select("_id");

        query.order = {
            $in: assignedOrders.map(order => order._id)
        };
    }

    const invoices = await Invoice.find(query)
        .populate({
            path: "order",
            populate: [
                {
                    path: "service",
                    select: "title"
                },
                {
                    path: "servicePlan",
                    select: "title price"
                }
            ]
        })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            invoices,
            "Invoices fetched successfully"
        )
    );
});


// ======================================
// GET SINGLE INVOICE
// ======================================
export const getSingleInvoice = asyncHandler(async (req, res) => {

    const invoice = await Invoice.findById(req.params.id)
        .populate(
            "client",
            "fullName email phone"
        )
        .populate({
            path: "order",
            populate: [
                {
                    path: "service",
                    select: "title"
                },
                {
                    path: "servicePlan",
                    select: "title price"
                },
                {
                    path: "assignedEmployee",
                    select: "fullName email"
                }
            ]
        })
        .populate(
            "createdBy",
            "fullName email role"
        );

    if (!invoice) {
        throw new ApiError(
            404,
            "Invoice not found"
        );
    }

    // ======================================
    // CLIENT OWNERSHIP CHECK
    // ======================================

    if (
        req.user.role === "client" &&
        invoice.client._id.toString() !== req.user._id.toString()
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
            !invoice.order.assignedEmployee ||
            invoice.order.assignedEmployee._id.toString() !== req.user._id.toString()
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
            invoice,
            "Invoice fetched successfully"
        )
    );
});


// ======================================
// UPDATE INVOICE STATUS
// ======================================
export const updateInvoiceStatus = asyncHandler(async (req, res) => {

    const { status } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
        throw new ApiError(
            404,
            "Invoice not found"
        );
    }

    // ======================================
    // VALID STATUS CHECK
    // ======================================

    const validStatuses = [
        "pending",
        "paid",
        "cancelled",
        "overdue"
    ];

    if (!validStatuses.includes(status)) {
        throw new ApiError(
            400,
            "Invalid invoice status"
        );
    }

    invoice.status = status;

    await invoice.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            invoice,
            "Invoice status updated successfully"
        )
    );
});


// ======================================
// DELETE INVOICE
// ======================================
export const deleteInvoice = asyncHandler(async (req, res) => {

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
        throw new ApiError(
            404,
            "Invoice not found"
        );
    }

    await invoice.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Invoice deleted successfully"
        )
    );
});