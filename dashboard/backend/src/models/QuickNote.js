import mongoose from "mongoose";

const QuickNoteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Note text is required"],
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

const QuickNote = mongoose.model("QuickNote", QuickNoteSchema);
export default QuickNote;
