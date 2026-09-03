import React, { useState, useEffect } from "react";
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
  X,
  Truck,
  Wrench
} from "./ui/solar-icons";
import { Printer, Download } from "lucide-react";
import { OrderDetailModal } from "./OrderDetailModal";
import { StatementPreviewModal } from "./StatementPreviewModal";
import { RevenueGrowthChart } from "./RevenueGrowthChart";
import {
  formatNepali,
  formatNepaliShort,
  getCurrentNepaliDate,
  NEPALI_MONTHS,
  NEPALI_YEARS,
  formatArchiveStatementLabel,
} from "../utils/nepaliDate";

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
    exportInventory,
    statementArchives,
    fetchStatementArchives,
    downloadArchive,
    fetchStatementData,
    fetchArchiveData
  } = useStore();

  const [noteText, setNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  // Statement PDF Preview Modal States
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Outstanding Due Modal States
  const [showOutstandingModal, setShowOutstandingModal] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<any>(null);

  const currentBs = getCurrentNepaliDate();

  // Statement Export States
  const [exportMonth, setExportMonth] = useState<string>(currentBs.month.toString());
  const [exportYear, setExportYear] = useState<string>(currentBs.year.toString());
  const [exportingType, setExportingType] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStatementArchives();
    }
  }, [user, fetchStatementArchives]);

  const handlePreviewStatement = async (type: string) => {
    try {
      setPreviewLoading(true);
      setPreviewModalOpen(true);
      const data = await fetchStatementData(type, exportMonth, exportYear);
      setPreviewData(data);
    } catch (err) {
      alert("Failed to load statement: " + (err instanceof Error ? err.message : String(err)));
      setPreviewModalOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePreviewArchive = async (archiveId: string) => {
    try {
      setPreviewLoading(true);
      setPreviewModalOpen(true);
      const data = await fetchArchiveData(archiveId);
      setPreviewData(data);
    } catch (err) {
      alert("Failed to load archive statement: " + (err instanceof Error ? err.message : String(err)));
      setPreviewModalOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

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
    .filter((o) => o.approved && (o.stage === "delivered" || o.stage === "paid"))
    .sort((a, b) => new Date(a.approvedAt || a.updatedAt || a.createdAt).getTime() - new Date(b.approvedAt || b.updatedAt || b.createdAt).getTime());

  // Active orders are those in design, manufacturing, or completed (not yet delivered or paid)
  const activeOrdersCount = orders.filter((o) => !o.deleted && o.stage !== "delivered" && o.stage !== "paid").length;

  // Dynamic Sales: Sum of total cost of all completed tasks + sales ledger entries (excluding delivery and fitting)
  const taskSales = completedTasks.reduce((acc, t) => acc + (t.totalCost || 0), 0);

  // Safe array check for sales
  const safeSales = Array.isArray(sales) ? sales : [];

  // Map orders by ID for guaranteed accurate base price resolution
  const ordersMap = new Map((Array.isArray(orders) ? orders : []).map((o) => [o._id.toString(), o]));

  // Order sales strictly reflect product base price without delivery or fitting charges
  const orderSales = safeSales
    .filter((s) => s.orderId)
    .reduce((acc, s) => {
      const orderIdStr = (typeof s.orderId === "object" && s.orderId !== null)
        ? (s.orderId as any)._id?.toString()
        : s.orderId?.toString();
      const matchedOrder = orderIdStr ? ordersMap.get(orderIdStr) : undefined;

      const pPrice = matchedOrder
        ? (Number(matchedOrder.price) || 0)
        : (s.orderId && typeof s.orderId === "object" && "price" in s.orderId)
          ? (Number((s.orderId as any).price) || 0)
          : (Number(s.amount) || 0);
      return acc + pPrice;
    }, 0);

  const directSales = safeSales
    .filter((s) => !s.orderId)
    .reduce((acc, s) => acc + (s.amount || 0), 0);

  const totalSales = taskSales + orderSales + directSales;

  // Delivery and Fitting charges calculated from orders (kept separate for manual calculation)
  const totalDeliveryCharges = orders.filter((o) => !o.deleted).reduce((acc, o) => acc + (o.deliveryPrice || 0), 0);
  const totalFittingCharges = orders.filter((o) => !o.deleted).reduce((acc, o) => acc + (o.installationPrice || 0), 0);
  const totalDuePayment = orders.filter((o) => !o.deleted).reduce((acc, o) => acc + (o.duePayment || 0), 0);

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
    .filter((o) => o.assignee?._id === activeId && o.deleted !== true && o.stage !== "delivered" && o.stage !== "paid")
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
    .filter((o) => o.assignee?._id === activeId && o.deleted !== true && (o.stage === "delivered" || o.stage === "paid" || o.approved))
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
      const orderIdStr = (typeof s.orderId === "object" && s.orderId !== null)
        ? (s.orderId as any)._id?.toString()
        : s.orderId?.toString();
      const matchedOrder = orderIdStr ? ordersMap.get(orderIdStr) : undefined;
      const pPrice = matchedOrder
        ? (Number(matchedOrder.price) || 0)
        : (s.orderId && typeof s.orderId === "object" && "price" in s.orderId)
          ? (Number((s.orderId as any).price) || 0)
          : (Number(s.amount) || 0);

      revenueItems.push({
        date: new Date(s.date),
        value: pPrice
      });
    });

    // Sort chronologically
    revenueItems.sort((a, b) => a.date.getTime() - b.date.getTime());

    let cumulative = 0;
    revenueItems.forEach((item) => {
      cumulative += item.value;
      const dateStr = formatNepaliShort(item.date);
      points.push({ label: dateStr, value: cumulative });
    });

    if (points.length === 1) {
      points.push({ label: "Today", value: 0 });
    }

    return points;
  };

  // Sparkline data helpers matching mockup design
  const getSparklineData = (type: "sales" | "orders" | "tasks" | "completed") => {
    if (type === "sales") {
      // Last 6 cumulative sales data points
      const data = getSalesChartData().slice(-6).map((d) => d.value);
      while (data.length < 6) data.unshift(0);
      return data;
    }
    if (type === "orders") {
      const events: { date: Date; change: number }[] = [];
      orders.forEach((o) => {
        if (o.deleted) return;
        events.push({ date: new Date(o.createdAt), change: 1 });
        if (o.stage === "delivered" || o.stage === "paid" || o.approved) {
          const compDate = new Date(o.approvedAt || o.updatedAt || o.createdAt);
          events.push({ date: compDate, change: -1 });
        }
      });
      events.sort((a, b) => a.date.getTime() - b.date.getTime());
      let currentCount = 0;
      const timeline: number[] = [];
      events.forEach((ev) => {
        currentCount += ev.change;
        timeline.push(Math.max(currentCount, 0));
      });
      const data = timeline.slice(-6);
      while (data.length < 6) data.unshift(0);
      return data;
    }
    if (type === "tasks") {
      const events: { date: Date; change: number }[] = [];
      tasks.forEach((t) => {
        events.push({ date: new Date(t.createdAt), change: 1 });
        if (t.status === "done") {
          const compDate = new Date(t.updatedAt || t.createdAt);
          events.push({ date: compDate, change: -1 });
        }
      });
      events.sort((a, b) => a.date.getTime() - b.date.getTime());
      let currentCount = 0;
      const timeline: number[] = [];
      events.forEach((ev) => {
        currentCount += ev.change;
        timeline.push(Math.max(currentCount, 0));
      });
      const data = timeline.slice(-6);
      while (data.length < 6) data.unshift(0);
      return data;
    }
    if (type === "completed") {
      const events: { date: Date }[] = [];
      tasks.forEach((t) => {
        if (t.status === "done") {
          events.push({ date: new Date(t.updatedAt || t.createdAt) });
        }
      });
      orders.forEach((o) => {
        if (o.deleted) return;
        if (o.stage === "delivered" || o.stage === "paid" || o.approved) {
          const compDate = new Date(o.approvedAt || o.updatedAt || o.createdAt);
          events.push({ date: compDate });
        }
      });
      events.sort((a, b) => a.date.getTime() - b.date.getTime());
      let cumulativeCount = 0;
      const timeline: number[] = [];
      events.forEach(() => {
        cumulativeCount += 1;
        timeline.push(cumulativeCount);
      });
      const data = timeline.slice(-6);
      while (data.length < 6) data.unshift(0);
      return data;
    }
    return [0, 0, 0, 0, 0, 0];
  };

  const renderMiniBarChart = (data: number[], colorClass: string) => {
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min;
    return (
      <svg className="w-16 h-10 overflow-visible" viewBox="0 0 64 40">
        {data.map((val, idx) => {
          const barHeight = range > 0 ? ((val - min) / range) * 28 : 10;
          const x = idx * 10.5;
          const y = 36 - barHeight;
          return (
            <rect
              key={idx}
              x={x}
              y={y}
              width="6.5"
              height={Math.max(barHeight, 2)}
              rx="1.5"
              className={colorClass}
            />
          );
        })}
      </svg>
    );
  };

  const renderMiniLineChart = (data: number[], strokeColor: string, fillGradientId: string) => {
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min;
    const points = data.map((val, idx) => {
      const x = idx * 11.5;
      const y = range > 0 ? 34 - ((val - min) / range) * 28 : 20;
      return { x, y };
    });
    let lineD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p = points[i];
      const cpX1 = p0.x + (p.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p.x - p0.x) / 2;
      const cpY2 = p.y;
      lineD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }
    const areaD = `${lineD} L ${points[points.length - 1].x} 38 L ${points[0].x} 38 Z`;
    return (
      <svg className="w-16 h-10 overflow-visible" viewBox="0 0 64 40">
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${fillGradientId})`} />
        <path d={lineD} fill="none" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill={strokeColor} />
      </svg>
    );
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
                      Due: {formatNepali(task.dueDate)}
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
            {/* Total Sales Card */}
            <div className="bg-card border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted font-bold uppercase tracking-wider block">Total Sales</span>
                    <span className="text-[9px] font-semibold text-muted bg-muted/20 px-1.5 py-0.5 rounded border border-border/50">Product Only</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground leading-none">Rs. {totalSales.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                  <DollarSign size={16} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted font-medium">Excl. delivery & fitting</span>
                </div>
                {renderMiniBarChart(getSparklineData("sales"), "fill-emerald-500/80 hover:fill-emerald-500 transition-colors")}
              </div>
            </div>

            {/* Active Orders Card */}
            <div className="bg-card border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider block">Active Orders</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground leading-none">{activeOrdersCount}</h3>
                </div>
                <div className="p-2 bg-accent text-white rounded-xl shadow-xs shrink-0">
                  <Package size={16} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="bg-accent text-white px-1.5 py-0.5 rounded text-[9px] font-bold shadow-xs">
                    ↓ 4.8%
                  </span>
                  <span className="text-[10px] text-muted font-medium">vs last week</span>
                </div>
                {renderMiniBarChart(getSparklineData("orders"), "fill-accent/80 hover:fill-accent transition-colors")}
              </div>
            </div>

            {/* Pending Tasks Card */}
            <div className="bg-card border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider block">Pending Tasks</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground leading-none">{pendingTasks.length}</h3>
                </div>
                <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs shrink-0">
                  <Clock size={16} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="bg-amber-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold shadow-xs">
                    ↓ 15.2%
                  </span>
                  <span className="text-[10px] text-muted font-medium">vs yesterday</span>
                </div>
                {renderMiniLineChart(getSparklineData("tasks"), "#d97706", "amber-spark")}
              </div>
            </div>

            {/* Completed Work Card */}
            <div className="bg-card border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted font-bold uppercase tracking-wider block">Completed Work</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground leading-none">{completedTasksCount + approvedOrders.length}</h3>
                </div>
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
                  <CheckCircle size={16} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold shadow-xs">
                    ↑ 8.3%
                  </span>
                  <span className="text-[10px] text-muted font-medium">vs last week</span>
                </div>
                {renderMiniLineChart(getSparklineData("completed"), "#2563eb", "blue-spark")}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Delivery Charges */}
            <div className="bg-card border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all p-5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted font-bold uppercase tracking-wider block">Total Delivery Charges</span>
                <h3 className="text-xl sm:text-2xl font-extrabold font-display text-blue-600 dark:text-blue-400">Rs. {totalDeliveryCharges.toLocaleString()}</h3>
                <p className="text-[10px] text-muted">Separate delivery fees (not in Total Sales)</p>
              </div>
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xs">
                <Truck size={22} />
              </div>
            </div>

            {/* Total Fitting Charges */}
            <div className="bg-card border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all p-5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted font-bold uppercase tracking-wider block">Total Fitting Charges</span>
                <h3 className="text-xl sm:text-2xl font-extrabold font-display text-purple-600 dark:text-purple-400">Rs. {totalFittingCharges.toLocaleString()}</h3>
                <p className="text-[10px] text-muted">Separate installation fees (not in Total Sales)</p>
              </div>
              <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-xs">
                <Wrench size={22} />
              </div>
            </div>

            {/* Outstanding Receivables */}
            <div 
              onClick={() => setShowOutstandingModal(true)}
              className="bg-card border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all p-5 rounded-2xl flex items-center justify-between cursor-pointer hover:border-red-500/30 hover:bg-red-500/[0.01] group"
            >
              <div className="space-y-1">
                <span className="text-xs text-muted font-bold uppercase tracking-wider block group-hover:text-red-500 transition-colors">Total Outstanding Due</span>
                <h3 className="text-xl sm:text-2xl font-extrabold font-display text-red-500">Rs. {totalDuePayment.toLocaleString()}</h3>
                <p className="text-[10px] text-muted">Receivables remaining from active/completed orders (Click to view)</p>
              </div>
              <div className="p-3 bg-red-600 text-white rounded-2xl shadow-xs group-hover:scale-105 transition-transform">
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // STAFF PERSONAL METRICS CARD
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs text-muted font-bold uppercase tracking-wider block">Your Pending Tasks</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-amber-500 leading-none">{staffPendingTasks.length}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-amber-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold shadow-xs">
                  Active
                </span>
                <span className="text-[10px] text-muted font-medium">Awaiting completion</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-xs">
                <Clock size={20} />
              </div>
              {renderMiniLineChart(getSparklineData("tasks"), "#d97706", "staff-tasks-spark")}
            </div>
          </div>

          <div className="bg-card border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs text-muted font-bold uppercase tracking-wider block">Your Completed Tasks</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-green-500 leading-none">{staffCompletedTasks.length}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold shadow-xs">
                  Completed
                </span>
                <span className="text-[10px] text-muted font-medium">Finished work items</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                <CheckCircle size={20} />
              </div>
              {renderMiniLineChart(getSparklineData("completed"), "#10b981", "staff-completed-spark")}
            </div>
          </div>

          <div className="bg-card border border-border/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all p-5 rounded-2xl flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs text-muted font-bold uppercase tracking-wider block">Marketing Hub</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-blue-500 leading-none">{campaigns.length}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold shadow-xs">
                  Active
                </span>
                <span className="text-[10px] text-muted font-medium">Coordinated campaigns</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                <FileText size={20} />
              </div>
              {renderMiniBarChart([4, 5, 3, 6, 4, campaigns.length], "fill-blue-500/80 hover:fill-blue-500 transition-colors")}
            </div>
          </div>
        </div>
      )}

      {/* FINANCIAL & INVENTORY OVERVIEW CARD SECTION */}
      {user?.role === "admin" && (
        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Expenses Overview Card */}
            <div className="bg-card border border-border/80 rounded-2xl shadow-sm p-6 flex flex-col justify-between h-[240px]">
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
            <div className="bg-card border border-border/80 rounded-2xl shadow-sm p-6 flex flex-col justify-between h-[240px]">
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
            <div className="bg-card border border-border/80 rounded-2xl shadow-sm p-6 flex flex-col justify-between h-[240px]">
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
          <div className="bg-card border border-border/80 rounded-2xl shadow-sm p-6 bg-accent/[0.01]">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-4 mb-4 gap-4">
              <div>
                <h3 className="font-bold text-base font-display flex items-center gap-2">
                  <FileText className="text-accent" size={20} />
                  Financial Statements & Exports
                </h3>
                <p className="text-xs text-muted mt-1">
                  Generate and download monthly CSV statements or inventory CSV reports at any time.
                </p>
              </div>

              {/* Date Filters (Nepali BS) & PDF Preview */}
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Nepali Month</span>
                  <select
                    value={exportMonth}
                    onChange={(e) => setExportMonth(e.target.value)}
                    className="bg-card border border-border text-foreground text-xs rounded px-3 py-1.5 focus:outline-none focus:border-accent font-semibold cursor-pointer"
                  >
                    <option value="all">All Time (सम्पूर्ण)</option>
                    {NEPALI_MONTHS.map((m) => (
                      <option key={m.value} value={m.value.toString()}>
                        {m.name} ({m.nepaliName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Nepali Year (BS)</span>
                  <select
                    value={exportYear}
                    onChange={(e) => setExportYear(e.target.value)}
                    className="bg-card border border-border text-foreground text-xs rounded px-3 py-1.5 focus:outline-none focus:border-accent font-semibold cursor-pointer"
                  >
                    {NEPALI_YEARS.map((y) => (
                      <option key={y} value={y.toString()}>
                        {y} BS
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handlePreviewStatement("all")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FE914C] hover:bg-[#E2752D] text-white rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Open printable statement preview modal"
                >
                  <Printer size={14} />
                  <span>Preview / Print PDF</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Combined Statement */}
              <div className="p-4 rounded-xl border border-border/80 bg-card hover:border-accent hover:shadow-md transition-all flex flex-col items-center justify-between text-center group">
                <div className="flex flex-col items-center">
                  <div className="p-2.5 bg-accent text-white rounded-xl shadow-xs mb-2 group-hover:scale-105 transition-transform">
                    <FileText size={18} />
                  </div>
                  <span className="text-xs font-bold text-foreground">Combined Statement</span>
                  <span className="text-[9px] text-muted mt-0.5">Sales, expenses & procurement</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 w-full">
                  <button
                    onClick={() => handlePreviewStatement("all")}
                    className="flex-1 py-1 px-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={12} />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => handleExport("all")}
                    disabled={exportingType !== null}
                    className="py-1 px-2 rounded-lg border border-border bg-background hover:bg-accent/[0.05] text-[11px] font-bold text-foreground transition-colors"
                    title="Download CSV"
                  >
                    {exportingType === "all" ? "..." : "CSV"}
                  </button>
                </div>
              </div>

              {/* Sales Only */}
              <div className="p-4 rounded-xl border border-border/80 bg-card hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center justify-between text-center group">
                <div className="flex flex-col items-center">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs mb-2 group-hover:scale-105 transition-transform">
                    <TrendingUp size={18} />
                  </div>
                  <span className="text-xs font-bold text-foreground">Sales Only</span>
                  <span className="text-[9px] text-muted mt-0.5">Revenue ledger & invoices</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 w-full">
                  <button
                    onClick={() => handlePreviewStatement("sales")}
                    className="flex-1 py-1 px-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={12} />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => handleExport("sales")}
                    disabled={exportingType !== null}
                    className="py-1 px-2 rounded-lg border border-border bg-background hover:bg-blue-500/10 text-[11px] font-bold text-foreground transition-colors"
                    title="Download CSV"
                  >
                    {exportingType === "sales" ? "..." : "CSV"}
                  </button>
                </div>
              </div>

              {/* Expenses Only */}
              <div className="p-4 rounded-xl border border-border/80 bg-card hover:border-red-500 hover:shadow-md transition-all flex flex-col items-center justify-between text-center group">
                <div className="flex flex-col items-center">
                  <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-xs mb-2 group-hover:scale-105 transition-transform">
                    <DollarSign size={18} />
                  </div>
                  <span className="text-xs font-bold text-foreground">Expenses Only</span>
                  <span className="text-[9px] text-muted mt-0.5">Salaries, rent & utilities</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 w-full">
                  <button
                    onClick={() => handlePreviewStatement("expenses")}
                    className="flex-1 py-1 px-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={12} />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => handleExport("expenses")}
                    disabled={exportingType !== null}
                    className="py-1 px-2 rounded-lg border border-border bg-background hover:bg-red-500/10 text-[11px] font-bold text-foreground transition-colors"
                    title="Download CSV"
                  >
                    {exportingType === "expenses" ? "..." : "CSV"}
                  </button>
                </div>
              </div>

              {/* Purchases Only */}
              <div className="p-4 rounded-xl border border-border/80 bg-card hover:border-amber-500 hover:shadow-md transition-all flex flex-col items-center justify-between text-center group">
                <div className="flex flex-col items-center">
                  <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-xs mb-2 group-hover:scale-105 transition-transform">
                    <Briefcase size={18} />
                  </div>
                  <span className="text-xs font-bold text-foreground">Purchases Only</span>
                  <span className="text-[9px] text-muted mt-0.5">Raw materials & procurement</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 w-full">
                  <button
                    onClick={() => handlePreviewStatement("purchases")}
                    className="flex-1 py-1 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={12} />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => handleExport("purchases")}
                    disabled={exportingType !== null}
                    className="py-1 px-2 rounded-lg border border-border bg-background hover:bg-amber-500/10 text-[11px] font-bold text-foreground transition-colors"
                    title="Download CSV"
                  >
                    {exportingType === "purchases" ? "..." : "CSV"}
                  </button>
                </div>
              </div>

              {/* Inventory Catalog */}
              <div className="p-4 rounded-xl border border-border/80 bg-card hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center justify-between text-center group sm:col-span-2 lg:col-span-1">
                <div className="flex flex-col items-center">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs mb-2 group-hover:scale-105 transition-transform">
                    <Package size={18} />
                  </div>
                  <span className="text-xs font-bold text-foreground">Inventory Catalog</span>
                  <span className="text-[9px] text-muted mt-0.5">Raw materials & stocks</span>
                </div>
                <button
                  onClick={() => handleExport("inventory")}
                  disabled={exportingType !== null}
                  className="w-full mt-3 py-1 px-2 rounded-lg border border-border bg-background hover:bg-emerald-500/10 text-[11px] font-bold text-foreground transition-colors"
                >
                  {exportingType === "inventory" ? "Exporting..." : "Export CSV"}
                </button>
              </div>
            </div>

            {/* Archived Monthly Combined Statements */}
            {user?.role === "admin" && statementArchives.filter((a) => a.type === "all").length > 0 && (
              <div className="mt-6 border-t border-border pt-4">
                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calendar size={14} className="text-accent" />
                  Archived Monthly Combined Statements (PDF & CSV)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {statementArchives
                    .filter((a) => a.type === "all")
                    .map((archive) => (
                      <div
                        key={archive._id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card hover:border-accent/40 hover:shadow-sm transition-all group"
                      >
                        <button
                          onClick={() => handlePreviewArchive(archive._id)}
                          className="flex items-center gap-3 min-w-0 text-left flex-1"
                          title="Preview / Print PDF"
                        >
                          <div className="p-2 bg-accent text-white rounded-lg shadow-xs group-hover:scale-105 transition-transform">
                            <FileText size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">
                              Combined Statement
                            </p>
                            <p className="text-[10px] text-muted font-medium mt-0.5">
                              {formatArchiveStatementLabel(archive)}
                            </p>
                          </div>
                        </button>

                        <button
                          onClick={() => downloadArchive(archive._id, archive.filename)}
                          className="p-1.5 text-muted hover:text-accent rounded-lg hover:bg-accent/10 transition-colors ml-2"
                          title="Download CSV file"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECONDARY ROW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: STAFF LIST (ADMIN) / TODAY'S SCHEDULE (STAFF) */}
        <div className="bg-card border border-border/80 rounded-2xl shadow-sm p-6 flex flex-col h-[400px]">
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
                  className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/60 shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{staff.name}</h4>
                    <span className="text-[10px] text-muted font-semibold">
                      {staff.pending} tasks remaining
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="border border-green-500/20 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-green-500/5">
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
                  className="p-4 bg-background border border-border/60 rounded-xl hover:border-accent hover:shadow-md cursor-pointer transition-all duration-200"
                >
                  <h4 className="font-bold text-sm line-clamp-1 text-foreground">{task.title}</h4>
                  <p className="text-xs text-muted mt-1 line-clamp-1 font-medium">
                    {task.description || "No description."}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span
                      className={`text-[9px] px-2.5 py-1 rounded-lg font-bold uppercase border ${
                        task.priority === "high"
                          ? "border-red-500/25 text-red-600 dark:text-red-400 bg-red-500/5"
                          : task.priority === "medium"
                          ? "border-amber-500/25 text-amber-600 dark:text-amber-400 bg-amber-500/5"
                          : "border-green-500/25 text-green-600 dark:text-green-400 bg-green-500/5"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-muted font-semibold">
                      Due: {formatNepali(task.dueDate)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: LIVE ACTIVITY LOG (ADMIN) / OR FOCUS MODE NOTIFICATION BAR */}
        {user?.role === "admin" ? (
          <div className="bg-card border border-border/80 rounded-2xl shadow-sm p-6 flex flex-col h-[400px]">
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
                  <div key={act._id} className="p-4 bg-background border border-border/60 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-extrabold text-accent">{act.user?.name || "Deleted User"}</span>
                      <span className="text-[10px] text-muted font-medium">
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <span className="font-extrabold text-foreground uppercase tracking-wider block text-[9px] mb-1">
                      {act.action}
                    </span>
                    <p className="text-muted leading-relaxed font-medium">{act.details}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border/80 rounded-2xl shadow-sm p-6 flex flex-col h-[400px]">
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
                    className="p-4 bg-background border border-border/60 rounded-xl hover:border-accent hover:shadow-md cursor-pointer transition-all duration-200"
                  >
                    <h4 className="font-bold text-sm line-clamp-1 text-foreground">{task.title}</h4>
                    <p className="text-xs text-muted mt-1 line-clamp-1 font-medium">
                      {task.description || "No description."}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[9px] border border-green-500/25 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-lg font-bold uppercase bg-green-500/5">
                        Completed
                      </span>
                      <span className="text-[10px] text-muted font-semibold">
                        Due: {formatNepali(task.dueDate)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: QUICK NOTES STICKY REMINDERS */}
        <div className="bg-card border border-border/80 rounded-2xl shadow-sm p-6 flex flex-col h-[400px]">
          <h2 className="text-base font-bold font-display border-b border-border pb-3 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText size={18} className="text-accent" />
              Quick-Notes Widget
            </span>
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="p-1.5 rounded-full hover:bg-border text-accent transition-colors"
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
                  className="flex-1 px-4 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  placeholder="Type note and hit enter..."
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-white text-xs font-bold rounded-xl hover:bg-accent-dark transition-all shadow-md shadow-accent/15"
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
                <p className="text-sm font-medium">No personal notes created yet. Click the + button above to add one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {safeQuickNotes.map((note, index) => {
                  const colorClass = stickyColors[index % stickyColors.length];
                  return (
                    <div
                      key={note._id}
                      className={`p-4 rounded-xl border flex flex-col justify-between min-h-[105px] shadow-sm transition-all duration-200 hover:scale-[1.02] ${colorClass}`}
                    >
                      <p className="text-xs font-bold leading-normal break-words">
                        {note.text}
                      </p>
                      <div className="flex justify-between items-center mt-3 border-t border-black/5 dark:border-white/5 pt-2 text-[9px] opacity-80">
                        <span className="font-extrabold">
                          By {note.createdBy?.name?.split(" ")[0] || "Staff"}
                        </span>
                        <button
                          onClick={() => deleteQuickNote(note._id)}
                          className="p-1 rounded hover:bg-black/10 text-inherit opacity-75 hover:opacity-100 transition-all"
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
        <RevenueGrowthChart
          sales={safeSales}
          orders={orders}
          completedTasks={completedTasks}
          title="Revenue Over Time"
        />
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
        <div className="modal-overlay fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 sm:p-4 overflow-y-auto">
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
                    className="bg-card border border-border/60 p-4 rounded-xl flex items-center justify-between hover:border-red-500/30 hover:bg-red-500/[0.02] hover:shadow-md cursor-pointer transition-all duration-200 group"
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
                        <div className="text-[9px] text-muted font-semibold">
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

      {/* Statement PDF Preview Modal */}
      <StatementPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        data={previewData}
        loading={previewLoading}
        onDownloadCsv={() => {
          if (previewData) handleExport(previewData.type);
        }}
      />
    </div>
  );
};
