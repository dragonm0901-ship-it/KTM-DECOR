import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ktm_decor_dashboard";

const QuickNoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const QuickNote = mongoose.model("QuickNote", QuickNoteSchema);

async function run() {
  console.log("Connecting to", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log("Connected. Querying notes...");
  const notes = await QuickNote.find({});
  console.log("Total notes:", notes.length);
  console.log(JSON.stringify(notes, null, 2));
  await mongoose.disconnect();
}

run().catch(console.error);
