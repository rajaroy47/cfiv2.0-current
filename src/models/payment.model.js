import mongoose from "mongoose";

export const PAYMENT_METHODS = {
  UPI: "upi",
  CARD: "card",
  NETBANKING: "netbanking",
  WALLET: "wallet",
  EMI: "emi",
  CASH: "cash", // offline payments recorded manually
};

const paymentSchema = new mongoose.Schema(
  {
    // ── References ─────────────────────────────────────────────────
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order reference is required"],
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client reference is required"],
      index: true,
    },

    // ── Razorpay Fields ────────────────────────────────────────────
    razorpayOrderId: {
      type: String,
      default: "", // returned by Razorpay when creating an order
    },
    razorpayPaymentId: {
      type: String,
      default: "", // returned after successful capture
    },
    razorpaySignature: {
      type: String,
      select: false, // sensitive — exclude from default queries
    },

    // ── Amount ─────────────────────────────────────────────────────
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      // stored in PAISE (multiply by 100 before sending to Razorpay)
    },
    currency: {
      type: String,
      default: "INR",
    },

    // ── Status ─────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      default: null,
    },

    // ── Invoice Link ───────────────────────────────────────────────
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },

    // ── Refund ─────────────────────────────────────────────────────
    refundId: {
      type: String,
      default: "", // Razorpay refund ID
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
      default: "",
    },
    refundedAt: { type: Date, default: null },

    paidAt: { type: Date, default: null },

    // ── For manual / offline payments ──────────────────────────────
    isManual: {
      type: Boolean,
      default: false,
    },
    manualNote: {
      type: String,
      default: "",
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // admin who recorded manual payment
    },
  },
  { timestamps: true }
);

paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;


