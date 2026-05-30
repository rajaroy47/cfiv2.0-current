
import mongoose from "mongoose";

const MODULES = [
  "users",
  "roles",
  "services",
  "orders",
  "payments",
  "tasks",
  "documents",
  "chat",
  "notifications",
  "invoices",
  "support_tickets",
  "activity_logs",
  "audit_trails",
  "cms",
  "settings",
  "faqs",
  "email_templates",
  "dashboard",
];

const permissionSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: [true, "Module is required"],
      enum: MODULES,
    },
    actions: {
      type: [String],
      enum: ["create", "read", "update", "delete"],
      default: ["read"],
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate module entries
permissionSchema.index({ module: 1 }, { unique: true });

const Permission = mongoose.model("Permission", permissionSchema);
export default Permission;

