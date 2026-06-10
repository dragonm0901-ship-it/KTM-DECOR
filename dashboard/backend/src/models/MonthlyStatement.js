import mongoose from "mongoose";

const MonthlyStatementSchema = new mongoose.Schema(
  {
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["sales", "expenses", "purchases", "all"],
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    content: {
      type: String, // CSV text content
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate generation for same type/month/year
MonthlyStatementSchema.index({ month: 1, year: 1, type: 1 }, { unique: true });

const MonthlyStatement = mongoose.model("MonthlyStatement", MonthlyStatementSchema);
export default MonthlyStatement;
