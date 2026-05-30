import {
    Role,
    Permission
} from "../models/index.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// ======================================
// CREATE ROLE
// ======================================
export const createRole = asyncHandler(async (req, res) => {

    const {
        name,
        description,
        permissions
    } = req.body;

    // check existing role
    const existingRole = await Role.findOne({
        name: name.toLowerCase()
    });

    if (existingRole) {
        throw new ApiError(400, "Role already exists");
    }

    // validate permissions
    if (permissions && permissions.length > 0) {

        const permissionDocs = await Permission.find({
            _id: { $in: permissions }
        });

        if (permissionDocs.length !== permissions.length) {
            throw new ApiError(
                400,
                "Some permissions are invalid"
            );
        }
    }

    // create role
    const role = await Role.create({
        name: name.toLowerCase(),
        description,
        permissions
    });

    const createdRole = await Role.findById(role._id)
        .populate("permissions");

    return res.status(201).json(
        new ApiResponse(
            201,
            createdRole,
            "Role created successfully"
        )
    );
});


// ======================================
// GET ALL ROLES
// ======================================
export const getAllRoles = asyncHandler(async (req, res) => {

    const roles = await Role.find()
        .populate("permissions")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            roles,
            "Roles fetched successfully"
        )
    );
});


// ======================================
// GET SINGLE ROLE
// ======================================
export const getSingleRole = asyncHandler(async (req, res) => {

    const role = await Role.findById(req.params.id)
        .populate("permissions");

    if (!role) {
        throw new ApiError(404, "Role not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            role,
            "Role fetched successfully"
        )
    );
});


// ======================================
// UPDATE ROLE
// ======================================
export const updateRole = asyncHandler(async (req, res) => {

    const {
        name,
        description,
        permissions
    } = req.body;

    const role = await Role.findById(req.params.id);

    if (!role) {
        throw new ApiError(404, "Role not found");
    }

    // validate permissions
    if (permissions && permissions.length > 0) {

        const permissionDocs = await Permission.find({
            _id: { $in: permissions }
        });

        if (permissionDocs.length !== permissions.length) {
            throw new ApiError(
                400,
                "Some permissions are invalid"
            );
        }
    }

    role.name = name || role.name;
    role.description = description || role.description;

    if (permissions) {
        role.permissions = permissions;
    }

    await role.save();

    const updatedRole = await Role.findById(role._id)
        .populate("permissions");

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedRole,
            "Role updated successfully"
        )
    );
});


// ======================================
// DELETE ROLE
// ======================================
export const deleteRole = asyncHandler(async (req, res) => {

    const role = await Role.findById(req.params.id);

    if (!role) {
        throw new ApiError(404, "Role not found");
    }

    await role.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Role deleted successfully"
        )
    );
});