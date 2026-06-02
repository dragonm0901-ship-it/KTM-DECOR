import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["task_assigned", "marketing_deadline", "system_announcement"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // null means global system announcement
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // To track read status for global announcements
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", NotificationSchema);
