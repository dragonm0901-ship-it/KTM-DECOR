import mongoose from "mongoose";

const InventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      trim: true,
    },
    alertLevel: {
      type: Number,
      default: 5,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

InventoryItemSchema.index({ name: 1 });
InventoryItemSchema.index({ category: 1 });

const InventoryItem = mongoose.model("InventoryItem", InventoryItemSchema);
export default InventoryItem;
