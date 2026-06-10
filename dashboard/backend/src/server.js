import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Pusher from "pusher";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ExcelJS from "exceljs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Models
import User from "./models/User.js";
import Task from "./models/Task.js";
import Notification from "./models/Notification.js";
import FieldNote from "./models/FieldNote.js";
import ActivityLog from "./models/ActivityLog.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
import Sale from "./models/Sale.js";
import Expense from "./models/Expense.js";
import Purchase from "./models/Purchase.js";
import InventoryItem from "./models/InventoryItem.js";
import Quotation from "./models/Quotation.js";
import QuickNote from "./models/QuickNote.js";

// Middleware
import { protect, admin } from "./middleware/auth.js";

dotenv.config();

const app = express();

// Configure CORS (support local dev + vercel subdomains and previews)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "https://ktmdecor.com",
  "https://www.ktmdecor.com",
  "https://admin.ktmdecor.com"
];

if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim()));
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowed) => allowed === origin || origin.endsWith(".vercel.app"));
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Connection to MongoDB
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/ktm_decor_dashboard";

// Database Connection Caching for Serverless
let cachedDb = null;
let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection?.readyState === 1) return mongoose.connection;
  if (mongoose.connection?.readyState === 2) {
    if (connectionPromise) {
      return connectionPromise;
    }
  }

  if (!MONGO_URI) throw new Error("MONGO_URI or MONGODB_URI environment variable is not defined");
  mongoose.set("strictQuery", true);

  connectionPromise = mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  }).then((conn) => {
    connectionPromise = null;
    cachedDb = conn;
    return conn;
  }).catch((err) => {
    connectionPromise = null;
    throw err;
  });

  return connectionPromise;
};

// Sync manual registry order to Sales ledger
async function syncOrderSale(order, userId) {
  try {
    if (order.approved) {
      // Check if sale already exists
      const existingSale = await Sale.findOne({ orderId: order._id });
      if (!existingSale) {
        const sale = new Sale({
          clientName: order.customerName,
          productName: order.productName,
          amount: order.totalPrice,
          date: order.approvedAt || new Date(),
          paymentMethod: order.paymentMethod || "cash",
          notes: order.manufacturingNotes || `Automatic sale from approved order: ${order.productName}`,
          createdBy: userId || order.createdBy,
          orderId: order._id
        });
        await sale.save();
        
        const populatedSale = await Sale.findById(sale._id).populate("createdBy", "name role");
        triggerPusher("sale_created", populatedSale);
        await logActivity(userId || order.createdBy, "Sale Logged", `Logged sale from approved order for "${order.productName}" (Rs. ${order.totalPrice.toLocaleString()})`);
      } else {
        existingSale.clientName = order.customerName;
        existingSale.productName = order.productName;
        existingSale.amount = order.totalPrice;
        existingSale.paymentMethod = order.paymentMethod || "cash";
        existingSale.notes = order.manufacturingNotes || `Automatic sale from approved order: ${order.productName}`;
        await existingSale.save();
        
        const populatedSale = await Sale.findById(existingSale._id).populate("createdBy", "name role");
        triggerPusher("sale_created", populatedSale);
        await logActivity(userId || order.createdBy, "Sale Updated", `Updated sale details from approved order for "${order.productName}" (Rs. ${order.totalPrice.toLocaleString()})`);
      }
    } else {
      // If not approved, remove any corresponding sale
      const existingSale = await Sale.findOne({ orderId: order._id });
      if (existingSale) {
        await Sale.findByIdAndDelete(existingSale._id);
        triggerPusher("sale_deleted", existingSale._id.toString());
        await logActivity(userId || order.createdBy, "Sale Deleted", `Deleted sale log for "${order.productName}" due to order revert`);
      }
    }
  } catch (err) {
    console.error("Error syncing order to sale:", err);
  }
}

// Sync existing approved orders with sales collection on startup
async function syncExistingApprovedOrders() {
  try {
    const approvedOrders = await Order.find({ approved: true, deleted: { $ne: true } });
    let createdCount = 0;
    for (const order of approvedOrders) {
      const existingSale = await Sale.findOne({ orderId: order._id });
      if (!existingSale) {
        const sale = new Sale({
          clientName: order.customerName,
          productName: order.productName,
          amount: order.totalPrice,
          date: order.approvedAt || order.updatedAt || new Date(),
          paymentMethod: order.paymentMethod || "cash",
          notes: order.manufacturingNotes || `Automatic sale from approved order: ${order.productName}`,
          createdBy: order.createdBy,
          orderId: order._id
        });
        await sale.save();
        createdCount++;
      }
    }
    if (createdCount > 0) {
      console.log(`Synced database: created ${createdCount} missing Sales records for approved orders.`);
    }
  } catch (err) {
    console.error("Error syncing existing approved orders with sales:", err);
  }
}

// Seeding Caching
let seeded = false;
const runSeeds = async () => {
  if (seeded) return;
  // Let errors bubble up to database middleware so it fails gracefully with a 500 status code
  await seedUsers();
  await seedProducts();
  await seedInventoryItems();
  await syncExistingApprovedOrders();
  seeded = true;
  console.log("Database seeded successfully");
};

// Diagnostic endpoint to check configuration status
app.get("/api/auth/status", async (req, res) => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  const envKeys = Object.keys(process.env).filter(key => 
    key.includes("MONGO") || 
    key.includes("URI") || 
    key.includes("URL") || 
    key.includes("SECRET") || 
    key.includes("PASSWORD") || 
    key.includes("PORT") ||
    key.includes("VITE")
  );

  const maskString = (str) => {
    if (!str) return "none";
    if (str.length <= 30) return str;
    return str.substring(0, 15) + "..." + str.substring(str.length - 15);
  };

  let connectError = null;
  try {
    await connectDB();
  } catch (err) {
    connectError = err.message;
  }

  const dbState = mongoose.connection?.readyState;

  const status = {
    dbConnected: dbState === 1,
    dbState: states[dbState] || "unknown",
    connectError,
    envKeysAvailable: envKeys,
    envAdminPasswordDefined: !!process.env.SEED_ADMIN_PASSWORD,
    envStaffPasswordDefined: !!process.env.SEED_STAFF_PASSWORD,
    envMongoUriDefined: !!process.env.MONGO_URI,
    envMongoUriMasked: maskString(process.env.MONGO_URI),
    envJwtSecretDefined: !!process.env.JWT_SECRET,
  };

  if (dbState !== 1) {
    return res.json(status);
  }

  let seedError = null;
  let userCount = 0;
  let adminUserFound = null;
  let inventoryCount = 0;
  let runSeedSuccess = false;

  try {
    userCount = await User.countDocuments();
    inventoryCount = await InventoryItem.countDocuments();
    adminUserFound = await User.findOne({ role: "admin" });

    const pathsToTry = [
      path.join(__dirname, "inventorySeed.json"),
      path.join(process.cwd(), "dashboard/backend/src/inventorySeed.json"),
      path.join(process.cwd(), "src/inventorySeed.json")
    ];
    let resolvedPath = "";
    for (const p of pathsToTry) {
      if (fs.existsSync(p)) {
        resolvedPath = p;
        break;
      }
    }

    if (resolvedPath && adminUserFound && inventoryCount === 0) {
      const rawData = fs.readFileSync(resolvedPath, "utf8");
      const seedData = JSON.parse(rawData);
      // Filter out invalid items (e.g. missing name, category, or unit) to protect validation schema
      const itemsToInsert = seedData
        .filter((item) => item && item.name && item.name.trim() && item.category && item.unit)
        .map((item) => ({
          ...item,
          createdBy: adminUserFound._id,
        }));
      if (itemsToInsert.length > 0) {
        await InventoryItem.insertMany(itemsToInsert);
      }
      inventoryCount = await InventoryItem.countDocuments();
      runSeedSuccess = true;
    }
  } catch (error) {
    seedError = error.message;
  }

  res.json({
    ...status,
    userCount,
    adminUserFound: !!adminUserFound,
    adminEmail: adminUserFound ? adminUserFound.email : "none",
    inventoryCount,
    seedError,
    runSeedSuccess
  });
});

// Middleware to ensure database connection in serverless environment
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!seeded) {
      runSeeds().catch((err) => console.error("Database background seeding error:", err));
    }
    next();
  } catch (err) {
    console.error("Database middleware connection error:", err);
    res.status(500).json({ 
      message: "Database connection failed",
      error: err.message 
    });
  }
});

