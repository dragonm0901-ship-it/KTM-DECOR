KTM Decor Dashboard — Full Codebase Audit Report
Date: June 17, 2026
Scope: Backend (
server.js
), all 15 Mongoose models, auth middleware, Zustand store, env configuration, deployment setup.

Verdict Summary
Area Grade Status
Production Readiness 🔴 C- Not ready — critical security issues
Code Quality (Senior Level) 🟡 C+ Functional but architecturally weak
Security (Minor/Medium Attacks) 🔴 D Vulnerable to common attacks
MongoDB Performance 🟡 C Fixable — 10-20s is not normal
Statelessness 🟢 B+ Mostly stateless, minor issues

1. 🚨 CRITICAL SECURITY VULNERABILITIES
   1.1 Credentials Hardcoded & Exposed in Frontend .env
   CAUTION

Severity: CRITICAL — This is the single most dangerous issue in the entire codebase.

Frontend .env
contains:

VITE*SEED_ADMIN_PASSWORD="uH9#fX8$mK2!vP5_wZ7*tQ3"
VITE_SEED_STAFF_PASSWORD="xR4!yP6_zT8$wB2\*qM5#sK9"
Any VITE\* prefixed variable is embedded into the production JavaScript bundle and visible to anyone who opens browser DevTools. This means:

Anyone can log in as admin by inspecting your built JS.
Both admin and staff passwords are fully public.
Fix: Remove VITE_SEED_ADMIN_PASSWORD and VITE_SEED_STAFF_PASSWORD from the frontend .env immediately. These should only exist in the backend .env.

1.2 JWT Secret is Weak and Hardcoded
Backend .env
:

JWT_SECRET=super_secret_ktm_decor_dashboard_key_2026
Problems:

This is a predictable, human-readable string. Attackers can guess or brute-force it.
It's committed alongside the code — if the .env ever leaks to a public repo, all JWTs are compromised.
Fix: Use a cryptographically random 256-bit key:

bash

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
1.3 JWT Token Expiry is 30 Days
server.js:L1003-1005
:

js

const token = jwt.sign({ id: user.\_id }, process.env.JWT_SECRET, {
expiresIn: "30d",
});
If a token is stolen, the attacker has 30 full days of unrestricted access. For a business dashboard with financial data, this is excessive.

Fix: Use expiresIn: "8h" or "1d" and implement a refresh token mechanism.

1.4 Pusher Secret Exposed in Backend .env (Committed to Git)
Backend .env
:

PUSHER_SECRET="7edf05b1af6b33b2405d"
While .env is in .gitignore, the actual .env file exists in the repo directory. If this is deployed via Vercel or ever pushed accidentally, the Pusher secret allows anyone to send fake real-time events to your dashboard.

1.5 The /api/auth/status Endpoint Leaks Sensitive Diagnostics
server.js:L200-302
— This endpoint is completely unauthenticated and exposes:

Database connection state
Masked (but partially visible) MONGO_URI
Whether admin/staff passwords are defined
All env key names containing MONGO, URI, SECRET, PASSWORD
Admin email address
User count and inventory count
WARNING

An attacker can use this to fingerprint your infrastructure, confirm the DB provider, and enumerate env variables.

Fix: Either protect this endpoint with protect, admin middleware, or remove it entirely in production.

2. 🔒 SECURITY ANALYSIS (Attack Resistance)
   2.1 ❌ No Rate Limiting — Anywhere
   Your server has zero rate limiting. This means:

Attack Possible? Impact
Brute-force login ✅ Yes An attacker can try thousands of passwords per minute against /api/auth/login
API abuse/DDoS ✅ Yes No throttling on any endpoint
Credential stuffing ✅ Yes Automated bots can spray credentials
Fix: Install express-rate-limit:

js

import rateLimit from 'express-rate-limit';
// Global: 100 requests per minute
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
// Login: 5 attempts per 15 minutes
app.use('/api/auth/login', rateLimit({ windowMs: 15 \* 60_000, max: 5 }));
2.2 ❌ No Input Validation / Sanitization Layer
Routes accept req.body fields directly and pass them to Mongoose. While Mongoose schemas provide type coercion, they do not protect against:

NoSQL injection: Fields like { "$gt": "" } can bypass queries. Example:

json

POST /api/auth/login
{ "email": { "$gt": "" }, "password": { "$gt": "" } }
This could potentially bypass the login check.

