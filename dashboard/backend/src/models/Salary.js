import mongoose from "mongoose";

const SalarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Staff member is required"],
    },
    month: {
      type: Number,
      required: [true, "Month is required"],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
    },
    baseSalary: {
      type: Number,
      required: [true, "Base salary is required"],
      min: 0,
    },
    presentDays: {
      type: Number,
      required: [true, "Present days are required"],
      min: 0,
    },
    absentDays: {
      type: Number,
      required: [true, "Absent days are required"],
      min: 0,
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0,
    },
    deductions: {
      type: Number,
      default: 0,
      min: 0,
    },
    calculatedSalary: {
      type: Number,
      required: [true, "Calculated salary is required"],
      min: 0,
    },
    finalSalary: {
      type: Number,
      required: [true, "Final salary is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online_banking", "esewa", "cheque", "other"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    linkedExpense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
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

// Prevent duplicate salary logs for same user, month, and year
SalarySchema.index({ user: 1, month: 1, year: 1 }, { unique: true });
SalarySchema.index({ year: -1, month: -1 });
SalarySchema.index({ user: 1, year: -1, month: -1 });

const Salary = mongoose.model("Salary", SalarySchema);
export default Salary;
