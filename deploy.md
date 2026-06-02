# Production Deployment Guide: Subdomain Routing (Option A)

This guide walks you through deploying the **KTM DECOR** stack (User Site, Admin/Staff Dashboard, and Node.js/Express API + WebSockets backend) on a custom domain (e.g., `ktmdecor.com`) using subdomains.

---

## Architecture Overview
In this setup, each service runs on its own isolated subdomain:
* **User Website:** `https://ktmdecor.com` (and `https://www.ktmdecor.com`)
* **Admin Dashboard:** `https://admin.ktmdecor.com`
* **Backend API & WebSockets:** `https://api.ktmdecor.com`

---

## Step 1: Deploy the Backend API (`api.ktmdecor.com`)
You need a hosting provider that supports persistent running processes (VPS or PaaS) because the backend uses WebSockets (Socket.io).

### Recommended Hosts:
* **Render** (Web Service), **Railway**, **Fly.io**, **Heroku**, or a **VPS** (DigitalOcean / AWS EC2).
* *Note:* Avoid serverless platforms like Vercel/Netlify for the backend, as they do not support persistent Socket.io connections out of the box.

### Step-by-Step Backend Deploy:
1. Set up a production database cluster on **MongoDB Atlas**.
2. Push your `dashboard/backend` folder to a GitHub repository.
3. Connect your repository to your chosen hosting provider (e.g., Render Web Service).
4. Configure your **Environment Variables** in the provider's dashboard:
   ```env
   NODE_ENV=production
   PORT=5001
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ktm_decor_prod
   JWT_SECRET=your_super_secret_production_key
   ```
5. Map your custom subdomain `api.ktmdecor.com` inside your hosting provider settings. (They will provide a DNS target URL, e.g., `ktm-decor-api.onrender.com`).

---

## Step 2: Configure CORS and WebSockets on the Backend
Before deploying, make sure the backend allows incoming connections from your subdomains.

### Update `dashboard/backend/src/server.js`:
Verify the `allowedOrigins` list includes your production URLs:
```javascript
const allowedOrigins = [
  "http://localhost:5173", // Keep for local development
  "http://localhost:3000", 
  "https://ktmdecor.com",
  "https://www.ktmdecor.com",
  "https://admin.ktmdecor.com"
];
```

---

## Step 3: Deploy the Admin Dashboard (`admin.ktmdecor.com`)
The frontend is a static React application built with Vite. It compiles down to static HTML, CSS, and JS files.

### Recommended Hosts:
* **Vercel**, **Netlify**, **Render** (Static Site), or **GitHub Pages**.

### Step-by-Step Dashboard Deploy:
1. In the frontend root `dashboard/frontend/src/store/useStore.ts`, ensure the API base URL handles production dynamically.
   
   **Pro Tip:** Instead of hardcoding `http://localhost:5001`, use an environment variable:
   ```typescript
   const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
   ```
2. Build the project locally to verify compilation:
   ```bash
   npm run build
   ```
3. Set the environment variable `VITE_API_URL=https://api.ktmdecor.com` in your frontend hosting dashboard.
4. Deploy the `dashboard/frontend` directory.
5. Map the subdomain `admin.ktmdecor.com` in your host's dashboard.

---

## Step 4: Configure DNS Records (Custom Domain Registrar)
Go to your DNS manager (Cloudflare, Namecheap, GoDaddy, etc.) and add the following records:

| Type | Name | Content/Target | Purpose |
| :--- | :--- | :--- | :--- |
| **CNAME** | `@` (or Root) | `your-user-site.vercel.app` | Point root domain to User Site |
| **CNAME** | `www` | `your-user-site.vercel.app` | Point www subdomain to User Site |
| **CNAME** | `admin` | `your-admin-dashboard.vercel.app` | Point admin subdomain to Admin Dashboard |
| **CNAME** / **A** | `api` | `ktm-decor-api.onrender.com` (or server IP) | Point api subdomain to Backend Server |

*Note: DNS changes can take anywhere from 5 minutes to 24 hours to propagate globally.*

---

## Common Mistakes & How to Overcome Them

### 1. Mixed Content Blocker (HTTP vs. HTTPS)
* **Problem:** You deploy the frontend to HTTPS (e.g. `https://admin.ktmdecor.com`) but your API url is configured as HTTP (e.g. `http://api.ktmdecor.com`). The browser will block all requests.
* **Solution:** Ensure all URLs explicitly use **`https://`** in production. Most modern hosts provide SSL/TLS (HTTPS) certificates automatically.

### 2. WebSocket Connection Failure (Proxy Buffering)
* **Problem:** Socket.io connections are failing or fallback to long-polling instead of direct Websockets.
* **Solution:** 
  * If using Cloudflare, turn **Websockets ON** in the Cloudflare Dashboard under *Network -> WebSockets*.
  * If using Nginx on a VPS, ensure you configure the proxy headers to support headers upgrading:
    ```nginx
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    ```

### 3. Missing Frontend Environment Variables
* **Problem:** The built static files are still sending requests to `http://localhost:5001` in production.
* **Solution:** Vite embeds environment variables *during the build process*. You must define `VITE_API_URL=https://api.ktmdecor.com` **before** running the build command in your CI/CD provider.

### 4. CORS Errors on WebSockets Handshake
* **Problem:** Dashboard loads but you get CORS warnings in console referencing Socket.io `/socket.io/?EIO=4&transport=websocket`.
* **Solution:** Verify that backend Socket.io is initialized using the `allowedOrigins` array:
  ```javascript
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });
  ```

### 5. ERR_TOO_MANY_REDIRECTS on `/admin`
* **Problem:** Accessing `https://ktmdecor.com/admin` redirects too many times.
* **Solution:**
  1. Ensure that the `DASHBOARD_URL` environment variable is defined on the Vercel project of the main Next.js site (e.g. `DASHBOARD_URL=https://admin.ktmdecor.com` or the Vercel deployment of the dashboard `https://ktm-decor-admin.vercel.app`).
  2. If this is not set, Next.js defaults to proxying to local Vite (`http://127.0.0.1:5173`), which is unreachable in production. This causes a proxy failure and fallback to Next.js's internal routing, resulting in infinite redirect loops.
