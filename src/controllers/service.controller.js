import {
    Service
} from "../models/index.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// ======================================
// CREATE SERVICE
// ======================================
export const createService = asyncHandler(async (req, res) => {

    const {
        title,
        slug,
        shortDescription,
        description,
        category,
        thumbnail,
        startingPrice,
        features,
        isFeatured
    } = req.body;

    const existingService = await Service.findOne({
        slug
    });

    if (existingService) {
        throw new ApiError(
            400,
            "Service already exists"
        );
    }

    const service = await Service.create({
        title,
        slug,
        shortDescription,
        description,
        category,
        thumbnail,
        startingPrice,
        features,
        isFeatured,
        createdBy: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            service,
            "Service created successfully"
        )
    );
});


// ======================================
// GET ALL SERVICES
// ======================================
export const getAllServices = asyncHandler(async (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const query = {
        title: {
            $regex: search,
            $options: "i"
        }
    };

    const services = await Service.find(query)
        .populate("createdBy", "fullName email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const totalServices =
        await Service.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                services,
                pagination: {
                    totalServices,
                    currentPage: page,
                    totalPages: Math.ceil(
                        totalServices / limit
                    ),
                    limit
                }
            },
            "Services fetched successfully"
        )
    );
});


// ======================================
// GET SINGLE SERVICE
// ======================================
export const getSingleService = asyncHandler(async (req, res) => {

    const service = await Service.findById(
        req.params.id
    ).populate(
        "createdBy",
        "fullName email"
    );

    if (!service) {
        throw new ApiError(
            404,
            "Service not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            service,
            "Service fetched successfully"
        )
    );
});


// ======================================
// UPDATE SERVICE
// ======================================
export const updateService = asyncHandler(async (req, res) => {

    const {
        title,
        slug,
        shortDescription,
        description,
        category,
        thumbnail,
        startingPrice,
        features,
        isFeatured,
        isActive
    } = req.body;

    const service = await Service.findById(
        req.params.id
    );

    if (!service) {
        throw new ApiError(
            404,
            "Service not found"
        );
    }

    service.title =
        title || service.title;

    service.slug =
        slug || service.slug;

    service.shortDescription =
        shortDescription || service.shortDescription;

    service.description =
        description || service.description;

    service.category =
        category || service.category;

    service.thumbnail =
        thumbnail || service.thumbnail;

    service.startingPrice =
        startingPrice || service.startingPrice;

    service.features =
        features || service.features;

    service.isFeatured =
        isFeatured ?? service.isFeatured;

    service.isActive =
        isActive ?? service.isActive;

    await service.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            service,
            "Service updated successfully"
        )
    );
});


// ======================================
// DELETE SERVICE
// ======================================
export const deleteService = asyncHandler(async (req, res) => {

    const service = await Service.findById(
        req.params.id
    );

    if (!service) {
        throw new ApiError(
            404,
            "Service not found"
        );
    }

    await service.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Service deleted successfully"
        )
    );
});