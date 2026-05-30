// import ApiError from "../utils/ApiError.js";
// import asyncHandler from "../utils/asyncHandler.js";

// // ==========================================
// // SUPER ADMIN
// // ==========================================
// export const isSuperAdmin = asyncHandler(async (req, res, next) => {
//   if (!req.user) {
//     throw new ApiError(401, "Unauthorized request");
//   }

//   if (req.user.role !== "super_admin") {
//     throw new ApiError(403, "Access denied");
//   }

//   next();
// });

// // ==========================================
// // ADMIN
// // ==========================================
// export const isAdmin = asyncHandler(async (req, res, next) => {
//   if (!req.user) {
//     throw new ApiError(401, "Unauthorized request");
//   }

//   console.log("passed")

//   if (req.user.role === "admin") {
//     console.log("passseddddd")
//     next();
//   } else {
//     throw new ApiError(403, "Access denied");
//   } 
  
// });

// // ==========================================
// // EMPLOYEE
// // ==========================================
// export const isEmployee = asyncHandler(async (req, res, next) => {
//   if (!req.user) {
//     throw new ApiError(401, "Unauthorized request");
//   }

//   if (!["employee", "admin", "super_admin"].includes(req.user.role)) {
//     throw new ApiError(403, "Access denied");
//   }

//   next();
// });



import ApiError    from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const allow = (roles) =>
    asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        if (!roles.includes(req.user.role)) {
            throw new ApiError(
                403,
                `Access denied. Required role: ${roles.join(" | ")}`
            );
        }

        next();
    });

export const isSuperAdmin = allow(["super_admin"]);
export const isAdmin = allow(["admin", "super_admin"]);
export const isEmployee = allow(["employee", "admin", "super_admin"]);

export const isAdminOrSelf = (paramName = "id") =>
    asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        const isPrivileged = ["admin", "super_admin"].includes(req.user.role);
        const isSelf = req.params[paramName] === req.user._id.toString();

        if (!isPrivileged && !isSelf) {
            throw new ApiError(403, "Access denied");
        }

        next();
    });


export const isClient = allow(["client"]);

export const isNotClient = allow(["employee", "admin", "super_admin"]);