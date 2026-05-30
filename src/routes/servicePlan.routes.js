import express from "express";

import {
    createServicePlan,
    getAllServicePlans,
    getSingleServicePlan,
    getPlansByService,
    updateServicePlan,
    deleteServicePlan
} from "../controllers/servicePlan.controller.js";

import {
    verifyToken
} from "../middlewares/auth.middleware.js";

import {
    isAdmin,
    isSuperAdmin
} from "../middlewares/role.middleware.js";

const router = express.Router();


// ======================================
// CREATE SERVICE PLAN
// ======================================
router.post(
    "/create",
    verifyToken,
    isAdmin,
    createServicePlan
);


// ======================================
// GET ALL SERVICE PLANS
// ======================================
router.get(
    "/",
    getAllServicePlans
);


// ======================================
// GET SINGLE SERVICE PLAN
// ======================================
router.get(
    "/:id",
    getSingleServicePlan
);


// ======================================
// GET PLANS BY SERVICE
// ======================================
router.get(
    "/service/:serviceId",
    getPlansByService
);


// ======================================
// UPDATE SERVICE PLAN
// ======================================
router.put(
    "/:id",
    verifyToken,
    isAdmin,
    updateServicePlan
);


// ======================================
// DELETE SERVICE PLAN
// ======================================
router.delete(
    "/:id",
    verifyToken,
    isSuperAdmin,
    deleteServicePlan
);

export default router;