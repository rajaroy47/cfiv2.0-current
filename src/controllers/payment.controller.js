import crypto from "crypto";

import {
    Payment,
    Order
} from "../models/index.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// ======================================
// CREATE PAYMENT
// ======================================
export const createPayment = asyncHandler(async (req, res) => {

    const {
        orderId,
        paymentMethod,
        transactionId
    } = req.body;

    // ======================================
    // CHECK ORDER
    // ======================================

    const order = await Order.findById(orderId);

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
            "Unauthorized payment access"
        );
    }

    // ======================================
    // PREVENT DUPLICATE PAYMENT
    // ======================================

    const existingPayment = await Payment.findOne({
        order: orderId
    });

    if (existingPayment) {
        throw new ApiError(
            400,
            "Payment already exists"
        );
    }

    // ======================================
    // CREATE PAYMENT
    // ======================================

    const payment = await Payment.create({
        order: orderId,
        client: req.user._id,
        amount: order.amount,
        paymentMethod,
        transactionId,
        paymentStatus: "pending"
    });

    const createdPayment = await Payment.findById(payment._id)
        .populate("client", "fullName email")
        .populate({
            path: "order",
            populate: {
                path: "service",
                select: "title"
            }
        });

    return res.status(201).json(
        new ApiResponse(
            201,
            createdPayment,
            "Payment created successfully"
        )
    );
});


// ======================================
// GET ALL PAYMENTS
// ======================================
export const getAllPayments = asyncHandler(async (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const query = {};

    // ======================================
    // EMPLOYEE CAN SEE ASSIGNED PAYMENTS
    // ======================================

    if (req.user.role === "employee") {

        const assignedOrders = await Order.find({
            assignedEmployee: req.user._id
        }).select("_id");

        query.order = {
            $in: assignedOrders.map(order => order._id)
        };
    }

    const payments = await Payment.find(query)
        .populate("client", "fullName email")
        .populate({
            path: "order",
            populate: {
                path: "service",
                select: "title"
            }
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const totalPayments = await Payment.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                payments,
                pagination: {
                    totalPayments,
                    currentPage: page,
                    totalPages: Math.ceil(totalPayments / limit),
                    limit
                }
            },
            "Payments fetched successfully"
        )
    );
});


// ======================================
// GET MY PAYMENTS
// ======================================
export const getMyPayments = asyncHandler(async (req, res) => {

    const query = {};

    // ======================================
    // CLIENT PAYMENTS
    // ======================================

    if (req.user.role === "client") {
        query.client = req.user._id;
    }

    // ======================================
    // EMPLOYEE PAYMENTS
    // ======================================

    if (req.user.role === "employee") {

        const assignedOrders = await Order.find({
            assignedEmployee: req.user._id
        }).select("_id");

        query.order = {
            $in: assignedOrders.map(order => order._id)
        };
    }

    const payments = await Payment.find(query)
        .populate({
            path: "order",
            populate: {
                path: "service",
                select: "title"
            }
        })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            payments,
            "Payments fetched successfully"
        )
    );
});


// ======================================
// GET SINGLE PAYMENT
// ======================================
export const getSinglePayment = asyncHandler(async (req, res) => {

    const payment = await Payment.findById(req.params.id)
        .populate("client", "fullName email")
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
        });

    if (!payment) {
        throw new ApiError(
            404,
            "Payment not found"
        );
    }

    // ======================================
    // CLIENT OWNERSHIP CHECK
    // ======================================

    if (
        req.user.role === "client" &&
        payment.client._id.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Unauthorized access"
        );
    }

    // ======================================
    // EMPLOYEE OWNERSHIP CHECK
    // ======================================

    if (
        req.user.role === "employee" &&
        (
            !payment.order.assignedEmployee ||
            payment.order.assignedEmployee._id.toString() !== req.user._id.toString()
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
            payment,
            "Payment fetched successfully"
        )
    );
});


// ======================================
// VERIFY PAYMENT
// ======================================
export const verifyPayment = asyncHandler(async (req, res) => {

    const {
        paymentId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;

    // ======================================
    // CHECK PAYMENT
    // ======================================

    const payment = await Payment.findById(paymentId)
        .populate("order");

    if (!payment) {
        throw new ApiError(
            404,
            "Payment not found"
        );
    }

    // ======================================
    // CLIENT OWNERSHIP CHECK
    // ======================================

    if (
        req.user.role === "client" &&
        payment.client.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Unauthorized access"
        );
    }

    // ======================================
    // PREVENT DUPLICATE VERIFICATION
    // ======================================

    if (payment.paymentStatus === "paid") {
        throw new ApiError(
            400,
            "Payment already verified"
        );
    }

    // ======================================
    // VERIFY SIGNATURE
    // ======================================

    const body =
        razorpay_order_id +
        "|" +
        razorpay_payment_id;

    const generatedSignature = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(body.toString())
        .digest("hex");

    const isAuthentic =
        generatedSignature === razorpay_signature;

    if (!isAuthentic) {
        throw new ApiError(
            400,
            "Invalid payment signature"
        );
    }

    // ======================================
    // UPDATE PAYMENT
    // ======================================

    payment.paymentStatus = "paid";

    payment.transactionId = razorpay_payment_id;

    payment.paidAt = new Date();

    await payment.save();

    // ======================================
    // UPDATE ORDER PAYMENT STATUS
    // ======================================

    payment.order.paymentStatus = "paid";

    await payment.order.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                verified: true,
                payment
            },
            "Payment verified successfully"
        )
    );
});


// ======================================
// UPDATE PAYMENT STATUS
// ======================================
export const updatePaymentStatus = asyncHandler(async (req, res) => {

    const { paymentStatus } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        throw new ApiError(
            404,
            "Payment not found"
        );
    }

    payment.paymentStatus = paymentStatus;

    // ======================================
    // AUTO UPDATE PAID DATE
    // ======================================

    if (paymentStatus === "paid") {
        payment.paidAt = new Date();
    }

    await payment.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            payment,
            "Payment status updated successfully"
        )
    );
});


// ======================================
// DELETE PAYMENT
// ======================================
export const deletePayment = asyncHandler(async (req, res) => {

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        throw new ApiError(
            404,
            "Payment not found"
        );
    }

    await payment.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Payment deleted successfully"
        )
    );
});