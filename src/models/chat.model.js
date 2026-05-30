
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    // ── Participants ────────────────────────────────────────────────
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // ── Context (optional) ─────────────────────────────────────────
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      // links conversation to a specific order
    },

    // ── Last Message Preview ───────────────────────────────────────
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastMessageBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ── Status ─────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Unread Counts Per Participant ──────────────────────────────
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
      // { "userId_string": count }
    },
  },
  { timestamps: true }
);

// Compound index to find existing chat between two participants efficiently
chatSchema.index({ participants: 1 });
chatSchema.index({ orderId: 1 });
chatSchema.index({ lastMessageAt: -1 });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;


