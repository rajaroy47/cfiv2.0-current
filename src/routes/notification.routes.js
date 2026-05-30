import express from "express";

import {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    sendNotification
} from "../controllers/notification.controller.js";

import {
    verifyToken
} from "../middlewares/auth.middleware.js";

import {
    isAdmin
} from "../middlewares/role.middleware.js";

const router = express.Router();


// ======================================
// GET MY NOTIFICATIONS
// ======================================

/*
    All logged-in users

    Client:
    Own notifications

    Employee:
    Own notifications

    Admin:
    Own notifications

    Super Admin:
    Own notifications
*/
router.get(
    "/",
    verifyToken,
    getMyNotifications
);


// ======================================
// MARK SINGLE NOTIFICATION AS READ
// ======================================

/*
    User can mark
    only own notification
*/
router.patch(
    "/:id/read",
    verifyToken,
    markAsRead
);


// ======================================
// MARK ALL NOTIFICATIONS AS READ
// ======================================

router.patch(
    "/read-all",
    verifyToken,
    markAllAsRead
);


// ======================================
// DELETE SINGLE NOTIFICATION
// ======================================

/*
    User can delete
    only own notification
*/
router.delete(
    "/:id",
    verifyToken,
    deleteNotification
);


// ======================================
// DELETE ALL NOTIFICATIONS
// ======================================

router.delete(
    "/",
    verifyToken,
    deleteAllNotifications
);


// ======================================
// SEND NOTIFICATION
// ======================================

/*
    Admin/Super Admin only

    Can send:
    - single user
    - multiple users
    - role based users
    - all users
*/
router.post(
    "/send",
    verifyToken,
    isAdmin,
    sendNotification
);


export default router;