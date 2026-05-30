import mongoose from "mongoose";

const auditTrailSchema = new mongoose.Schema(
  {
    // ── Who ────────────────────────────────────────────────────────
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Performer is required"],
      index: true,
    },

    // ── What ───────────────────────────────────────────────────────
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "RESTORE"],
      required: [true, "Action is required"],
    },

    // ── Which Model / Document ─────────────────────────────────────
    targetModel: {
      type: String,
      required: [true, "Target model name is required"],
      enum: [
        "User",
        "Role",
        "Permission",
        "Service",
        "ServicePlan",
        "Order",
        "Payment",
        "Task",
        "Document",
        "Invoice",
        "SupportTicket",
        "CMSPage",
        "WebsiteSetting",
        "FAQ",
        "EmailTemplate",
      ],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Target document ID is required"],
      index: true,
    },

    // ── Change Snapshot ────────────────────────────────────────────
    oldData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      // null for CREATE actions
    },
    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      // null for DELETE actions
    },

    // ── Changed Fields List ────────────────────────────────────────
    changedFields: {
      type: [String],
      default: [],
      // ["status", "assignedEmployee"] — quick filter
    },

    // ── Context ────────────────────────────────────────────────────
    ip: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    reason: {
      type: String,
      default: "",
      // optional human-readable reason for the change
    },
  },
  {
    timestamps: true,
    // Audit trails are immutable — never update
  }
);

auditTrailSchema.index({ targetModel: 1, targetId: 1, createdAt: -1 });
auditTrailSchema.index({ performedBy: 1, createdAt: -1 });
auditTrailSchema.index({ action: 1 });

const AuditTrail = mongoose.model("AuditTrail", auditTrailSchema);
export default AuditTrail;

