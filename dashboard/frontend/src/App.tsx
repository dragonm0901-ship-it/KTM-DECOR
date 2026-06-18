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
      setLoginError("Invalid email or password. Hint: check pre-filled test users.");
    }
  };

  const handleSetTestCredentials = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
  };

  // Auth Guard
  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden transition-colors duration-300">
        {/* Animated background decoration */}
        <div className="absolute inset-0 bg-cnc-grid pointer-events-none opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />

        <div className="w-full max-w-md z-10 space-y-6">
          <div className="text-center space-y-4 flex flex-col items-center">
            <img
              src="/admin/logo/ktm%20decor.svg"
              alt="KTM DECOR"
              className="h-16 w-auto object-contain dark:invert dark:hue-rotate-180"
            />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Admin & Staff Work Station
            </p>
          </div>

          <div className="glass-panel p-8 rounded-xl border border-border shadow-2xl space-y-6 bg-card/85">
            <h2 className="text-lg font-bold font-display text-foreground flex items-center gap-2">
              <LogIn size={20} className="text-accent" />
              Sign in to Dashboard
            </h2>

            {loginError && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded font-semibold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full pl-10 pr-4 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                    placeholder="name@ktmdecor.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white rounded font-bold text-sm transition-all shadow-md shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Login to Work Station"}
              </button>
            </form>

            {import.meta.env.DEV && (
              <div className="border-t border-border/80 pt-4 mt-6">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">
                  Click credentials to test (DEV ONLY):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSetTestCredentials("admin@ktmdecor.com", "uH9#fX8$mK2!vP5_wZ7*tQ3")}
                    className="px-3 py-2 text-[10px] text-left border border-border bg-background rounded hover:border-accent transition-all hover:bg-accent/5"
                  >
                    <span className="font-bold text-accent block">Kishor (Admin)</span>
                    admin@ktmdecor.com
                  </button>
                  <button
                    onClick={() => handleSetTestCredentials("staff@ktmdecor.com", "xR4!yP6_zT8$wB2*qM5#sK9")}
                    className="px-3 py-2 text-[10px] text-left border border-border bg-background rounded hover:border-accent transition-all hover:bg-accent/5"
                  >
                    <span className="font-bold text-accent block">Shared Staff Login</span>
                    staff@ktmdecor.com
                  </button>
                </div>
              </div>
            )}
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
