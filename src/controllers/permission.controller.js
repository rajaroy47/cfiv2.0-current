import {
    Permission
} from "../models/index.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// ======================================
// CREATE PERMISSION
// ======================================
export const createPermission = asyncHandler(async (req, res) => {

    const {
        name,
        module,
        action,
        description
    } = req.body;

    const existingPermission =
        await Permission.findOne({
            name: name.toLowerCase()
        });

    if (existingPermission) {
        throw new ApiError(
            400,
            "Permission already exists"
        );
    }

    const permission = await Permission.create({
        name: name.toLowerCase(),
        module,
        action,
        description
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            permission,
            "Permission created successfully"
        )
    );
});


// ======================================
// GET ALL PERMISSIONS
// ======================================
export const getAllPermissions = asyncHandler(async (req, res) => {

    const permissions = await Permission.find()
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            permissions,
            "Permissions fetched successfully"
        )
    );
});


// ======================================
// GET SINGLE PERMISSION
// ======================================
export const getSinglePermission = asyncHandler(async (req, res) => {

    const permission = await Permission.findById(
        req.params.id
    );

    if (!permission) {
        throw new ApiError(
            404,
            "Permission not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            permission,
            "Permission fetched successfully"
        )
    );
});


// ======================================
// UPDATE PERMISSION
// ======================================
export const updatePermission = asyncHandler(async (req, res) => {

    const {
        name,
        module,
        action,
        description
    } = req.body;

    const permission =
        await Permission.findById(req.params.id);

    if (!permission) {
        throw new ApiError(
            404,
            "Permission not found"
        );
    }

    permission.name =
        name?.toLowerCase() || permission.name;

    permission.module =
        module || permission.module;

    permission.action =
        action || permission.action;

    permission.description =
        description || permission.description;

    await permission.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            permission,
            "Permission updated successfully"
        )
    );
});


// ======================================
// DELETE PERMISSION
// ======================================
export const deletePermission = asyncHandler(async (req, res) => {

    const permission =
        await Permission.findById(req.params.id);

    if (!permission) {
        throw new ApiError(
            404,
            "Permission not found"
        );
    }

    await permission.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Permission deleted successfully"
        )
    );
});