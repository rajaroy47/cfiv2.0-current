
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: {
      type: [String],
      default: [], // file URLs
    },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    // ── References ─────────────────────────────────────────────────
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order reference is required"],
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned by is required"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigned to is required"],
      index: true,
    },

    // ── Task Details ───────────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },

    // ── Tracking ───────────────────────────────────────────────────
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "done", "cancelled"],
      default: "todo",
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },

    // ── Comments / Thread ──────────────────────────────────────────
    comments: {
      type: [commentSchema],
      default: [],
    },

    // ── Internal ───────────────────────────────────────────────────
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Auto-set completedAt when status → done
taskSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "done" && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ orderId: 1, status: 1 });
taskSchema.index({ dueDate: 1 });

const Task = mongoose.model("Task", taskSchema);
export default Task;


