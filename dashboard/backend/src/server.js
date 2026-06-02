import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Pusher from "pusher";

// Models
import User from "./models/User.js";
import Task from "./models/Task.js";
import Notification from "./models/Notification.js";
import MarketingCampaign from "./models/MarketingCampaign.js";
import ActivityLog from "./models/ActivityLog.js";
import Product from "./models/Product.js";

// Middleware
import { protect, admin } from "./middleware/auth.js";

dotenv.config();

const app = express();

// Configure CORS (support local dev + vercel subdomains and previews)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
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
const connectDB = async () => {
  if (cachedDb && mongoose.connection?.readyState === 1) return cachedDb;
  if (!MONGO_URI) throw new Error("MONGO_URI or MONGODB_URI environment variable is not defined");
  mongoose.set("strictQuery", true);

  // Clean up any stale or half-open connections before reconnecting
  if (mongoose.connection?.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch (err) {
      console.warn("Error disconnecting stale connection:", err);
    }
  }

  const conn = await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30 seconds
  });
  cachedDb = conn;
  return conn;
};

// Seeding Caching
let seeded = false;
const runSeeds = async () => {
  if (seeded) return;
  // Let errors bubble up to database middleware so it fails gracefully with a 500 status code
  await seedUsers();
  await seedProducts();
  seeded = true;
  console.log("Database seeded successfully");
};

// Diagnostic endpoint to check configuration status
app.get("/api/auth/status", async (req, res) => {
  const dbState = mongoose.connection?.readyState;
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

  const status = {
    dbConnected: dbState === 1,
    dbState: states[dbState] || "unknown",
    envKeysAvailable: envKeys,
    envAdminPasswordDefined: !!process.env.SEED_ADMIN_PASSWORD,
    envAdminPasswordLength: process.env.SEED_ADMIN_PASSWORD ? process.env.SEED_ADMIN_PASSWORD.length : 0,
    envStaffPasswordDefined: !!process.env.SEED_STAFF_PASSWORD,
    envStaffPasswordLength: process.env.SEED_STAFF_PASSWORD ? process.env.SEED_STAFF_PASSWORD.length : 0,
    envMongoUriDefined: !!process.env.MONGO_URI,
    envMongoUriLength: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0,
    envMongodbUriDefined: !!process.env.MONGODB_URI,
    envMongodbUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
    envJwtSecretDefined: !!process.env.JWT_SECRET,
    envJwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
  };

  if (dbState !== 1) {
    return res.json({
      ...status,
      adminExists: false,
      note: "Database is not connected; skipped query to avoid hanging"
    });
  }

  try {
    const adminExists = await User.findOne({ email: "admin@ktmdecor.com" });
    const staffExists = await User.findOne({ email: "staff@ktmdecor.com" });
    res.json({
      ...status,
      adminExists: !!adminExists,
      staffExists: !!staffExists,
    });
  } catch (error) {
    res.json({
      ...status,
      adminExists: false,
      staffExists: false,
      error: error.message
    });
  }
});

