import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    isStaff: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    // ── References ─────────────────────────────────────────────────
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client reference is required"],
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Ticket Info ────────────────────────────────────────────────
    ticketNumber: {
      type: String,
      unique: true,
      index: true,
      // e.g. TKT-0001 — generated in pre-save hook
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject too long"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },

    // ── Status & Priority ──────────────────────────────────────────
    status: {
      type: String,
      enum: ["open", "in_progress", "waiting_on_client", "resolved", "closed"],
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // ── Category ───────────────────────────────────────────────────
    category: {
      type: String,
      enum: ["payment", "order", "document", "technical", "general"],
      default: "general",
    },

    // ── Linked Order (optional) ────────────────────────────────────
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    // ── Replies ────────────────────────────────────────────────────
    replies: {
      type: [replySchema],
      default: [],
    },

    // ── Resolution ─────────────────────────────────────────────────
    resolvedAt: { type: Date, default: null },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolution: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// ── Auto-generate ticket number ───────────────────────────────────────
supportTicketSchema.pre("save", async function (next) {
  if (this.isNew && !this.ticketNumber) {
    const count = await mongoose.model("SupportTicket").countDocuments();
    this.ticketNumber = `TKT-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

supportTicketSchema.index({ clientId: 1, status: 1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
export default SupportTicket;


