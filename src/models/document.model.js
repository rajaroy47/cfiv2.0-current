
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    // ── References ─────────────────────────────────────────────────
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order reference is required"],
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader reference is required"],
    },

    // ── File Info ──────────────────────────────────────────────────
    fileName: {
      type: String,
      required: [true, "File name is required"],
      // sanitized name stored on cloud
    },
    originalName: {
      type: String,
      required: [true, "Original file name is required"],
      // as received from client
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
      // Cloudinary secure URL
    },
    publicId: {
      type: String,
      default: "",
      // Cloudinary public_id — needed for deletion
    },
    fileType: {
      type: String,
      required: [true, "File type is required"],
      enum: ["pdf", "jpg", "jpeg", "png", "docx", "xlsx", "zip", "other"],
    },
    mimeType: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
      // in bytes
    },

    // ── Categorisation ─────────────────────────────────────────────
    category: {
      type: String,
      enum: [
        "identity",      // Aadhaar, PAN, Passport
        "address",       // Utility bill, rental agreement
        "financial",     // Bank statement, ITR, balance sheet
        "business",      // MOA, AOA, partnership deed
        "government",    // GST cert, CIN, FSSAI
        "output",        // Documents produced by employee (final deliverables)
        "other",
      ],
      default: "other",
    },

    // ── Verification ───────────────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: "", // rejection reason or request note
    },

    // ── Visibility ─────────────────────────────────────────────────
    uploadedByRole: {
      type: String,
      enum: ["client", "employee", "admin"],
      required: true,
    },
    isVisibleToClient: {
      type: Boolean,
      default: true,
      // output docs from employees are visible; internal docs may not be
    },
  },
  { timestamps: true }
);

documentSchema.index({ orderId: 1, category: 1 });
documentSchema.index({ uploadedBy: 1 });

const Document = mongoose.model("Document", documentSchema);
export default Document;

