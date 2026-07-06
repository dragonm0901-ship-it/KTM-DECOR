# KTM DECOR - Full Stack Developer Onboarding & Getting Started Guide

Welcome to the **KTM DECOR** project! This guide is designed to help new developers understand the project architecture, set up their local development environment, seed the database, and start building.

---

## 1. Project Architecture Overview

The codebase is organized as a monorepo-style structure featuring three main components:

```
ktm-decor-workspace/
├── dashboard/
│   ├── backend/       # Express.js API & Pusher Real-Time WebSocket Server
│   └── frontend/      # Vite + React Admin/Staff Dashboard
├── public/            # Static assets & Next.js public directory
│   └── admin/         # Production-built admin assets (copied during build)
├── src/               # Main User-Facing E-commerce Website (Next.js)
```

### Component Details
*   **User-Facing Website (Root Directory):**
    *   **Framework:** Next.js (React 19 + TypeScript + Tailwind CSS)
    *   **Libraries:** GSAP (Animations), Lenis (Smooth Scroll), Framer Motion, `@solar-icons/react`
    *   **AI Integration:** Google Gemini Flash API for smart widgets (e.g., chatbot)
    *   **Dev Server Port:** `http://localhost:3000`
*   **Dashboard Frontend (`/dashboard/frontend`):**
    *   **Framework:** Vite + React 18 + TypeScript + Tailwind CSS
    *   **State Management:** Zustand (defined in `store/useStore.ts`)
    *   **Real-Time Sync:** Pusher-js (updates dashboard lists/charts dynamically)
    *   **Dev Server Port:** `http://127.0.0.1:5173` (Next.js rewrites `/admin` requests to this port)
*   **Dashboard Backend (`/dashboard/backend`):**
    *   **Framework:** Node.js + Express (ES Modules)
    *   **Database:** MongoDB via Mongoose ORM
    *   **Real-Time Gateway:** Pusher (broadcasts events for sales, tasks, notifications)
    *   **Authentication:** JSON Web Tokens (JWT) + bcryptjs passwords
    *   **Dev Server Port:** `http://localhost:5001`

---

## 2. Environment Variables Configuration

Each component requires its own environment configuration. Create the following files in their respective folders:

### A. Root Directory (`/.env` and `/.env.local`)
Create a `.env` file in the project root:
```env
# Gemini Flash API Key for AI Chatbot and widgets
GEMINI_API_KEY=your_gemini_api_key_here
```

### B. Dashboard Backend (`/dashboard/backend/.env`)
Create a `.env` file in `dashboard/backend`:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/ktm_decor_dashboard
JWT_SECRET=generate_a_secure_random_key_here
NODE_ENV=development

# Pusher Credentials for Real-Time Syncing
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster

# Default passwords for seeded database users
SEED_ADMIN_PASSWORD=adminpassword
SEED_STAFF_PASSWORD=staffpassword
```

### C. Dashboard Frontend (`/dashboard/frontend/.env`)
Create a `.env` file in `dashboard/frontend`:
```env
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=your_pusher_cluster
VITE_API_URL=http://localhost:5001
```

---

## 3. Local Installation & Setup

Follow these steps to configure and boot all parts of the application locally:

### Step 1: Clone the Repository & Install Dependencies
You need to install dependencies in three locations. Open your terminal and run:

```bash
# 1. Install dependencies for the Main Next.js Website
npm install

# 2. Install dependencies for the Dashboard Backend
cd dashboard/backend
npm install

# 3. Install dependencies for the Dashboard Frontend
cd ../frontend
npm install
```

### Step 2: Ensure MongoDB is Running
Make sure you have a local MongoDB instance running on your machine, or swap the `MONGO_URI` in the backend `.env` file with a cloud-hosted **MongoDB Atlas** connection string.

For local MongoDB:
*   **macOS (Homebrew):** `brew services start mongodb-community`
*   **Windows / Linux:** Ensure the `mongod` service is active.

### Step 3: Run the Services
To develop locally, you must spin up three development servers concurrently:

1.  **Terminal 1 (Root Folder) - Start User Website:**
    ```bash
    npm run dev
    # Runs on http://localhost:3000
    ```
2.  **Terminal 2 (`dashboard/backend`) - Start API & WebSocket Server:**
    ```bash
    npm run dev
    # Runs on http://localhost:5001 via nodemon
    ```
3.  **Terminal 3 (`dashboard/frontend`) - Start Dashboard UI:**
    ```bash
    npm run dev
    # Runs on http://127.0.0.1:5173 via Vite
    ```

---

## 4. Development Routing & Admin Portal

*   In **development**, the main user site runs on `localhost:3000` and the dashboard Vite server runs on `localhost:5173`.
*   We use Next.js redirects/rewrites inside `next.config.js` to proxy requests starting with `/admin` directly to the Vite frontend server:
    ```javascript
    // next.config.js
    {
      source: "/admin/:path*",
      destination: "http://127.0.0.1:5173/admin/:path*",
    }
    ```
*   **Access Point:** Open your browser and go to **`http://localhost:3000/admin`** to log in to the Dashboard.

