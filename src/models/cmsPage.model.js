
import mongoose from "mongoose";
import slugify from "slugify";

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    ogImage: { type: String, default: "" },
  },
  { _id: false }
);

const cmsPageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Page title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
      // e.g. "about-us", "privacy-policy"
    },
    content: {
      type: String,
      default: "",
      // rich text HTML or markdown — rendered by frontend
    },
    excerpt: {
      type: String,
      default: "",
      maxlength: [500, "Excerpt too long"],
    },
    seo: {
      type: seoSchema,
      default: () => ({}),
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },

    // ── System pages cannot be deleted ────────────────────────────
    isSystem: {
      type: Boolean,
      default: false,
      // true = built-in page (About, Privacy, Terms) — cannot be deleted by admin
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// ── Auto-generate slug from title ─────────────────────────────────────
cmsPageSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const CMSPage = mongoose.model("CMSPage", cmsPageSchema);
export default CMSPage;
