import dotenv from "dotenv";
import express from "express";
dotenv.config();

import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import servicePlanRoutes from "./routes/servicePlan.routes.js";

import errorMiddleware from "./middlewares/error.middleware.js";
import ApiError from "./utils/ApiError.js";

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT;

app.get("/health", (req, res)=>{
    return res.status(200).json({
        success: true,
        message: "I am healthy"
    })
})


app.use("/api/v1", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/service", serviceRoutes);
app.use("/api/v1/service-plan", servicePlanRoutes);

// ======================================
// 404 HANDLER
// ======================================

app.use((req, res, next) => {
    next(
        new ApiError(
            404,
            `Route not found - ${req.originalUrl}`
        )
    );
});


// ======================================
// ERROR MIDDLEWARE
// ======================================

app.use(errorMiddleware);


export default app

