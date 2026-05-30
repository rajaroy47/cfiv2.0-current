

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