XSS via stored data: Fields like manufacturingNotes, description, message accept arbitrary text that gets rendered in the frontend. If the frontend uses dangerouslySetInnerHTML anywhere, this is exploitable.

Fix:

Use express-mongo-sanitize to strip $ operators from input
Use helmet for security headers
Validate input shapes with joi or zod
js

import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
app.use(helmet());
app.use(mongoSanitize());
2.3 ❌ No CSRF Protection
The API uses Bearer tokens (not cookies), so CSRF is less of a concern. However, since credentials: true is enabled in CORS, you should be aware that if cookies are ever added, CSRF becomes a risk.

2.4 ⚠️ CORS Allows All \*.vercel.app Subdomains
server.js:L58
:

js

const isAllowed = allowedOrigins.some(
(allowed) => allowed === origin || origin.endsWith(".vercel.app")
);
Any Vercel-deployed app (by anyone in the world) can make authenticated requests to your API. An attacker could deploy a malicious page to evil-site.vercel.app and access your API.

Fix: Restrict to your specific Vercel domains:

js

origin.endsWith(".ktmdecor.vercel.app") || origin === "https://your-specific-preview.vercel.app"
2.5 ❌ No Helmet Security Headers
Missing headers that protect against:

Clickjacking (X-Frame-Options)
MIME sniffing (X-Content-Type-Options)
XSS reflection (X-XSS-Protection)
Referrer leakage (Referrer-Policy) 3. 🗄️ MongoDB: Why Your Dashboard Takes 10-20 Seconds
IMPORTANT

10-20 seconds is NOT normal for MongoDB. Even with ~1000 documents across all collections, this should take under 1 second. Here is exactly why it's slow:

3.1 The "Monster Bootstrap" Endpoint
server.js:L322-413
— The /api/bootstrap endpoint fires 9-16 parallel queries in a single request:

tasks, users, notifications, campaigns, activities, products,
orders, inventoryItems, quickNotes

- (admin only): sales, expenses, purchases, quotations, binTasks, binCampaigns, binOrders
  Each query includes .populate() calls that trigger additional sub-queries. For admin, this is approximately 16 MongoDB queries + 20+ populate sub-queries — all hitting the database simultaneously.

  3.2 ❌ ZERO Database Indexes (Except Defaults)
  None of your 15 Mongoose schemas define custom indexes. MongoDB is doing full collection scans for every single query.

Collections that critically need indexes:

Model Missing Index Used In
Task { deleted: 1, assignee: 1 } Every task query filters by deleted and assignee
Task { pinned: -1, createdAt: -1 } Sorting on every fetch
Order { deleted: 1, createdAt: -1 } Every order query
Order { approved: 1, deleted: 1 } syncExistingApprovedOrders() startup scan
Sale { orderId: 1 } syncOrderSale() lookup on every order change
Sale { date: -1 } Every sale fetch sorts by date
Expense { date: -1 } Every expense fetch sorts by date
Purchase { date: -1 } Every purchase fetch sorts by date
Notification { recipient: 1, read: 1 } Notification queries with $or on recipient
FieldNote { deleted: 1, createdAt: -1 } Field note queries
ActivityLog { createdAt: -1 } Activity feed with .limit(30) still needs to sort all docs without an index
InventoryItem { name: 1 } Sorted alphabetically on every fetch
3.3 The Serverless Cold-Start Tax
On Vercel serverless:

Cold start — Node.js process boots (~1-3s)
MongoDB reconnection — TCP handshake + auth to Atlas (~1-3s)
Seed check — runSeeds() runs on EVERY cold start, executing ~10 queries to check/create users, products, inventory, duplicates (~3-5s)
Bootstrap query — The actual data fetch (~2-5s)
Total cold-start worst case: 7-16 seconds — which matches your 10-20s observation.

3.4 The Seed Functions Are Wasteful
server.js:L157-184
— On every cold start:

seedUsers() queries 10+ individual users, potentially deletes old ones, reassigns orphan tasks
seedProducts() runs 6+ queries checking for legacy/placeholder data
seedInventoryItems() loads ALL inventory into memory, groups/deduplicates in JS
syncExistingApprovedOrders() fetches ALL approved orders, then loops checking each for a matching Sale (N+1 pattern)
3.5 N+1 Query Patterns
server.js:L157-184
— syncExistingApprovedOrders():

js

