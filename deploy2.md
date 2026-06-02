# Complete Beginner's Production Deployment Guide: KTM DECOR Stack

This guide is designed for complete beginners. It will walk you through deploying the **KTM DECOR User Website** (Next.js), the **Admin & Staff Dashboard** (Vite/React), and the **Backend API & WebSockets Server** (Express/Socket.io) to production.

By the end of this guide, your application will run on your custom domain with the following subdomains:

- **User Website:** `https://ktmdecor.com`
- **Admin Dashboard:** `https://admin.ktmdecor.com`
- **Backend API & WebSockets:** `https://api.ktmdecor.com`

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Push Your Code to GitHub](#phase-1-push-your-code-to-github)
3. [Phase 2: Prepare Frontend Code for Production](#phase-2-prepare-frontend-code-for-production)
4. [Phase 3: Set Up a Production MongoDB Database (MongoDB Atlas)](#phase-3-set-up-a-production-mongodb-database-mongodb-atlas)
5. [Phase 4: Deploy the Backend WebSockets API (on Render or Railway)](#phase-4-deploy-the-backend-websockets-api-on-render-or-railway)
6. [Phase 5: Deploy the User Website (Next.js) on Vercel](#phase-5-deploy-the-user-website-nextjs-on-vercel)
7. [Phase 6: Deploy the Admin Dashboard (Vite) on Vercel](#phase-6-deploy-the-admin-dashboard-vite-on-vercel)
8. [Phase 7: Connect Your Custom Domains (DNS Settings)](#phase-7-connect-your-custom-domains-dns-settings)

---

## Prerequisites

Before starting, sign up for free accounts on:

- **GitHub** ([github.com](https://github.com))
- **MongoDB Atlas** ([mongodb.com/atlas](https://www.mongodb.com/cloud/atlas))
- **Vercel** ([vercel.com](https://vercel.com))
- **Render** ([render.com](https://render.com)) _OR_ **Railway** ([railway.app](https://railway.app))

---

## Phase 1: Push Your Code to GitHub

Your cloud hosting services need to pull your code from a repository to build it.

1. Open your terminal at the root of the project `/Users/lui/Desktop/Projects/KTM DECOR F`.
2. Check if a local Git repository exists:
   ```bash
   git status
   ```
3. If it is not initialized, run:
   ```bash
   git init
   git add .
   git commit -m "feat: setup full stack code for deployment"
   ```
4. Open [github.com](https://github.com), sign in, and click **New Repository** (green button at top left).
5. Fill in the details:
   - **Repository name:** `ktm-decor`
   - **Public/Private:** Select **Private** (recommended to protect files).
   - _Leave all other boxes unchecked (no README, no .gitignore)._
   - Click **Create repository**.
6. Copy the commands under the heading **"…or push an existing repository from the command line"**. They will look like this:
   ```bash
   git remote add origin https://github.com/your-username/ktm-decor.git
   git branch -M main
   git push -u origin main
   ```
7. Run those commands in your project terminal. Your code is now live on GitHub!

---

## Phase 2: Prepare Frontend Code for Production

Currently, your frontend dashboard code is configured to send requests to `localhost:5001`. In production, it must communicate with your live server (e.g., `https://api.ktmdecor.com`).

### 1. Update the Store API base URL

Open the file [dashboard/frontend/src/store/useStore.ts](file:///Users/lui/Desktop/Projects/KTM%20DECOR%20F/dashboard/frontend/src/store/useStore.ts) and locate line 4:

```typescript
// BEFORE (Local only)
const API_URL = "http://localhost:5001";
```

Change it to dynamically check for an environment variable, fallback to localhost:

```typescript
// AFTER (Production Ready)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
```

### 2. Update Direct Fetch calls (if any)

Open [dashboard/frontend/src/components/TaskBoard.tsx](file:///Users/lui/Desktop/Projects/KTM%20DECOR%20F/dashboard/frontend/src/components/TaskBoard.tsx) and look at line 96:

```typescript
// BEFORE
fetch(`http://localhost:5001/api/tasks/${editingTask._id}`, {
```

Change it to dynamically use the `API_URL` variable already available:

```typescript
// AFTER
const currentApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
fetch(`${currentApiUrl}/api/tasks/${editingTask._id}`, {
```

### 3. Save, Commit, and Push changes to GitHub:

```bash
git add .
git commit -m "config: dynamically resolve API endpoint using env variables"
git push origin main
```

---

## Phase 3: Set Up a Production MongoDB Database (MongoDB Atlas)

You need a fully hosted cloud database. We will use MongoDB Atlas.

### 1. Create a Cluster

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Create** to deploy a new database.
3. Choose the **M0 Shared (Free)** tier.
4. Select your preferred Cloud Provider and Region (choose one geographically close to you or your host, e.g., AWS - N. Virginia `us-east-1` or Singapore `ap-southeast-1`).
5. Click **Create Deployment** (this may take 2-3 minutes).

### 2. Create Database User Credentials

1. Under **Security** in the left-hand sidebar, click **Database Access**.
2. Click the green **+ Add New Database User** button.
3. Select **Password** as the authentication method.
4. Enter a **Username** (e.g., `ktm_admin`) and a secure **Password**. _Save these details; you will need them shortly!_
5. Under **Database User Privileges**, select **Read and write to any database**.
6. Click **Add User**.

### 3. Set Up Network Access (IP Whitelist)

1. Under **Security** in the left-hand sidebar, click **Network Access**.
2. Click **+ Add IP Address**.
3. Choose **Allow Access From Anywhere** (this adds IP `0.0.0.0/0`).
   - _Why?_ Cloud platforms like Render or Railway rotate their servers' outbound IP addresses. Allowing access from anywhere is standard practice for server deployments. Your database is still secured by your username and password.
4. Click **Confirm** and wait for the status to change from "Pending" to "Active".

### 4. Copy Your Connection String

1. In the left-hand sidebar, click **Database** (or click **Deployment -> Databases**).
2. Click the **Connect** button next to your cluster.
3. Select **Drivers** (usually under "Connect to your application").
4. Copy the connection string displayed. It will look like this:
   ```text
   mongodb+srv://ktm_admin:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
5. Replace `<db_password>` with the password you created in Step 2.
6. Replace the `/?` section with the database name you want to create (e.g., `/ktm_decor_prod?`).
   - Your final connection string should look like:
     ```text
     mongodb+srv://ktm_admin:SuperSecurePassword123@cluster0.abcde.mongodb.net/ktm_decor_prod?retryWrites=true&w=majority&appName=Cluster0
     ```
7. Keep this connection string safe! Do not save it in files uploaded to Github.

---

## Phase 4: Deploy the Backend WebSockets API (on Render or Railway)

Since your backend uses **Socket.io** for real-time synchronization, you cannot deploy it on Vercel. Choose either Render or Railway.

### Option A: Deploying on Render (Free / Paid)

1. Go to [dashboard.render.com](https://dashboard.render.com) and log in.
2. Click **New +** (top right) and select **Web Service**.
3. Select **Build and deploy from a Git repository** and click **Next**.
4. Connect your GitHub account and select your `ktm-decor` repository.
5. In the settings form, configure:
   - **Name:** `ktm-decor-api`
   - **Region:** Choose the region closest to your MongoDB database region.
   - **Root Directory:** `dashboard/backend` _(Crucial: This tells Render to only run the backend directory)_
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js` (or `npm start` if defined in [dashboard/backend/package.json](file:///Users/lui/Desktop/Projects/KTM%20DECOR%20F/dashboard/backend/package.json))
6. Scroll down and click **Advanced** -> **Add Environment Variable**. Add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render's default port)
   - `MONGO_URI` = `mongodb+srv://ktm_admin:SuperSecurePassword123@cluster0.abcde.mongodb.net/ktm_decor_prod?retryWrites=true&w=majority` (your connection string from Phase 3)
   - `JWT_SECRET` = `a_long_random_secret_string_123!` (create a custom secret)
7. Click **Create Web Service**.
8. Once built, copy your live API URL (e.g., `https://ktm-decor-api.onrender.com`).

---

### Option B: Deploying on Railway (Paid, but very fast)

1. Log in to [railway.app](https://railway.app).
2. Click **+ New Project** -> **Deploy from GitHub repo**.
3. Select your `ktm-decor` repository.
4. Click **Configure** before deploying to set the subdirectory.
5. In your project canvas, select the service card and go to **Settings**:
   - **Root Directory:** Set to `dashboard/backend`.
6. Go to the **Variables** tab on the service card and add:
   - `NODE_ENV` = `production`
   - `PORT` = `5001`
   - `MONGO_URI` = _(your connection string from Phase 3)_
   - `JWT_SECRET` = _(your secret)_
7. Go to **Settings** -> **Public Networking** -> click **Generate Domain** (or set up `api.ktmdecor.com`).
8. Copy your live API URL (e.g., `https://ktm-decor-api.up.railway.app`).

---

## Phase 5: Deploy the User Website (Next.js) on Vercel

Vercel is the natural choice for Next.js applications. By default, Vercel will look at the root directory of your project where your Next.js configuration is located.

1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your `ktm-decor` repository.
4. On the configuration page:
   - **Project Name:** `ktm-decor-site`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Leave blank (which defaults to root `./`).
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY` = `AIzaSyD...` (Your Gemini Key from your local `.env.local` file)
   - `DASHBOARD_URL` = `https://ktm-decor-admin.vercel.app` (or your custom `https://admin.ktmdecor.com` once set up in Phase 6/7. This environment variable is critical so Next.js knows where to proxy `/admin` requests)
6. Click **Deploy**.
7. Vercel will build your main store pages. Once done, it will provide a link like `https://ktm-decor-site.vercel.app`.

---

## Phase 6: Deploy the Admin Dashboard (Vite) on Vercel

Since your admin dashboard is a standalone static site located in `dashboard/frontend`, we can deploy it as a separate project on Vercel.

1. Go back to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import the exact same `ktm-decor` repository.
4. On the configuration page:
   - **Project Name:** `ktm-decor-admin`
   - **Framework Preset:** `Vite` (Vercel will auto-detect Vite once you set the directory)
   - **Root Directory:** Click **Edit** and choose `dashboard/frontend`. Click **Save**.
5. Expand the **Environment Variables** section and add:
   - `VITE_API_URL` = `https://ktm-decor-api.onrender.com` (or your live backend URL from Phase 4)
   - _Note: Do not put a trailing slash `/` at the end of the URL._
6. Click **Deploy**.
7. Vercel will compile the Vite assets and host your admin panel. It will provide a link like `https://ktm-decor-admin.vercel.app`.

---

## Phase 7: Connect Your Custom Domains (DNS Settings)

Once all three environments are online, route them to your official domain registrar (Cloudflare, Namecheap, GoDaddy, Hostinger, etc.).

Log in to your domain registrar, navigate to **DNS Zone File / DNS Management**, and add the following records:

| Record Type | Host/Name            | Target/Value/Destination     | Notes                                            |
| :---------- | :------------------- | :--------------------------- | :----------------------------------------------- |
| **CNAME**   | `@` (or leave blank) | `cname.vercel-dns.com`       | Links root `ktmdecor.com` to Vercel (User Site)  |
| **CNAME**   | `www`                | `cname.vercel-dns.com`       | Links `www.ktmdecor.com` to Vercel (User Site)   |
| **CNAME**   | `admin`              | `cname.vercel-dns.com`       | Links `admin.ktmdecor.com` to Vercel (Dashboard) |
| **CNAME**   | `api`                | `ktm-decor-api.onrender.com` | Links `api.ktmdecor.com` to Render API Backend   |

### Linking the Subdomains inside Hosting Dashboards:

1. **On Vercel (User Site):** Go to `ktm-decor-site` -> **Settings** -> **Domains**. Add `ktmdecor.com` and `www.ktmdecor.com`.
2. **On Vercel (Admin Dashboard):** Go to `ktm-decor-admin` -> **Settings** -> **Domains**. Add `admin.ktmdecor.com`.
3. **On Render (Backend API):** Go to `ktm-decor-api` -> **Settings** -> **Custom Domains**. Add `api.ktmdecor.com`.

_Note: Allow up to 2-24 hours for global DNS records to propagate. Once completed, your full stack is fully synced, secure, and live in production!_
