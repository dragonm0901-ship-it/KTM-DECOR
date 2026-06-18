import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/ktm_decor_dashboard";

let connectionPromise = null;

export const connectDB = async () => {
  if (mongoose.connection?.readyState === 1) return mongoose.connection;
  if (mongoose.connection?.readyState === 2) {
    if (connectionPromise) {
      await connectionPromise;
      return mongoose.connection;
    }
  }

  const opts = {
    bufferCommands: false,
  };

  connectionPromise = mongoose.connect(MONGO_URI, opts);
  try {
    await connectionPromise;
    console.log("Connected to MongoDB via mongoose");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    connectionPromise = null;
    throw error;
  }
};
