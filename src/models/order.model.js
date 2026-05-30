
import mongoose from "mongoose";

// ── Order Status FSM ──────────────────────────────────────────────────
// PENDING → PAID → DOCUMENT_PENDING → IN_PROGRESS
//         → UNDER_REVIEW → COMPLETED → DELIVERED
//         → CANCELLED (from any state by admin)
export const ORDER_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  DOCUMENT_PENDING: "DOCUMENT_PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  UNDER_REVIEW: "UNDER_REVIEW",
  COMPLETED: "COMPLETED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
  REFUNDED: "refunded",
  FAILED: "failed",
};

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    note: { type: String, default: "" },
    completedAt: { type: Date, default: null },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: true, timestamps: false }
);

const orderSchema = new mongoose.Schema(
  {
    // ── Core ───────────────────────────────────────────────────────
    orderNumber: {
      type: String,
      unique: true,
      index: true,
      // e.g. ORD-20250001 — generated in pre-save hook
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client reference is required"],
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service reference is required"],
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServicePlan",
      required: [true, "Plan reference is required"],
    },

    // ── Status ─────────────────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Financials (snapshot at time of order) ──────────────────────
    baseAmount: {
      type: Number,
      required: [true, "Base amount is required"],
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: [true, "Final amount is required"],
    },

    // ── Content ────────────────────────────────────────────────────
    notes: {
      type: String,
      default: "", // client notes at checkout
    },
    adminNotes: {
      type: String,
      default: "", // internal notes (not visible to client)
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    milestones: {
      type: [milestoneSchema],
      default: [],
    },

    // ── Cancellation ───────────────────────────────────────────────
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: "" },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Delivery ───────────────────────────────────────────────────
    deliveredAt: { type: Date, default: null },
    expectedDelivery: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Auto-generate order number ────────────────────────────────────────
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Order").countDocuments();
    const year = new Date().getFullYear();
    this.orderNumber = `ORD-${year}${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

orderSchema.index({ clientId: 1, status: 1 });
orderSchema.index({ assignedEmployee: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;



