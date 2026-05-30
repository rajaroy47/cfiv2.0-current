
import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    // ── References ─────────────────────────────────────────────────
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order reference is required"],
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client reference is required"],
      index: true,
    },

    // ── Invoice Number ─────────────────────────────────────────────
    invoiceNumber: {
      type: String,
      unique: true,
      index: true,
      // e.g. INV-2025-0001 — generated in pre-save hook
    },

    // ── Amounts ────────────────────────────────────────────────────
    lineItems: {
      type: [lineItemSchema],
      default: [],
    },
    baseAmount: {
      type: Number,
      required: [true, "Base amount is required"],
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    gstRate: {
      type: Number,
      default: 18, // percentage
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },

    // ── PDF ────────────────────────────────────────────────────────
    pdfUrl: {
      type: String,
      default: "", // Cloudinary URL after generation
    },

    // ── Dates ──────────────────────────────────────────────────────
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: null,
    },

    // ── Status ─────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["draft", "issued", "paid", "cancelled"],
      default: "draft",
    },

    // ── Business Info snapshot (so it survives setting changes) ────
    businessInfo: {
      name: { type: String, default: "" },
      gstin: { type: String, default: "" },
      address: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// ── Auto-generate invoice number ──────────────────────────────────────
invoiceSchema.pre("save", async function (next) {
  if (this.isNew && !this.invoiceNumber) {
    const count = await mongoose.model("Invoice").countDocuments();
    const year = new Date().getFullYear();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;

