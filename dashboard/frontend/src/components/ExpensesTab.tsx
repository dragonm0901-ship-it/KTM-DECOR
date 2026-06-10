import React, { useState } from "react";
import { useStore, Expense } from "../store/useStore";
import {
  DollarSign,
  Plus,
  Trash2,
  Search,
  X,
  Calendar,
  User,
  TrendingUp,
  Edit2,
  Eye
} from "./ui/solar-icons";

export const ExpensesTab: React.FC = () => {
  const { expenses, sales, createExpense, updateExpense, deleteExpense, user, exportStatement } = useStore();

  // Statement Export States
  const [exportMonth, setExportMonth] = useState((new Date().getMonth() + 1).toString());
  const [exportYear, setExportYear] = useState(new Date().getFullYear().toString());
  const [exporting, setExporting] = useState(false);

  const handleExportClick = async () => {
    setExporting(true);
    try {
      await exportStatement("expenses", exportMonth, exportYear);
    } catch (err) {
      alert("Failed to export expenses statement: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setExporting(false);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Expense["category"]>("salary");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Normalized category resolver for backward compatibility
  const getNormalizedCategory = (cat: string): Expense["category"] => {
    if (cat === "wages_salaries" || cat === "salary") return "salary";
    if (cat === "rent_utilities" || cat === "rent") return "rent";
    if (cat === "logistics_fuel" || cat === "travel") return "travel";
    if (cat === "food") return "food";
    return "miscellaneous"; // defaults and other types mapped here
  };

  // Calculations
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Filtered List
  const filteredExpenses = expenses.filter((e) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      e.title.toLowerCase().includes(query) ||
      (e.description && e.description.toLowerCase().includes(query));

    const normCat = getNormalizedCategory(e.category);
    const matchesCategory = categoryFilter === "all" || normCat === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setTitle("");
    setCategory("salary");
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setTitle(expense.title);
    setCategory(getNormalizedCategory(expense.category));
    setAmount(String(expense.amount));
    setDescription(expense.description || "");
    setDate(new Date(expense.date).toISOString().split("T")[0]);
    setFormError("");
    setShowModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim() || !category || !amount.trim()) {
      setFormError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingExpense) {
        // Update existing expense
        await updateExpense(editingExpense._id, {
          title,
          category,
          amount: Number(amount),
          description,
          date
        });
      } else {
        // Create new expense
        await createExpense({
          title,
          category,
          amount: Number(amount),
          description,
          date
        });
      }
      setShowModal(false);
      setEditingExpense(null);
    } catch (err: any) {
      setFormError(err.message || "Failed to save expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense log?")) {
      try {
        await deleteExpense(id);
      } catch (err) {
        console.error("Failed to delete expense log", err);
      }
    }
  };

  const getCategoryLabel = (cat: string) => {
    const norm = getNormalizedCategory(cat);
    switch (norm) {
      case "salary":
        return "Salary & Wages";
      case "rent":
        return "Rent & Utilities";
      case "travel":
        return "Travel & Transport";
      case "food":
        return "Food & Catering";
      case "miscellaneous":
        return "Miscellaneous";
      default:
        return norm;
    }
  };

  const getCategoryBadge = (cat: string) => {
    const norm = getNormalizedCategory(cat);
    switch (norm) {
      case "salary":
        return "bg-purple-600 border-purple-600 text-white";
      case "rent":
        return "bg-pink-600 border-pink-600 text-white";
      case "travel":
        return "bg-blue-600 border-blue-600 text-white";
      case "food":
        return "bg-amber-600 border-amber-600 text-white";
      default:
        return "bg-zinc-600 border-zinc-600 text-white";
    }
  };

  // ──── PIE/DONUT CHART SEGMENTS CALCULATION ────
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent - Math.PI / 2);
    const y = Math.sin(2 * Math.PI * percent - Math.PI / 2);
    return [x, y];
  };

  const salarySum = expenses.reduce((sum, e) => sum + (getNormalizedCategory(e.category) === "salary" ? e.amount : 0), 0);
  const rentSum = expenses.reduce((sum, e) => sum + (getNormalizedCategory(e.category) === "rent" ? e.amount : 0), 0);
  const travelSum = expenses.reduce((sum, e) => sum + (getNormalizedCategory(e.category) === "travel" ? e.amount : 0), 0);
  const foodSum = expenses.reduce((sum, e) => sum + (getNormalizedCategory(e.category) === "food" ? e.amount : 0), 0);
  const miscSum = expenses.reduce((sum, e) => sum + (getNormalizedCategory(e.category) === "miscellaneous" ? e.amount : 0), 0);
  const totalCategorySum = salarySum + rentSum + travelSum + foodSum + miscSum || 1;

  const categoriesData = [
    { key: "salary", label: "Salary & Wages", value: salarySum, color: "#9333EA", hoverColor: "#A855F7" },
    { key: "rent", label: "Rent & Utilities", value: rentSum, color: "#EC4899", hoverColor: "#F472B6" },
    { key: "travel", label: "Travel & Transport", value: travelSum, color: "#2563EB", hoverColor: "#3B82F6" },
    { key: "food", label: "Food & Catering", value: foodSum, color: "#D97706", hoverColor: "#F59E0B" },
    { key: "miscellaneous", label: "Miscellaneous", value: miscSum, color: "#71717A", hoverColor: "#94A3B8" }
  ].filter(c => c.value > 0);

  let accumulatedPercent = 0;
  const segments = categoriesData.map((data) => {
    const percent = data.value / totalCategorySum;
    const startPercent = accumulatedPercent;
    const endPercent = accumulatedPercent + percent;
    accumulatedPercent = endPercent;

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);

    const largeArcFlag = percent > 0.5 ? 1 : 0;

    const scaleStartX = 60 + startX * 40;
    const scaleStartY = 60 + startY * 40;
    const scaleEndX = 60 + endX * 40;
    const scaleEndY = 60 + endY * 40;

    const pathData = [
      `M ${scaleStartX} ${scaleStartY}`,
      `A 40 40 0 ${largeArcFlag} 1 ${scaleEndX} ${scaleEndY}`
    ].join(" ");

    return {
      ...data,
      pathData,
      percent: Math.round(percent * 100)
    };
  });

  // ──── DOUBLE LINE GRAPH: SALES VS EXPENSES TREND ────
  const getTrendData = () => {
    const allDatesMap: { [key: string]: { sales: number; expenses: number } } = {};

    sales.forEach((s) => {
      const dateStr = new Date(s.date).toISOString().split("T")[0];
      if (!allDatesMap[dateStr]) allDatesMap[dateStr] = { sales: 0, expenses: 0 };
      allDatesMap[dateStr].sales += s.amount;
    });

    expenses.forEach((e) => {
      const dateStr = new Date(e.date).toISOString().split("T")[0];
      if (!allDatesMap[dateStr]) allDatesMap[dateStr] = { sales: 0, expenses: 0 };
      allDatesMap[dateStr].expenses += e.amount;
    });

    const sortedDates = Object.keys(allDatesMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    let cumSales = 0;
    let cumExpenses = 0;
    const points = sortedDates.map((date) => {
      cumSales += allDatesMap[date].sales;
      cumExpenses += allDatesMap[date].expenses;
      return {
        date,
        label: new Date(date).toLocaleDateString([], { month: "short", day: "numeric" }),
        salesVal: cumSales,
        expensesVal: cumExpenses
      };
    });

    if (points.length === 0) {
      points.push({ date: "Today", label: "Today", salesVal: 0, expensesVal: 0 });
    }

    return points;
  };

  const trendData = getTrendData();
  const maxTrendVal = Math.max(...trendData.map((d) => Math.max(d.salesVal, d.expensesVal)), 1000);

  const svgWidth = 600;
  const svgHeight = 160;
  const paddingX = 55;
  const paddingY = 20;

  const getCoordinates = () => {
    return trendData.map((d, index) => {
      const x = paddingX + (index / (trendData.length - 1 || 1)) * (svgWidth - 2 * paddingX);
      const ySales = (svgHeight - paddingY) - (d.salesVal / maxTrendVal) * (svgHeight - 2 * paddingY);
      const yExpenses = (svgHeight - paddingY) - (d.expensesVal / maxTrendVal) * (svgHeight - 2 * paddingY);
      return { x, ySales, yExpenses, label: d.label, salesVal: d.salesVal, expensesVal: d.expensesVal };
    });
  };

  const trendCoords = getCoordinates();

  let salesLinePath = "";
  let salesAreaPath = "";
  let expensesLinePath = "";
  let expensesAreaPath = "";

  if (trendCoords.length > 0) {
    salesLinePath = `M ${trendCoords[0].x} ${trendCoords[0].ySales}`;
    expensesLinePath = `M ${trendCoords[0].x} ${trendCoords[0].yExpenses}`;

    for (let i = 1; i < trendCoords.length; i++) {
      const p0 = trendCoords[i - 1];
      const p = trendCoords[i];
      const cpX1 = p0.x + (p.x - p0.x) / 2;
      const cpY1Sales = p0.ySales;
      const cpX2 = p0.x + (p.x - p0.x) / 2;
      const cpY2Sales = p.ySales;

      salesLinePath += ` C ${cpX1} ${cpY1Sales}, ${cpX2} ${cpY2Sales}, ${p.x} ${p.ySales}`;

      const cpY1Expenses = p0.yExpenses;
      const cpY2Expenses = p.yExpenses;
      expensesLinePath += ` C ${cpX1} ${cpY1Expenses}, ${cpX2} ${cpY2Expenses}, ${p.x} ${p.yExpenses}`;
    }

    salesAreaPath = `${salesLinePath} L ${trendCoords[trendCoords.length - 1].x} ${svgHeight - paddingY} L ${trendCoords[0].x} ${svgHeight - paddingY} Z`;
    expensesAreaPath = `${expensesLinePath} L ${trendCoords[trendCoords.length - 1].x} ${svgHeight - paddingY} L ${trendCoords[0].x} ${svgHeight - paddingY} Z`;
  }

  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<any>(null);

  const handleTrendMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (trendCoords.length === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
    
    let closest = trendCoords[0];
    let minDiff = Math.abs(mouseX - trendCoords[0].x);
    
    for (let i = 1; i < trendCoords.length; i++) {
      const diff = Math.abs(mouseX - trendCoords[i].x);
      if (diff < minDiff) {
        minDiff = diff;
        closest = trendCoords[i];
      }
    }
    
    setHoveredTrendPoint(closest);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card p-4 rounded-lg border border-border">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <DollarSign className="text-accent" />
            Expenses Log
          </h1>
          <p className="text-xs text-muted mt-1">
            Track business operating costs, salary payments, rent, utility bills, and other overheads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Quick Statement Download */}
          <div className="flex items-center gap-2 bg-border/20 p-2 rounded-md border border-border/40">
            <select
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
              className="bg-card border border-border text-foreground text-[11px] rounded px-2 py-1.5 focus:outline-none focus:border-accent font-semibold"
            >
              <option value="all">All Time</option>
              <option value="1">Jan</option>
              <option value="2">Feb</option>
              <option value="3">Mar</option>
              <option value="4">Apr</option>
              <option value="5">May</option>
              <option value="6">Jun</option>
              <option value="7">Jul</option>
              <option value="8">Aug</option>
              <option value="9">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>
            <select
              value={exportYear}
              onChange={(e) => setExportYear(e.target.value)}
              className="bg-card border border-border text-foreground text-[11px] rounded px-2 py-1.5 focus:outline-none focus:border-accent font-semibold"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
            <button
              onClick={handleExportClick}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/90 text-white text-[11px] rounded font-bold hover:bg-accent-dark transition-all disabled:opacity-50"
            >
              {exporting ? "Exporting..." : "Export XLSX"}
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 py-2 px-4 bg-accent hover:bg-accent-dark text-white rounded font-bold text-xs transition-all shadow-md shadow-accent/15 self-start md:self-auto h-9"
          >
            <Plus size={16} />
            Log New Expense
          </button>
        </div>
      </div>

      {/* Pie Chart & Overall summary layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Overall Expenses Panel */}
        <div className="glass-panel p-6 rounded-lg flex flex-col justify-between border border-border h-[220px]">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <DollarSign size={22} />
            </div>
            <div>
              <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Total Overall Expenses</span>
              <h3 className="text-2xl font-extrabold mt-1 text-foreground font-display">Rs. {totalExpenses.toLocaleString()}</h3>
              <p className="text-[9px] text-muted mt-0.5">{expenses.length} logs recorded</p>
            </div>
          </div>

          <div className="border-t border-border/60 pt-4 mt-2">
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-2">Category distribution</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-semibold text-muted">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-600" /> Salary</span>
                <span className="text-foreground">Rs. {salarySum.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-pink-600" /> Rent</span>
                <span className="text-foreground">Rs. {rentSum.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-600" /> Travel</span>
                <span className="text-foreground">Rs. {travelSum.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-600" /> Food</span>
                <span className="text-foreground">Rs. {foodSum.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-zinc-600" /> Misc</span>
                <span className="text-foreground">Rs. {miscSum.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Donut Chart Panel */}
        <div className="glass-panel p-5 rounded-lg flex items-center justify-around border border-border lg:col-span-2 h-[220px]">
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider mb-2">Expense Categories</span>
            <div className="space-y-2">
              {categoriesData.length === 0 ? (
                <span className="text-xs text-muted italic">No expenses logged yet</span>
              ) : (
                categoriesData.map((seg) => {
                  const pct = Math.round((seg.value / totalCategorySum) * 100);
                  return (
                    <div key={seg.key} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                      <span className="text-xs font-bold text-foreground">{seg.label}:</span>
                      <span className="text-xs font-medium text-muted">Rs. {seg.value.toLocaleString()} ({pct}%)</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="relative h-40 w-40 flex items-center justify-center">
            {categoriesData.length === 0 ? (
              <svg viewBox="0 0 120 120" className="h-full w-full">
                <circle cx="60" cy="60" r="40" fill="none" stroke="var(--border)" strokeWidth="12" />
                <text x="60" y="64" textAnchor="middle" fill="var(--muted)" fontSize="9" className="font-bold">NO DATA</text>
              </svg>
            ) : (
              <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible">
                {segments.map((seg, idx) => (
                  <path
                    key={idx}
                    d={seg.pathData}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="14"
                    strokeLinecap="butt"
                    className="transition-all hover:stroke-amber-500 cursor-pointer"
                    style={{ transition: "stroke 0.2s" }}
                  >
                    <title>{`${seg.label}: ${seg.percent}%`}</title>
                  </path>
                ))}
                <circle cx="60" cy="60" r="32" fill="var(--card)" />
                <text x="60" y="63" textAnchor="middle" fill="var(--foreground)" fontSize="8" className="font-extrabold uppercase tracking-wider">
                  Breakdown
                </text>
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Double Line Graph: Sales vs Expenses Trend */}
      <div className="glass-panel p-5 rounded-lg border border-border relative overflow-hidden transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h3 className="font-bold text-sm font-display flex items-center gap-1.5">
              <TrendingUp size={16} className="text-accent" />
              Sales & Expenses Growth Trend
            </h3>
            <p className="text-[10px] text-muted">Fluid double curve tracking cumulative revenue vs. costs</p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-muted text-[10px]">Cumulative Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-muted text-[10px]">Cumulative Expenses</span>
            </div>
          </div>
        </div>

        <div className="relative w-full h-[180px]">
          {trendCoords.length <= 1 ? (
            <div className="h-full flex items-center justify-center text-muted text-xs border border-dashed border-border/40 rounded">
              Insufficient transaction points to render growth trends
            </div>
          ) : (
            <>
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full overflow-visible select-none"
                onMouseMove={handleTrendMouseMove}
                onMouseLeave={() => setHoveredTrendPoint(null)}
              >
                <defs>
                  <linearGradient id="sales-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="exp-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                {[0.25, 0.5, 0.75, 1.0].map((ratio, index) => {
                  const yVal = svgHeight - paddingY - ratio * (svgHeight - 2 * paddingY);
                  const valLabel = Math.round(ratio * maxTrendVal);
                  return (
                    <g key={index} className="opacity-30">
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
                        Rs. {valLabel >= 1000 ? `${(valLabel / 1000).toFixed(0)}k` : valLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Areas */}
                {salesAreaPath && <path d={salesAreaPath} fill="url(#sales-grad)" className="transition-all duration-300" />}
                {expensesAreaPath && <path d={expensesAreaPath} fill="url(#exp-grad)" className="transition-all duration-300" />}

                {/* Sales Bezier Line */}
                {salesLinePath && (
                  <path
                    d={salesLinePath}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                )}

                {/* Expenses Bezier Line */}
                {expensesLinePath && (
                  <path
                    d={expensesLinePath}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                )}

                {/* X Axis Date labels */}
                {trendCoords.map((c, index) => {
                  const showLabel = index === 0 || index === trendCoords.length - 1 || (trendCoords.length > 2 && index === Math.floor(trendCoords.length / 2));
                  if (!showLabel) return null;
                  return (
                    <text
                      key={index}
                      x={c.x}
                      y={svgHeight - 4}
                      fill="var(--muted)"
                      fontSize="8"
                      className="font-semibold"
                      textAnchor="middle"
                    >
                      {c.label}
                    </text>
                  );
                })}

                {/* Hover line tracker */}
                {hoveredTrendPoint && (
                  <line
                    x1={hoveredTrendPoint.x}
                    y1={paddingY}
                    x2={hoveredTrendPoint.x}
                    y2={svgHeight - paddingY}
                    stroke="var(--border)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Hover circles */}
                {hoveredTrendPoint && (
                  <g>
                    {/* Sales Dot */}
                    <circle cx={hoveredTrendPoint.x} cy={hoveredTrendPoint.ySales} r="4.5" fill="#10B981" stroke="var(--card)" strokeWidth="1.5" />
                    {/* Expenses Dot */}
                    <circle cx={hoveredTrendPoint.x} cy={hoveredTrendPoint.yExpenses} r="4.5" fill="#EF4444" stroke="var(--card)" strokeWidth="1.5" />
                  </g>
                )}
              </svg>

              {/* Tooltip Popup */}
              {hoveredTrendPoint && (
                <div
                  className="absolute bg-card border border-border p-2.5 rounded shadow-2xl text-[10px] pointer-events-none select-none z-30 space-y-1 min-w-[140px]"
                  style={{
                    left: `${(hoveredTrendPoint.x / svgWidth) * 100}%`,
                    top: `10%`,
                    transform: "translateX(-50%)"
                  }}
                >
                  <span className="text-[8px] text-muted font-bold block uppercase tracking-wider">
                    {hoveredTrendPoint.label}
                  </span>
                  <div className="flex justify-between gap-4">
                    <span className="text-green-500 font-bold">Revenue:</span>
                    <span className="font-extrabold text-foreground">Rs. {hoveredTrendPoint.salesVal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-red-500 font-bold">Expenses:</span>
                    <span className="font-extrabold text-foreground">Rs. {hoveredTrendPoint.expensesVal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-border pt-1 font-extrabold">
                    <span className="text-accent">Net Margin:</span>
                    <span className={hoveredTrendPoint.salesVal - hoveredTrendPoint.expensesVal >= 0 ? "text-green-500" : "text-red-500"}>
                      Rs. {(hoveredTrendPoint.salesVal - hoveredTrendPoint.expensesVal).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter and Table */}
      <div className="glass-panel p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-xs"
            placeholder="Search expenses by title or description..."
          />
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted" />
        </div>

        <div className="flex items-center gap-2 text-xs w-full md:w-auto">
          <span className="text-muted font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-1.5 border border-border rounded bg-background focus:outline-none text-xs font-semibold"
          >
            <option value="all">All Categories</option>
            <option value="salary">Salary & Wages</option>
            <option value="rent">Rent & Utilities</option>
            <option value="travel">Travel & Transport</option>
            <option value="food">Food & Catering</option>
            <option value="miscellaneous">Miscellaneous</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-panel rounded-lg overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-card text-muted border-b border-border uppercase font-semibold tracking-wider text-[10px]">
                <th className="p-4">Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Expense Title</th>
                <th className="p-4">Logged By</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    No expenses logged matching selected filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-border/20 transition-colors">
                    <td className="p-4 font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-muted" />
                        {new Date(expense.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${getCategoryBadge(expense.category)}`}>
                        {getCategoryLabel(expense.category)}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      {expense.title}
                    </td>
                    <td className="p-4 font-semibold text-muted">
                      <div className="flex items-center gap-1.5">
                        <User size={11} className="text-accent" />
                        {expense.createdBy?.name || "System"}
                      </div>
                    </td>
                    <td className="p-4 text-muted font-medium max-w-xs truncate" title={expense.description}>
                      {expense.description || "—"}
                    </td>
                    <td className="p-4 text-right font-extrabold text-red-500">
                      Rs. {expense.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingExpense(viewingExpense?._id === expense._id ? null : expense)}
                          className="p-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 transition-colors shadow-sm"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {user?.role === "admin" && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(expense)}
                              className="p-1.5 bg-amber-600 rounded text-white hover:bg-amber-700 transition-colors shadow-sm"
                              title="Edit Expense"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(expense._id)}
                              className="p-1.5 bg-red-600 rounded text-white hover:bg-red-700 transition-colors shadow-sm"
                              title="Delete Log"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-lg border border-border p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <DollarSign className="text-accent" />
                {editingExpense ? "Edit Expense" : "Log Business Expense"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 text-xs bg-red-600 border border-red-600 text-white rounded font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                  placeholder="e.g. Purchase of Red Neon Flex Coils"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-semibold"
                >
                  <option value="salary">Salary & Wages</option>
                  <option value="rent">Rent & Utilities</option>
                  <option value="travel">Travel & Transport</option>
                  <option value="food">Food & Catering</option>
                  <option value="miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                    Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-bold text-red-500"
                    placeholder="Amount in Rs."
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                  Description / Remarks
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-20 px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm resize-none"
                  placeholder="Invoice number, merchant, payment specifics..."
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-border rounded text-xs hover:bg-border transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-accent text-white rounded text-xs hover:bg-accent-dark transition-colors shadow-md shadow-accent/15 font-bold disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingExpense ? "Update Expense" : "Log Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Expense Detail Modal */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-lg border border-border p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <Eye className="text-accent" />
                Expense Details
              </h2>
              <button
                onClick={() => setViewingExpense(null)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-0.5">Expense Title</span>
                <span className="text-sm font-bold text-foreground">{viewingExpense.title}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-0.5">Category</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${getCategoryBadge(viewingExpense.category)}`}>
                    {getCategoryLabel(viewingExpense.category)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-0.5">Date</span>
                  <span className="text-sm font-semibold text-foreground">
                    {new Date(viewingExpense.date).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-0.5">Amount</span>
                  <span className="text-lg font-extrabold text-red-500 font-display">Rs. {viewingExpense.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-0.5">Logged By</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <User size={12} className="text-accent" />
                    {viewingExpense.createdBy?.name || "System"}
                  </span>
                </div>
              </div>

              {viewingExpense.description && (
                <div className="border-t border-border pt-3">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Description / Remarks</span>
                  <p className="text-sm text-foreground font-medium whitespace-pre-wrap">{viewingExpense.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4 mt-4">
              {user?.role === "admin" && (
                <button
                  onClick={() => {
                    handleOpenEditModal(viewingExpense);
                    setViewingExpense(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded text-xs hover:bg-amber-700 transition-colors shadow-sm font-bold"
                >
                  <Edit2 size={13} /> Edit Expense
                </button>
              )}
              <button
                onClick={() => setViewingExpense(null)}
                className="px-4 py-2 border border-border rounded text-xs hover:bg-border transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
