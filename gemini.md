You are a Principal Software Engineer and UI/ visual "Pinned/High Priority" section at the very top of the dashboard for urgent announcements or critical tasks. 
> *   **Delegation:** Admins can createUX Architect. Your task is to design and generate the codebase for a highly responsive, real-time Admin and Staff Dashboard for an existing business website. 

 a task, attach a deadline, and assign it to a specific staff member. Staff can only change the status of their assigned tasks.
> 
> **C. MarketingThe system must be built using the MERN stack (MongoDB, Express, React, Node.js), utilizing Socket.io for real-time synchronization, Tailwind & Campaign Hub**
> *   A shared calendar view displaying upcoming social media posts, ad campaigns, and promotions.
> *   Features to upload assets (images/ CSS for responsive styling, and Zustand/Redux for state management. The UI should feature smooth, high-end micro-interactions (using GSAP or Framer Motioncopy) so staff can download them for posting.
> *   Status trackers for campaigns (e.g., `Draft`, `Scheduled`, `Active`).
> 
>).

Before writing any code, acknowledge these requirements and output a structured plan, followed by the complete, production-ready code for the requested modules.

# 1 **D. The Dashboard (Overview)**
> *   **Admin View:** High-level metrics (total sales, active campaigns, staff performance, pending tasks).
> *. Tech Stack & Styling Requirements
*   **Frontend:** React (Vite), Tailwind CSS, Lucide React (icons), Zustand (state).
*   **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io.
*   **Theming:** The dashboard MUST inherit the exact brand colors from   **Staff View:** Personalized greeting, their specific pending tasks for the day, and pinned global announcements.
> 
> **E. "Awesome" Value-Add Features the main website. Expose a `theme.css` file using CSS variables (e.g., `--primary`, `--secondary`, `--accent`) so Tailwind (Include these)**
> *   **Activity Audit Log:** A chronological feed visible to Admins showing who did what and when (e.g., "Staff A completed can seamlessly apply the business's existing color palette. 
*   **Responsiveness:** The layout must be perfectly responsive. Use a collapsible sidebar for desktop that Task B at 2:00 PM").
> *   **Quick-Notes:** A sticky-note style widget on the dashboard for personal, non converts into a bottom navigation bar or hamburger menu for mobile devices.

# 2. Role-Based Access Control (RBAC) Architecture
Implement strict RB-shared reminders.
> *   **Dark/Light Mode Toggle:** Seamlessly integrated with the brand's color palette.
> 
> **ExecutionAC using JWT middleware.
*   **Admin Role (Superuser):** Has full CRUD access to all modules, system settings, user management, and global marketing analytics. Can assign tasks, promote staff, and override pinned items.
*   **Staff Role:** Restricted access. Can view assigned tasks, update task statuses (To Instructions for the AI**
> 1. Start by providing the database schema/models (Mongoose) for User, Task, Notification, and MarketingCampaign Do, In Progress, Done), manage specific marketing deliverables, and view relevant notifications. Cannot access global settings or manage other users.

# 3. Core Modules (.
> 2. Provide the frontend layout shell (Sidebar, Header, Main Content Area) using Tailwind CSS and responsive breakpoints.
> 3.Real-Time Synchronized)
All modules below must utilize Socket.io to ensure that if an Admin pins a task or updates a marketing campaign, all connected Provide the RBAC logic/higher-order components for protecting routes.
> 4. Build out the Task Management and Real-time Notification components step- Staff dashboards update instantly without a page refresh.

*   **A. Global Notification Center:**
    *   A bell icon in the header with an unread badge.by-step. 
> 
> Please write clean, modular, and heavily commented code. Prioritize component reusability and separation of concerns.
    *   Real-time alerts for: New assigned tasks, marketing deadlines, and system announcements.
    *   Socket Event: `emit('new_notification')` -> `on('receive_notification')`.

*   **B. Advanced Task Management ("Works to Do"):**
    *   A Kanban-style board and a List-view toggle for tasks.
    *   Fields: Title, Description, Assignee, Due Date, Priority (Low, Medium, High).
    *   **Pinning System:** A feature to "Pin" critical tasks. Pinned tasks bypass standard sorting and lock to the top of the dashboard for all relevant users.
    *   Socket Events: `task_created`, `task_updated`, `task_pinned`.

*   **C. Marketing & Campaign Hub:**
    *   A dedicated module to track social media marketing (e.g., TikTok, Instagram, Facebook campaigns).
    *   Features: Content calendar, asset links, and status tracking (Draft, Scheduled, Published).
    *   Real-time sync ensures the whole team knows which marketing assets are currently live.

*   **D. "Awesome" Quality-of-Life Features (Dashboard Home):**
    *   **Quick Actions:** Floating Action Button (FAB) on mobile, or a top-bar "Quick Create" menu on desktop to instantly create a task, notification, or note.
    *   **Activity Activity Log:** A live ticker on the dashboard showing recent actions (e.g., "Sagar updated the Spring Marketing Campaign 2 mins ago").
    *   **Focus Mode:** A toggle that hides all non-pinned tasks so staff can concentrate on critical daily deliverables.

# 4. Deliverables Required from You:
1.  **Database Models:** Provide the Mongoose schemas for `User`, `Task`, `Notification`, and `MarketingCampaign`.
2.  **WebSocket Setup:** Provide the basic Express/Socket.io server initialization showing how the real-time sync handles the `task_pinned` event.
3.  **Frontend Layout:** The React code for the responsive shell (Sidebar, Header, Main Content Area) utilizing Tailwind CSS variables.
4.  **The Task Component:** The React component for the "Works to Do" list, featuring the pinning mechanic and real-time state updates via Socket.io.

Write clean, modular, and extensively commented code. Assume this is going directly into a production environment.