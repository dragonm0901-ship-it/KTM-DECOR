import React, { useState, useEffect } from "react";
import { useStore, Order } from "../store/useStore";
import {
  TrendingUp,
  Trash2,
  DollarSign,
  User,
  Search,
  Package,
  Calendar,
  Eye,
  CheckCircle,
  Clock
} from "./ui/solar-icons";
import { OrderDetailModal } from "./OrderDetailModal";
import {
  NEPALI_MONTHS,
  NEPALI_YEARS,
  getCurrentNepaliDate,
  formatNepali,
  formatNepaliShort
} from "../utils/nepaliDate";

export const SalesTab: React.FC = () => {
  const {
    sales,
    orders,
    deleteSale,
    approveOrder,
    user,
    exportStatement,
    statementArchives,
    fetchStatementArchives,
    downloadArchive
  } = useStore();
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStatementArchives();
    }
  }, [user, fetchStatementArchives]);

  const currentBs = getCurrentNepaliDate();

  // Statement Export States (Nepali BS)
  const [exportMonth, setExportMonth] = useState(currentBs.month.toString());
  const [exportYear, setExportYear] = useState(currentBs.year.toString());
  const [exporting, setExporting] = useState(false);

  const handleExportClick = async () => {
    setExporting(true);
    try {
      await exportStatement("sales", exportMonth, exportYear);
    } catch (err) {
      alert("Failed to export sales statement: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setExporting(false);
    }
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all"); // all, order, direct

  // Calculations
  const orderSalesTotal = sales
    .filter((s) => s.orderId)
    .reduce((sum, s) => sum + s.amount, 0);

  const directSalesTotal = sales
    .filter((s) => !s.orderId)
    .reduce((sum, s) => sum + s.amount, 0);

  const combinedTotal = orderSalesTotal + directSalesTotal;
  const totalDuePayment = orders.reduce((acc, o) => acc + (o.duePayment || 0), 0);

  // Merging orders and custom sales for a unified ledger
  const unifiedSales = sales.map((s) => {
    const isOrder = !!s.orderId;
    const orderObj = (s.orderId && typeof s.orderId === "object") ? s.orderId as Order : undefined;

    return {
      type: (isOrder ? "order" : "direct") as "order" | "direct",
      id: s._id,
      client: s.clientName,
      product: s.productName,
      amount: s.amount,
      date: s.date,
      method: s.paymentMethod,
      notes: s.notes,
      orderObj: orderObj
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filtered Ledger
  const filteredSales = unifiedSales.filter((s) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      s.client.toLowerCase().includes(query) ||
      s.product.toLowerCase().includes(query) ||
      (s.notes && s.notes.toLowerCase().includes(query));

    const matchesMethod = methodFilter === "all" || s.method === methodFilter;
    const matchesType = typeFilter === "all" || s.type === typeFilter;

    return matchesSearch && matchesMethod && matchesType;
  });

  // Completed Sign Orders Awaiting Approval
  const pendingApprovalOrders = orders.filter((o) => o.stage === "completed" && !o.approved);

  // Generate sales chart data points (using sales array chronologically)
  const getSalesChartData = () => {
    const chronologicalSales = [...sales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const points: { label: string; value: number }[] = [{ label: "Start", value: 0 }];
    
    let cumulative = 0;
    chronologicalSales.forEach((s) => {
      cumulative += s.amount;
      const dateStr = formatNepaliShort(s.date);
      points.push({ label: dateStr, value: cumulative });
    });

    if (points.length === 1) {
      points.push({ label: "Today", value: 0 });
    }

    return points;
  };

  const chartData = getSalesChartData();
  const maxVal = Math.max(...chartData.map((d) => d.value), 1000);

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 160;
  const paddingX = 55;
  const paddingY = 20;

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

  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (coords.length === 0) return;
    const svg = e.currentTarget;
    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    
    const svgPoint = point.matrixTransform(ctm.inverse());
    const mouseX = svgPoint.x;
    
    // Graceful margin bounds check to hide hover crosshair if cursor leaves chart content zone
    if (mouseX < paddingX - 15 || mouseX > svgWidth - paddingX + 15) {
      setHoveredPoint(null);
      return;
    }
    
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



  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this sale log?")) {
      try {
        await deleteSale(id);
      } catch (err) {
        console.error("Failed to delete sale log", err);
      }
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "esewa":
        return "Esewa";
      case "online_banking":
        return "Fonepay";
      case "cheque":
        return "Cheque";
      case "cash":
        return "Cash";
      default:
        return method.toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card p-5 rounded-2xl border border-border/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <TrendingUp className="text-accent" />
            Sales Ledger
          </h1>
          <p className="text-xs text-muted mt-1">
            Track and monitor business revenue from sign installations and direct client sales.
          </p>
        </div>

        {/* Quick Statement Download */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-border/20 p-2 rounded-xl border border-border/40">
          <select
            value={exportMonth}
            onChange={(e) => setExportMonth(e.target.value)}
            className="bg-card border border-border text-foreground text-[11px] rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-semibold cursor-pointer"
          >
            <option value="all">All Time</option>
            {NEPALI_MONTHS.map((m) => (
              <option key={m.value} value={m.value.toString()}>
                {m.name} ({m.nepaliName})
              </option>
            ))}
          </select>
          <select
            value={exportYear}
            onChange={(e) => setExportYear(e.target.value)}
            className="bg-card border border-border text-foreground text-[11px] rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-semibold cursor-pointer"
          >
            {NEPALI_YEARS.map((y) => (
              <option key={y} value={y.toString()}>
                {y} BS
              </option>
            ))}
          </select>
          <button
            onClick={handleExportClick}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-[11px] rounded-xl font-bold hover:bg-accent-dark transition-all disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Archived Monthly Statements */}
      {user?.role === "admin" && statementArchives.filter((a) => a.type === "sales").length > 0 && (
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar size={14} className="text-accent" />
            Archived Monthly Sales Statements (CSV)
          </h3>
          <div className="flex flex-wrap gap-2">
            {statementArchives
              .filter((a) => a.type === "sales")
              .map((archive) => (
                <button
                  key={archive._id}
                  onClick={() => downloadArchive(archive._id, archive.filename)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-accent/[0.04] hover:border-accent/30 text-xs font-bold transition-all"
                >
                  <TrendingUp size={12} className="text-accent" />
                  {archive.filename.replace("sales_statement_", "").replace(".csv", "").replace("_", " ")}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="border shadow-sm p-5 rounded-2xl flex items-center gap-4 bg-green-600/[0.02] border-green-500/20">
          <div className="h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="text-[10px] text-green-500 uppercase font-bold tracking-wider">Total Sales</span>
            <h3 className="text-xl font-bold mt-1 text-green-500 font-display">Rs. {combinedTotal.toLocaleString()}</h3>
            <p className="text-[9px] text-muted mt-0.5">Approved ledger balance</p>
          </div>
        </div>

        <div className="border shadow-sm p-5 rounded-2xl flex items-center gap-4 bg-red-600/[0.02] border-red-500/20">
          <div className="h-12 w-12 rounded-lg bg-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <DollarSign size={22} className="text-white" />
          </div>
          <div>
            <span className="text-[10px] text-red-500 uppercase font-bold tracking-wider">Total Outstanding Dues</span>
            <h3 className="text-xl font-bold mt-1 text-red-500 font-display">Rs. {totalDuePayment.toLocaleString()}</h3>
            <p className="text-[9px] text-muted mt-0.5">{orders.filter(o => o.duePayment > 0).length} pending accounts</p>
          </div>
        </div>
      </div>

      {/* Sales Growth Trend Graph */}
      <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/60 pb-5 mb-5 gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={18} className="text-accent" />
              <h3 className="font-bold text-base font-display text-foreground">
                Sales Growth Trend
              </h3>
            </div>
            <div className="flex items-baseline gap-2.5 mt-2.5">
              <h2 className="text-3xl font-extrabold font-display text-foreground leading-none">
                Rs. {(hoveredPoint ? hoveredPoint.value : combinedTotal).toLocaleString()}
              </h2>
              {(() => {
                if (!hoveredPoint) {
                  if (coords.length > 1) {
                    const lastIdx = coords.length - 1;
                    const prevVal = coords[lastIdx - 1].value;
                    if (prevVal > 0) {
                      const pct = ((coords[lastIdx].value - prevVal) / prevVal) * 100;
                      return (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          pct >= 0
                            ? "bg-green-500/10 text-green-600 border-green-500/10"
                            : "bg-red-500/10 text-red-600 border-red-500/10"
                        }`}>
                          {pct >= 0 ? "↑" : "↓"} {Math.abs(pct).toFixed(1)}%
                        </span>
                      );
                    }
                  }
                  return (
                    <span className="bg-green-500/10 text-green-600 border border-green-500/10 px-2 py-0.5 rounded text-[10px] font-bold">
                      ↑ 12.4%
                    </span>
                  );
                }
                const idx = coords.findIndex(c => c.x === hoveredPoint.x);
                if (idx <= 0) return null;
                const prevVal = coords[idx - 1].value;
                if (prevVal === 0) return null;
                const pct = ((hoveredPoint.value - prevVal) / prevVal) * 100;
                return (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    pct >= 0
                      ? "bg-green-500/10 text-green-600 border-green-500/10"
                      : "bg-red-500/10 text-red-600 border-red-500/10"
                  }`}>
                    {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                  </span>
                );
              })()}
            </div>
            <p className="text-[10px] text-muted font-bold tracking-wider uppercase mt-1">
              {hoveredPoint ? `Coordinate Point: ${hoveredPoint.label}` : "Cumulative Total Sales Revenue"}
            </p>
          </div>
        </div>

        <div className="relative w-full h-[180px]">
          {coords.length <= 1 ? (
            <div className="h-full flex items-center justify-center text-muted text-xs border border-dashed border-border/40 rounded">
              No sales logged yet to view graph progression
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

                {/* Horizontal gridlines removed for clean Vercel-style aesthetics */}

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

                {/* Snapping vertical tracker line */}
                {hoveredPoint && (
                  <line
                    x1={hoveredPoint.x}
                    y1={paddingY}
                    x2={hoveredPoint.x}
                    y2={svgHeight - paddingY}
                    stroke="var(--border)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="opacity-50"
                  />
                )}

                {/* Snapped Pulsating focal point dot */}
                {hoveredPoint && (
                  <g>
                    <circle
                      cx={hoveredPoint.x}
                      cy={hoveredPoint.y}
                      r="8"
                      className="fill-accent/15 stroke-accent/35 stroke-[2px] animate-pulse"
                    />
                    <circle
                      cx={hoveredPoint.x}
                      cy={hoveredPoint.y}
                      r="4.5"
                      fill="var(--accent)"
                      stroke="var(--card)"
                      strokeWidth="2"
                      className="shadow"
                    />
                  </g>
                )}
              </svg>
            </>
          )}
        </div>
      </div>

      {/* Completed Sign Orders Awaiting Approval */}
      {pendingApprovalOrders.length > 0 && (
        <div className="p-5 rounded-2xl shadow-sm border border-amber-500/20 bg-amber-500/[0.02] space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <h3 className="font-bold text-sm font-display text-amber-500 flex items-center gap-2">
              <Package size={16} />
              Completed Sign Orders Awaiting Approval ({pendingApprovalOrders.length})
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-600 text-white px-2 py-0.5 rounded shadow-sm">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApprovalOrders.map((order) => (
              <div
                key={order._id}
                className="bg-card border border-border/80 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-sm hover:border-amber-500/30 transition-all"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{order.productName}</h4>
                    <p className="text-xs text-muted mt-0.5">Customer: {order.customerName}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-muted">
                      <span>Size: {order.size}</span>
                      <span>|</span>
                      <span>Payment: {getMethodLabel(order.paymentMethod)}</span>
                      <span>|</span>
                      <span className="font-bold text-accent">Total: Rs. {order.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-blue-600 border border-blue-600 text-white uppercase tracking-wider shadow-sm">
                    Completed Stage
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-border/60 mt-1">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Eye size={12} />
                    View Details
                  </button>

                  {user?.role === "admin" ? (
                    <button
                      onClick={async () => {
                        if (window.confirm(`Approve and deliver "${order.productName}" for Rs. ${order.totalPrice.toLocaleString()}?`)) {
                          try {
                            await approveOrder(order._id);
                          } catch (err: any) {
                            alert(err.message || "Failed to approve order.");
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm shadow-green-500/10"
                    >
                      <CheckCircle size={10} />
                      Approve & Log Sale
                    </button>
                  ) : (
                    <span className="text-[9px] text-muted font-extrabold uppercase flex items-center gap-1">
                      <Clock size={10} />
                      Pending Admin Approval
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Ledger */}
      <div className="bg-card border border-border/80 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs"
            placeholder="Search by client or product..."
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Method Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted font-medium">Payment:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold cursor-pointer"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="online_banking">Fonepay</option>
              <option value="esewa">Esewa</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted font-medium">Source:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold cursor-pointer"
            >
              <option value="all">All Sources</option>
              <option value="order">Sign Orders</option>
              <option value="direct">Direct Sales</option>
            </select>
          </div>
        </div>
      </div>

      {/* Unified Sales Ledger Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-card text-muted border-b border-border uppercase font-semibold tracking-wider text-[10px]">
                <th className="p-4">Date</th>
                <th className="p-4">Source Category</th>
                <th className="p-4">Client Details</th>
                <th className="p-4">Product / Service</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    No sales records logged matching these filters.
                  </td>
                </tr>
              ) : (
                filteredSales.map((item) => (
                  <tr key={item.type + item.id} className="hover:bg-border/20 transition-colors">
                    <td className="p-4 font-semibold text-foreground text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-muted" />
                        {formatNepali(item.date)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider shadow-sm ${
                        item.type === "order"
                          ? "bg-purple-600 border-purple-600 text-white"
                          : "bg-blue-600 border-blue-600 text-white"
                      }`}>
                        {item.type === "order" ? "Sign Order" : "Direct Sale"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <User size={11} className="text-accent" />
                        {item.client}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="font-semibold text-foreground">{item.product}</span>
                        {item.notes && <p className="text-[10px] text-muted truncate max-w-xs">{item.notes}</p>}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-muted">
                      {getMethodLabel(item.method)}
                    </td>
                    <td className="p-4 text-right font-extrabold text-foreground">
                      Rs. {item.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.type === "order" ? (
                          <button
                            onClick={() => setSelectedOrder(item.orderObj || null)}
                            className="p-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 transition-colors shadow-sm"
                            title="View Full Order Specifications"
                          >
                            <Eye size={14} />
                          </button>
                        ) : (
                          user?.role === "admin" && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 bg-red-600 rounded text-white hover:bg-red-700 transition-colors shadow-sm"
                              title="Delete Log"
                            >
                              <Trash2 size={14} />
                            </button>
                          )
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



      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};
