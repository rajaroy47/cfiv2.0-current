import {
    Task,
    Order,
    User
} from "../models/index.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// ======================================
// CREATE TASK
// ======================================
export const createTask = asyncHandler(async (req, res) => {

    const {
        order,
        assignedTo,
        title,
        description,
        dueDate,
        priority = "medium"
    } = req.body;

    // ======================================
    // CHECK ORDER
    // ======================================

    const existingOrder = await Order.findById(order)
        .populate("client", "fullName email");

    if (!existingOrder) {
        throw new ApiError(
            404,
            "Order not found"
        );
    }

    // ======================================
    // CHECK EMPLOYEE
    // ======================================

    const employee = await User.findById(assignedTo);

    if (!employee) {
        throw new ApiError(
            404,
            "Employee not found"
        );
    }

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

    // ======================================
    // CREATE TASK
    // ======================================

    const task = await Task.create({
        order,
        assignedTo,
        title,
        description,
        dueDate,
        priority,
        createdBy: req.user._id
    });

    const createdTask = await Task.findById(task._id)
        .populate({
            path: "order",
            populate: [
                {
                    path: "client",
                    select: "fullName email"
                },
                {
                    path: "service",
                    select: "title"
                }
            ]
        })
        .populate(
            "assignedTo",
            "fullName email role"
        )
        .populate(
            "createdBy",
            "fullName email role"
        );

    return res.status(201).json(
        new ApiResponse(
            201,
            createdTask,
            "Task created successfully"
        )
    );
});


// ======================================
// GET ALL TASKS
// ======================================
export const getAllTasks = asyncHandler(async (req, res) => {

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const status = req.query.status || "";

    const priority = req.query.priority || "";

    const skip = (page - 1) * limit;

    const query = {};

    // ======================================
    // FILTER STATUS
    // ======================================

    if (status) {
        query.status = status;
    }

    // ======================================
    // FILTER PRIORITY
    // ======================================

    if (priority) {
        query.priority = priority;
    }

    // ======================================
    // EMPLOYEE CAN ONLY SEE OWN TASKS
    // ======================================

    if (req.user.role === "employee") {
        query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
        .populate({
            path: "order",
            populate: [
                {
                    path: "client",
                    select: "fullName email"
                },
                {
                    path: "service",
                    select: "title"
                }
            ]
        })
        .populate(
            "assignedTo",
            "fullName email role"
        )
        .populate(
            "createdBy",
            "fullName email role"
        )
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const totalTasks =
        await Task.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tasks,
                pagination: {
                    totalTasks,
                    currentPage: page,
                    totalPages: Math.ceil(
                        totalTasks / limit
                    ),
                    limit
                }
            },
            "Tasks fetched successfully"
        )
    );
});


// ======================================
// GET MY TASKS
// ======================================
export const getMyTasks = asyncHandler(async (req, res) => {

    const query = {};

    // ======================================
    // EMPLOYEE TASKS
    // ======================================

    if (req.user.role === "employee") {
        query.assignedTo = req.user._id;
    }

    // ======================================
    // ADMIN CREATED TASKS
    // ======================================

    if (
        ["admin", "super_admin"].includes(req.user.role)
    ) {
        query.createdBy = req.user._id;
    }

    const tasks = await Task.find(query)
        .populate({
            path: "order",
            populate: [
                {
                    path: "client",
                    select: "fullName email"
                },
                {
                    path: "service",
                    select: "title"
                }
            ]
        })
        .populate(
            "assignedTo",
            "fullName email role"
        )
        .populate(
            "createdBy",
            "fullName email role"
        )
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            tasks,
            "Tasks fetched successfully"
        )
    );
});


// ======================================
// GET SINGLE TASK
// ======================================
export const getSingleTask = asyncHandler(async (req, res) => {

    const task = await Task.findById(req.params.id)
        .populate({
            path: "order",
            populate: [
                {
                    path: "client",
                    select: "fullName email"
                },
                {
                    path: "service",
                    select: "title"
                }
            ]
        })
        .populate(
            "assignedTo",
            "fullName email role"
        )
        .populate(
            "createdBy",
            "fullName email role"
        );

    if (!task) {
        throw new ApiError(
            404,
            "Task not found"
        );
    }

    // ======================================
    // EMPLOYEE ACCESS CHECK
    // ======================================

    if (
        req.user.role === "employee" &&
        task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Unauthorized access"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            task,
            "Task fetched successfully"
        )
    );
});


// ======================================
// UPDATE TASK
// ======================================
export const updateTask = asyncHandler(async (req, res) => {

    const {
        title,
        description,
        dueDate,
        priority,
        status
    } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
        throw new ApiError(
            404,
            "Task not found"
        );
    }

    // ======================================
    // EMPLOYEE OWNERSHIP CHECK
    // ======================================

    if (
        req.user.role === "employee" &&
        task.assignedTo.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Unauthorized access"
        );
    }

    // ======================================
    // UPDATE FIELDS
    // ======================================

    if (title) {
        task.title = title;
    }

    if (description) {
        task.description = description;
    }

    if (dueDate) {
        task.dueDate = dueDate;
    }

    if (priority) {
        task.priority = priority;
    }

    if (status) {

        const validStatuses = [
            "pending",
            "in_progress",
            "completed",
            "cancelled"
        ];

        if (!validStatuses.includes(status)) {
            throw new ApiError(
                400,
                "Invalid task status"
            );
        }

        task.status = status;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
        .populate(
            "assignedTo",
            "fullName email role"
        )
        .populate(
            "createdBy",
            "fullName email role"
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedTask,
            "Task updated successfully"
        )
    );
});


// ======================================
// REASSIGN TASK
// ======================================
export const reassignTask = asyncHandler(async (req, res) => {

    const { assignedTo } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
        throw new ApiError(
            404,
            "Task not found"
        );
    }

    // ======================================
    // CHECK EMPLOYEE
    // ======================================

    const employee = await User.findById(assignedTo);

    if (!employee) {
        throw new ApiError(
            404,
            "Employee not found"
        );
    }

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

    task.assignedTo = assignedTo;

    await task.save();

    const updatedTask = await Task.findById(task._id)
        .populate(
            "assignedTo",
            "fullName email role"
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedTask,
            "Task reassigned successfully"
        )
    );
});


// ======================================
// DELETE TASK
// ======================================
export const deleteTask = asyncHandler(async (req, res) => {

    const task = await Task.findById(req.params.id);

    if (!task) {
        throw new ApiError(
            404,
            "Task not found"
        );
    }

    await task.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Task deleted successfully"
        )
    );
});