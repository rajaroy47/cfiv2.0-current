import express from "express";

import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changePassword,
    forgotPassword,
    resetPassword
} from "../controllers/auth.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout",
    verifyToken,
    logoutUser
);

router.post("/refresh-token",
    refreshAccessToken
);

router.get("/me",
    verifyToken,
    getCurrentUser
);

router.post("/change-password",
    verifyToken,
    changePassword
);

router.post("/forgot-password",
    forgotPassword
);

router.post("/reset-password",
    resetPassword
);

export default router;