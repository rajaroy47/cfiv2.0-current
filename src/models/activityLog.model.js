
import mongoose from "mongoose";

// Predefined action constants — use these in your services, never raw strings
export const ACTIONS = {
  // Auth
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  REGISTER: "REGISTER",
  PASSWORD_RESET: "PASSWORD_RESET",
  EMAIL_VERIFIED: "EMAIL_VERIFIED",

  // Orders
  ORDER_CREATED: "ORDER_CREATED",
  ORDER_STATUS_CHANGED: "ORDER_STATUS_CHANGED",
  ORDER_ASSIGNED: "ORDER_ASSIGNED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  ORDER_DELIVERED: "ORDER_DELIVERED",

  // Payments
  PAYMENT_INITIATED: "PAYMENT_INITIATED",
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  REFUND_INITIATED: "REFUND_INITIATED",

  // Documents
  DOCUMENT_UPLOADED: "DOCUMENT_UPLOADED",
  DOCUMENT_VERIFIED: "DOCUMENT_VERIFIED",
  DOCUMENT_REJECTED: "DOCUMENT_REJECTED",
  DOCUMENT_DELETED: "DOCUMENT_DELETED",

  // Tasks
  TASK_CREATED: "TASK_CREATED",
  TASK_ASSIGNED: "TASK_ASSIGNED",
  TASK_STATUS_CHANGED: "TASK_STATUS_CHANGED",
  TASK_COMPLETED: "TASK_COMPLETED",

  // Users
  USER_CREATED: "USER_CREATED",
  USER_BLOCKED: "USER_BLOCKED",
  USER_UNBLOCKED: "USER_UNBLOCKED",
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",

  // Services
  SERVICE_CREATED: "SERVICE_CREATED",
  SERVICE_UPDATED: "SERVICE_UPDATED",
  SERVICE_DEACTIVATED: "SERVICE_DEACTIVATED",

  // Support
  TICKET_CREATED: "TICKET_CREATED",
  TICKET_RESOLVED: "TICKET_RESOLVED",
};

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Actor user is required"],
      index: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: Object.values(ACTIONS),
    },
    module: {
      type: String,
      required: [true, "Module is required"],
      enum: [
        "auth",
        "users",
        "orders",
        "payments",
        "documents",
        "tasks",
        "services",
        "support",
        "settings",
        "cms",
      ],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Any relevant data: { orderId, oldStatus, newStatus, ... }
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    // Logs are append-only — never update a log entry
  }
);

activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ module: 1, createdAt: -1 });
// TTL: auto-delete logs older than 1 year (optional)
// activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;

