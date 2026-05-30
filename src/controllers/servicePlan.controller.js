import {
    ServicePlan,
    Service
} from "../models/index.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// ======================================
// CREATE SERVICE PLAN
// ======================================
export const createServicePlan = asyncHandler(async (req, res) => {

    const {
        serviceId,
        name,
        slug,
        price,
        features,
        deliveryTime,
        revisions,
        description,
        isPopular
    } = req.body;

    // check service

    console.log(serviceId);
    const existingService = await Service.findById(serviceId);

    if (!existingService) {
        throw new ApiError(
            404,
            "Service not found"
        );
    }

    // check duplicate slug
    const existingPlan = await ServicePlan.findOne({
        slug
    });

    if (existingPlan) {
        throw new ApiError(
            400,
            "Service plan already exists"
        );
    }

    // create plan
    const plan = await ServicePlan.create({
        serviceId,
        name,
        slug,
        price,
        features,
        deliveryTime,
        revisions,
        description,
        isPopular,
        createdBy: req.user._id
    });

    const createdPlan = await ServicePlan.findById(plan._id)
        .populate("serviceId");

    return res.status(201).json(
        new ApiResponse(
            201,
            createdPlan,
            "Service plan created successfully"
        )
    );
});


// ======================================
// GET ALL SERVICE PLANS
// ======================================
export const getAllServicePlans = asyncHandler(async (req, res) => {

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

    const plans = await ServicePlan.find(query)
        .populate("serviceId")
        .populate("createdBy", "fullName email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const totalPlans =
        await ServicePlan.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                plans,
                pagination: {
                    totalPlans,
                    currentPage: page,
                    totalPages: Math.ceil(
                        totalPlans / limit
                    ),
                    limit
                }
            },
            "Service plans fetched successfully"
        )
    );
});


// ======================================
// GET SINGLE SERVICE PLAN
// ======================================
export const getSingleServicePlan = asyncHandler(async (req, res) => {

    const plan = await ServicePlan.findById(
        req.params.id
    )
        .populate("serviceId")
        .populate("createdBy", "fullName email");

    if (!plan) {
        throw new ApiError(
            404,
            "Service plan not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            plan,
            "Service plan fetched successfully"
        )
    );
});


// ======================================
// GET SERVICE PLANS BY SERVICE
// ======================================
export const getPlansByService = asyncHandler(async (req, res) => {

    const plans = await ServicePlan.find({
        service: req.params.serviceId
    }).populate("serviceId");

    return res.status(200).json(
        new ApiResponse(
            200,
            plans,
            "Service plans fetched successfully"
        )
    );
});


// ======================================
// UPDATE SERVICE PLAN
// ======================================
export const updateServicePlan = asyncHandler(async (req, res) => {

    const {
        name,
        slug,
        price,
        features,
        deliveryTime,
        revisions,
        description,
        isPopular,
        isActive
    } = req.body;

    const plan = await ServicePlan.findById(
        req.params.id
    );

    if (!plan) {
        throw new ApiError(
            404,
            "Service plan not found"
        );
    }

    plan.title =
        title || plan.title;

    plan.slug =
        slug || plan.slug;

    plan.price =
        price || plan.price;

    plan.salePrice =
        salePrice || plan.salePrice;

    plan.features =
        features || plan.features;

    plan.deliveryTime =
        deliveryTime || plan.deliveryTime;

    plan.revisions =
        revisions || plan.revisions;

    plan.description =
        description || plan.description;

    plan.isPopular =
        isPopular ?? plan.isPopular;

    plan.isActive =
        isActive ?? plan.isActive;

    await plan.save();

    const updatedPlan = await ServicePlan.findById(plan._id)
        .populate("service");

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlan,
            "Service plan updated successfully"
        )
    );
});


// ======================================
// DELETE SERVICE PLAN
// ======================================
export const deleteServicePlan = asyncHandler(async (req, res) => {

    const plan = await ServicePlan.findById(
        req.params.id
    );

    if (!plan) {
        throw new ApiError(
            404,
            "Service plan not found"
        );
    }

    await plan.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Service plan deleted successfully"
        )
    );
});