---

## 5. Database Seeding & User Roles

When the backend API starts up, it automatically initializes and runs a seeding service (`seedService.js`) to populate the database with default categories, 12 premium products, inventory, and users.

### Default Seeded Accounts:

| Role | Email | Default Password | Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ktmdecor.com` | `adminpassword` *(or SEED_ADMIN_PASSWORD)* | Full privileges: CRUD products, staff, financials, settings. |
| **Shared Staff** | `staff@ktmdecor.com` | `staffpassword` *(or SEED_STAFF_PASSWORD)* | Staff view: Assigned tasks, campaigns, updates. |
| **Staff Member** | `ramesh@ktmdecor.com` | `staffpassword` *(or SEED_STAFF_PASSWORD)* | Ramesh Thapa |
| **Staff Member** | `sita@ktmdecor.com` | `staffpassword` *(or SEED_STAFF_PASSWORD)* | Sita Sharma |
| **Staff Member** | `gopal@ktmdecor.com` | `staffpassword` *(or SEED_STAFF_PASSWORD)* | Gopal BK |
| **Staff Member** | `gita@ktmdecor.com` | `staffpassword` *(or SEED_STAFF_PASSWORD)* | Gita Adhikari |
| **Staff Member** | `hari@ktmdecor.com` | `staffpassword` *(or SEED_STAFF_PASSWORD)* | Hari Karki |
| **Staff Member** | `maya@ktmdecor.com` | `staffpassword` *(or SEED_STAFF_PASSWORD)* | Maya Tamang |
| **Staff Member** | `sunil@ktmdecor.com` | `staffpassword` *(or SEED_STAFF_PASSWORD)* | Sunil Shrestha |
| **Staff Member** | `pooja@ktmdecor.com` | `staffpassword` *(or SEED_STAFF_PASSWORD)* | Pooja Chaudhary |
| **Staff Member** | `anil@ktmdecor.com` | `staffpassword` *(or SEED_STAFF_PASSWORD)* | Anil Gurung |

*Note: Passwords are automatically hashed via bcrypt. In production, change default credentials immediately in your database.*

---

## 6. Real-Time State Syncing with Pusher

The dashboard uses **Pusher** instead of basic HTTP polling to keep all staff and admin clients synchronized instantly.

*   **Backend Events Trigger:** In `dashboard/backend/src/server.js`, whenever tasks are added, updated, or pinned, the server fires `triggerPusher(eventName, payload)`.
*   **Frontend Subscription:** In `dashboard/frontend/src/store/useStore.ts`, the frontend subscribes to the channel `ktm-decor-dashboard` and listens to events like:
    *   `task_created` / `task_updated` / `task_pinned` / `task_deleted`
    *   `receive_notification` (Global and user-specific alerts)
    *   `sale_created` / `sale_deleted`
    *   `order_created` / `order_updated` / `order_deleted`
*   Once received, the state stores inside Zustand updates instantly, causing React to re-render without manual page refreshes.

---

## 7. Production Builds & Deployment

Refer to the following guides in the root workspace for step-by-step production setup:
*   [deploy.md](file:///Users/lui/Desktop/Projects/KTM%20DECOR%20F/deploy.md): Subdomain routing overview.
*   [deploy2.md](file:///Users/lui/Desktop/Projects/KTM%20DECOR%20F/deploy2.md): Comprehensive step-by-step beginners production guide for GitHub, MongoDB Atlas, Render/Railway, and Vercel.

### Production Build Command
To verify compilation and prepare static assets, run in the project root:
```bash
npm run build
```
This script will build the dashboard frontend, copy the compiled dist assets into `public/admin/`, and then run `next build` on the Next.js website.
