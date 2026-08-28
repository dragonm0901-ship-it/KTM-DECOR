import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["salary", "rent", "travel", "food", "miscellaneous"],
      required: [true, "Category is required"],
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
    description: {
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

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1, date: -1 });

const Expense = mongoose.model("Expense", ExpenseSchema);
export default Expense;
