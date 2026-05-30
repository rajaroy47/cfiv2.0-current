
import mongoose from "mongoose";
import slugify from "slugify";

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords: { type: [String], default: [] },
  },
  { _id: false }
);

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    shortDescription: {
      type: String,
      default: "",
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    description: {
      type: String,
      default: "", // rich text / markdown
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "gst",
        "income_tax",
        "company_registration",
        "trademark",
        "legal",
        "compliance",
        "accounting",
        "other",
      ],
    },
    thumbnail: {
      type: String,
      default: "", // Cloudinary URL
    },

    // ── Relations ────────────────────────────────────────────────────
    plans: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServicePlan",
      },
    ],
    faqs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FAQ",
      },
    ],

    // ── Document Checklist (shown to client on order) ────────────────
    requiredDocuments: {
      type: [String],
      default: [],
    },

    // ── Meta ─────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    seo: {
      type: seoSchema,
      default: () => ({}),
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ── Auto-generate slug from title ─────────────────────────────────────
serviceSchema.pre("save", function () {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  // No next() required here if you don't declare it!
});

serviceSchema.index({ category: 1, isActive: 1 });

const Service = mongoose.model("Service", serviceSchema);
export default Service;

