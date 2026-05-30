import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // ── Recipient ──────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient user is required"],
      index: true,
    },

    // ── Content ────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },

    // ── Type ───────────────────────────────────────────────────────
    type: {
      type: String,
      enum: [
        "order",        // order placed, status changed
        "payment",      // payment received, failed
        "task",         // task assigned, due
        "document",     // doc uploaded, verified, rejected
        "chat",         // new message
        "ticket",       // support ticket update
        "system",       // announcements, maintenance
      ],
      required: true,
    },

    // ── Read Status ────────────────────────────────────────────────
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },

    // ── Navigation ─────────────────────────────────────────────────
    redirectUrl: {
      type: String,
      default: "",
      // e.g. /client/orders/123  or  /admin/tasks/456
    },

    // ── Actor (who triggered this notification) ────────────────────
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Related Entity ─────────────────────────────────────────────
    relatedModel: {
      type: String,
      enum: ["Order", "Payment", "Task", "Document", "Chat", "SupportTicket"],
      default: null,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
