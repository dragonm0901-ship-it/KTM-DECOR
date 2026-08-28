import mongoose from "mongoose";

const MarketingCampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Note", "Suggestion", "Work Detail"],
      default: "Note",
    },
    platform: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "discussion", "active"],
      default: "draft",
    },
    scheduledDate: {
      type: Date,
      required: [true, "Date is required"],
    },
    assetUrl: {
      type: String,
      trim: true,
    },
    copy: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      index: { expires: '7d' },
    },
  },
  {
    timestamps: true,
  }
);

MarketingCampaignSchema.index({ deleted: 1, scheduledDate: -1 });
MarketingCampaignSchema.index({ status: 1 });

export default mongoose.model("MarketingCampaign", MarketingCampaignSchema);
