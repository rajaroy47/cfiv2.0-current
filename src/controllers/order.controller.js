import {
    Order,
    Service,
    ServicePlan,
    User
} from "../models/index.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// ======================================
// CREATE ORDER
// ======================================
export const createOrder = asyncHandler(async (req, res) => {

    const {
        service,
        servicePlan,
        notes
    } = req.body;

    // ======================================
    // CHECK SERVICE
    // ======================================

    const existingService = await Service.findById(service);

    if (!existingService) {
        throw new ApiError(
            404,
            "Service not found"
        );
    }

    // ======================================
    // CHECK PLAN
    // ======================================

    const existingPlan = await ServicePlan.findById(servicePlan);

    if (!existingPlan) {
        throw new ApiError(
            404,
            "Service plan not found"
        );
    }

    // ======================================
    // CREATE ORDER
    // ======================================

    const order = await Order.create({
        client: req.user._id,
        service,
        servicePlan,
        amount: existingPlan.salePrice || existingPlan.price,
        notes
    });

    const createdOrder = await Order.findById(order._id)
        .populate("client", "fullName email")
        .populate("service")
        .populate("servicePlan");

    return res.status(201).json(
        new ApiResponse(
            201,
            createdOrder,
            "Order created successfully"
        )
    );
});


// ======================================
// GET ALL ORDERS
// ======================================
export const getAllOrders = asyncHandler(async (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status || "";

    const skip = (page - 1) * limit;

    const query = {};

    // ======================================
    // FILTER STATUS
    // ======================================

    if (status) {
        query.status = status;
    }

    // ======================================
    // EMPLOYEE CAN SEE ONLY ASSIGNED ORDERS
    // ======================================

    if (req.user.role === "employee") {
        query.assignedEmployee = req.user._id;
    }

    const orders = await Order.find(query)
        .populate("client", "fullName email")
        .populate("service", "title")
        .populate("servicePlan", "title price")
        .populate("assignedEmployee", "fullName email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const totalOrders = await Order.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                orders,
                pagination: {
                    totalOrders,
                    currentPage: page,
                    totalPages: Math.ceil(totalOrders / limit),
                    limit
                }
            },
            "Orders fetched successfully"
        )
    );
});


// ======================================
// GET MY ORDERS
// ======================================
export const getMyOrders = asyncHandler(async (req, res) => {

    const query = {};

    // ======================================
    // CLIENT
    // ======================================

    if (req.user.role === "client") {
        query.client = req.user._id;
    }

    // ======================================
    // EMPLOYEE
    // ======================================

    if (req.user.role === "employee") {
        query.assignedEmployee = req.user._id;
    }

    // ======================================
    // ADMIN/SUPER ADMIN
    // ======================================

    if (
        ["admin", "super_admin"].includes(req.user.role)
    ) {
        query.createdBy = req.user._id;
    }

    const orders = await Order.find(query)
        .populate("service", "title")
        .populate("servicePlan", "title price")
        .populate("assignedEmployee", "fullName email")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            orders,
            "Orders fetched successfully"
        )
    );
});


// ======================================
// GET SINGLE ORDER
// ======================================
export const getSingleOrder = asyncHandler(async (req, res) => {

    const order = await Order.findById(req.params.id)
        .populate("client", "fullName email")
        .populate("service")
        .populate("servicePlan")
        .populate("assignedEmployee", "fullName email");

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
        order.client._id.toString() !== req.user._id.toString()
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
            !order.assignedEmployee ||
            order.assignedEmployee._id.toString() !== req.user._id.toString()
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
            order,
            "Order fetched successfully"
        )
    );
});


// ======================================
// ASSIGN EMPLOYEE
// ======================================
export const assignEmployee = asyncHandler(async (req, res) => {

    const { employeeId } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ApiError(
            404,
            "Order not found"
        );
    }

    const employee = await User.findById(employeeId);

    if (!employee) {
        throw new ApiError(
            404,
            "Employee not found"
        );
    }

    // ======================================
    // VALIDATE EMPLOYEE ROLE
    // ======================================

    if (
        ![
            "employee",
            "admin",
            "super_admin"
        ].includes(employee.role)
    ) {
        throw new ApiError(
            400,
            "Invalid employee"
        );
    }

    order.assignedEmployee = employeeId;

    await order.save();

    const updatedOrder = await Order.findById(order._id)
        .populate("client", "fullName email")
        .populate("assignedEmployee", "fullName email");

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedOrder,
            "Employee assigned successfully"
        )
    );
});


// ======================================
// UPDATE ORDER STATUS
// ======================================
export const updateOrderStatus = asyncHandler(async (req, res) => {

    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ApiError(
            404,
            "Order not found"
        );
    }

    // ======================================
    // EMPLOYEE VALIDATION
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
            "You are not assigned to this order"
        );
    }

    // ======================================
    // UPDATE STATUS
    // ======================================

    order.status = status;

    await order.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            order,
            "Order status updated successfully"
        )
    );
});


// ======================================
// DELETE ORDER
// ======================================
export const deleteOrder = asyncHandler(async (req, res) => {

    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new ApiError(
            404,
            "Order not found"
        );
    }

    await order.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Order deleted successfully"
        )
    );
});