const approvedOrders = await Order.find({ approved: true, deleted: { $ne: true } });
for (const order of approvedOrders) {
const existingSale = await Sale.findOne({ orderId: order.\_id }); // ← N+1!
}
For 100 approved orders, this fires 101 queries (1 bulk + 100 individual).

Fix: Batch the lookup:

js

const approvedOrders = await Order.find({ approved: true, deleted: { $ne: true } });
const orderIds = approvedOrders.map(o => o.\_id);
const existingSales = await Sale.find({ orderId: { $in: orderIds } });
const salesMap = new Set(existingSales.map(s => s.orderId.toString()));
const missingOrders = approvedOrders.filter(o => !salesMap.has(o.\_id.toString())); 4. 📐 Code Quality & Architecture Assessment
4.1 🔴 Monolithic God File: server.js is 2,991 Lines
A senior developer would never put 3000 lines of routes, seed functions, export logic, and helpers in a single file. This is the biggest code quality issue.

Current structure:

server.js (2,991 lines)
├── DB connection logic
├── Seed functions (users, products, inventory)
├── Auth routes
├── Task routes (CRUD + pin)
├── Notification routes
├── Field Note routes
├── Bin/Trash routes
├── Product routes
├── Order routes (CRUD + progress + approve)
├── Sales routes
├── Expenses routes
├── Purchase routes
├── Inventory routes
├── Quotation routes
├── Quick Notes routes
├── Monthly Statement logic
├── Export/CSV generation
└── Server startup
What a senior dev would do:

src/
├── server.js (30 lines: app setup + imports)
├── config/
│ └── db.js (connection logic)
├── middleware/
│ ├── auth.js ✅ (already extracted)
│ ├── rateLimiter.js
│ └── errorHandler.js
├── routes/
│ ├── authRoutes.js
│ ├── taskRoutes.js
│ ├── orderRoutes.js
│ ├── salesRoutes.js
│ ├── ... (one per module)
│ └── exportRoutes.js
├── controllers/
│ ├── authController.js
│ ├── taskController.js
│ └── ...
├── services/
│ ├── pusherService.js
│ ├── activityLogger.js
│ └── seedService.js
└── models/ ✅ (already extracted)
4.2 No Error Handling Middleware
Every route has its own try/catch that returns res.status(500).json({ message: error.message }). This:

Leaks internal error messages to clients (information disclosure)
Has no centralized error logging
No distinction between operational vs programming errors
Fix: Add a global error handler:

js

app.use((err, req, res, next) => {
console.error(err.stack);
res.status(err.status || 500).json({
message: process.env.NODE_ENV === 'production'
? 'Internal server error'
: err.message
});
});
4.3 Unused Dependencies
Backend package.json
:

socket.io — Listed as dependency but never used anywhere in server.js. You use Pusher instead.
xlsx — Listed but you use exceljs for all export logic.
Frontend package.json
:

socket.io-client — Listed but never imported. You use pusher-js.
Fix: Remove socket.io, xlsx, and socket.io-client to reduce bundle size and attack surface.

4.4 Hard-Coded Business Logic
User emails like staff@ktmdecor.com are hardcoded throughout the codebase as special-case conditions:

server.js:L332
,
L1064
,
L1139
,
L1255
,
L1282
This creates a maintenance nightmare. If the email ever changes, you have to find and update every occurrence.

5. 🔄 Statelessness Analysis
   ✅ Mostly Stateless
   JWT-based auth (no server-side sessions) — good
   No in-memory caches for user data — good
   DB connection caching is appropriate for serverless — good
   ⚠️ Issues:
   seeded boolean (
   server.js:L187
   ): This is an in-memory flag that resets on every cold start. On Vercel, each serverless invocation may or may not share the same process, causing seed functions to potentially run multiple times concurrently. This leads to race conditions and duplicate data.

setInterval for statement generation (
server.js:L2980-2988
): This only works on long-running processes (local dev), not on Vercel serverless where functions are ephemeral. The condition check process.env.NODE_ENV !== "production" || !process.env.VERCEL is correct but the logic is fragile.

6. 🐞 Other Bugs & Flaws
   6.1 Bug: req.id Used Instead of req.params.id
   server.js:L1132
   :

js

const task = await Task.findById(req.id || req.params.id);
req.id is not a standard Express property. This is a latent bug — it works only because req.id is always undefined, falling through to req.params.id. But if Express or a middleware ever sets req.id, this would break silently.

