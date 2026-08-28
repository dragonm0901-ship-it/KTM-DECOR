import mongoose from "mongoose";

const QuotationItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  size: { type: String, trim: true, default: "" },
  hsCode: { type: String, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  rate: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true },
});

const QuotationSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    clientEmail: {
      type: String,
      trim: true,
    },
    clientContact: {
      type: String,
      trim: true,
    },
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    items: [QuotationItemSchema],
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected"],
      default: "draft",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    voucherNo: {
      type: String,
      trim: true,
    },
    voucherDate: {
      type: String,
      trim: true,
    },
    amountInWords: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
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

QuotationSchema.index({ date: -1 });
QuotationSchema.index({ status: 1, createdAt: -1 });
QuotationSchema.index({ clientName: 1 });

const Quotation = mongoose.model("Quotation", QuotationSchema);
export default Quotation;
