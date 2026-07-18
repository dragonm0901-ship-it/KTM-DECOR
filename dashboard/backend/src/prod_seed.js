import mongoose from "mongoose";
import { seedUsers } from "./services/seedService.js";
import dotenv from "dotenv";

dotenv.config();

const uri = process.argv[2] || process.env.MONGO_URI;

if (!uri) {
  console.error("Error: Please provide your MongoDB Atlas URI as an argument or set MONGO_URI in your environment.");
  console.error("Usage: node src/prod_seed.js \"mongodb+srv://...\"");
  process.exit(1);
}

async function run() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(uri);
    console.log("Connected successfully. Running user seeds...");
    await seedUsers();
    console.log("Database successfully seeded with new staff members!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
