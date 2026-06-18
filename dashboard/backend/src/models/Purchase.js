import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    supplier: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
    },
    itemDetails: {
      type: String,
      required: [true, "Item details are required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["paid", "pending", "partial"],
      default: "pending",
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        price: { type: Number, required: true }
      }
    ],
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

PurchaseSchema.index({ date: -1 });

const Purchase = mongoose.model("Purchase", PurchaseSchema);
export default Purchase;
