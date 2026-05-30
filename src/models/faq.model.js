
import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      default: null,
      index: true,
      // null = global FAQ (shown on FAQ page)
      // set = service-specific FAQ (shown on service page)
    },
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
    order: {
      type: Number,
      default: 0,
      // lower number = shown first
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

faqSchema.index({ serviceId: 1, order: 1, isActive: 1 });

const FAQ = mongoose.model("FAQ", faqSchema);
export default FAQ;
