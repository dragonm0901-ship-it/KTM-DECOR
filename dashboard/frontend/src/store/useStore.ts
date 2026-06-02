import { create } from "zustand";
import Pusher from "pusher-js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignee: User;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  pinned: boolean;
  createdBy: {
    _id: string;
    name: string;
    role: string;
  };
  totalCost?: number;
  prepaidCost?: number;
  remainingCost?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  _id: string;
  type: "task_assigned" | "marketing_deadline" | "system_announcement";
  message: string;
  recipient: string | null;
  read: boolean;
  readBy: string[];
  createdAt: string;
}

export interface MarketingCampaign {
  _id: string;
  title: string;
  category: string;
  platform?: string;
  status: "draft" | "discussion" | "active";
  scheduledDate: string;
  assetUrl?: string;
  copy?: string;
  notes?: string;
  createdBy: {
    _id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Activity {
  _id: string;
  user: User;
  action: string;
  details: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  image: string;
  badge?: string;
  description: string;
  specs: string[];
  stockStatus: "In Stock" | "Low Stock" | "Custom Order Only";
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface DashboardState {
  user: User | null;
  token: string | null;
  users: User[];
  tasks: Task[];
  notifications: Notification[];
  campaigns: MarketingCampaign[];
  binTasks: Task[];
  binCampaigns: MarketingCampaign[];
  products: Product[];
  activities: Activity[];
  pusher: Pusher | null;
  theme: "light" | "dark";
  focusMode: boolean;
  quickNotes: string[];
  activeStaffProfile: User | null;
  
  // Actions
  init: () => void;
  setActiveStaffProfile: (profile: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleTheme: () => void;
  toggleFocusMode: () => void;
  
  // Tasks
  fetchTasks: () => Promise<void>;
  createTask: (data: any) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task["status"]) => Promise<void>;
  togglePinTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  // Products
  fetchProducts: () => Promise<void>;
  createProduct: (data: any) => Promise<void>;
  updateProduct: (id: string, data: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Users
  fetchUsers: () => Promise<void>;
  
  // Notifications
  fetchNotifications: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  createAnnouncement: (message: string) => Promise<void>;
  
  // Campaigns
  fetchCampaigns: () => Promise<void>;
  createCampaign: (data: any) => Promise<void>;
  updateCampaign: (campaignId: string, data: any) => Promise<void>;
  deleteCampaign: (campaignId: string) => Promise<void>;
  
  // Bin
  fetchBin: () => Promise<void>;
  restoreBinItem: (type: "task" | "campaign", id: string) => Promise<void>;
  deleteBinItemPermanently: (type: "task" | "campaign", id: string) => Promise<void>;
  
  // Activities
  fetchActivities: () => Promise<void>;
  
  // Quick Notes
  addQuickNote: (note: string) => void;
  deleteQuickNote: (index: number) => void;
}

// Helpers
const getHeaders = (token: string | null) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const sortTasks = (tasksList: Task[]): Task[] => {
  return [...tasksList].sort((a, b) => {
    // Pinned tasks first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    
    // Then sort by due date ascending
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    if (dateA !== dateB) return dateA - dateB;

    // Finally sort by creation date descending
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const useStore = create<DashboardState>((set, get) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  users: [],
  tasks: [],
  notifications: [],
  campaigns: [],
  binTasks: [],
  binCampaigns: [],
  products: [],
  activities: [],
  pusher: null,
  theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
  focusMode: false,
  quickNotes: JSON.parse(localStorage.getItem("quickNotes") || "[]"),
  activeStaffProfile: JSON.parse(localStorage.getItem("activeStaffProfile") || "null"),

  init: () => {
    const { token, user } = get();
    
    // Apply theme
    const theme = get().theme;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (token && user) {
      get().fetchTasks();
      get().fetchUsers();
      get().fetchNotifications();
      get().fetchCampaigns();
      get().fetchActivities();
      get().fetchProducts();
      if (user.role === "admin") {
        get().fetchBin();
      }
      
      // Connect Pusher (cleanup previous connection if any)
      const existingPusher = get().pusher;
      if (existingPusher) {
        existingPusher.disconnect();
      }

      const pusherKey = import.meta.env.VITE_PUSHER_KEY || "YOUR_PUSHER_KEY";
      const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER || "mt1";

      const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true,
      });

      const channel = pusher.subscribe("ktm-dashboard");

      channel.bind("pusher:subscription_succeeded", () => {
        console.log("Pusher subscription succeeded on channel 'ktm-dashboard'");
      });

      // Bind events
      channel.bind("task_created", (newTask: Task) => {
        set((state) => {
          // If staff, verify if this task is assigned to them (or a staff member if using the shared staff login)
          if (state.user?.role !== "admin") {
            const isSharedStaff = state.user?.email === "staff@ktmdecor.com";
            const isAssignedToMe = newTask.assignee?._id === state.user?._id;
            const isAssignedToStaff = newTask.assignee?.role === "staff";
            
            if (isSharedStaff) {
              if (!isAssignedToMe && !isAssignedToStaff) return {};
            } else {
              if (!isAssignedToMe) return {};
            }
          }
          const filtered = state.tasks.filter((t) => t._id !== newTask._id);
          return { tasks: sortTasks([newTask, ...filtered]) };
        });
      });

      channel.bind("task_updated", (updatedTask: Task) => {
        set((state) => {
          const filtered = state.tasks.filter((t) => t._id !== updatedTask._id);
          // If staff, only keep tasks assigned to staff members
          if (state.user?.role !== "admin") {
            const isSharedStaff = state.user?.email === "staff@ktmdecor.com";
            const isAssignedToMe = updatedTask.assignee?._id === state.user?._id;
            const isAssignedToStaff = updatedTask.assignee?.role === "staff";
            
            if (isSharedStaff) {
              if (!isAssignedToMe && !isAssignedToStaff) return { tasks: sortTasks(filtered) };
            } else {
              if (!isAssignedToMe) return { tasks: sortTasks(filtered) };
            }
          }
          return { tasks: sortTasks([updatedTask, ...filtered]) };
        });
      });

      channel.bind("task_pinned", (pinnedTask: Task) => {
        set((state) => {
          const filtered = state.tasks.filter((t) => t._id !== pinnedTask._id);
          if (state.user?.role !== "admin") {
            const isSharedStaff = state.user?.email === "staff@ktmdecor.com";
            const isAssignedToMe = pinnedTask.assignee?._id === state.user?._id;
            const isAssignedToStaff = pinnedTask.assignee?.role === "staff";
            
            if (isSharedStaff) {
              if (!isAssignedToMe && !isAssignedToStaff) return { tasks: sortTasks(filtered) };
            } else {
              if (!isAssignedToMe) return { tasks: sortTasks(filtered) };
            }
          }
          return { tasks: sortTasks([pinnedTask, ...filtered]) };
        });
      });

      channel.bind("task_deleted", (deletedTaskId: string) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t._id !== deletedTaskId),
        }));
      });

      channel.bind("receive_notification", (notif: Notification) => {
        set((state) => {
          // Verify recipient
          if (notif.recipient) {
            // Direct notification
            if (state.user?.email === "staff@ktmdecor.com") {
              const isMe = notif.recipient === state.user?._id;
              const isPersona = notif.recipient === state.activeStaffProfile?._id;
              if (!isMe && !isPersona) return {};
            } else {
              if (notif.recipient !== state.user?._id && state.user?.role !== "admin") return {};
            }
          }
          const filtered = state.notifications.filter((n) => n._id !== notif._id);
          return { notifications: [notif, ...filtered] };
        });
      });

      channel.bind("campaign_updated", (updatedCampaign: MarketingCampaign) => {
        set((state) => {
          const filtered = state.campaigns.filter((c) => c._id !== updatedCampaign._id);
          return { campaigns: [...filtered, updatedCampaign].sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()) };
        });
      });

      channel.bind("campaign_deleted", (deletedCampaignId: string) => {
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c._id !== deletedCampaignId),
        }));
      });

      channel.bind("bin_updated", () => {
        if (get().user?.role === "admin") {
          get().fetchBin();
        }
      });

      channel.bind("new_activity", (activity: Activity) => {
        set((state) => {
          const filtered = state.activities.filter((a) => a._id !== activity._id);
          return { activities: [activity, ...filtered.slice(0, 29)] };
        });
      });

      channel.bind("product_created", (newProduct: Product) => {
        set((state) => {
          const filtered = state.products.filter((p) => p.id !== newProduct.id);
          return { products: [newProduct, ...filtered] };
        });
      });

      channel.bind("product_updated", (updatedProduct: Product) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
        }));
      });

      channel.bind("product_deleted", (deletedProductId: string) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== deletedProductId),
        }));
      });

      set({ pusher });
    }
  },

  login: async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        throw new Error("Invalid credentials");
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      set({ user: data, token: data.token });
      get().init();
      return true;
    } catch (error) {
      console.error("Login failure:", error);
      return false;
    }
  },

  setActiveStaffProfile: (profile) => {
    if (profile) {
      localStorage.setItem("activeStaffProfile", JSON.stringify(profile));
    } else {
      localStorage.removeItem("activeStaffProfile");
    }
    set({ activeStaffProfile: profile });
  },

  logout: () => {
    const { pusher } = get();
    if (pusher) {
      pusher.disconnect();
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("activeStaffProfile");
    set({
      user: null,
      token: null,
      activeStaffProfile: null,
      tasks: [],
      users: [],
      notifications: [],
      campaigns: [],
      binTasks: [],
      binCampaigns: [],
      products: [],
      activities: [],
      pusher: null,
    });
  },

  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { theme: nextTheme };
    });
  },

  toggleFocusMode: () => {
    set((state) => ({ focusMode: !state.focusMode }));
  },

  fetchTasks: async () => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: getHeaders(token),
      });
      if (res.ok) {
        const data = await res.json();
        set({ tasks: sortTasks(data) });
      }
    } catch (err) {
      console.error("Fetch tasks failed:", err);
    }
  },

  createTask: async (taskData) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(taskData),
      });
      if (!res.ok) throw new Error("Task creation failed");
      // Server will emit task_created socket event, handled in init()
    } catch (err) {
      console.error(err);
    }
  },

  updateTaskStatus: async (taskId, status) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Task update failed");
      // Server will emit task_updated socket event, handled in init()
    } catch (err) {
      console.error(err);
    }
  },

  togglePinTask: async (taskId) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}/pin`, {
        method: "PUT",
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error("Task pinning toggle failed");
      // Server will emit task_pinned socket event, handled in init()
    } catch (err) {
      console.error(err);
    }
  },

  deleteTask: async (taskId) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error("Task deletion failed");
      // Server will emit task_deleted socket event, handled in init()
    } catch (err) {
      console.error(err);
    }
  },

  fetchUsers: async () => {
    const { token, user, activeStaffProfile } = get();
    try {
      const res = await fetch(`${API_URL}/api/auth/users`, {
        headers: getHeaders(token),
      });
      if (res.ok) {
        const data = await res.json();
        set({ users: data });

        // If shared staff login, set default active persona if none exists
        if (user && user.email === "staff@ktmdecor.com" && !activeStaffProfile) {
          const staffMembers = data.filter((u: User) => u.role !== "admin" && u.email !== "staff@ktmdecor.com");
          if (staffMembers.length > 0) {
            get().setActiveStaffProfile(staffMembers[0]);
          }
        }
      }
    } catch (err) {
      console.error("Fetch users failed:", err);
    }
  },

  fetchNotifications: async () => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: getHeaders(token),
      });
      if (res.ok) {
        const data = await res.json();
        set({ notifications: data });
      }
    } catch (err) {
      console.error("Fetch notifications failed:", err);
    }
  },

  markNotificationsRead: async () => {
    const { token, user, activeStaffProfile } = get();
    if (!user) return;
    try {
      const body: any = {};
      if (user.email === "staff@ktmdecor.com" && activeStaffProfile) {
        body.assigneeId = activeStaffProfile._id;
      }
      const res = await fetch(`${API_URL}/api/notifications/read`, {
        method: "PUT",
        headers: {
          ...getHeaders(token),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        set((state) => ({
          notifications: state.notifications.map((notif) => {
            const readerId = (user.email === "staff@ktmdecor.com" && activeStaffProfile) ? activeStaffProfile._id : user._id;
            if (notif.recipient === null) {
              // Global announcement read list
              return { ...notif, readBy: [...new Set([...(notif.readBy || []), readerId])] };
            }
            // Direct notification
            if (notif.recipient === readerId) {
              return { ...notif, read: true };
            }
            return notif;
          }),
        }));
      }
    } catch (err) {
      console.error("Marking notifications read failed:", err);
    }
  },

  createAnnouncement: async (message) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/notifications/announcement`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Announcement publication failed");
    } catch (err) {
      console.error(err);
    }
  },

  fetchCampaigns: async () => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/campaigns`, {
        headers: getHeaders(token),
      });
      if (res.ok) {
        const data = await res.json();
        set({ campaigns: data });
      }
    } catch (err) {
      console.error("Fetch campaigns failed:", err);
    }
  },

  createCampaign: async (campaignData) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/campaigns`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(campaignData),
      });
      if (!res.ok) throw new Error("Campaign creation failed");
    } catch (err) {
      console.error(err);
    }
  },

  updateCampaign: async (campaignId, campaignData) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${campaignId}`, {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify(campaignData),
      });
      if (!res.ok) throw new Error("Campaign update failed");
    } catch (err) {
      console.error(err);
    }
  },

  deleteCampaign: async (campaignId) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${campaignId}`, {
        method: "DELETE",
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error("Campaign deletion failed");
    } catch (err) {
      console.error(err);
    }
  },

  fetchProducts: async () => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        headers: getHeaders(token),
      });
      if (res.ok) {
        const data = await res.json();
        set({ products: data });
      }
    } catch (err) {
      console.error("Fetch products failed:", err);
    }
  },

  createProduct: async (productData) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(productData),
      });
      if (!res.ok) throw new Error("Product creation failed");
    } catch (err) {
      console.error("Create product failed:", err);
      throw err;
    }
  },

  updateProduct: async (productId, productData) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify(productData),
      });
      if (!res.ok) throw new Error("Product update failed");
    } catch (err) {
      console.error("Update product failed:", err);
      throw err;
    }
  },

  deleteProduct: async (productId) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error("Product deletion failed");
    } catch (err) {
      console.error("Delete product failed:", err);
      throw err;
    }
  },

  fetchBin: async () => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/bin`, {
        headers: getHeaders(token),
      });
      if (res.ok) {
        const data = await res.json();
        set({
          binTasks: data.tasks || [],
          binCampaigns: data.campaigns || []
        });
      }
    } catch (err) {
      console.error("Fetch bin failed:", err);
    }
  },

  restoreBinItem: async (type, id) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/bin/${type}/${id}/restore`, {
        method: "PUT",
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error("Restoring bin item failed");
    } catch (err) {
      console.error(err);
    }
  },

  deleteBinItemPermanently: async (type, id) => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/bin/${type}/${id}/force`, {
        method: "DELETE",
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error("Force deleting bin item failed");
    } catch (err) {
      console.error(err);
    }
  },

  fetchActivities: async () => {
    const { token } = get();
    try {
      const res = await fetch(`${API_URL}/api/activities`, {
        headers: getHeaders(token),
      });
      if (res.ok) {
        const data = await res.json();
        set({ activities: data });
      }
    } catch (err) {
      console.error("Fetch activities failed:", err);
    }
  },

  addQuickNote: (note) => {
    set((state) => {
      const updatedNotes = [note, ...state.quickNotes];
      localStorage.setItem("quickNotes", JSON.stringify(updatedNotes));
      return { quickNotes: updatedNotes };
    });
  },

  deleteQuickNote: (index) => {
    set((state) => {
      const updatedNotes = state.quickNotes.filter((_, idx) => idx !== index);
      localStorage.setItem("quickNotes", JSON.stringify(updatedNotes));
      return { quickNotes: updatedNotes };
    });
  },
}));
