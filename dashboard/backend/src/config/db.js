import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/ktm_decor_dashboard";

// ─── SERVERLESS-OPTIMIZED CONNECTION ────────────────────────────
// Use a global variable to persist the connection across warm Vercel invocations.
// On cold starts, `global._mongooseConnection` is undefined, so a new connection is made.
// On warm invocations, we reuse the existing connection — saving 2-4 seconds.

let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

export const connectDB = async () => {
  // Fast path: already connected (warm invocation)
  if (cached.conn && mongoose.connection?.readyState === 1) {
    return cached.conn;
  }

  // If a connection attempt is already in progress, wait for it
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err) {
      // Previous attempt failed, reset and try again below
      cached.promise = null;
      cached.conn = null;
    }
  }

  // Serverless-optimized connection options
  const opts = {
    bufferCommands: false,           // Don't buffer if not connected
    maxPoolSize: 3,                  // Keep pool small for serverless (1 is too aggressive for concurrent bootstrap queries)
    minPoolSize: 1,                  // Pre-allocate 1 connection
    serverSelectionTimeoutMS: 5000,  // Fail fast if can't reach Atlas
    socketTimeoutMS: 45000,          // Generous socket timeout for large queries
    maxIdleTimeMS: 10000,            // Close idle connections quickly in serverless
    connectTimeoutMS: 10000,         // Connection timeout
  };

  cached.promise = mongoose.connect(MONGO_URI, opts);
  try {
    cached.conn = await cached.promise;
    console.log("Connected to MongoDB via mongoose (serverless-optimized)");
    return cached.conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
};