// ─── DASHBOARD BOOTSTRAP ENDPOINT ─────────────────────────────
// Trigger Vercel rebuild to apply deleted VITE_API_URL env variable
app.get("/api/bootstrap", protect, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userEmail = req.user.email;
    const userId = req.user._id;

    // 1. Build tasks query
    let taskQuery = { deleted: { $ne: true } };
    if (userRole !== "admin") {
      if (userEmail === "staff@ktmdecor.com") {
        const staffUsers = await User.find({ role: "staff" }).select("_id");
        const staffIds = staffUsers.map((u) => u._id);
        taskQuery = { assignee: { $in: [userId, ...staffIds] }, deleted: { $ne: true } };
      } else {
        taskQuery = { assignee: userId, deleted: { $ne: true } };
      }
    }

    // 2. Build notifications query
    let notifQuery = {};
    if (userEmail === "staff@ktmdecor.com") {
      const staffUsers = await User.find({ role: "staff" }).select("_id");
      const staffIds = staffUsers.map((u) => u._id);
      notifQuery = {
        $or: [
          { recipient: userId },
          { recipient: { $in: staffIds } },
          { recipient: null }
        ]
      };
    } else {
      notifQuery = {
        $or: [{ recipient: userId }, { recipient: null }]
      };
    }

    // 3. Define parallel database queries
    const promises = {
      tasks: Task.find(taskQuery)
        .populate("assignee", "name email role")
        .populate("createdBy", "name role")
        .sort({ pinned: -1, createdAt: -1 }),
      users: User.find({}).select("name email role"),
      notifications: Notification.find(notifQuery).sort({ createdAt: -1 }),
      campaigns: FieldNote.find({ deleted: { $ne: true } })
        .populate("createdBy", "name role")
        .sort({ createdAt: -1 }),
      activities: ActivityLog.find({})
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .limit(30),
      products: Product.find({}).sort({ createdAt: -1 }),
      orders: Order.find({ deleted: { $ne: true } })
        .populate("createdBy", "name role")
        .populate("assignee", "name email role")
        .sort({ createdAt: -1 }),
      inventoryItems: InventoryItem.find({})
        .populate("createdBy", "name role")
        .sort({ name: 1 }),
      quickNotes: QuickNote.find({})
        .populate("createdBy", "name role")
        .sort({ createdAt: -1 }),
    };

    // 4. Inject admin-only data
    if (userRole === "admin") {
      promises.sales = Sale.find({}).populate("createdBy", "name role").populate("orderId").sort({ date: -1 });
      promises.expenses = Expense.find({}).populate("createdBy", "name role").sort({ date: -1 });
      promises.purchases = Purchase.find({}).populate("createdBy", "name role").sort({ date: -1 });
      promises.quotations = Quotation.find({}).populate("createdBy", "name role").sort({ date: -1 });
      
      promises.binTasks = Task.find({ deleted: true }).populate("assignee", "name email role").populate("createdBy", "name role");
      promises.binCampaigns = FieldNote.find({ deleted: true }).populate("createdBy", "name role");
      promises.binOrders = Order.find({ deleted: true }).populate("assignee", "name email role").populate("createdBy", "name role");
    }

    // 5. Query all collections concurrently
    const keys = Object.keys(promises);
    const results = await Promise.all(Object.values(promises));
    
    // 6. Map results to keys
    const payload = {};
    keys.forEach((key, index) => {
      payload[key] = results[index];
    });

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initialize Pusher Client
let pusher = null;
if (
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_KEY &&
  process.env.PUSHER_SECRET &&
  process.env.PUSHER_CLUSTER
) {
  pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  });
  console.log("Pusher real-time client initialized.");
} else {
  console.warn("Pusher credentials missing. Real-time updates will be simulated locally.");
}

// Helper to broadcast events via Pusher
const triggerPusher = (event, data) => {
  if (pusher) {
    pusher.trigger("ktm-dashboard", event, data).catch((err) => {
      console.error(`Pusher trigger error for event ${event}:`, err);
    });
  } else {
    console.log(`[Simulated Real-time Broadcast] Event: ${event}`);
  }
};

