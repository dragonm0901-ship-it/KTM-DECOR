import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    size: {
      type: String,
      required: [true, "Size is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    deliveryPrice: {
      type: Number,
      default: 0,
      min: [0, "Delivery price cannot be negative"],
    },
    installationPrice: {
      type: Number,
      default: 0,
      min: [0, "Installation price cannot be negative"],
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    advancePayment: {
      type: Number,
      default: 0,
      min: [0, "Advance payment cannot be negative"],
    },
    duePayment: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      trim: true,
    },
    productImageUrl: {
      type: String,
      default: "",
    },
    locationImageUrl: {
      type: String,
      default: "",
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerContact: {
      type: String,
      required: [true, "Customer contact number is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    customerAddress: {
      type: String,
      required: [true, "Customer address is required"],
      trim: true,
    },
    orderFrom: {
      type: String,
      required: [true, "Order source is required"],
      enum: {
        values: ["tiktok", "instagram", "whatsapp", "direct"],
        message: "Order source must be tiktok, instagram, whatsapp, or direct",
      },
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["cash", "online_banking", "esewa", "cheque"],
        message: "Payment method must be cash, online_banking, esewa, or cheque",
      },
    },
    manufacturingNotes: {
      type: String,
      trim: true,
      default: "",
    },
    stage: {
      type: String,
      enum: ["design", "manufacturing", "completed", "delivered", "paid"],
      default: "design",
    },
    approved: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
    },
    deliveryDate: {
      type: Date,
      required: [true, "Delivery date is required"],
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate totalPrice automatically
OrderSchema.pre("save", function (next) {
  this.totalPrice = (this.price || 0) + (this.deliveryPrice || 0) + (this.installationPrice || 0);
  if (this.stage === "paid") {
    this.duePayment = 0;
  } else {
    this.duePayment = this.totalPrice - (this.advancePayment || 0);
  }
  next();
});

export default mongoose.model("Order", OrderSchema);
