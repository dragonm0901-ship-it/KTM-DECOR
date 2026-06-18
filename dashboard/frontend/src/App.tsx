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
import { LogIn, KeyRound, Mail } from "./components/ui/solar-icons";

export const App: React.FC = () => {
  const { user, token, init, login } = useStore();
  const [currentTab, setCurrentTab] = useState("overview");

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
    if (user && user.role !== "admin") {
      const restrictedTabs = ["sales", "expenses", "quotation", "products", "bin", "purchase"];
      if (restrictedTabs.includes(currentTab)) {
        setCurrentTab("overview");
      }
    }
  }, [currentTab, user]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    const success = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (!success) {
      setLoginError("Invalid email or password.");
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

        <div className="w-full max-w-lg z-10 space-y-8">
          <div className="text-center space-y-4 flex flex-col items-center">
            <img
              src="/admin/logo/ktm%20decor.svg"
              alt="KTM DECOR"
              className="h-20 w-auto object-contain dark:invert dark:hue-rotate-180 transition-transform duration-300 hover:scale-105"
            />
            <p className="text-sm font-bold uppercase tracking-widest text-accent">
              Admin & Staff Work Station
            </p>
          </div>

          <div className="glass-panel p-10 md:p-12 rounded-2xl border border-border shadow-2xl space-y-8 bg-card/90 backdrop-blur-md">
            <div className="space-y-2 text-center pb-2 border-b border-border/50">
              <h2 className="text-2xl font-extrabold font-display text-foreground tracking-tight flex items-center justify-center gap-2.5">
                <LogIn size={26} className="text-accent animate-pulse" />
                Sign In
              </h2>
              <p className="text-xs text-muted font-medium uppercase tracking-wider">
                KTM DECOR Enterprise Work Station
              </p>
            </div>

            {loginError && (
              <div className="p-4 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 block shrink-0 animate-ping" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-muted uppercase tracking-widest">
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
                    className="w-full pl-12 pr-4 py-3.5 border border-border rounded-lg bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-base transition-all duration-200"
                    placeholder="yourname@ktmdecor.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-muted uppercase tracking-widest">
                  Password
                </label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-muted group-focus-within:text-accent transition-colors duration-200" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-border rounded-lg bg-background/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-base transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-muted hover:text-foreground select-none">
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
                className="w-full py-3.5 bg-accent hover:bg-accent-dark text-white rounded-lg font-bold text-base transition-all shadow-lg hover:shadow-accent/30 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {currentTab === "overview" && (
        <DashboardOverview
          setCurrentTab={setCurrentTab}
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
        <CalendarTab setCurrentTab={setCurrentTab} />
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
    </Layout>
  );
};
export default App;
