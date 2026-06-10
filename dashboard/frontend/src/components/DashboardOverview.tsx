import React, { useState } from "react";
import { useStore } from "../store/useStore";
import {
  Activity as ActivityIcon,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Pin,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Package,
  Briefcase,
  User,
  Eye,
  Phone,
  MapPin,
  X
} from "./ui/solar-icons";
import { OrderDetailModal } from "./OrderDetailModal";

interface OverviewProps {
  setCurrentTab: (tab: string) => void;
  openTaskModal: () => void;
  openCampaignModal: () => void;
}

export const DashboardOverview: React.FC<OverviewProps> = ({
  setCurrentTab,
  openTaskModal,
  openCampaignModal
}) => {
  const {
    user,
    tasks,
    campaigns,
    activities,
    quickNotes,
    addQuickNote,
    deleteQuickNote,
    users,
    activeStaffProfile,
    orders,
    expenses,
    purchases,
    inventoryItems,
    sales,
    exportStatement,
    exportInventory
  } = useStore();

  const [noteText, setNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  // Outstanding Due Modal States
  const [showOutstandingModal, setShowOutstandingModal] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null);

  // Statement Export States
  const [exportMonth, setExportMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [exportYear, setExportYear] = useState<string>(new Date().getFullYear().toString());
  const [exportingType, setExportingType] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setExportingType(type);
    try {
      if (type === "inventory") {
        await exportInventory();
      } else {
        await exportStatement(type, exportMonth, exportYear);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to export statement: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setExportingType(null);
    }
  };

  // Get list of active/completed orders with outstanding due payment > 0
  const outstandingOrdersList = orders.filter((o) => o.duePayment > 0);

  // Defensive guard: ensure quickNotes is always an array for rendering
  const safeQuickNotes = Array.isArray(quickNotes) ? quickNotes : [];

  // Completed tasks sorted chronologically by completion date (updatedAt)
  const completedTasks = tasks
    .filter((t) => t.status === "done")
    .sort((a, b) => new Date(a.updatedAt || a.createdAt).getTime() - new Date(b.updatedAt || b.createdAt).getTime());

  // Approved manual orders
  const approvedOrders = orders
    .filter((o) => o.approved && o.stage === "delivered")
    .sort((a, b) => new Date(a.approvedAt || a.updatedAt || a.createdAt).getTime() - new Date(b.approvedAt || b.updatedAt || b.createdAt).getTime());

  const activeOrdersCount = orders.filter((o) => o.stage !== "delivered").length;

  // Dynamic Sales: Sum of total cost of all completed tasks + sales ledger entries
  const taskSales = completedTasks.reduce((acc, t) => acc + (t.totalCost || 0), 0);

  // Safe array check for sales
  const safeSales = Array.isArray(sales) ? sales : [];

  const orderSales = safeSales
    .filter((s) => s.orderId)
    .reduce((acc, s) => acc + (s.amount || 0), 0);

  const directSales = safeSales
    .filter((s) => !s.orderId)
    .reduce((acc, s) => acc + (s.amount || 0), 0);

  const totalSales = taskSales + orderSales + directSales;

  // Advance and Due calculations — calculated from all orders in registry
  const totalAdvancePaid = orders.reduce((acc, o) => acc + (o.advancePayment || 0), 0);
  const totalDuePayment = orders.reduce((acc, o) => acc + (o.duePayment || 0), 0);

  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const completedTasksCount = completedTasks.length;
  const pinnedTasks = tasks.filter((t) => t.pinned && t.status !== "done");

  // New calculations for Overview Cards
  const totalExpensesVal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPurchasesVal = purchases.reduce((sum, p) => sum + p.amount, 0);
  const outstandingPurchasesVal = purchases.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  const lowStockVal = inventoryItems.filter((i) => i.quantity <= i.alertLevel && i.quantity > 0).length;
  const outOfStockVal = inventoryItems.filter((i) => i.quantity === 0).length;

  const expenseCategorySums = {
    salary: expenses.filter((e) => e.category === "salary").reduce((sum, e) => sum + e.amount, 0),
    rent: expenses.filter((e) => e.category === "rent").reduce((sum, e) => sum + e.amount, 0),
    travel: expenses.filter((e) => e.category === "travel").reduce((sum, e) => sum + e.amount, 0),
    food: expenses.filter((e) => e.category === "food").reduce((sum, e) => sum + e.amount, 0),
    miscellaneous: expenses.filter((e) => e.category === "miscellaneous").reduce((sum, e) => sum + e.amount, 0),
  };

  const activeId = user?.email === "staff@ktmdecor.com" ? activeStaffProfile?._id : user?._id;

  const getOrderPriority = (deliveryDateStr: string | Date) => {
    if (!deliveryDateStr) return "low";
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const delivery = new Date(deliveryDateStr);
    delivery.setHours(0, 0, 0, 0);
    const diffTime = delivery.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 2) return "high";
    if (diffDays <= 5) return "medium";
    return "low";
  };

  const staffPendingOrders = orders
    .filter((o) => o.assignee?._id === activeId && o.deleted !== true && o.stage !== "delivered")
    .map((o) => ({
      _id: o._id,
      title: `Order: ${o.productName}`,
      description: `Client: ${o.customerName} | Size: ${o.size} | Color: ${o.color}`,
      priority: getOrderPriority(o.deliveryDate),
      dueDate: o.deliveryDate,
      status: o.stage,
      isOrder: true,
    }));

  const staffCompletedOrders = orders
    .filter((o) => o.assignee?._id === activeId && o.deleted !== true && (o.stage === "delivered" || o.approved))
    .map((o) => ({
      _id: o._id,
      title: `Order: ${o.productName}`,
      description: `Client: ${o.customerName} | Size: ${o.size} | Color: ${o.color}`,
      priority: "low",
      dueDate: o.deliveryDate,
      status: "done",
      isOrder: true,
    }));

  // Staff specific pending tasks
  const staffPendingTasks: any[] = [
    ...pendingTasks.filter((t) => t.assignee?._id === activeId),
    ...staffPendingOrders,
  ];

  // Staff specific completed tasks
  const staffCompletedTasks: any[] = [
    ...completedTasks.filter((t) => t.assignee?._id === activeId),
    ...staffCompletedOrders,
  ];

  // Generate sales chart data points (merging tasks and approved orders chronologically)
  const getSalesChartData = () => {
    const points: { label: string; value: number }[] = [{ label: "Start", value: 0 }];
    
    const revenueItems: { date: Date; value: number }[] = [];
    
    completedTasks.forEach((t) => {
      revenueItems.push({
        date: new Date(t.updatedAt || t.createdAt),
        value: t.totalCost || 0
      });
    });
    
    safeSales.forEach((s) => {
      revenueItems.push({
        date: new Date(s.date),
        value: s.amount || 0
      });
    });

    // Sort chronologically
    revenueItems.sort((a, b) => a.date.getTime() - b.date.getTime());

    let cumulative = 0;
    revenueItems.forEach((item) => {
      cumulative += item.value;
      const dateStr = item.date.toLocaleDateString([], {
        month: "short",
        day: "numeric"
      });
      points.push({ label: dateStr, value: cumulative });
    });

    if (points.length === 1) {
      points.push({ label: "Today", value: 0 });
    }

    return points;
  };

  const chartData = getSalesChartData();

  // Render graph path config
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 55;
  const paddingY = 20;

  const maxVal = Math.max(...chartData.map((d) => d.value), 1000);
  
  const getCoordinates = () => {
    return chartData.map((d, index) => {
      const x = paddingX + (index / (chartData.length - 1)) * (svgWidth - 2 * paddingX);
      const y = (svgHeight - paddingY) - (d.value / maxVal) * (svgHeight - 2 * paddingY);
      return { x, y, label: d.label, value: d.value };
    });
  };

  const coords = getCoordinates();

  let linePath = "";
  let areaPath = "";

  if (coords.length > 0) {
    linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const p0 = coords[i - 1];
      const p = coords[i];
      const cpX1 = p0.x + (p.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p.x - p0.x) / 2;
      const cpY2 = p.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }
    areaPath = `${linePath} L ${coords[coords.length - 1].x} ${svgHeight - paddingY} L ${coords[0].x} ${svgHeight - paddingY} Z`;
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (coords.length === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
    
    let closest = coords[0];
    let minDiff = Math.abs(mouseX - coords[0].x);
    
    for (let i = 1; i < coords.length; i++) {
      const diff = Math.abs(mouseX - coords[i].x);
      if (diff < minDiff) {
        minDiff = diff;
        closest = coords[i];
      }
    }
    
    setHoveredPoint(closest);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Sticky notes colors
  const stickyColors = [
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800/50",
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/50",
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800/50",
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border-purple-200 dark:border-purple-800/50"
  ];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addQuickNote(noteText.trim());
    setNoteText("");
    setShowNoteInput(false);
  };

  // Staff Performance list (completed tasks and orders per user)
  const getStaffPerformance = (): { name: string; completed: number; pending: number }[] => {
    const perfMap: { [key: string]: { name: string; completed: number; pending: number } } = {};
    
    // Initialize with all users
    users.forEach((u) => {
      perfMap[u._id] = { name: u.name, completed: 0, pending: 0 };
    });

    tasks.forEach((t) => {
      const assigneeId = t.assignee?._id;
      if (assigneeId && perfMap[assigneeId]) {
        if (t.status === "done") {
          perfMap[assigneeId].completed += 1;
        } else {
          perfMap[assigneeId].pending += 1;
        }
      }
    });

    orders.forEach((o) => {
      const assigneeId = o.assignee?._id;
      if (assigneeId && perfMap[assigneeId] && o.deleted !== true) {
        if (o.stage === "delivered" || o.approved) {
          perfMap[assigneeId].completed += 1;
        } else {
          perfMap[assigneeId].pending += 1;
        }
      }
    });

    return Object.values(perfMap).sort((a, b) => b.completed - a.completed);
  };

  const staffPerformance = getStaffPerformance();

  return (
    <div className="space-y-6 relative">
      {/* Personalized Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            Welcome back, <span className="text-accent">
              {(user?.email === "staff@ktmdecor.com" && activeStaffProfile)
                ? activeStaffProfile.name.split(" ")[0]
                : user?.name.split(" ")[0]}
            </span>!
          </h1>
          <p className="text-muted text-sm mt-1">
            {user?.role === "admin"
              ? "Here's what is happening across KTM DECOR today."
              : "Review your pending items and get started on today's tasks."}
          </p>
        </div>
      </div>

      {/* ─── PINNED / HIGH PRIORITY SECTION ─── */}
      {pinnedTasks.length > 0 && (
        <div className="border border-red-500/20 bg-red-500/5 dark:bg-red-500/10 rounded-lg p-4 animate-pulse-dots">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-display font-bold text-sm mb-3">
            <Pin size={16} className="rotate-45" />
            PINNED & URGENT DELIVERABLES
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pinnedTasks.map((task) => (
              <div
                key={task._id}
                className="bg-card border border-border p-3.5 rounded-md flex justify-between items-start gap-4 shadow-sm"
              >
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{task.title}</h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2">
                    {task.description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] border border-red-500/25 text-red-600 dark:text-red-400 px-2 py-0.5 rounded font-medium">
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-muted font-medium">
                      Assignee: {task.assignee?.name || "Deleted User"}
                    </span>
                    <span className="text-[10px] text-muted font-medium flex items-center gap-1">
                      <Clock size={10} />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* METRIC CARD STATS FOR ADMIN OR STAFF */}
      {user?.role === "admin" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-muted font-semibold uppercase tracking-wider">Total Sales</span>
                <h3 className="text-2xl font-bold font-display mt-2 text-green-500 font-sans">Rs. {totalSales.toLocaleString()}</h3>
                <p className="text-[9px] text-muted mt-1 flex flex-wrap gap-x-1.5 gap-y-0.5">
                  <span>Tasks: Rs. {taskSales.toLocaleString()}</span>
                  <span>|</span>
                  <span>Orders: Rs. {orderSales.toLocaleString()}</span>
                  {directSales > 0 && (
                    <>
                      <span>|</span>
                      <span>Direct: Rs. {directSales.toLocaleString()}</span>
                    </>
                  )}
                </p>
              </div>
              <div className="p-2.5 bg-green-600 text-white rounded-md shadow-sm">
                <DollarSign size={22} />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-muted font-semibold uppercase tracking-wider">Active Orders</span>
                <h3 className="text-2xl font-bold font-display mt-2 text-accent font-sans">{activeOrdersCount}</h3>
                <p className="text-[10px] text-muted mt-1">In progress tracking board</p>
              </div>
              <div className="p-2.5 bg-accent text-white rounded-md shadow-sm">
                <Package size={22} />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-muted font-semibold uppercase tracking-wider">Pending Tasks</span>
                <h3 className="text-2xl font-bold font-display mt-2 text-amber-500 font-sans">{pendingTasks.length}</h3>
                <p className="text-[10px] text-muted mt-1">Awaiting implementation</p>
              </div>
              <div className="p-2.5 bg-amber-600 text-white rounded-md shadow-sm">
                <Clock size={22} />
              </div>
            </div>

            <div className="glass-panel p-5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-muted font-semibold uppercase tracking-wider">Completed Work</span>
                <h3 className="text-2xl font-bold font-display mt-2 text-blue-500 font-sans">{completedTasksCount + approvedOrders.length}</h3>
                <p className="text-[10px] text-muted mt-1">Tasks: {completedTasksCount} | Orders: {approvedOrders.length}</p>
              </div>
              <div className="p-2.5 bg-blue-600 text-white rounded-md shadow-sm">
                <CheckCircle size={22} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-lg flex items-center justify-between bg-emerald-500/[0.01] border-emerald-500/10">
              <div>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Total Advance Received</span>
                <h3 className="text-xl font-bold font-display mt-1 text-emerald-600 dark:text-emerald-400">Rs. {totalAdvancePaid.toLocaleString()}</h3>
                <p className="text-[9px] text-muted">Upfront client payments collected</p>
              </div>
              <div className="p-2 bg-emerald-600 text-white rounded shadow-sm">
                <CheckCircle size={18} />
              </div>
            </div>

            <div 
              onClick={() => setShowOutstandingModal(true)}
              className="glass-panel p-4 rounded-lg flex items-center justify-between bg-red-500/[0.01] border-red-500/10 cursor-pointer hover:border-red-500/30 hover:bg-red-500/[0.03] hover:shadow-md transition-all group"
            >
              <div>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider group-hover:text-red-400 transition-colors">Total Outstanding Due</span>
                <h3 className="text-xl font-bold font-display mt-1 text-red-500">Rs. {totalDuePayment.toLocaleString()}</h3>
                <p className="text-[9px] text-muted">Receivables remaining from active/completed orders (Click to view list)</p>
              </div>
              <div className="p-2 bg-red-600 text-white rounded shadow-sm group-hover:scale-105 transition-transform">
                <Clock size={18} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // STAFF PERSONAL METRICS CARD
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">Your Pending Tasks</span>
              <h3 className="text-2xl font-bold font-display mt-2 text-amber-500">
                {staffPendingTasks.length}
              </h3>
              <p className="text-[10px] text-muted mt-1">Tasks for immediate attention</p>
            </div>
            <div className="p-2.5 border border-border bg-card text-amber-500 rounded-md shadow-sm">
              <Clock size={22} />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">Your Completed Tasks</span>
              <h3 className="text-2xl font-bold font-display mt-2 text-green-500">
                {staffCompletedTasks.length}
              </h3>
              <p className="text-[10px] text-muted mt-1">Finished deliverables</p>
            </div>
            <div className="p-2.5 border border-border bg-card text-green-500 rounded-md shadow-sm">
              <CheckCircle size={22} />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">Marketing Hub</span>
              <h3 className="text-2xl font-bold font-display mt-2 text-blue-500">
                {campaigns.length}
              </h3>
              <p className="text-[10px] text-muted mt-1">Collaborative team updates</p>
            </div>
            <div className="p-2.5 border border-border bg-card text-blue-500 rounded-md shadow-sm">
              <FileText size={22} />
            </div>
          </div>
        </div>
      )}

      {/* FINANCIAL & INVENTORY OVERVIEW CARD SECTION */}
      {user?.role === "admin" && (
        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Expenses Overview Card */}
            <div className="glass-panel p-5 rounded-lg border border-border flex flex-col justify-between h-[230px]">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
                  <h3 className="font-bold text-sm font-display flex items-center gap-2">
                    <DollarSign size={16} className="text-red-500" />
                    Expenses Summary
                  </h3>
                  <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded shadow-sm">
                    Log
                  </span>
                </div>
                <div className="mb-3">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Total Expenses</span>
                  <h4 className="text-xl font-extrabold text-foreground mt-0.5">Rs. {totalExpensesVal.toLocaleString()}</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-muted font-semibold">
                  <div className="flex justify-between">
                    <span>Salary:</span>
                    <span className="font-extrabold text-foreground">Rs. {expenseCategorySums.salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rent:</span>
                    <span className="font-extrabold text-foreground">Rs. {expenseCategorySums.rent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Travel:</span>
                    <span className="font-extrabold text-foreground">Rs. {expenseCategorySums.travel.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Food:</span>
                    <span className="font-extrabold text-foreground">Rs. {expenseCategorySums.food.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Misc:</span>
                    <span className="font-extrabold text-foreground">Rs. {expenseCategorySums.miscellaneous.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentTab("expenses")}
                className="text-left text-[10px] font-bold text-accent hover:text-accent-dark transition-colors mt-3"
              >
                View Expense Log &rarr;
              </button>
            </div>

            {/* Purchases Tracker Card */}
            <div className="glass-panel p-5 rounded-lg border border-border flex flex-col justify-between h-[230px]">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
                  <h3 className="font-bold text-sm font-display flex items-center gap-2">
                    <Briefcase size={16} className="text-blue-500" />
                    Purchases Tracker
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${
                    outstandingPurchasesVal > 0 ? "bg-amber-600 text-white" : "bg-green-600 text-white"
                  }`}>
                    {outstandingPurchasesVal > 0 ? "Pending Dues" : "Settled"}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Total Purchases</span>
                  <h4 className="text-xl font-extrabold text-foreground mt-0.5">Rs. {totalPurchasesVal.toLocaleString()}</h4>
                  {outstandingPurchasesVal > 0 && (
                    <p className="text-[9px] text-red-500 font-bold mt-0.5">Rs. {outstandingPurchasesVal.toLocaleString()} outstanding dues</p>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted uppercase font-bold tracking-wider block">Recent Invoices</span>
                  {purchases.slice(0, 2).map((p) => (
                    <div key={p._id} className="flex justify-between items-center text-[10px] border-b border-border/40 pb-1">
                      <span className="truncate max-w-[120px] font-semibold text-foreground">{p.supplier}</span>
                      <span className="text-muted">Rs. {p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {purchases.length === 0 && (
                    <span className="text-[10px] text-muted italic">No purchases logged</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setCurrentTab("purchase")}
                className="text-left text-[10px] font-bold text-accent hover:text-accent-dark transition-colors mt-3"
              >
                View Purchases Tracker &rarr;
              </button>
            </div>

            {/* Material Inventory Card */}
            <div className="glass-panel p-5 rounded-lg border border-border flex flex-col justify-between h-[230px]">
              <div>
                <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
                  <h3 className="font-bold text-sm font-display flex items-center gap-2">
                    <Package size={16} className="text-emerald-500" />
                    Material Inventory
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${
                    (lowStockVal + outOfStockVal) > 0 ? "bg-red-600 text-white" : "bg-green-600 text-white"
                  }`}>
                    {(lowStockVal + outOfStockVal) > 0 ? "Alerts" : "Ok"}
                  </span>
                </div>
                <div className="mb-2 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Low Stock / Out</span>
                    <h4 className="text-xl font-extrabold text-foreground mt-0.5">{(lowStockVal + outOfStockVal)} Items</h4>
                  </div>
                  <div className="text-right text-[9px] text-muted font-bold space-y-0.5">
                    <div className="text-amber-500">{lowStockVal} Low Stock</div>
                    <div className="text-red-500">{outOfStockVal} Out of Stock</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-muted uppercase font-bold tracking-wider block">Critical Materials</span>
                  {inventoryItems.filter((i) => i.quantity <= i.alertLevel).slice(0, 2).map((i) => (
                    <div key={i._id} className="flex justify-between items-center text-[10px] border-b border-border/40 pb-1">
                      <span className="truncate max-w-[120px] font-semibold text-foreground">{i.name}</span>
                      <span className={`font-bold ${i.quantity === 0 ? "text-red-500" : "text-amber-500"}`}>
                        {i.quantity} {i.unit}
                      </span>
                    </div>
                  ))}
                  {inventoryItems.filter((i) => i.quantity <= i.alertLevel).length === 0 && (
                    <span className="text-[10px] text-green-500 font-bold italic">All materials fully stocked</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setCurrentTab("inventory")}
                className="text-left text-[10px] font-bold text-accent hover:text-accent-dark transition-colors mt-3"
              >
                View Material Inventory &rarr;
              </button>
            </div>
          </div>

          {/* Reports & Statement Downloads */}
          <div className="glass-panel p-5 rounded-lg border border-border bg-accent/[0.01]">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-4 mb-4 gap-4">
              <div>
                <h3 className="font-bold text-base font-display flex items-center gap-2">
                  <FileText className="text-accent" size={20} />
                  Financial Statements & Exports
                </h3>
                <p className="text-xs text-muted mt-1">
                  Generate and download monthly XLSX statements or inventory CSV reports at any time.
                </p>
              </div>

              {/* Date Filters */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Month</span>
                  <select
                    value={exportMonth}
                    onChange={(e) => setExportMonth(e.target.value)}
                    className="bg-card border border-border text-foreground text-xs rounded px-3 py-1.5 focus:outline-none focus:border-accent font-semibold"
                  >
                    <option value="all">All Time</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Year</span>
                  <select
                    value={exportYear}
                    onChange={(e) => setExportYear(e.target.value)}
                    className="bg-card border border-border text-foreground text-xs rounded px-3 py-1.5 focus:outline-none focus:border-accent font-semibold"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <button
                onClick={() => handleExport("all")}
                disabled={exportingType !== null}
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-accent/20 bg-accent/[0.03] hover:bg-accent/[0.06] transition-all text-center group"
              >
                <FileText className="text-accent group-hover:scale-110 transition-transform mb-2" size={24} />
                <span className="text-xs font-bold text-foreground">Combined Statement</span>
                <span className="text-[9px] text-muted mt-1">All sales, expenses, and purchases</span>
                {exportingType === "all" && <span className="text-[9px] text-accent font-bold mt-1 animate-pulse">Exporting...</span>}
              </button>

              <button
                onClick={() => handleExport("sales")}
                disabled={exportingType !== null}
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-blue-500/20 bg-blue-500/[0.02] hover:bg-blue-500/[0.05] transition-all text-center group"
              >
                <TrendingUp className="text-blue-500 group-hover:scale-110 transition-transform mb-2" size={24} />
                <span className="text-xs font-bold text-foreground">Sales Only</span>
                <span className="text-[9px] text-muted mt-1">XLSX sheet of sales ledger</span>
                {exportingType === "sales" && <span className="text-[9px] text-blue-500 font-bold mt-1 animate-pulse">Exporting...</span>}
              </button>

              <button
                onClick={() => handleExport("expenses")}
                disabled={exportingType !== null}
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-red-500/20 bg-red-500/[0.02] hover:bg-red-500/[0.05] transition-all text-center group"
              >
                <DollarSign className="text-red-500 group-hover:scale-110 transition-transform mb-2" size={24} />
                <span className="text-xs font-bold text-foreground">Expenses Only</span>
                <span className="text-[9px] text-muted mt-1">XLSX sheet of expenses log</span>
                {exportingType === "expenses" && <span className="text-[9px] text-red-500 font-bold mt-1 animate-pulse">Exporting...</span>}
              </button>

              <button
                onClick={() => handleExport("purchases")}
                disabled={exportingType !== null}
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.02] hover:bg-amber-500/[0.05] transition-all text-center group"
              >
                <Briefcase className="text-amber-500 group-hover:scale-110 transition-transform mb-2" size={24} />
                <span className="text-xs font-bold text-foreground">Purchases Only</span>
                <span className="text-[9px] text-muted mt-1">XLSX sheet of material purchases</span>
                {exportingType === "purchases" && <span className="text-[9px] text-amber-500 font-bold mt-1 animate-pulse">Exporting...</span>}
              </button>

              <button
                onClick={() => handleExport("inventory")}
                disabled={exportingType !== null}
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05] transition-all text-center group sm:col-span-2 lg:col-span-1"
              >
                <Package className="text-emerald-500 group-hover:scale-110 transition-transform mb-2" size={24} />
                <span className="text-xs font-bold text-foreground">Inventory Catalog</span>
                <span className="text-[9px] text-muted mt-1">CSV file of raw materials</span>
                {exportingType === "inventory" && <span className="text-[9px] text-emerald-500 font-bold mt-1 animate-pulse">Exporting...</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECONDARY ROW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: STAFF LIST (ADMIN) / TODAY'S SCHEDULE (STAFF) */}
        <div className="glass-panel rounded-lg p-5 flex flex-col h-[400px]">
          <h2 className="text-base font-bold font-display border-b border-border pb-3 mb-4 flex items-center gap-2">
            {user?.role === "admin" ? (
              <>
                <TrendingUp size={18} className="text-accent" />
                Staff Performance & Workload
              </>
            ) : (
              <>
                <CheckCircle size={18} className="text-accent" />
                Your Pending Schedule
              </>
            )}
          </h2>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {user?.role === "admin" ? (
              staffPerformance.map((staff) => (
                <div
                  key={staff.name}
                  className="flex items-center justify-between p-3 rounded-md bg-card border border-border"
                >
                  <div>
                    <h4 className="font-semibold text-sm">{staff.name}</h4>
                    <span className="text-[10px] text-muted font-medium">
                      {staff.pending} tasks remaining
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="border border-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded font-semibold uppercase">
                      {staff.completed} Completed
                    </span>
                  </div>
                </div>
              ))
            ) : staffPendingTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted">
                <CheckCircle size={40} className="text-green-500/30 mb-2" />
                <p className="text-sm">Great job! No pending tasks remaining today.</p>
              </div>
            ) : (
              staffPendingTasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => setCurrentTab(task.isOrder ? "order-progress" : "tasks")}
                  className="p-3 bg-card border border-border rounded-md hover:border-accent hover:shadow-sm cursor-pointer transition-all"
                >
                  <h4 className="font-semibold text-sm line-clamp-1">{task.title}</h4>
                  <p className="text-xs text-muted mt-1 line-clamp-1">
                    {task.description || "No description."}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase border ${
                        task.priority === "high"
                          ? "border-red-500/25 text-red-600 dark:text-red-400"
                          : task.priority === "medium"
                          ? "border-amber-500/25 text-amber-600 dark:text-amber-400"
                          : "border-green-500/25 text-green-600 dark:text-green-400"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-muted font-medium">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: LIVE ACTIVITY LOG (ADMIN) / OR FOCUS MODE NOTIFICATION BAR */}
        {user?.role === "admin" ? (
          <div className="glass-panel rounded-lg p-5 flex flex-col h-[400px]">
            <h2 className="text-base font-bold font-display border-b border-border pb-3 mb-4 flex items-center gap-2">
              <ActivityIcon size={18} className="text-accent" />
              Activity Audit Log
            </h2>
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {activities.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted text-sm">
                  No activity logged yet
                </div>
              ) : (
                activities.map((act) => (
                  <div key={act._id} className="p-3 bg-card border border-border rounded-md text-xs">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-accent">{act.user?.name || "Deleted User"}</span>
                      <span className="text-[10px] text-muted">
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <span className="font-semibold text-foreground uppercase tracking-wide block text-[9px] mb-1">
                      {act.action}
                    </span>
                    <p className="text-muted leading-tight">{act.details}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-lg p-5 flex flex-col h-[400px]">
            <h2 className="text-base font-bold font-display border-b border-border pb-3 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle size={18} className="text-accent" />
                Completed Tasks
              </span>
              <span className="text-xs bg-border px-2 py-0.5 rounded font-bold text-muted">
                {staffCompletedTasks.length}
              </span>
            </h2>
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {staffCompletedTasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted">
                  <CheckCircle size={40} className="text-muted/30 mb-2" />
                  <p className="text-sm">No tasks completed yet.</p>
                </div>
              ) : (
                staffCompletedTasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => setCurrentTab(task.isOrder ? "order-progress" : "tasks")}
                    className="p-3 bg-card border border-border rounded-md hover:border-accent hover:shadow-sm cursor-pointer transition-all"
                  >
                    <h4 className="font-semibold text-sm line-clamp-1">{task.title}</h4>
                    <p className="text-xs text-muted mt-1 line-clamp-1">
                      {task.description || "No description."}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[9px] border border-green-500/25 text-green-600 dark:text-green-400 px-2 py-0.5 rounded font-semibold uppercase">
                        Completed
                      </span>
                      <span className="text-[10px] text-muted font-medium">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: QUICK NOTES STICKY REMINDERS */}
        <div className="glass-panel rounded-lg p-5 flex flex-col h-[400px]">
          <h2 className="text-base font-bold font-display border-b border-border pb-3 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText size={18} className="text-accent" />
              Quick-Notes Widget
            </span>
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="p-1 rounded-full hover:bg-border text-accent"
              aria-label="Add Note"
            >
              <Plus size={18} />
            </button>
          </h2>

          {showNoteInput && (
            <form onSubmit={handleAddNote} className="mb-4 animate-slide-up">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Type note and hit enter..."
                  required
                />
                <button
                  type="submit"
                  className="px-3 bg-accent text-white text-xs rounded hover:bg-accent-dark transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          <div className="flex-1 overflow-y-auto pr-1">
            {safeQuickNotes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted">
                <FileText size={40} className="text-muted/30 mb-2" />
                <p className="text-sm">No personal notes created yet. Click the + button above to add one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {safeQuickNotes.map((note, index) => {
                  const colorClass = stickyColors[index % stickyColors.length];
                  return (
                    <div
                      key={note._id}
                      className={`p-3 rounded-md border flex flex-col justify-between min-h-[90px] ${colorClass}`}
                    >
                      <p className="text-xs font-semibold leading-normal break-words">
                        {note.text}
                      </p>
                      <div className="flex justify-between items-center mt-2 border-t border-black/5 pt-1.5 text-[9px] opacity-75">
                        <span className="font-bold">
                          By {note.createdBy?.name?.split(" ")[0] || "Staff"}
                        </span>
                        <button
                          onClick={() => deleteQuickNote(note._id)}
                          className="p-0.5 rounded hover:bg-black/10 text-inherit opacity-70 hover:opacity-100 transition-all"
                          title="Delete note"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SALES GROWTH TREND (ADMIN ONLY - ON THE BOTTOM) */}
      {user?.role === "admin" && (
        <div className="glass-panel p-5 rounded-lg border border-border relative overflow-hidden transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="font-bold text-sm font-display flex items-center gap-1.5">
                <TrendingUp size={16} className="text-accent" />
                Sales Growth Trend
              </h3>
              <p className="text-[10px] text-muted">Fluid reactive line tracking your project values</p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                <span className="text-muted text-[10px]">Cumulative Sales Revenue</span>
              </div>
            </div>
          </div>

          <div className="relative w-full h-[220px]">
            {coords.length <= 1 ? (
              <div className="h-full flex items-center justify-center text-muted text-xs border border-dashed border-border/40 rounded">
                Add completed tasks with values to view graph progression
              </div>
            ) : (
              <>
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-full overflow-visible select-none"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <defs>
                    <linearGradient id="sales-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  {[0.25, 0.5, 0.75, 1.0].map((ratio, index) => {
                    const yVal = svgHeight - paddingY - ratio * (svgHeight - 2 * paddingY);
                    const costLabel = Math.round(ratio * maxVal);
                    return (
                      <g key={index} className="opacity-40">
                        <line
                          x1={paddingX}
                          y1={yVal}
                          x2={svgWidth - paddingX}
                          y2={yVal}
                          stroke="var(--border)"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={paddingX - 8}
                          y={yVal + 3}
                          fill="var(--muted)"
                          fontSize="8"
                          className="font-bold text-right"
                          textAnchor="end"
                        >
                          Rs. {costLabel >= 1000 ? `${(costLabel / 1000).toFixed(0)}k` : costLabel}
                        </text>
                      </g>
                    );
                  })}

                  {/* Shaded Area */}
                  {areaPath && (
                    <path
                      d={areaPath}
                      fill="url(#sales-gradient)"
                      className="transition-all duration-300 ease-out"
                    />
                  )}

                  {/* Bezier Path Line */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="transition-all duration-300 ease-out"
                    />
                  )}

                  {/* X Axis Date labels */}
                  {coords.map((c, index) => {
                    // Only show first, middle, and last to avoid clutter
                    const showLabel = index === 0 || index === coords.length - 1 || (coords.length > 2 && index === Math.floor(coords.length / 2));
                    if (!showLabel) return null;
                    return (
                      <text
                        key={index}
                        x={c.x}
                        y={svgHeight - 4}
                        fill="var(--muted)"
                        fontSize="8"
                        className="font-semibold text-center"
                        textAnchor="middle"
                      >
                        {c.label}
                      </text>
                    );
                  })}

                  {/* Hover reference line */}
                  {hoveredPoint && (
                    <line
                      x1={hoveredPoint.x}
                      y1={paddingY}
                      x2={hoveredPoint.x}
                      y2={svgHeight - paddingY}
                      stroke="var(--accent)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      className="opacity-75"
                    />
                  )}

                  {/* Hover dot */}
                  {hoveredPoint && (
                    <g>
                      <circle
                        cx={hoveredPoint.x}
                        cy={hoveredPoint.y}
                        r="6"
                        fill="var(--accent)"
                        className="opacity-20 animate-ping-small"
                      />
                      <circle
                        cx={hoveredPoint.x}
                        cy={hoveredPoint.y}
                        r="4"
                        fill="var(--accent)"
                        stroke="var(--card)"
                        strokeWidth="1.5"
                        className="shadow"
                      />
                    </g>
                  )}
                </svg>

                {/* Floating Tooltip Div */}
                {hoveredPoint && (
                  <div
                    className="absolute bg-card border border-border p-2 rounded shadow-2xl text-[10px] pointer-events-none transition-all duration-75 select-none z-30"
                    style={{
                      left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                      top: `${(hoveredPoint.y / svgHeight) * 100 - 45}%`,
                      transform: "translateX(-50%)"
                    }}
                  >
                    <span className="text-[8px] text-muted font-bold block uppercase tracking-wider">
                      {hoveredPoint.label}
                    </span>
                    <span className="font-extrabold text-accent block mt-0.5 whitespace-nowrap">
                      Rs. {hoveredPoint.value.toLocaleString()}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON (FAB) FOR QUICK ACTIONS */}
      <div className="fixed bottom-16 md:bottom-6 right-6 z-50">
        <div className="relative">
          {/* Quick Actions Panel */}
          {fabOpen && (
            <div className="absolute bottom-16 right-0 mb-2 w-48 bg-card border border-border rounded-lg shadow-2xl overflow-hidden py-1 flex flex-col animate-slide-up">
              {user?.role === "admin" && (
                <>
                  <button
                    onClick={() => {
                      setFabOpen(false);
                      openTaskModal();
                    }}
                    className="px-4 py-2.5 text-xs text-left font-medium hover:bg-border text-foreground flex items-center gap-2"
                  >
                    <Plus size={14} className="text-accent" />
                    Assign New Task
                  </button>
                  <button
                    onClick={() => {
                      setFabOpen(false);
                      openCampaignModal();
                    }}
                    className="px-4 py-2.5 text-xs text-left font-medium hover:bg-border text-foreground flex items-center gap-2"
                  >
                    <Calendar size={14} className="text-accent" />
                    Create Marketing Entry
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setFabOpen(false);
                  setShowNoteInput(true);
                }}
                className="px-4 py-2.5 text-xs text-left font-medium hover:bg-border text-foreground flex items-center gap-2"
              >
                <FileText size={14} className="text-accent" />
                Add Sticky Note
              </button>
            </div>
          )}

          {/* Core FAB Toggle Button */}
          <button
            onClick={() => setFabOpen(!fabOpen)}
            className="h-12 w-12 rounded-full bg-accent text-white shadow-xl flex items-center justify-center hover:bg-accent-dark transition-all hover:scale-105"
            aria-label="Quick action trigger"
          >
            <Plus size={24} className={`transition-transform duration-200 ${fabOpen ? "rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Outstanding Due Accounts List Modal */}
      {showOutstandingModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-xl rounded-lg border border-border p-6 shadow-2xl animate-scale-up my-8 max-h-[85vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <h2 className="text-lg font-bold font-display flex items-center gap-2 text-red-500">
                <DollarSign size={20} />
                Outstanding Receivables Dues
              </h2>
              <button
                type="button"
                onClick={() => setShowOutstandingModal(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-muted mb-4">
              Below is the list of clients with remaining due balances on active or completed orders. Click on any client to view full details of the order.
            </p>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {outstandingOrdersList.length === 0 ? (
                <div className="py-8 text-center text-muted text-xs">
                  No outstanding client dues found. All payments are fully settled!
                </div>
              ) : (
                outstandingOrdersList.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrderForDetails(order)}
                    className="glass-panel p-3.5 rounded-md border border-border/80 flex items-center justify-between hover:border-red-500/30 hover:bg-red-500/[0.02] hover:shadow-sm cursor-pointer transition-all group"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-foreground group-hover:text-accent transition-colors flex items-center gap-1.5">
                        <User size={12} className="text-accent" />
                        {order.customerName}
                      </div>
                      <div className="text-[10px] text-muted font-medium">
                        Product: <span className="font-semibold text-foreground">{order.productName}</span> ({order.size})
                      </div>
                      <div className="text-[10px] text-muted font-medium flex items-center gap-1">
                        <Phone size={10} /> {order.customerContact}
                        <span className="mx-1">|</span>
                        <MapPin size={10} className="text-accent" /> {order.customerAddress}
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="text-xs font-extrabold text-red-500">
                          Rs. {order.duePayment.toLocaleString()} due
                        </div>
                        <div className="text-[9px] text-muted">
                          Total: Rs. {order.totalPrice.toLocaleString()}
                        </div>
                      </div>
                      <Eye size={16} className="text-muted group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowOutstandingModal(false);
                  setCurrentTab("orders");
                }}
                className="px-4 py-2 border border-border rounded text-xs hover:bg-border transition-colors font-semibold text-muted hover:text-foreground"
              >
                Go to Registry
              </button>
              <button
                type="button"
                onClick={() => setShowOutstandingModal(false)}
                className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded text-xs font-bold transition-all shadow-md shadow-accent/15"
              >
                Close Dues List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrderForDetails}
        onClose={() => setSelectedOrderForDetails(null)}
      />
    </div>
  );
};
