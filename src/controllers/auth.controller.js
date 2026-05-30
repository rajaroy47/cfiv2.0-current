import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateTokens from "../utils/generateTokens.js";


// =============================
// REGISTER USER
// =============================
export const registerUser = asyncHandler(async (req, res) => {

    const {
        fullName,
        email,
        password,
        phone,
        role = "client"
    } = req.body;

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    // create user
    const user = await User.create({
        fullName,
        email,
        password,
        phone,
        role
    });

    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    );
});


// =============================
// LOGIN USER
// =============================
export const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email })
        .select("+password +refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isBlocked) {
        throw new ApiError(403, "Your account is blocked");
    }

    // Check timeout first
    if (user.timeOut && user.timeOut > Date.now()) {
        throw new ApiError(
            429,
            "Too many failed attempts. Try again later."
        );
    }

    const isPasswordCorrect = await user.comparePassword(password);

    // Wrong password
    if (!isPasswordCorrect) {

        user.failedLoginAttempts =
            (user.failedLoginAttempts || 0) + 1;

        // Lock account after 5 attempts
        if (user.failedLoginAttempts >= 5) {

            user.timeOut = new Date(
                Date.now() + (5 * 60 * 1000)
            );

            await user.save({ validateBeforeSave: false });

            throw new ApiError(
                429,
                "Too many failed attempts. Account locked for 5 minutes."
            );
        }

        await user.save({ validateBeforeSave: false });

        throw new ApiError(401, "Invalid credentials");
    }

    // Reset after successful login
    user.failedLoginAttempts = 0;
    user.timeOut = null;

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();

    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: false
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "Login successful"
            )
        );
});


// =============================
// LOGOUT USER
// =============================
export const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: false
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "Logged out successfully"
            )
        );
});


// =============================
// REFRESH ACCESS TOKEN
// =============================
export const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken =
        req.cookies.refreshToken ||
        req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token missing");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }

    const user = await User.findById(decodedToken?._id).select("+refreshToken");

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (user.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is expired or already used");
    }

    const {
        accessToken,
        refreshToken
    } = generateTokens(user);

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: false
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken
                },
                "Access token refreshed"
            )
        );
});


// =============================
// GET CURRENT USER
// =============================
export const getCurrentUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id)
        .select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Current user fetched"
        )
    );
});


// =============================
// CHANGE PASSWORD
// =============================
export const changePassword = asyncHandler(async (req, res) => {

    const {
        oldPassword,
        newPassword
    } = req.body;

    const user = await User.findById(req.user._id)
        .select("+password");

    const isPasswordCorrect =
        await user.comparePassword(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old password incorrect");
    }

    user.password = newPassword;

    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    );
});


// =============================
// FORGOT PASSWORD
// =============================
export const forgotPassword = asyncHandler(async (req, res) => {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const resetToken =
        crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = resetToken;

    user.passwordResetExpiry =
        Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                resetToken
            },
            "Password reset token generated"
        )
    );
});


// =============================
// RESET PASSWORD
// =============================
export const resetPassword = asyncHandler(async (req, res) => {

    const {
        token,
        newPassword
    } = req.body;

    const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpiry: { $gt: Date.now() }
    }).select("+password");

    if (!user) {
        throw new ApiError(400, "Invalid or expired token");
    }

    user.password = newPassword;

    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;

    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password reset successful"
        )
    );
});