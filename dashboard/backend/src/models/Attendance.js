import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Staff member reference is required"],
    },
    date: {
      type: Date,
      required: [true, "Attendance date is required"],
    },
    status: {
      type: String,
      enum: ["present", "absent", "half_day", "leave"],
      default: "present",
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a staff user has at most one attendance record per day
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", AttendanceSchema);
