import { Notification, User } from "../models/index.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// ======================================
// GET MY NOTIFICATIONS
// ======================================
export const getMyNotifications = asyncHandler(async (req, res) => {

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 20;

    const type = req.query.type || "";

    const isRead = req.query.isRead;

    const skip = (page - 1) * limit;

    // ======================================
    // QUERY
    // ======================================

    const query = {
        userId: req.user._id
    };

    // ======================================
    // FILTER TYPE
    // ======================================

    if (type) {
        query.type = type;
    }

    // ======================================
    // FILTER READ STATUS
    // ======================================

    if (isRead === "true") {
        query.isRead = true;
    }

    if (isRead === "false") {
        query.isRead = false;
    }

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(
            "triggeredBy",
            "fullName avatar role"
        );

    const total =
        await Notification.countDocuments(query);

    const unreadCount =
        await Notification.countDocuments({
            userId: req.user._id,
            isRead: false
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                notifications,
                unreadCount,
                pagination: {
                    total,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    limit
                }
            },
            "Notifications fetched successfully"
        )
    );
});


// ======================================
// MARK SINGLE NOTIFICATION AS READ
// ======================================
export const markAsRead = asyncHandler(async (req, res) => {

    const notification = await Notification.findOne({
        _id: req.params.id,
        userId: req.user._id
    });

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found"
        );
    }

    // ======================================
    // ALREADY READ
    // ======================================

    if (!notification.isRead) {

        notification.isRead = true;

        notification.readAt = new Date();

        await notification.save();
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            notification,
            "Notification marked as read"
        )
    );
});


// ======================================
// MARK ALL NOTIFICATIONS AS READ
// ======================================
export const markAllAsRead = asyncHandler(async (req, res) => {

    await Notification.updateMany(
        {
            userId: req.user._id,
            isRead: false
        },
        {
            $set: {
                isRead: true,
                readAt: new Date()
            }
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "All notifications marked as read"
        )
    );
});


// ======================================
// DELETE SINGLE NOTIFICATION
// ======================================
export const deleteNotification = asyncHandler(async (req, res) => {

    const notification =
        await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

    if (!notification) {
        throw new ApiError(
            404,
            "Notification not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Notification deleted successfully"
        )
    );
});


// ======================================
// DELETE ALL NOTIFICATIONS
// ======================================
export const deleteAllNotifications = asyncHandler(async (req, res) => {

    await Notification.deleteMany({
        userId: req.user._id
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "All notifications deleted successfully"
        )
    );
});


// ======================================
// SEND NOTIFICATION
// ======================================
export const sendNotification = asyncHandler(async (req, res) => {

    const {
        userId,
        userIds,
        role,
        title,
        message,
        type = "general",
        redirectUrl = "",
        relatedModel = "",
        relatedId = null
    } = req.body;

    // ======================================
    // VALIDATION
    // ======================================

    if (!title || !message) {
        throw new ApiError(
            400,
            "Title and message are required"
        );
    }

    let users = [];

    // ======================================
    // SEND TO SINGLE USER
    // ======================================

    if (userId) {

        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(
                404,
                "User not found"
            );
        }

        users = [user];
    }

    // ======================================
    // SEND TO MULTIPLE USERS
    // ======================================

    else if (
        userIds &&
        Array.isArray(userIds) &&
        userIds.length > 0
    ) {

        users = await User.find({
            _id: { $in: userIds }
        });
    }

    // ======================================
    // SEND TO ROLE
    // ======================================

    else if (role) {

        const validRoles = [
            "client",
            "employee",
            "admin",
            "super_admin"
        ];

        if (!validRoles.includes(role)) {
            throw new ApiError(
                400,
                "Invalid role"
            );
        }

        users = await User.find({ role });
    }

    // ======================================
    // SEND TO ALL USERS
    // ======================================

    else {

        users = await User.find({});
    }

    // ======================================
    // CHECK USERS
    // ======================================

    if (!users.length) {
        throw new ApiError(
            404,
            "No users found"
        );
    }

    // ======================================
    // CREATE NOTIFICATIONS
    // ======================================

    const notificationsData = users.map((user) => ({
        userId: user._id,
        title,
        message,
        type,
        redirectUrl,
        relatedModel,
        relatedId,
        triggeredBy: req.user._id
    }));

    await Notification.insertMany(
        notificationsData
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                totalSent: notificationsData.length
            },
            "Notification sent successfully"
        )
    );
});