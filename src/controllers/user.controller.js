import { User } from "../models/index.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// ======================================
// GET ALL USERS
// ======================================
export const getAllUsers = asyncHandler(async (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const query = {
        $or: [
            {
                fullName: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                email: {
                    $regex: search,
                    $options: "i"
                }
            }
        ]
    };

    const users = await User.find(query)
        .select("-password -refreshToken")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users,
                pagination: {
                    totalUsers,
                    currentPage: page,
                    totalPages: Math.ceil(totalUsers / limit),
                    limit
                }
            },
            "Users fetched successfully"
        )
    );
});


// ======================================
// GET SINGLE USER
// ======================================
export const getSingleUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id)
        .select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "User fetched successfully"
        )
    );
});


// ======================================
// GET MY PROFILE
// ======================================

export const getMyProfile = asyncHandler(async (req, res) => {
    // 1. Destructure for cleaner code
    const userId = req.user._id;

    // 2. Use findById and exclude sensitive fields
    const user = await User.findById(userId).select("-password -refreshToken");

    // 3. Fail early if user was deleted or token is invalid
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 4. Return secure response
    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Profile fetched successfully"
        )
    );
});


// ======================================
// UPDATE PROFILE
// ======================================

export const updateProfile = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const {
        fullName,
        phone,
        avatar,

        // employee fields
        department,
        designation,
        salary,
        joiningDate,
        employeeCode,

        // client fields
        gstNumber,
        panNumber,
        aadhaarNumber,
        companyName,
        businessType,

        address
    } = req.body;

    // ======================================
    // COMMON FIELDS
    // ======================================

    if (fullName !== undefined) {
        user.fullName = fullName;
    }

    if (phone !== undefined) {
        user.phone = phone;
    }

    if (avatar !== undefined) {
        user.avatar = avatar;
    }

    // ======================================
    // EMPLOYEE UPDATE
    // ======================================

    if (
        ["employee", "admin", "super_admin"].includes(user.role)
    ) {

        if (department !== undefined) {
            user.employeeDetails.department = department;
        }

        if (designation !== undefined) {
            user.employeeDetails.designation = designation;
        }

        if (salary !== undefined) {
            user.employeeDetails.salary = salary;
        }

        if (joiningDate !== undefined) {
            user.employeeDetails.joiningDate = joiningDate;
        }

        if (employeeCode !== undefined) {
            user.employeeDetails.employeeCode = employeeCode;
        }
    }

    // ======================================
    // CLIENT UPDATE
    // ======================================

    if (user.role === "client") {

        if (gstNumber !== undefined) {
            user.clientDetails.gstNumber = gstNumber;
        }

        if (panNumber !== undefined) {
            user.clientDetails.panNumber = panNumber;
        }

        if (aadhaarNumber !== undefined) {
            user.clientDetails.aadhaarNumber = aadhaarNumber;
        }

        if (companyName !== undefined) {
            user.clientDetails.companyName = companyName;
        }

        if (businessType !== undefined) {
            user.clientDetails.businessType = businessType;
        }

        // ADDRESS
        if (address) {

            if (address.street !== undefined) {
                user.clientDetails.address.street = address.street;
            }

            if (address.city !== undefined) {
                user.clientDetails.address.city = address.city;
            }

            if (address.state !== undefined) {
                user.clientDetails.address.state = address.state;
            }

            if (address.pincode !== undefined) {
                user.clientDetails.address.pincode = address.pincode;
            }

            if (address.country !== undefined) {
                user.clientDetails.address.country = address.country;
            }
        }
    }

    await user.save();

    const updatedUser = await User.findById(userId)
        .select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedUser,
            "Profile updated successfully"
        )
    );
});


// ======================================
// CREATE EMPLOYEE
// ======================================
export const createEmployee = asyncHandler(async (req, res) => {

    const {
        fullName,
        email,
        password,
        phone,
        department,
        designation,
        salary
    } = req.body;

    const existingEmployee = await User.findOne({ email });

    if (existingEmployee) {
        throw new ApiError(400, "Employee already exists");
    }

    const employee = await User.create({
        fullName,
        email,
        password,
        phone,
        role: "employee",

        employeeDetails: {
            department,
            designation,
            salary
        },

        createdBy: req.user._id
    });

    const createdEmployee = await User.findById(employee._id)
        .select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(
            201,
            createdEmployee,
            "Employee created successfully"
        )
    );
});


// ======================================
// BLOCK USER
// ======================================
export const blockUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.isBlocked = true;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "User blocked successfully"
        )
    );
});


// ======================================
// UNBLOCK USER
// ======================================
export const unblockUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.isBlocked = false;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "User unblocked successfully"
        )
    );
});


// ======================================
// DELETE USER
// ======================================
export const deleteUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await user.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "User deleted successfully"
        )
    );
});