// Middleware to ensure database connection in serverless environment
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await runSeeds();
    next();
  } catch (err) {
    console.error("Database middleware connection error:", err);
    res.status(500).json({ 
      message: "Database connection failed",
      error: err.message 
    });
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
    } else if (process.env.SEED_ADMIN_PASSWORD) {
      adminExists.password = process.env.SEED_ADMIN_PASSWORD;
      await adminExists.save();
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
    } else if (process.env.SEED_STAFF_PASSWORD) {
      sharedStaffExists.password = process.env.SEED_STAFF_PASSWORD;
      await sharedStaffExists.save();
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
      } else if (process.env.SEED_STAFF_PASSWORD) {
        exists.password = process.env.SEED_STAFF_PASSWORD;
        await exists.save();
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

// ─── MARKETING CAMPAIGNS ENDPOINTS ────────────────────────────

// Get all campaigns
app.get("/api/campaigns", protect, async (req, res) => {
  try {
    const campaigns = await MarketingCampaign.find({ deleted: { $ne: true } })
      .populate("createdBy", "name role")
      .sort({ scheduledDate: 1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create campaign (Admin & Staff authorized to create deliverables)
app.post("/api/campaigns", protect, async (req, res) => {
  const { title, platform, category, status, scheduledDate, assetUrl, copy, notes } = req.body;
  try {
    const finalCategory = category || platform || "Note";
    const campaign = await MarketingCampaign.create({
      title,
      category: finalCategory,
      platform: finalCategory,
      status,
      scheduledDate,
      assetUrl,
      copy,
      notes,
      createdBy: req.user._id,
    });

    const populatedCampaign = await MarketingCampaign.findById(campaign._id).populate("createdBy", "name role");

    triggerPusher("campaign_updated", populatedCampaign);

    // Create Notification alerts for marketing deadline
    const deadlineNotif = await Notification.create({
      type: "marketing_deadline",
      message: `New marketing entry created: "${title}" (${finalCategory})`,
    });
    triggerPusher("receive_notification", deadlineNotif);

    await logActivity(req.user._id, "Campaign Created", `Created marketing entry "${title}" (${finalCategory})`);
    res.status(201).json(populatedCampaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update campaign status or materials
app.put("/api/campaigns/:id", protect, async (req, res) => {
  const { title, platform, category, status, scheduledDate, assetUrl, copy, notes } = req.body;
  try {
    const campaign = await MarketingCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    campaign.title = title || campaign.title;
    if (category || platform) {
      const finalCategory = category || platform;
      campaign.category = finalCategory;
      campaign.platform = finalCategory;
    }
    campaign.status = status || campaign.status;
    campaign.scheduledDate = scheduledDate || campaign.scheduledDate;
    campaign.assetUrl = assetUrl !== undefined ? assetUrl : campaign.assetUrl;
    campaign.copy = copy !== undefined ? copy : campaign.copy;
    campaign.notes = notes !== undefined ? notes : campaign.notes;

    await campaign.save();

    const populatedCampaign = await MarketingCampaign.findById(campaign._id).populate("createdBy", "name role");

    triggerPusher("campaign_updated", populatedCampaign);

    await logActivity(
      req.user._id,
      "Campaign Updated",
      `Updated marketing entry "${campaign.title}" to status "${campaign.status.toUpperCase()}"`
    );

    res.json(populatedCampaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete campaign (Admin only, soft-deletes)
app.delete("/api/campaigns/:id", protect, admin, async (req, res) => {
  try {
    const campaign = await MarketingCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Marketing entry not found" });
    }

    campaign.deleted = true;
    campaign.deletedAt = new Date();
    await campaign.save();

    triggerPusher("campaign_deleted", req.params.id);
    triggerPusher("bin_updated", {});

    await logActivity(req.user._id, "Campaign Deleted", `Moved marketing entry "${campaign.title}" to Bin`);
    res.json({ message: "Marketing entry moved to trash bin" });
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
      
    const deletedCampaigns = await MarketingCampaign.find({ deleted: true })
      .populate("createdBy", "name role");

    res.json({
      tasks: deletedTasks,
      campaigns: deletedCampaigns
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
    } else if (type === "campaign") {
      const campaign = await MarketingCampaign.findById(id);
      if (!campaign) return res.status(404).json({ message: "Marketing entry not found" });
      campaign.deleted = false;
      campaign.deletedAt = undefined;
      await campaign.save();

      const populatedCampaign = await MarketingCampaign.findById(campaign._id)
        .populate("createdBy", "name role");

      triggerPusher("campaign_updated", populatedCampaign);
      triggerPusher("bin_updated", {});
      await logActivity(req.user._id, "Campaign Restored", `Restored marketing entry "${campaign.title}"`);
      return res.json(populatedCampaign);
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
    } else if (type === "campaign") {
      const campaign = await MarketingCampaign.findById(id);
      if (!campaign) return res.status(404).json({ message: "Marketing entry not found" });
      await campaign.deleteOne();
      triggerPusher("bin_updated", {});
      await logActivity(req.user._id, "Campaign Perm Deleted", `Permanently deleted marketing entry "${campaign.title}"`);
      return res.json({ message: "Marketing entry permanently deleted" });
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
    res.json({ message: "Sticky notes are maintained locally on the client." });
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
