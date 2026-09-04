import React, { useEffect, useState } from "react";
import { useStore, Task, MarketingCampaign } from "./store/useStore";
import { Layout } from "./components/Layout";
import { DashboardOverview } from "./components/DashboardOverview";
import { TaskBoard } from "./components/TaskBoard";
import { FieldNotes } from "./components/FieldNotes";
import { BinView } from "./components/BinView";
import { ProductManagement } from "./components/ProductManagement";
import { OrdersTab } from "./components/OrdersTab";
import { OrderProgressTab } from "./components/OrderProgressTab";
import { SalesTab } from "./components/SalesTab";
import { ExpensesTab } from "./components/ExpensesTab";
import { PurchaseTab } from "./components/PurchaseTab";
import { InventoryTab } from "./components/InventoryTab";
import { QuotationTab } from "./components/QuotationTab";
import { CalendarTab } from "./components/CalendarTab";
import { StaffManagement } from "./components/StaffManagement";
import { LogIn, KeyRound, Mail } from "./components/ui/solar-icons";

const ALL_VALID_TABS = [
  "overview",
  "calendar",
  "tasks",
  "field-notes",
  "staff-management",
  "orders",
  "order-progress",
  "inventory",
  "sales",
  "expenses",
  "purchase",
  "quotation",
  "products",
  "bin"
];

const RESTRICTED_STAFF_TABS = ["sales", "expenses", "quotation", "products", "bin", "purchase"];

const getInitialTab = (): string => {
  if (typeof window !== "undefined") {
    const hash = window.location.hash.replace(/^#\/?/, "").trim();
    if (hash && ALL_VALID_TABS.includes(hash)) {
      return hash;
    }
    const stored = localStorage.getItem("ktm_active_tab");
    if (stored && ALL_VALID_TABS.includes(stored)) {
      return stored;
    }
  }
  return "overview";
};

export const App: React.FC = () => {
  const { user, token, init, login } = useStore();
  const [currentTab, setCurrentTab] = useState<string>(getInitialTab);

  // Tab change handler that keeps URL hash and localStorage in sync
  const handleSetCurrentTab = (tab: string) => {
    if (ALL_VALID_TABS.includes(tab)) {
      setCurrentTab(tab);
      localStorage.setItem("ktm_active_tab", tab);
      if (window.location.hash.replace(/^#\/?/, "") !== tab) {
        window.location.hash = tab;
      }
    }
  };

  // Sync with browser back/forward and direct hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, "").trim();
      if (hash && ALL_VALID_TABS.includes(hash)) {
        if (user && user.role !== "admin" && RESTRICTED_STAFF_TABS.includes(hash)) {
          handleSetCurrentTab("overview");
        } else {
          setCurrentTab(hash);
          localStorage.setItem("ktm_active_tab", hash);
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [user]);

  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal Triggers (to trigger task/campaign creation from FAB or overview card)
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);

  useEffect(() => {
    init();
  }, [token, init]);

  useEffect(() => {
    if (user) {
      if (user.role !== "admin" && RESTRICTED_STAFF_TABS.includes(currentTab)) {
        handleSetCurrentTab("overview");
      } else {
        localStorage.setItem("ktm_active_tab", currentTab);
        if (window.location.hash.replace(/^#\/?/, "") !== currentTab) {
          window.location.hash = currentTab;
        }
      }
    }
  }, [currentTab, user]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setLoginError("Failed to connect to backend. Please ensure the backend server (port 5001) is running.");
      } else {
        setLoginError(err.message || "Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Auth Guard
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden transition-colors duration-300">
        {/* Animated background decoration */}
        <div className="absolute inset-0 bg-cnc-grid pointer-events-none opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />

        <div className="w-full max-w-sm md:max-w-lg z-10 space-y-8">
          <div className="text-center space-y-3 flex flex-col items-center">
            <img
              src="/admin/logo/ktm%20decor.svg"
              alt="KTM DECOR"
              className="h-16 md:h-20 w-auto object-contain dark:invert dark:hue-rotate-180 transition-transform duration-300 hover:scale-105"
            />
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-black dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 shadow-2xs">
              Admin & Staff Work Station
            </span>
          </div>

          <div className="p-7 sm:p-10 md:p-12 rounded-[32px] border border-border/80 shadow-2xl space-y-7 bg-card">
            <div className="space-y-1.5 text-center pb-2">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground tracking-tight flex items-center justify-center gap-2.5">
                <LogIn size={24} className="text-accent" />
                Sign In
              </h2>
              <p className="text-xs text-muted font-medium">
                Enter your credentials to access your daily workstation
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 text-xs bg-red-500/10 border border-red-500/25 text-red-500 rounded-2xl font-bold flex items-center gap-2.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-red-500 block shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-muted uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted group-focus-within:text-accent transition-colors duration-200" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full pl-12 pr-4 py-3.5 border border-border/80 rounded-2xl bg-background/60 focus:bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm transition-all duration-200 shadow-2xs"
                    placeholder="yourname@ktmdecor.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-muted uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-muted group-focus-within:text-accent transition-colors duration-200" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-border/80 rounded-2xl bg-background/60 focus:bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm transition-all duration-200 shadow-2xs"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-muted hover:text-foreground select-none">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30 accent-accent cursor-pointer"
                  />
                  <span>Remember this station</span>
                </label>
                <a href="#" className="font-bold text-accent hover:text-accent-dark transition-colors">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
                }}
                className="w-full py-3.5 text-black font-bold rounded-2xl text-sm transition-all shadow-md shadow-orange-500/20 hover:opacity-95 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  "Access Work Station"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout currentTab={currentTab} setCurrentTab={handleSetCurrentTab}>
      {currentTab === "overview" && (
        <DashboardOverview
          setCurrentTab={handleSetCurrentTab}
          openTaskModal={() => {
            setEditingTask(null);
            setShowTaskModal(true);
          }}
          openCampaignModal={() => {
            setEditingCampaign(null);
            setShowCampaignModal(true);
          }}
        />
      )}
      {currentTab === "tasks" && (
        <TaskBoard
          showModal={showTaskModal}
          setShowModal={setShowTaskModal}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
        />
      )}
      {currentTab === "calendar" && (
        <CalendarTab setCurrentTab={handleSetCurrentTab} />
      )}
      {currentTab === "field-notes" && (
        <FieldNotes
          showModal={showCampaignModal}
          setShowModal={setShowCampaignModal}
          editingCampaign={editingCampaign}
          setEditingCampaign={setEditingCampaign}
        />
      )}
      {currentTab === "bin" && user?.role === "admin" && (
        <BinView />
      )}
      {currentTab === "products" && user?.role === "admin" && (
        <ProductManagement />
      )}
      {currentTab === "orders" && (
        <OrdersTab />
      )}
      {currentTab === "order-progress" && (
        <OrderProgressTab />
      )}
      {currentTab === "sales" && user?.role === "admin" && (
        <SalesTab />
      )}
      {currentTab === "expenses" && user?.role === "admin" && (
        <ExpensesTab />
      )}
      {currentTab === "purchase" && user?.role === "admin" && (
        <PurchaseTab />
      )}
      {currentTab === "inventory" && (
        <InventoryTab />
      )}
      {currentTab === "quotation" && user?.role === "admin" && (
        <QuotationTab />
      )}
      {currentTab === "staff-management" && (
        <StaffManagement />
      )}
    </Layout>
  );
};
export default App;
