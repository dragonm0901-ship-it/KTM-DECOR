import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const LOCAL_URI = "mongodb://localhost:27017/ktm_decor_dashboard";
const ATLAS_URI = process.argv[2];

if (!ATLAS_URI) {
  console.error("Error: Please provide your MongoDB Atlas connection string as an argument.");
  console.error("Usage: node src/migrate_db.js \"mongodb+srv://ktmadmin:<password>@ktmdecor.6mksaxf.mongodb.net/ktm_decor_dashboard?appName=ktmdecor\"");
  process.exit(1);
}

// Collections to migrate from local to Atlas
const collectionsToMigrate = [
  "fieldnotes",
  "quicknotes",
  "orders",
  "purchases",
  "products",
  "inventoryitems",
  "expenses",
  "salaries",
  "sales",
  "tasks",
  "quotations",
  "notifications",
  "attendances",
  "marketingcampaigns",
  "monthlystatements",
  "users"
];

async function run() {
  let localConnection = null;
  let atlasConnection = null;

  try {
    console.log("Connecting to local MongoDB...");
    localConnection = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log("Connected to local database.");

    console.log("Connecting to MongoDB Atlas...");
    atlasConnection = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log("Connected to Atlas database.");

    const localDb = localConnection.db;
    const atlasDb = atlasConnection.db;

    for (const colName of collectionsToMigrate) {
      const localColl = localDb.collection(colName);
      const atlasColl = atlasDb.collection(colName);

      // Check if local collection exists and has documents
      const docs = await localColl.find({}).toArray();
      console.log(`\nCollection "${colName}": Found ${docs.length} documents locally.`);

      if (docs.length > 0) {
        console.log(`-> Clearing existing documents in Atlas collection "${colName}"...`);
        await atlasColl.deleteMany({});

        console.log(`-> Uploading ${docs.length} documents to Atlas...`);
        // MongoDB insertMany fails on empty array, but we check docs.length > 0
        await atlasColl.insertMany(docs);
        console.log(`-> Successfully migrated "${colName}"!`);
      } else {
        console.log(`-> Skipping "${colName}" (no local documents).`);
      }
    }

    console.log("\n=============================================");
    console.log("Migration complete! All local database records have been copied to Atlas.");
    console.log("Now run the seed script to verify staff and settings are aligned.");
    console.log("=============================================");

  } catch (error) {
    console.error("Migration failed with error:", error);
  } finally {
    if (localConnection) await localConnection.close();
    if (atlasConnection) await atlasConnection.close();
    console.log("Connections closed.");
  }
}

run();
