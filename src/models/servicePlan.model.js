

import mongoose from "mongoose";

const servicePlanSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service reference is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Plan name is required"],
      enum: ["Basic", "Standard", "Premium"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    features: {
      type: [String],
      default: [], // bullet points shown on pricing card
    },
    deliveryTime: {
      type: Number,
      required: [true, "Delivery time is required"],
      min: [1, "Delivery time must be at least 1 day"],
      // in business days
    },
    revisions: {
      type: Number,
      default: 0,
    },
    isPopular: {
      type: Boolean,
      default: false, // shows "Most Popular" badge
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Only one plan of each tier per service
servicePlanSchema.index({ serviceId: 1, name: 1 }, { unique: true });

const ServicePlan = mongoose.model("ServicePlan", servicePlanSchema);
export default ServicePlan;




// ===========================  ============================


// import mongoose from "mongoose";
// import slugify from "slugify";

// const seoSchema = new mongoose.Schema(
//   {
//     metaTitle: { type: String, default: "" },
//     metaDescription: { type: String, default: "" },
//     keywords: { type: [String], default: [] },
//   },
//   { _id: false }
// );

// const serviceSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: [true, "Service title is required"],
//       trim: true,
//     },
//     slug: {
//       type: String,
//       unique: true,
//       lowercase: true,
//       index: true,
//     },
//     shortDescription: {
//       type: String,
//       default: "",
//       maxlength: [300, "Short description cannot exceed 300 characters"],
//     },
//     description: {
//       type: String,
//       default: "", // rich text / markdown
//     },
//     category: {
//       type: String,
//       required: [true, "Category is required"],
//       enum: [
//         "gst",
//         "income_tax",
//         "company_registration",
//         "trademark",
//         "legal",
//         "compliance",
//         "accounting",
//         "other",
//       ],
//     },
//     thumbnail: {
//       type: String,
//       default: "", // Cloudinary URL
//     },

//     // ── Relations ────────────────────────────────────────────────────
//     plans: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "ServicePlan",
//       },
//     ],
//     faqs: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "FAQ",
//       },
//     ],

//     // ── Document Checklist (shown to client on order) ────────────────
//     requiredDocuments: {
//       type: [String],
//       default: [],
//     },

//     // ── Meta ─────────────────────────────────────────────────────────
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     seo: {
//       type: seoSchema,
//       default: () => ({}),
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// // ── Auto-generate slug from title ─────────────────────────────────────
// serviceSchema.pre("save", function () {
//   if (this.isModified("title")) {
//     this.slug = slugify(this.title, { lower: true, strict: true });
//   }
//   // No next() required here if you don't declare it!
// });

// serviceSchema.index({ category: 1, isActive: 1 });

// const Service = mongoose.model("Service", serviceSchema);
// export default Service;