// Helper to log activities and emit real-time logs
const logActivity = async (userId, action, details) => {
  try {
    const log = await ActivityLog.create({ user: userId, action, details });
    const populatedLog = await log.populate("user", "name email role");
    triggerPusher("new_activity", populatedLog);
    return populatedLog;
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

// Helper: only update a user's password if the stored hash doesn't match the env variable.
// This prevents the double-hashing bug that corrupts credentials on every cold start.
const syncPasswordIfNeeded = async (user, envPassword) => {
  if (!envPassword) return false;
  const alreadyMatches = await bcrypt.compare(envPassword, user.password);
  if (alreadyMatches) return false;
  // Password mismatch — update it (pre-save hook will hash it)
  user.password = envPassword;
  await user.save();
  console.log(`  ↳ Password synced for ${user.email}`);
  return true;
};

// Seed default users if DB is empty
const seedUsers = async () => {
  try {
    // Delete old test users
    await User.deleteMany({ email: { $in: ["rohan@ktmdecor.com", "anjali@ktmdecor.com"] } });

    // Seed Admin
    const adminExists = await User.findOne({ email: "admin@ktmdecor.com" });
    if (!adminExists) {
      await User.create({
        name: "Sagar (Admin)",
        email: "admin@ktmdecor.com",
        password: process.env.SEED_ADMIN_PASSWORD || "adminpassword",
        role: "admin",
      });
      console.log("  ↳ Created admin user: admin@ktmdecor.com");
    } else {
      await syncPasswordIfNeeded(adminExists, process.env.SEED_ADMIN_PASSWORD);
    }

    // Seed Shared Staff Login user
    const sharedStaffExists = await User.findOne({ email: "staff@ktmdecor.com" });
    if (!sharedStaffExists) {
      await User.create({
        name: "Shared Staff Login",
        email: "staff@ktmdecor.com",
        password: process.env.SEED_STAFF_PASSWORD || "staffpassword",
        role: "staff",
      });
      console.log("  ↳ Created shared staff user: staff@ktmdecor.com");
    } else {
      await syncPasswordIfNeeded(sharedStaffExists, process.env.SEED_STAFF_PASSWORD);
    }

    // Seed the 6 Nepali staff members
    const nepaliStaff = [
      { name: "Sandip Thapa", email: "sandip@ktmdecor.com" },
      { name: "Biraj Shrestha", email: "biraj@ktmdecor.com" },
      { name: "Anup Adhikari", email: "anup@ktmdecor.com" },
      { name: "Niran Tamang", email: "niran@ktmdecor.com" },
      { name: "Sujan Maharjan", email: "sujan@ktmdecor.com" },
      { name: "Kiran Bhattarai", email: "kiran@ktmdecor.com" },
    ];

    for (const s of nepaliStaff) {
      const exists = await User.findOne({ email: s.email });
      if (!exists) {
        await User.create({
          name: s.name,
          email: s.email,
          password: process.env.SEED_STAFF_PASSWORD || "staffpassword",
          role: "staff",
        });
      } else {
        await syncPasswordIfNeeded(exists, process.env.SEED_STAFF_PASSWORD);
      }
    }

    // Clean up or reassign tasks/notifications referencing deleted users (e.g. rohan or anjali)
    const validUsers = await User.find({}).select("_id");
    const validUserIds = validUsers.map((u) => u._id.toString());
    const sandip = await User.findOne({ email: "sandip@ktmdecor.com" });

    if (sandip) {
      // Reassign orphan tasks to Sandip Thapa
      await Task.updateMany(
        { $or: [{ assignee: { $nin: validUserIds } }, { assignee: null }] },
        { assignee: sandip._id }
      );
      // Reassign orphan notifications to Sandip Thapa
      await Notification.updateMany(
        { recipient: { $nin: [...validUserIds, null] } },
        { recipient: sandip._id }
      );
    } else {
      // Fallback: Delete orphans if Sandip does not exist
      await Task.deleteMany({ assignee: { $nin: validUserIds } });
      await Notification.deleteMany({ recipient: { $nin: [...validUserIds, null] } });
    }

    console.log("User seeding and verification completed successfully.");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

// Seed default products if DB is empty (initializes the 122 static catalog items)
const seedProducts = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log("Seeding default product catalog (122 signs)...");
      const products = [];
      let globalId = 1;

      const CATEGORIES = [
        "Acrylic Backlit Signage",
        "Neon Sign",
        "3D Signage",
        "2D Board",
        "House/Office Nameplate",
        "Wooden Signage",
        "2.5D Signage",
        "Acrylic Table Lamp",
        "3D Number Plate",
        "Double Sided Round Light Board"
      ];

      const SUB_CATEGORIES = {
        "Acrylic Backlit Signage": ["Lobby & Reception", "Corporate Office", "Retail Storefront", "Luxury Showrooms"],
        "Neon Sign": ["Custom Script", "Bar & Restaurant", "Boutique & Salon", "Event Backdrop"],
        "3D Signage": ["Brushed Metal", "Glowing Halo", "Block Acrylic", "Fabricated Steel"],
        "2D Board": ["Directional & Directory", "Restaurant Menu", "Safety & Informational", "Exterior Panels"],
        "House/Office Nameplate": ["Executive Desk", "Premium Residential", "Modern Metallic", "Glass Finish"],
        "Wooden Signage": ["Laser Engraved", "Earthy Rustic Plank", "Live Edge Wood", "Wood-Acrylic Hybrid"],
        "2.5D Signage": ["Multi-Layered relief", "Textured CNC Cut", "Geometric Art Panel", "Abstract Relief"],
        "Acrylic Table Lamp": ["Branded Display Lamp", "3D Wireframe Illusion", "Bedside Glow Accent", "Minimalist Icon Lamp"],
        "3D Number Plate": ["Luxury Car Plate", "Bike Number Plate", "Villa Address Plaque", "Floating Mount Plate"],
        "Double Sided Round Light Board": ["Projecting Bracket Sign", "LED Rotating Box", "Vintage Flange Sign", "Urban Under-Canopy"]
      };

      const TECHNICAL_SPECS = {
        "Acrylic Backlit Signage": [
          "High-efficiency 12V backlighting LED strips",
          "Sleek premium 8mm frosted cast acrylic faceplate",
          "Heavy-duty aluminum backing panel for structural support",
          "Standoff wall mounts & hardware fixtures included",
          "Even diffusion layout prevents shadows or hot-spots",
          "Over 45,000 hours estimated LED operational lifespan"
        ],
        "Neon Sign": [
          "Heavy-duty low-voltage 12V silicon flex neon tubing",
          "Contoured high-clarity 6mm transparent acrylic backing",
          "Complete hanging wire setup & standoff mounting screws",
          "Includes quiet solid-state 12V 5A power transformer",
          "Safe to touch, low heat, absolutely hum-free operation",
          "Flexible design adapts to any wall hanging structure"
        ],
        "3D Signage": [
          "Heavy-duty 304 marine-grade anti-corrosive steel returns",
          "Solid 20mm depth spacer pegs for floating shadow relief",
          "Fully waterproof internal IP67 light modules",
          "Precision waterjet-cut acrylic faceplate overlays",
          "Direct-mount drilling guides for seamless setup",
          "10-Year structural material warranty guarantee"
        ],
        "2D Board": [
          "Durable commercial-grade ACP (Aluminum Composite Panel) backing",
          "UV-resistant outdoor protective matte laminate wrap",
          "Clean-cut router beveled borders for modern presentation",
          "Pre-drilled heavy-load wall bracket screw eyelets",
          "Resistant to high winds, heavy rain, and direct sunlight",
          "Easy-wipe surface compatible with standard cleaning sprays"
        ],
        "House/Office Nameplate": [
          "Laser-engraved polished solid brass or wood inserts",
          "Float-mount polished edge glass spacer panel sets",
          "Invisible rear mounting stud brackets with anchor screws",
          "UV-sealed weatherproofing coating prevents tarnish/fade",
          "Fits executive desk or outdoor brick wall mounting layouts",
          "Beautiful gift packaging container included"
        ],
        "Wooden Signage": [
          "Sustainably sourced premium walnut/oak wood blocks base",
          "Precision CNC router deep engraving lines",
          "Eco-friendly outdoor Danish oil moisture-proof finish",
          "Integrated mounting hardware slots on rear panel",
          "Natural woodgrain textures make every unit unique",
          "Solid heavy-feel craftsmanship by master Nepalese artisans"
        ],
        "2.5D Signage": [
          "Multi-layered laser-cut 3mm acrylic sheet panels",
          "Textured relief CNC milling background finishes",
          "Hand-assembled layered composite construction",
          "Provides elegant dimensional depth profile details",
          "Pre-applied industrial strength double-sided mounting adhesive",
          "Spectacular visual changes under shifting ceiling lights"
        ],
        "Acrylic Table Lamp": [
          "Laser-etched high-clarity 4mm acrylic graphic slide",
          "Solid organic beechwood circular glowing light base",
          "Multi-mode warm & cool white LED emitters",
          "USB-powered layout with convenient inline switch control",
          "Ultra-low power draw (under 3.5 Watts total)",
          "Creates a mesmerizing glowing wireframe optical illusion"
        ],
        "3D Number Plate": [
          "Embossed vacuum-formed acrylic block digits",
          "Premium laser-cut carbon fiber weave backing board",
          "Fully government-compliant size and font specifications",
          "Heavy-duty waterproof double-sided foam mounting tape",
          "Reflective high-visibility backing plate for night safety",
          "Impact-resistant composite shield avoids chipping"
        ],
        "Double Sided Round Light Board": [
          "Heavy-duty rustproof circular iron outer frame casing",
          "Dual-sided high-opacity opal acrylic glowing panels",
          "Extended steel projection arm brackets for wall mounting",
          "Intense uniform internal daylight LED light array",
          "Direct-wire AC 220V connection block ready",
          "IP65 Certified fully dustproof and waterproof shell"
        ]
      };

      const BASE_DESCRIPTIONS = {
        "Acrylic Backlit Signage": "Transform your business front or reception desk with our premium backlit signage. Handcrafted from heavy cast acrylic and fitted with high-intensity uniform LED panels to offer a glowing architectural silhouette that commands attention.",
        "Neon Sign": "Bring vibrant color and modern aesthetic energy to any room or commercial bar with our hand-bent glowing neon signs. Mounted on contoured clear acrylic backings, these low-voltage LED tubes run perfectly cold and completely silent.",
        "3D Signage": "Add physical depth and structural branding authority with our heavy-duty fabricated 3D lettering signs. Combining stainless steel and block acrylic elements, these signs cast beautiful drop-shadows on corporate reception backdrops.",
        "2D Board": "Clean, highly visible, and built to withstand the elements, our flat e-commerce 2D boards are ideal for retail pricing menus, company directional indexes, and regulatory safety displays. Features crisp beveled edges.",
        "House/Office Nameplate": "Welcome guests or designate your workspace in premium style with our elegant custom nameplates. Blending natural wood inserts, glass frames, and polished brass plates for a timeless, executive presentation.",
        "Wooden Signage": "Bring natural warmth and artisanal character to your brand with our CNC-carved solid timber signs. Sanded to a smooth furniture finish and treated with weatherproofing oils, these pieces showcase gorgeous, unique wood grains.",
        "2.5D Signage": "A stunning cross between fine sculpture and modern signage, our 2.5D layered signs utilize overlapping panels and relief textures to create a spectacular physical depth layout that changes with ambient light angles.",
        "Acrylic Table Lamp": "Light up your workspace or bedside table with our mesmerizing 3D-optical illusion acrylic lamps. Features a solid wood base with glowing warm LEDs that shine through a custom laser-etched pattern overlay.",
        "3D Number Plate": "Stand out on the road or define your home address with our high-contrast 3D number plates. Fabricated with raised bold numbers on carbon fiber templates to ensure durability, high visibility, and luxury styles.",
        "Double Sided Round Light Board": "Ensure maximum foot-traffic views from both street directions with our heavy-duty projecting round light boxes. Built with waterproof metal frames and double-sided glowing acrylic faces to shine brightly through night storms."
      };

      CATEGORIES.forEach((cat) => {
        const subCats = SUB_CATEGORIES[cat] || [];
        const baseDesc = BASE_DESCRIPTIONS[cat] || "Premium custom signage hand-built to order by KTM DECOR.";
        const baseSpecs = TECHNICAL_SPECS[cat] || ["Premium construction material", "High durability finish"];
        
        const itemsCount = (cat === "Neon Sign" || cat === "Acrylic Table Lamp") ? 13 : 12;

        for (let index = 0; index < itemsCount; index++) {
          const subCategory = subCats[index % subCats.length];
          const priceFactor = ((index * 7 + cat.length * 3) % 17) + 1;
          const price = Math.round((3500 + priceFactor * 4500) / 500) * 500;

          let stockStatus = "In Stock";
          if ((index + 5) % 8 === 0) {
            stockStatus = "Low Stock";
          } else if ((index + 7) % 9 === 0) {
            stockStatus = "Custom Order Only";
          }

          let badge = undefined;
          if (index === 0) badge = "Best Seller";
          else if (index === 1 && cat === "Neon Sign") badge = "Hot Buy";
          else if (index === 2) badge = "New";
          else if (stockStatus === "Custom Order Only") badge = "Custom";

          const name = `${cat} #${globalId}`;
          const description = `${baseDesc} This product is custom engineered for ${subCategory.toLowerCase()} spaces. Features a durable framework and elegant finishes that deliver a premium architectural feel. Custom options available on request.`;

          const specs = [
            ...baseSpecs,
            `Optimized dimensions for ${subCategory.toLowerCase()} applications`,
            `Direct delivery available inside Kathmandu, Lalitpur, and Bhaktapur`
          ];

          products.push({
            id: globalId.toString(),
            name,
            category: cat,
            subCategory,
            price,
            image: "/images/placeholder.svg",
            badge,
            description,
            specs,
            stockStatus,
            rating: 4.8,
            reviewsCount: 15
          });

          globalId++;
        }
      });

      await Product.insertMany(products);
      console.log(`Seeded ${products.length} products into MongoDB successfully.`);
    }
  } catch (error) {
    console.error("Error seeding products:", error);
  }
};

// Seed default inventory items if DB is empty (initializes items from JSON file)
const seedInventoryItems = async () => {
  try {
    const itemCount = await InventoryItem.countDocuments();
    if (itemCount === 0) {
      console.log("Seeding default inventory items from inventorySeed.json...");
      // Find an admin user to assign as creator
      const adminUser = await User.findOne({ role: "admin" });
      if (!adminUser) {
        console.warn("Skipping inventory seeding: no admin user found.");
        return;
      }

      const pathsToTry = [
        path.join(__dirname, "inventorySeed.json"),
        path.join(process.cwd(), "dashboard/backend/src/inventorySeed.json"),
        path.join(process.cwd(), "src/inventorySeed.json")
      ];
      let seedFilePath = "";
      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          seedFilePath = p;
          break;
        }
      }

      if (!seedFilePath) {
        console.warn("Skipping inventory seeding: inventorySeed.json not found in paths:", pathsToTry);
        return;
      }

      const rawData = fs.readFileSync(seedFilePath, "utf8");
      const seedData = JSON.parse(rawData);

      // Filter out invalid items (e.g. missing name, category, or unit) to protect validation schema
      const itemsToInsert = seedData
        .filter((item) => item && item.name && item.name.trim() && item.category && item.unit)
        .map((item) => ({
          ...item,
          createdBy: adminUser._id,
        }));

      if (itemsToInsert.length > 0) {
        await InventoryItem.insertMany(itemsToInsert);
      }
      console.log(`Seeded ${itemsToInsert.length} inventory items into MongoDB successfully.`);
    }
  } catch (error) {
    console.error("Error seeding inventory items:", error);
  }
};

// ─── AUTH ENDPOINTS ─────────────────────────────────────────


// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = email ? email.toLowerCase().trim() : "";
    const user = await User.findOne({ email: normalizedEmail });
    if (user && (await user.comparePassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register user (Admin only)
app.post("/api/auth/register", protect, admin, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current profile
app.get("/api/auth/me", protect, async (req, res) => {
  res.json(req.user);
});

// Get all staff members (for task assignees selection)
app.get("/api/auth/users", protect, async (req, res) => {
  try {
    const users = await User.find({}).select("name email role");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── TASKS ENDPOINTS ─────────────────────────────────────────

// Get all tasks (Admin sees all, Staff sees their own)
app.get("/api/tasks", protect, async (req, res) => {
  try {
    let query = { deleted: { $ne: true } };
    if (req.user.role !== "admin") {
      if (req.user.email === "staff@ktmdecor.com") {
        // Shared staff login: can view all staff-assigned tasks
        const staffUsers = await User.find({ role: "staff" }).select("_id");
        const staffIds = staffUsers.map((u) => u._id);
        query = { assignee: { $in: [req.user._id, ...staffIds] }, deleted: { $ne: true } };
      } else {
        query = { assignee: req.user._id, deleted: { $ne: true } };
      }
    }
    const tasks = await Task.find(query)
      .populate("assignee", "name email role")
      .populate("createdBy", "name role")
      .sort({ pinned: -1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task (Admin only)
app.post("/api/tasks", protect, admin, async (req, res) => {
  const { title, description, assignee, dueDate, priority, totalCost, prepaidCost } = req.body;
  try {
    const computedTotal = Number(totalCost) || 0;
    const computedPrepaid = Number(prepaidCost) || 0;
    const remainingCost = computedTotal - computedPrepaid;

    const task = await Task.create({
      title,
      description,
      assignee,
      dueDate,
      priority,
      totalCost: computedTotal,
      prepaidCost: computedPrepaid,
      remainingCost,
      createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignee", "name email role")
      .populate("createdBy", "name role");

    // Broadcast task creation via Pusher
    triggerPusher("task_created", populatedTask);

    // Create Notification in DB
    const notif = await Notification.create({
      type: "task_assigned",
      message: `New task assigned to you: "${title}" by ${req.user.name}`,
      recipient: assignee,
    });

    // Broadcast notification via Pusher
    triggerPusher("receive_notification", notif);

    await logActivity(req.user._id, "Task Created", `Assigned "${title}" to ${populatedTask.assignee.name}`);

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update task (Admin can change everything, Staff can only change status of their tasks)
app.put("/api/tasks/:id", protect, async (req, res) => {
  const { title, description, assignee, dueDate, priority, status, totalCost, prepaidCost } = req.body;
  try {
    const task = await Task.findById(req.id || req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Role verification
    if (req.user.role !== "admin") {
      if (req.user.email === "staff@ktmdecor.com") {
        // Shared staff login: verify the assignee is indeed a staff member
        const taskAssignee = await User.findById(task.assignee);
        if (!taskAssignee || taskAssignee.role !== "staff") {
          return res.status(403).json({ message: "Not authorized to modify this task" });
        }
      } else if (task.assignee.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to modify this task" });
      }
    }

    let previousStatus = task.status;

    if (req.user.role === "admin") {
      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.assignee = assignee || task.assignee;
      task.dueDate = dueDate || task.dueDate;
      task.priority = priority || task.priority;
      task.status = status || task.status;
      if (totalCost !== undefined) task.totalCost = Number(totalCost) || 0;
      if (prepaidCost !== undefined) task.prepaidCost = Number(prepaidCost) || 0;
      task.remainingCost = (task.totalCost || 0) - (task.prepaidCost || 0);
    } else {
      // Staff can only modify the status
      task.status = status || task.status;
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignee", "name email role")
      .populate("createdBy", "name role");

    // Real-time synchronization to everyone
    triggerPusher("task_updated", populatedTask);

    // If status changed to done, notify the creator (admin)
    if (previousStatus !== "done" && task.status === "done") {
      const creatorNotif = await Notification.create({
        type: "task_assigned",
        message: `Task completed by ${req.user.name}: "${task.title}"`,
        recipient: task.createdBy,
      });
      triggerPusher("receive_notification", creatorNotif);
    }

    await logActivity(
      req.user._id,
      "Task Updated",
      `Changed status of "${task.title}" to "${task.status.toUpperCase()}"`
    );

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle Task Pinning (Admin only)
app.put("/api/tasks/:id/pin", protect, admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.pinned = !task.pinned;
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("createdBy", "name");

    // Broadcast pinned event via Pusher
    triggerPusher("task_pinned", populatedTask);

    await logActivity(
      req.user._id,
      task.pinned ? "Task Pinned" : "Task Unpinned",
      `"${task.title}" has been ${task.pinned ? "pinned to top" : "unpinned"}`
    );

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task (Admin only)
app.delete("/api/tasks/:id", protect, admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.deleted = true;
    task.deletedAt = new Date();
    await task.save();
    triggerPusher("task_deleted", req.params.id);
    triggerPusher("bin_updated", {});

    await logActivity(req.user._id, "Task Deleted", `Moved task "${task.title}" to Bin`);
    res.json({ message: "Task moved to trash bin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── NOTIFICATION ENDPOINTS ──────────────────────────────────

// Get user notifications
app.get("/api/notifications", protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.email === "staff@ktmdecor.com") {
      const staffUsers = await User.find({ role: "staff" }).select("_id");
      const staffIds = staffUsers.map((u) => u._id);
      query = {
        $or: [
          { recipient: req.user._id },
          { recipient: { $in: staffIds } },
          { recipient: null }
        ]
      };
    } else {
      query = {
        $or: [{ recipient: req.user._id }, { recipient: null }]
      };
    }
    const notifs = await Notification.find(query).sort({ createdAt: -1 });
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notifications as read
app.put("/api/notifications/read", protect, async (req, res) => {
  const { assigneeId } = req.body;
  try {
    // For direct notifications
    if (req.user.email === "staff@ktmdecor.com" && assigneeId) {
      // Mark read only for the active staff persona
      await Notification.updateMany({ recipient: assigneeId, read: false }, { read: true });
    } else {
      await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    }

    // For global system announcements, add user/persona ID to readBy array
    const readerId = (req.user.email === "staff@ktmdecor.com" && assigneeId) ? assigneeId : req.user._id;
    await Notification.updateMany(
      { recipient: null, readBy: { $ne: readerId } },
      { $addToSet: { readBy: readerId } }
    );

    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post a system announcement (Admin only)
app.post("/api/notifications/announcement", protect, admin, async (req, res) => {
  const { message } = req.body;
  try {
    const announcement = await Notification.create({
      type: "system_announcement",
      message,
      recipient: null,
    });

    // Broadcast globally to all connected users via Pusher
    triggerPusher("receive_notification", announcement);

    await logActivity(req.user._id, "Announcement Published", `Broadcaster: "${message}"`);
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── FIELD NOTES ENDPOINTS ────────────────────────────────────

// Get all field notes
app.get("/api/campaigns", protect, async (req, res) => {
  try {
    const fieldNotes = await FieldNote.find({ deleted: { $ne: true } })
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });
    res.json(fieldNotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create field note (Staff only!)
app.post("/api/campaigns", protect, async (req, res) => {
  const { title, description, district, location, fittingSpotImageUrl, email } = req.body;
  try {
    // Only staff, not admins
    if (req.user.role === "admin") {
      return res.status(403).json({ message: "Only staff members can create field notes." });
    }

    const fieldNote = await FieldNote.create({
      title,
      description,
      district,
      location,
      fittingSpotImageUrl: fittingSpotImageUrl || "",
      email: email || "",
      createdBy: req.user._id,
    });

    const populatedFieldNote = await FieldNote.findById(fieldNote._id).populate("createdBy", "name role");

    triggerPusher("campaign_updated", populatedFieldNote);

    // Create and broadcast global notification for new field note
    const globalFieldNoteNotif = await Notification.create({
      type: "new_field_note",
      message: `New field note: "${title}" by ${req.user.name} (District: ${district})`,
      recipient: null,
    });
    triggerPusher("receive_notification", globalFieldNoteNotif);

    await logActivity(req.user._id, "Field Note Created", `Created field note "${title}" in ${district}, ${location}`);
    res.status(201).json(populatedFieldNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update field note (Admins or the owner staff member)
app.put("/api/campaigns/:id", protect, async (req, res) => {
  const { title, description, district, location, fittingSpotImageUrl, email } = req.body;
  try {
    const fieldNote = await FieldNote.findById(req.params.id);
    if (!fieldNote) {
      return res.status(404).json({ message: "Field note not found" });
    }

    if (req.user.role !== "admin" && fieldNote.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this field note" });
    }

    fieldNote.title = title || fieldNote.title;
    fieldNote.description = description || fieldNote.description;
    fieldNote.district = district || fieldNote.district;
    fieldNote.location = location || fieldNote.location;
    if (fittingSpotImageUrl !== undefined) fieldNote.fittingSpotImageUrl = fittingSpotImageUrl;
    if (email !== undefined) fieldNote.email = email;

    await fieldNote.save();

    const populatedFieldNote = await FieldNote.findById(fieldNote._id).populate("createdBy", "name role");

    triggerPusher("campaign_updated", populatedFieldNote);

    await logActivity(
      req.user._id,
      "Field Note Updated",
      `Updated field note "${fieldNote.title}"`
    );

    res.json(populatedFieldNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete field note (Admin only, soft-deletes)
app.delete("/api/campaigns/:id", protect, admin, async (req, res) => {
  try {
    const fieldNote = await FieldNote.findById(req.params.id);
    if (!fieldNote) {
      return res.status(404).json({ message: "Field note not found" });
    }

    fieldNote.deleted = true;
    fieldNote.deletedAt = new Date();
    await fieldNote.save();

    triggerPusher("campaign_deleted", req.params.id);
    triggerPusher("bin_updated", {});

    await logActivity(req.user._id, "Field Note Deleted", `Moved field note "${fieldNote.title}" to Bin`);
    res.json({ message: "Field note moved to trash bin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── TRASH BIN ENDPOINTS ──────────────────────────────────────

// Get all soft-deleted records (Admin only)
app.get("/api/bin", protect, admin, async (req, res) => {
  try {
    const deletedTasks = await Task.find({ deleted: true })
      .populate("assignee", "name email role")
      .populate("createdBy", "name role");
      
    const deletedCampaigns = await FieldNote.find({ deleted: true })
      .populate("createdBy", "name role");

    const deletedOrders = await Order.find({ deleted: true })
      .populate("assignee", "name email role")
      .populate("createdBy", "name role");

    res.json({
      tasks: deletedTasks,
      campaigns: deletedCampaigns,
      orders: deletedOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Restore soft-deleted record (Admin only)
app.put("/api/bin/:type/:id/restore", protect, admin, async (req, res) => {
  const { type, id } = req.params;
  try {
    if (type === "task") {
      const task = await Task.findById(id);
      if (!task) return res.status(404).json({ message: "Task not found" });
      task.deleted = false;
      task.deletedAt = undefined;
      await task.save();

      const populatedTask = await Task.findById(task._id)
        .populate("assignee", "name email role")
        .populate("createdBy", "name role");

      triggerPusher("task_created", populatedTask);
      triggerPusher("bin_updated", {});
      await logActivity(req.user._id, "Task Restored", `Restored task "${task.title}"`);
      return res.json(populatedTask);
    } else if (type === "campaign" || type === "field-note") {
      const fieldNote = await FieldNote.findById(id);
      if (!fieldNote) return res.status(404).json({ message: "Field note not found" });
      fieldNote.deleted = false;
      fieldNote.deletedAt = undefined;
      await fieldNote.save();

      const populatedFieldNote = await FieldNote.findById(fieldNote._id)
        .populate("createdBy", "name role");

      triggerPusher("campaign_updated", populatedFieldNote);
      triggerPusher("bin_updated", {});
      await logActivity(req.user._id, "Field Note Restored", `Restored field note "${fieldNote.title}"`);
      return res.json(populatedFieldNote);
    } else if (type === "order") {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      order.deleted = false;
      order.deletedAt = undefined;
      await order.save();

      const populatedOrder = await Order.findById(order._id)
        .populate("createdBy", "name role")
        .populate("assignee", "name email role");

      triggerPusher("order_created", populatedOrder);
      triggerPusher("bin_updated", {});
      await logActivity(req.user._id, "Order Restored", `Restored order for "${order.productName}"`);
      return res.json(populatedOrder);
    }
    res.status(400).json({ message: "Invalid record type" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Permanently delete record immediately (Admin only)
app.delete("/api/bin/:type/:id/force", protect, admin, async (req, res) => {
  const { type, id } = req.params;
  try {
    if (type === "task") {
      const task = await Task.findById(id);
      if (!task) return res.status(404).json({ message: "Task not found" });
      await task.deleteOne();
      triggerPusher("bin_updated", {});
      await logActivity(req.user._id, "Task Perm Deleted", `Permanently deleted task "${task.title}"`);
      return res.json({ message: "Task permanently deleted" });
    } else if (type === "campaign" || type === "field-note") {
      const fieldNote = await FieldNote.findById(id);
      if (!fieldNote) return res.status(404).json({ message: "Field note not found" });
      await fieldNote.deleteOne();
      triggerPusher("bin_updated", {});
      await logActivity(req.user._id, "Field Note Perm Deleted", `Permanently deleted field note "${fieldNote.title}"`);
      return res.json({ message: "Field note permanently deleted" });
    } else if (type === "order") {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      await order.deleteOne();
      triggerPusher("bin_updated", {});
      await logActivity(req.user._id, "Order Perm Deleted", `Permanently deleted order for "${order.productName}"`);
      return res.json({ message: "Order permanently deleted" });
    }
    res.status(400).json({ message: "Invalid record type" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PRODUCT CATALOG CRUD ENDPOINTS ───────────────────────────────────

// Get all products (Public)
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single product by ID (Public)
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (Admin only)
app.post("/api/products", protect, admin, async (req, res) => {
  const {
    name,
    category,
    subCategory,
    price,
    image,
    badge,
    description,
    specs,
    stockStatus,
  } = req.body;

  try {
    // Generate a unique ID (incremental or timestamp)
    const latestProd = await Product.findOne({}).sort({ createdAt: -1 });
    let newId = "1";
    if (latestProd && !isNaN(parseInt(latestProd.id))) {
      newId = (parseInt(latestProd.id) + 1).toString();
    } else {
      newId = Date.now().toString();
    }

    const product = await Product.create({
      id: newId,
      name,
      category,
      subCategory,
      price: Number(price),
      image,
      badge,
      description,
      specs: Array.isArray(specs) ? specs : [],
      stockStatus: stockStatus || "In Stock",
    });

    triggerPusher("product_created", product);
    await logActivity(req.user._id, "Product Created", `Created catalog product "${product.name}"`);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product (Admin only)
app.put("/api/products/:id", protect, admin, async (req, res) => {
  const {
    name,
    category,
    subCategory,
    price,
    image,
    badge,
    description,
    specs,
    stockStatus,
  } = req.body;

  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name !== undefined ? name : product.name;
    product.category = category !== undefined ? category : product.category;
    product.subCategory = subCategory !== undefined ? subCategory : product.subCategory;
    product.price = price !== undefined ? Number(price) : product.price;
    product.image = image !== undefined ? image : product.image;
    product.badge = badge !== undefined ? badge : product.badge;
    product.description = description !== undefined ? description : product.description;
    product.specs = specs !== undefined ? (Array.isArray(specs) ? specs : []) : product.specs;
    product.stockStatus = stockStatus !== undefined ? stockStatus : product.stockStatus;

    await product.save();

    triggerPusher("product_updated", product);
    await logActivity(req.user._id, "Product Updated", `Updated catalog product "${product.name}"`);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product (Admin only)
app.delete("/api/products/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    triggerPusher("product_deleted", req.params.id);
    await logActivity(req.user._id, "Product Deleted", `Deleted catalog product "${product.name}"`);
    res.json({ message: "Product deleted from catalog" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ORDERS ENDPOINTS ──────────────────────────────────────────

// Get all orders (non-deleted, sorted by creation date descending)
app.get("/api/orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ deleted: { $ne: true } })
      .populate("createdBy", "name role")
      .populate("assignee", "name email role")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create manual order (Admin only)
app.post("/api/orders", protect, admin, async (req, res) => {
  const {
    productName,
    size,
    price,
    deliveryPrice,
    installationPrice,
    advancePayment,
    color,
    productImageUrl,
    locationImageUrl,
    customerName,
    customerContact,
    customerEmail,
    customerAddress,
    orderFrom,
    paymentMethod,
    manufacturingNotes,
    deliveryDate,
    assignee,
  } = req.body;

  try {
    const order = await Order.create({
      productName,
      size,
      price: Number(price) || 0,
      deliveryPrice: Number(deliveryPrice) || 0,
      installationPrice: Number(installationPrice) || 0,
      advancePayment: Number(advancePayment) || 0,
      color,
      productImageUrl: productImageUrl || "",
      locationImageUrl: locationImageUrl || "",
      customerName,
      customerContact,
      customerEmail: customerEmail || "",
      customerAddress,
      orderFrom,
      paymentMethod,
      manufacturingNotes: manufacturingNotes || "",
      deliveryDate: deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignee: assignee || null,
      createdBy: req.user._id,
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("createdBy", "name role")
      .populate("assignee", "name email role");

    triggerPusher("order_created", populatedOrder);
    await logActivity(req.user._id, "Order Created", `Posted manual order for "${productName}" (Rs. ${populatedOrder.totalPrice.toLocaleString()})`);

    // Create and broadcast notification if assignee is set
    if (order.assignee) {
      const notif = await Notification.create({
        type: "order_assigned",
        message: `New order assigned to you: "${order.productName}" by ${req.user.name}`,
        recipient: order.assignee,
      });
      triggerPusher("receive_notification", notif);
    }

    // Create and broadcast global notification for new order
    const globalOrderNotif = await Notification.create({
      type: "new_order",
      message: `New order: "${productName}" (Client: ${customerName}) created by ${req.user.name}`,
      recipient: null,
    });
    triggerPusher("receive_notification", globalOrderNotif);

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order details (Admin only)
app.put("/api/orders/:id", protect, admin, async (req, res) => {
  const {
    productName,
    size,
    price,
    deliveryPrice,
    installationPrice,
    advancePayment,
    color,
    productImageUrl,
    locationImageUrl,
    customerName,
    customerContact,
    customerEmail,
    customerAddress,
    orderFrom,
    paymentMethod,
    manufacturingNotes,
    deliveryDate,
    assignee,
  } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const oldAssignee = order.assignee ? order.assignee.toString() : null;

    order.productName = productName || order.productName;
    order.size = size || order.size;
    if (price !== undefined) order.price = Number(price) || 0;
    if (deliveryPrice !== undefined) order.deliveryPrice = Number(deliveryPrice) || 0;
    if (installationPrice !== undefined) order.installationPrice = Number(installationPrice) || 0;
    if (advancePayment !== undefined) order.advancePayment = Number(advancePayment) || 0;
    order.color = color || order.color;
    if (productImageUrl !== undefined) order.productImageUrl = productImageUrl;
    if (locationImageUrl !== undefined) order.locationImageUrl = locationImageUrl;
    order.customerName = customerName || order.customerName;
    order.customerContact = customerContact || order.customerContact;
    order.customerEmail = customerEmail !== undefined ? customerEmail : order.customerEmail;
    order.customerAddress = customerAddress || order.customerAddress;
    order.deliveryDate = deliveryDate || order.deliveryDate;
    if (assignee !== undefined) order.assignee = assignee || null;
    order.orderFrom = orderFrom || order.orderFrom;
    order.paymentMethod = paymentMethod || order.paymentMethod;
    if (manufacturingNotes !== undefined) order.manufacturingNotes = manufacturingNotes;

    await order.save();
    await syncOrderSale(order, req.user._id);

    // Send notification if assignee changed and is not null
    const newAssigneeStr = order.assignee ? order.assignee.toString() : null;
    if (newAssigneeStr && newAssigneeStr !== oldAssignee) {
      const notif = await Notification.create({
        type: "order_assigned",
        message: `New order assigned to you: "${order.productName}" by ${req.user.name}`,
        recipient: order.assignee,
      });
      triggerPusher("receive_notification", notif);
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("createdBy", "name role")
      .populate("assignee", "name email role");

    triggerPusher("order_updated", populatedOrder);
    await logActivity(req.user._id, "Order Updated", `Modified details of order for "${order.productName}"`);

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order stage/progress (Admin & Staff)
app.put("/api/orders/:id/progress", protect, async (req, res) => {
  const { stage, assignee } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const oldAssignee = order.assignee ? order.assignee.toString() : null;

    const previousStage = order.stage;
    if (stage) order.stage = stage;
    if (assignee !== undefined) order.assignee = assignee || null;

    // If explicitly moves it to delivered, approve it
    if (stage === "delivered") {
      order.approved = true;
      order.approvedAt = new Date();
    } else if (stage && stage !== "delivered") {
      // If moving back, unapprove
      order.approved = false;
      order.approvedAt = undefined;
    }

    await order.save();
    await syncOrderSale(order, req.user._id);

    // Send notification if assignee changed and is not null
    const newAssigneeStr = order.assignee ? order.assignee.toString() : null;
    if (newAssigneeStr && newAssigneeStr !== oldAssignee) {
      const notif = await Notification.create({
        type: "order_assigned",
        message: `New order assigned to you: "${order.productName}" by ${req.user.name}`,
        recipient: order.assignee,
      });
      triggerPusher("receive_notification", notif);
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("createdBy", "name role")
      .populate("assignee", "name email role");

    triggerPusher("order_updated", populatedOrder);
    
    let logMsg = `Updated order "${order.productName}"`;
    if (stage && previousStage !== stage) {
      logMsg = `Moved "${order.productName}" from ${previousStage.toUpperCase()} to ${stage.toUpperCase()}`;
    }
    await logActivity(
      req.user._id,
      "Order Progress Updated",
      logMsg
    );

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve order (Admin only)
app.put("/api/orders/:id/approve", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.stage = "delivered";
    order.approved = true;
    order.approvedAt = new Date();

    await order.save();
    await syncOrderSale(order, req.user._id);

    const populatedOrder = await Order.findById(order._id)
      .populate("createdBy", "name role")
      .populate("assignee", "name email role");

    triggerPusher("order_updated", populatedOrder);
    await logActivity(req.user._id, "Order Approved", `Approved order for "${order.productName}". Revenue Rs. ${populatedOrder.totalPrice.toLocaleString()} added to Sales.`);

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete order (Admin only, soft-delete)
app.delete("/api/orders/:id", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.deleted = true;
    order.deletedAt = new Date();
    order.approved = false; // remove sale association
    await order.save();
    await syncOrderSale(order, req.user._id);

    triggerPusher("order_deleted", req.params.id);
    triggerPusher("bin_updated", {});
    await logActivity(req.user._id, "Order Deleted", `Deleted order for "${order.productName}"`);

    res.json({ message: "Order soft-deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// SALES ROUTES
// ==========================================
app.get("/api/sales", protect, admin, async (req, res) => {
  try {
    const sales = await Sale.find({}).populate("createdBy", "name role").populate("orderId").sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/sales", protect, admin, async (req, res) => {
  const { clientName, productName, amount, date, paymentMethod, notes } = req.body;
  try {
    const sale = new Sale({
      clientName,
      productName,
      amount: Number(amount) || 0,
      date: date || new Date(),
      paymentMethod,
      notes,
      createdBy: req.user._id,
    });
    await sale.save();

    const populatedSale = await Sale.findById(sale._id).populate("createdBy", "name role").populate("orderId");
    triggerPusher("sale_created", populatedSale);
    await logActivity(req.user._id, "Sale Logged", `Logged direct sale to "${clientName}" for "${productName}" (Rs. ${Number(amount).toLocaleString()})`);

    res.status(201).json(populatedSale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/sales/:id", protect, admin, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    await Sale.findByIdAndDelete(req.params.id);
    triggerPusher("sale_deleted", req.params.id);
    await logActivity(req.user._id, "Sale Deleted", `Deleted sale log for "${sale.productName}"`);
    res.json({ message: "Sale deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// EXPENSES ROUTES
// ==========================================
app.get("/api/expenses", protect, admin, async (req, res) => {
  try {
    const expenses = await Expense.find({}).populate("createdBy", "name role").sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/expenses", protect, admin, async (req, res) => {
  const { title, category, amount, date, description } = req.body;
  try {
    const expense = new Expense({
      title,
      category,
      amount: Number(amount) || 0,
      date: date || new Date(),
      description,
      createdBy: req.user._id,
    });
    await expense.save();

    const populatedExpense = await Expense.findById(expense._id).populate("createdBy", "name role");
    triggerPusher("expense_created", populatedExpense);
    await logActivity(req.user._id, "Expense Logged", `Logged expense "${title}" (Rs. ${Number(amount).toLocaleString()})`);

    res.status(201).json(populatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/expenses/:id", protect, admin, async (req, res) => {
  const { title, category, amount, date, description } = req.body;
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (title !== undefined) expense.title = title;
    if (category !== undefined) expense.category = category;
    if (amount !== undefined) expense.amount = Number(amount) || 0;
    if (date !== undefined) expense.date = date;
    if (description !== undefined) expense.description = description;

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id).populate("createdBy", "name role");
    triggerPusher("expense_updated", populatedExpense);
    await logActivity(req.user._id, "Expense Updated", `Updated expense log "${expense.title}" (Rs. ${expense.amount.toLocaleString()})`);

    res.json(populatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/expenses/:id", protect, admin, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    await Expense.findByIdAndDelete(req.params.id);
    triggerPusher("expense_deleted", req.params.id);
    await logActivity(req.user._id, "Expense Deleted", `Deleted expense log for "${expense.title}"`);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// PURCHASE ROUTES
// ==========================================
app.get("/api/purchases", protect, admin, async (req, res) => {
  try {
    const purchases = await Purchase.find({}).populate("createdBy", "name role").sort({ date: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/purchases", protect, admin, async (req, res) => {
  const { supplier, itemDetails, amount, date, status, items } = req.body;
  try {
    const purchase = new Purchase({
      supplier,
      itemDetails,
      amount: Number(amount) || 0,
      date: date || new Date(),
      status: status || "pending",
      items: items || [],
      createdBy: req.user._id,
    });
    await purchase.save();

    const populatedPurchase = await Purchase.findById(purchase._id).populate("createdBy", "name role");
    triggerPusher("purchase_created", populatedPurchase);
    await logActivity(req.user._id, "Purchase Logged", `Logged purchase from "${supplier}" (Rs. ${Number(amount).toLocaleString()})`);

    res.status(201).json(populatedPurchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/purchases/:id", protect, admin, async (req, res) => {
  const { supplier, itemDetails, amount, date, status, items } = req.body;
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });
    
    if (supplier !== undefined) purchase.supplier = supplier;
    if (itemDetails !== undefined) purchase.itemDetails = itemDetails;
    if (amount !== undefined) purchase.amount = Number(amount) || 0;
    if (date !== undefined) purchase.date = date;
    if (status !== undefined) purchase.status = status;
    if (items !== undefined) purchase.items = items;
    
    await purchase.save();

    const populatedPurchase = await Purchase.findById(purchase._id).populate("createdBy", "name role");
    triggerPusher("purchase_updated", populatedPurchase);
    await logActivity(req.user._id, "Purchase Updated", `Updated purchase details for "${purchase.supplier}" (Rs. ${purchase.amount.toLocaleString()})`);

    res.json(populatedPurchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/purchases/:id", protect, admin, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });
    await Purchase.findByIdAndDelete(req.params.id);
    triggerPusher("purchase_deleted", req.params.id);
    await logActivity(req.user._id, "Purchase Deleted", `Deleted purchase from "${purchase.supplier}"`);
    res.json({ message: "Purchase deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// INVENTORY ROUTES
// ==========================================
app.get("/api/inventory", protect, async (req, res) => {
  try {
    const items = await InventoryItem.find({}).populate("createdBy", "name role").sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/inventory", protect, admin, async (req, res) => {
  const { name, category, quantity, unit, alertLevel } = req.body;
  try {
    const item = new InventoryItem({
      name,
      category,
      quantity: Number(quantity) || 0,
      unit,
      alertLevel: Number(alertLevel) || 5,
      createdBy: req.user._id,
    });
    await item.save();

    const populatedItem = await InventoryItem.findById(item._id).populate("createdBy", "name role");
    triggerPusher("inventory_created", populatedItem);
    await logActivity(req.user._id, "Inventory Item Added", `Added inventory item "${name}" (${quantity} ${unit})`);

    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/inventory/:id", protect, admin, async (req, res) => {
  const { name, category, quantity, unit, alertLevel } = req.body;
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Inventory item not found" });

    if (name !== undefined) item.name = name;
    if (category !== undefined) item.category = category;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unit !== undefined) item.unit = unit;
    if (alertLevel !== undefined) item.alertLevel = Number(alertLevel);

    await item.save();

    const populatedItem = await InventoryItem.findById(item._id).populate("createdBy", "name role");
    triggerPusher("inventory_updated", populatedItem);

    res.json(populatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/inventory/:id", protect, admin, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Inventory item not found" });
    await InventoryItem.findByIdAndDelete(req.params.id);
    triggerPusher("inventory_deleted", req.params.id);
    await logActivity(req.user._id, "Inventory Item Deleted", `Deleted inventory item "${item.name}"`);
    res.json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// QUOTATION ROUTES
// ==========================================
app.get("/api/quotations", protect, admin, async (req, res) => {
  try {
    const quotations = await Quotation.find({}).populate("createdBy", "name role").sort({ date: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/quotations", protect, admin, async (req, res) => {
  const { clientName, clientEmail, clientContact, projectName, items, discount, tax, grandTotal, status, date, voucherNo, voucherDate, amountInWords, remarks } = req.body;
  try {
    const quotation = new Quotation({
      clientName,
      clientEmail,
      clientContact,
      projectName,
      items,
      discount: Number(discount) || 0,
      tax: Number(tax) || 0,
      grandTotal: Number(grandTotal) || 0,
      status: status || "draft",
      date: date || new Date(),
      voucherNo,
      voucherDate,
      amountInWords,
      remarks,
      createdBy: req.user._id,
    });
    await quotation.save();

    const populatedQuotation = await Quotation.findById(quotation._id).populate("createdBy", "name role");
    triggerPusher("quotation_created", populatedQuotation);
    await logActivity(req.user._id, "Quotation Created", `Generated quotation for "${clientName}" on project "${projectName}" (Total: Rs. ${Number(grandTotal).toLocaleString()})`);

    res.status(201).json(populatedQuotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/quotations/:id", protect, admin, async (req, res) => {
  const { status } = req.body;
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    quotation.status = status || quotation.status;
    await quotation.save();

    const populatedQuotation = await Quotation.findById(quotation._id).populate("createdBy", "name role");
    triggerPusher("quotation_updated", populatedQuotation);
    await logActivity(req.user._id, "Quotation Updated", `Updated quotation status for "${quotation.clientName}" to ${status.toUpperCase()}`);

    res.json(populatedQuotation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/quotations/:id", protect, admin, async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });
    await Quotation.findByIdAndDelete(req.params.id);
    triggerPusher("quotation_deleted", req.params.id);
    await logActivity(req.user._id, "Quotation Deleted", `Deleted quotation for "${quotation.clientName}"`);
    res.json({ message: "Quotation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chronological activity log
app.get("/api/activities", protect, async (req, res) => {
  try {
    const activities = await ActivityLog.find({})
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Quick-Notes support
app.get("/api/notes", protect, async (req, res) => {
  try {
    const notes = await QuickNote.find({}).populate("createdBy", "name role").sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/notes", protect, async (req, res) => {
  const { text } = req.body;
  try {
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Note text is required" });
    }
    const note = new QuickNote({
      text: text.trim(),
      createdBy: req.user._id,
    });
    await note.save();

    const populatedNote = await QuickNote.findById(note._id).populate("createdBy", "name role");

    // Broadcast to everyone via Pusher!
    triggerPusher("note_created", populatedNote);

    // Create and broadcast global notification for new note
    const globalNoteNotif = await Notification.create({
      type: "new_quick_note",
      message: `New note: "${text.trim()}" by ${req.user.name}`,
      recipient: null,
    });
    triggerPusher("receive_notification", globalNoteNotif);

    res.status(201).json(populatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/notes/:id", protect, async (req, res) => {
  try {
    const note = await QuickNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    await QuickNote.deleteOne({ _id: req.params.id });

    // Broadcast delete event via Pusher!
    triggerPusher("note_deleted", req.params.id);

    res.json({ message: "Note deleted successfully", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Export monthly or all-time statements (Admin only) - Beautifully formatted with ExcelJS
app.get("/api/export/statement", protect, admin, async (req, res) => {
  const { type = "all", month = "all", year = new Date().getFullYear().toString() } = req.query;

  try {
    let dateFilter = {};
    if (month !== "all") {
      const mNum = parseInt(month, 10);
      const yNum = parseInt(year, 10);
      const startOfMonth = new Date(Date.UTC(yNum, mNum - 1, 1, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(yNum, mNum, 0, 23, 59, 59, 999));
      dateFilter = { date: { $gte: startOfMonth, $lte: endOfMonth } };
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "KTM DECOR Admin Dashboard";

    // Fetch data
    let sales = [];
    let expenses = [];
    let purchases = [];

    if (type === "all" || type === "sales") {
      sales = await Sale.find(dateFilter).sort({ date: 1 });
    }
    if (type === "all" || type === "expenses") {
      expenses = await Expense.find(dateFilter).sort({ date: 1 });
    }
    if (type === "all" || type === "purchases") {
      purchases = await Purchase.find(dateFilter).sort({ date: 1 });
    }

    // Month Label
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const periodLabel = month === "all" ? "All_Time" : `${monthNames[parseInt(month, 10) - 1]}_${year}`;
    const cleanPeriodLabel = periodLabel.replace(/_/g, " ");

    // Helper: Style sheet helper to enforce gridlines and basic border/font formatting
    const applyDefaultBorders = (sheet, startRow, endRow, numCols) => {
      sheet.views = [{ showGridLines: true }];
      for (let r = startRow; r <= endRow; r++) {
        const row = sheet.getRow(r);
        for (let c = 1; c <= numCols; c++) {
          const cell = row.getCell(c);
          cell.font = cell.font || { name: "Segoe UI", size: 10 };
          cell.border = cell.border || {
            top: { style: "thin", color: { argb: "E5E7EB" } },
            left: { style: "thin", color: { argb: "E5E7EB" } },
            bottom: { style: "thin", color: { argb: "E5E7EB" } },
            right: { style: "thin", color: { argb: "E5E7EB" } }
          };
        }
      }
    };

    // 1. SUMMARY SHEET
    if (type === "all") {
      const summarySheet = workbook.addWorksheet("Summary Overview");
      summarySheet.columns = [
        { key: "metric", width: 32 },
        { key: "value", width: 22 },
        { key: "count", width: 16 }
      ];

      // Banner Row 1
      summarySheet.mergeCells("A1:C1");
      const banner = summarySheet.getCell("A1");
      banner.value = "KTM DECOR - BUSINESS STATEMENT OVERVIEW";
      banner.font = { name: "Segoe UI", size: 13, bold: true, color: { argb: "FFFFFF" } };
      banner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FE914C" } };
      banner.alignment = { horizontal: "center", vertical: "middle" };
      summarySheet.getRow(1).height = 36;

      // Period & Info
      summarySheet.getCell("A2").value = "Statement Period:";
      summarySheet.getCell("A2").font = { name: "Segoe UI", size: 10, bold: true };
      summarySheet.getCell("B2").value = cleanPeriodLabel;
      summarySheet.getCell("B2").alignment = { horizontal: "left" };

      summarySheet.getCell("A3").value = "Exported On:";
      summarySheet.getCell("A3").font = { name: "Segoe UI", size: 10, bold: true };
      summarySheet.getCell("B3").value = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
      summarySheet.getCell("B3").alignment = { horizontal: "left" };

      // Headers (Row 5)
      const headersRow = summarySheet.getRow(5);
      headersRow.values = ["METRIC SUMMARY", "AMOUNT (Rs.)", "RECORDS COUNT"];
      headersRow.height = 24;
      headersRow.eachCell((cell) => {
        cell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "000000" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F3F4F6" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });

      // Data rows
      summarySheet.getCell("A6").value = "Total Sales Revenue";
      summarySheet.getCell("B6").value = { formula: `'Sales Ledger'!F${sales.length + 3}` };
      summarySheet.getCell("C6").value = sales.length;

      summarySheet.getCell("A7").value = "Total Expenses Value";
      summarySheet.getCell("B7").value = { formula: `'Expenses Log'!E${expenses.length + 3}` };
      summarySheet.getCell("C7").value = expenses.length;

      summarySheet.getCell("A8").value = "Total Purchases Value";
      summarySheet.getCell("B8").value = { formula: `'Purchases Ledger'!F${purchases.length + 3}` };
      summarySheet.getCell("C8").value = purchases.length;

      // Net Profit (Row 10)
      summarySheet.getCell("A10").value = "NET OPERATING PROFIT / (LOSS)";
      summarySheet.getCell("A10").font = { name: "Segoe UI", size: 10, bold: true };
      
      const profitCell = summarySheet.getCell("B10");
      profitCell.value = { formula: "B6-B7-B8" };
      profitCell.font = { name: "Segoe UI", size: 11, bold: true };
      
      // Formatting number cells on summary sheet
      ["B6", "B7", "B8", "B10"].forEach((cellRef) => {
        const cell = summarySheet.getCell(cellRef);
        cell.numFormat = `"Rs. "#,##0.00`;
        cell.alignment = { horizontal: "right", vertical: "middle" };
      });

      // Standard styling & borders for Summary sheet
      applyDefaultBorders(summarySheet, 1, 11, 3);
      
      // Additional styling for Summary sheet cells
      summarySheet.getRow(10).eachCell((cell, colIdx) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0E5" } };
        cell.border = {
          top: { style: "thin", color: { argb: "9CA3AF" } },
          bottom: { style: "double", color: { argb: "374151" } }
        };
      });
    }

    // 2. SALES SHEET
    if (type === "all" || type === "sales") {
      const salesSheet = workbook.addWorksheet("Sales Ledger");
      salesSheet.columns = [
        { key: "sn", width: 8 },
        { key: "date", width: 14 },
        { key: "clientName", width: 25 },
        { key: "productName", width: 25 },
        { key: "paymentMethod", width: 18 },
        { key: "amount", width: 18 },
        { key: "notes", width: 30 }
      ];

      // Title Banner Row 1
      salesSheet.mergeCells("A1:G1");
      const banner = salesSheet.getCell("A1");
      banner.value = "KTM DECOR - SALES TRANSACTION LEDGER";
      banner.font = { name: "Segoe UI", size: 13, bold: true, color: { argb: "FFFFFF" } };
      banner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "3B82F6" } }; // Blue accent
      banner.alignment = { horizontal: "center", vertical: "middle" };
      salesSheet.getRow(1).height = 36;

      // Table Headers Row 2
      const headersRow = salesSheet.getRow(2);
      headersRow.values = ["S.N.", "Date", "Client Name", "Product", "Payment Method", "Amount (Rs.)", "Notes"];
      headersRow.height = 24;
      headersRow.eachCell((cell) => {
        cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "000000" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "EFF6FF" } }; // Light blue fill
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "medium", color: { argb: "9CA3AF" } },
          bottom: { style: "medium", color: { argb: "9CA3AF" } }
        };
      });

      // Data Rows
      sales.forEach((s, idx) => {
        const row = salesSheet.addRow([
          idx + 1,
          new Date(s.date).toLocaleDateString(),
          s.clientName,
          s.productName,
          s.paymentMethod.toUpperCase(),
          s.amount,
          s.notes || ""
        ]);
        row.height = 20;
        
        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(2).alignment = { horizontal: "center" };
        row.getCell(5).alignment = { horizontal: "center" };
        row.getCell(6).numFormat = `"Rs. "#,##0.00`;
        row.getCell(6).alignment = { horizontal: "right" };
      });

      // Total Row
      const totalRowIndex = sales.length + 3;
      const totalRow = salesSheet.addRow([
        "TOTAL",
        "",
        "",
        "",
        "",
        { formula: `SUM(F3:F${totalRowIndex - 1})` },
        ""
      ]);
      totalRow.height = 22;
      totalRow.eachCell((cell, colNum) => {
        cell.font = { name: "Segoe UI", size: 10, bold: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "EFF6FF" } };
        cell.border = {
          top: { style: "thin", color: { argb: "9CA3AF" } },
          bottom: { style: "double", color: { argb: "374151" } }
        };
        if (colNum === 1) cell.alignment = { horizontal: "center" };
        if (colNum === 6) {
          cell.numFormat = `"Rs. "#,##0.00`;
          cell.alignment = { horizontal: "right" };
        }
      });

      applyDefaultBorders(salesSheet, 1, totalRowIndex, 7);
    }

    // 3. EXPENSES SHEET
    if (type === "all" || type === "expenses") {
      const expensesSheet = workbook.addWorksheet("Expenses Log");
      expensesSheet.columns = [
        { key: "sn", width: 8 },
        { key: "date", width: 14 },
        { key: "title", width: 25 },
        { key: "category", width: 18 },
        { key: "amount", width: 18 },
        { key: "description", width: 32 }
      ];

      // Title Banner Row 1
      expensesSheet.mergeCells("A1:F1");
      const banner = expensesSheet.getCell("A1");
      banner.value = "KTM DECOR - EXPENSES TRANSACTION LOG";
      banner.font = { name: "Segoe UI", size: 13, bold: true, color: { argb: "FFFFFF" } };
      banner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "EF4444" } }; // Red
      banner.alignment = { horizontal: "center", vertical: "middle" };
      expensesSheet.getRow(1).height = 36;

      // Table Headers Row 2
      const headersRow = expensesSheet.getRow(2);
      headersRow.values = ["S.N.", "Date", "Expense Item", "Category", "Amount (Rs.)", "Description"];
      headersRow.height = 24;
      headersRow.eachCell((cell) => {
        cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "000000" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FEF2F2" } }; // Light red fill
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "medium", color: { argb: "9CA3AF" } },
          bottom: { style: "medium", color: { argb: "9CA3AF" } }
        };
      });

      // Data Rows
      expenses.forEach((e, idx) => {
        const row = expensesSheet.addRow([
          idx + 1,
          new Date(e.date).toLocaleDateString(),
          e.title,
          e.category.toUpperCase(),
          e.amount,
          e.description || ""
        ]);
        row.height = 20;

        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(2).alignment = { horizontal: "center" };
        row.getCell(4).alignment = { horizontal: "center" };
        row.getCell(5).numFormat = `"Rs. "#,##0.00`;
        row.getCell(5).alignment = { horizontal: "right" };
      });

      // Total Row
      const totalRowIndex = expenses.length + 3;
      const totalRow = expensesSheet.addRow([
        "TOTAL",
        "",
        "",
        "",
        { formula: `SUM(E3:E${totalRowIndex - 1})` },
        ""
      ]);
      totalRow.height = 22;
      totalRow.eachCell((cell, colNum) => {
        cell.font = { name: "Segoe UI", size: 10, bold: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FEF2F2" } };
        cell.border = {
          top: { style: "thin", color: { argb: "9CA3AF" } },
          bottom: { style: "double", color: { argb: "374151" } }
        };
        if (colNum === 1) cell.alignment = { horizontal: "center" };
        if (colNum === 5) {
          cell.numFormat = `"Rs. "#,##0.00`;
          cell.alignment = { horizontal: "right" };
        }
      });

      applyDefaultBorders(expensesSheet, 1, totalRowIndex, 6);
    }

    // 4. PURCHASES SHEET
    if (type === "all" || type === "purchases") {
      const purchasesSheet = workbook.addWorksheet("Purchases Ledger");
      purchasesSheet.columns = [
        { key: "sn", width: 8 },
        { key: "date", width: 14 },
        { key: "supplier", width: 25 },
        { key: "details", width: 30 },
        { key: "status", width: 15 },
        { key: "amount", width: 18 }
      ];

      // Title Banner Row 1
      purchasesSheet.mergeCells("A1:F1");
      const banner = purchasesSheet.getCell("A1");
      banner.value = "KTM DECOR - RAW MATERIAL PURCHASES LEDGER";
      banner.font = { name: "Segoe UI", size: 13, bold: true, color: { argb: "FFFFFF" } };
      banner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F59E0B" } }; // Amber
      banner.alignment = { horizontal: "center", vertical: "middle" };
      purchasesSheet.getRow(1).height = 36;

      // Table Headers Row 2
      const headersRow = purchasesSheet.getRow(2);
      headersRow.values = ["S.N.", "Date", "Supplier", "Purchase Details", "Status", "Amount (Rs.)"];
      headersRow.height = 24;
      headersRow.eachCell((cell) => {
        cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "000000" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FEF3C7" } }; // Light amber fill
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "medium", color: { argb: "9CA3AF" } },
          bottom: { style: "medium", color: { argb: "9CA3AF" } }
        };
      });

      // Data Rows
      purchases.forEach((p, idx) => {
        const row = purchasesSheet.addRow([
          idx + 1,
          new Date(p.date).toLocaleDateString(),
          p.supplier,
          p.itemDetails,
          p.status.toUpperCase(),
          p.amount
        ]);
        row.height = 20;

        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(2).alignment = { horizontal: "center" };
        row.getCell(5).alignment = { horizontal: "center" };
        row.getCell(6).numFormat = `"Rs. "#,##0.00`;
        row.getCell(6).alignment = { horizontal: "right" };
      });

      // Total Row
      const totalRowIndex = purchases.length + 3;
      const totalRow = purchasesSheet.addRow([
        "TOTAL",
        "",
        "",
        "",
        "",
        { formula: `SUM(F3:F${totalRowIndex - 1})` }
      ]);
      totalRow.height = 22;
      totalRow.eachCell((cell, colNum) => {
        cell.font = { name: "Segoe UI", size: 10, bold: true };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FEF3C7" } };
        cell.border = {
          top: { style: "thin", color: { argb: "9CA3AF" } },
          bottom: { style: "double", color: { argb: "374151" } }
        };
        if (colNum === 1) cell.alignment = { horizontal: "center" };
        if (colNum === 6) {
          cell.numFormat = `"Rs. "#,##0.00`;
          cell.alignment = { horizontal: "right" };
        }
      });

      applyDefaultBorders(purchasesSheet, 1, totalRowIndex, 6);
    }

    // Send spreadsheet workbook
    const filename = `${type}_statement_${periodLabel}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export inventory data as CSV (Any authenticated staff/admin can download) - Updated to ExcelJS
app.get("/api/export/inventory", protect, async (req, res) => {
  try {
    const items = await InventoryItem.find({}).sort({ name: 1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Inventory");

    sheet.columns = [
      { header: "S.N.", key: "sn", width: 8 },
      { header: "Item Name", key: "name", width: 25 },
      { header: "Category", key: "category", width: 18 },
      { header: "Quantity", key: "quantity", width: 12 },
      { header: "Unit", key: "unit", width: 10 },
      { header: "Alert Level", key: "alertLevel", width: 12 },
      { header: "Status", key: "status", width: 15 },
      { header: "Last Updated", key: "lastUpdated", width: 15 }
    ];

    items.forEach((item, idx) => {
      sheet.addRow({
        sn: idx + 1,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        alertLevel: item.alertLevel,
        status: item.quantity === 0 ? "OUT OF STOCK" : item.quantity <= item.alertLevel ? "LOW STOCK" : "IN STOCK",
        lastUpdated: new Date(item.updatedAt).toLocaleDateString()
      });
    });

    const filename = `Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    await workbook.csv.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Conditionally start Express server locally (not in serverless environment)
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  connectDB()
    .then(() => {
      runSeeds().then(() => {
        app.listen(PORT, () => {
          console.log(`Local Express Server running on port ${PORT}`);
        });
      });
    })
    .catch((err) => {
      console.error("Failed to start local database/server:", err);
    });
}

export default app;
