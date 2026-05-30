import mongoose from "mongoose";

// ── Built-in template name constants ─────────────────────────────────
// Use these keys in your mailer service — never raw strings
export const EMAIL_TEMPLATES = {
  WELCOME: "WELCOME",
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",

  ORDER_PLACED: "ORDER_PLACED",
  ORDER_ASSIGNED: "ORDER_ASSIGNED",
  ORDER_STATUS_CHANGED: "ORDER_STATUS_CHANGED",
  ORDER_COMPLETED: "ORDER_COMPLETED",
  ORDER_DELIVERED: "ORDER_DELIVERED",
  ORDER_CANCELLED: "ORDER_CANCELLED",

  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  INVOICE_GENERATED: "INVOICE_GENERATED",

  DOCUMENT_REQUEST: "DOCUMENT_REQUEST",
  DOCUMENT_VERIFIED: "DOCUMENT_VERIFIED",
  DOCUMENT_REJECTED: "DOCUMENT_REJECTED",

  TASK_ASSIGNED: "TASK_ASSIGNED",
  TASK_DUE_REMINDER: "TASK_DUE_REMINDER",

  TICKET_CREATED: "TICKET_CREATED",
  TICKET_REPLY: "TICKET_REPLY",
  TICKET_RESOLVED: "TICKET_RESOLVED",
};

const emailTemplateSchema = new mongoose.Schema(
  {
    // ── Identity ───────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Template name is required"],
      unique: true,
      uppercase: true,
      trim: true,
      enum: Object.values(EMAIL_TEMPLATES),
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      // Supports: {{variables}} e.g. "Your order {{orderNumber}} is confirmed"
    },
    body: {
      type: String,
      required: [true, "Body is required"],
      // Full HTML template with {{variable}} placeholders
    },

    // ── Variable Reference ─────────────────────────────────────────
    variables: {
      type: [String],
      default: [],
      // List of expected variables, e.g. ["clientName", "orderNumber"]
      // Used for documentation / validation in the admin UI
    },

    // ── Status ─────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Audit ──────────────────────────────────────────────────────
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const EmailTemplate = mongoose.model("EmailTemplate", emailTemplateSchema);
export default EmailTemplate;