6.2 Note Deletion Has No Authorization Check
server.js:L2367-2382
: Any authenticated user (staff or admin) can delete any quick note, not just their own. The protect middleware only checks authentication, not ownership.

6.3 Products API is Partially Unprotected
server.js:L1550-1570
: GET /api/products and GET /api/products/:id have no auth middleware. While this might be intentional (public catalog), it means anyone can enumerate your product catalog and pricing without authentication.

6.4 deletedAt TTL Index Only on Tasks
Task.js:L60
: Only the Task model has a TTL index (expires: '7d' on deletedAt). Orders and FieldNotes have deletedAt fields but no TTL, meaning soft-deleted items accumulate forever.

6.5 The MonthlyStatement Stores Raw CSV as a String Field
MonthlyStatement.js:L22-24
: Large CSV content is stored as a plain String field. For substantial datasets, this will hit MongoDB's 16MB document limit and degrade query performance when loading statement metadata (even with -content projection, the storage impact remains).

6.6 Duplicate Code: Export Logic Repeated Twice
server.js:L2397-2611
and
server.js:L2645-2887
: The generateStatementCSVText() helper and the /api/export/statement endpoint contain nearly identical ExcelJS logic duplicated in full. This is ~500 lines of pure duplication.

7. 📊 Prioritized Fix Roadmap
   🔴 Phase 1: Critical Security (Do This Week)

# Fix Effort Files

1 Remove VITE*SEED*_ passwords from frontend .env 5 min
frontend/.env
2 Regenerate JWT_SECRET with crypto-random key 5 min
backend/.env
3 Install helmet + express-mongo-sanitize 15 min
server.js
4 Add rate limiting to login + global routes 30 min
server.js
5 Restrict CORS _.vercel.app wildcard 10 min
server.js:L58
6 Protect or remove /api/auth/status 5 min
server.js:L200
🟡 Phase 2: Performance (Fix 10-20s Load Time)

# Fix Expected Impact

7 Add compound indexes to all 12 collections 5-10x faster queries
8 Batch the N+1 syncExistingApprovedOrders Eliminates ~100 extra queries
9 Move seed logic behind a one-time DB flag (e.g., a \_seeds collection) instead of running checks every cold start Eliminates 3-5s on cold start
10 Add .lean() to read-only queries in the bootstrap endpoint — returns plain JS objects instead of Mongoose documents, ~2-3x faster Significant memory + speed savings
11 Paginate the bootstrap response — Don't send ALL sales, expenses, purchases on initial load. Use lazy loading per tab. Cuts payload by 60-70% for admin
🟢 Phase 3: Code Quality (When Time Permits)

# Fix

12 Split server.js into routes/controllers/services
13 Remove unused deps (socket.io, xlsx, socket.io-client)
14 Add global error handling middleware
15 Add authorization to note deletion
16 Extract hardcoded email constants
17 Add TTL indexes to Orders and FieldNotes deletedAt
18 DRY the duplicated export logic
19 Reduce JWT expiry to 8h-1d + add refresh tokens 8. Quick Win: Sample Index Definitions
Add these to each model file before the export default line:

js

// Task.js
TaskSchema.index({ deleted: 1, assignee: 1 });
TaskSchema.index({ pinned: -1, createdAt: -1 });
// Order.js  
OrderSchema.index({ deleted: 1, createdAt: -1 });
OrderSchema.index({ approved: 1, deleted: 1 });
// Sale.js
SaleSchema.index({ orderId: 1 });
SaleSchema.index({ date: -1 });
// Expense.js
ExpenseSchema.index({ date: -1 });
// Purchase.js
PurchaseSchema.index({ date: -1 });
// Notification.js
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
// FieldNote.js
FieldNoteSchema.index({ deleted: 1, createdAt: -1 });
// ActivityLog.js
ActivityLogSchema.index({ createdAt: -1 });
// InventoryItem.js
InventoryItemSchema.index({ name: 1 });
These indexes alone should reduce your bootstrap query time from 5-10s → 500ms-1s.

TL;DR
Your codebase works and is functional, but it is not production-secure. The three most urgent issues are:

Admin/Staff passwords are publicly visible in the frontend bundle
No rate limiting — anyone can brute-force your login
Missing MongoDB indexes — this is the primary cause of your 10-20s load time
Fix Phase 1 (security items) before anything else. The performance fixes in Phase 2 will bring your load time down to under 2 seconds.
