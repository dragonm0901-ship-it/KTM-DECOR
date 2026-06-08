import React, { useState } from "react";
import { useStore, Sale, Order } from "../store/useStore";
import {
  TrendingUp,
  Plus,
  Trash2,
  DollarSign,
  User,
  SlidersHorizontal,
  X,
  Package,
  Calendar,
  Eye,
  CheckCircle,
  Clock
} from "./ui/solar-icons";
import { OrderDetailModal } from "./OrderDetailModal";

export const SalesTab: React.FC = () => {
  const { sales, orders, createSale, deleteSale, approveOrder, user } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form States
  const [clientName, setClientName] = useState("");
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Sale["paymentMethod"]>("cash");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      const dateStr = new Date(s.date).toLocaleDateString([], {
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

  const handleOpenAddModal = () => {
    setClientName("");
    setProductName("");
    setAmount("");
    setPaymentMethod("cash");
    setNotes("");
    setDate(new Date().toISOString().split("T")[0]);
    setFormError("");
    setShowModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!clientName.trim() || !productName.trim() || !amount.trim()) {
      setFormError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await createSale({
        clientName,
        productName,
        amount: Number(amount),
        paymentMethod,
        notes,
        date
      });
      setShowModal(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to log sale.");
    } finally {
      setSubmitting(false);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <TrendingUp className="text-accent" />
            Sales Ledger
          </h1>
          <p className="text-xs text-muted mt-1">
            Track and monitor business revenue from sign installations and direct client sales.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-accent hover:bg-accent-dark text-white rounded font-bold text-xs transition-all shadow-md shadow-accent/15 self-start sm:self-auto"
        >
          <Plus size={16} />
          Log Direct Sale
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-lg flex items-center gap-4 border border-border">
          <div className="h-12 w-12 rounded-lg bg-emerald-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Package size={22} />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Sign Order Sales</span>
            <h3 className="text-lg font-bold mt-1 text-foreground font-display">Rs. {orderSalesTotal.toLocaleString()}</h3>
            <p className="text-[9px] text-muted mt-0.5">{sales.filter((s) => s.orderId).length} approved orders</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-lg flex items-center gap-4 border border-border">
          <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">General Direct Sales</span>
            <h3 className="text-lg font-bold mt-1 text-foreground font-display">Rs. {directSalesTotal.toLocaleString()}</h3>
            <p className="text-[9px] text-muted mt-0.5">{sales.filter((s) => !s.orderId).length} custom logs</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-lg flex items-center gap-4 border border-border bg-accent/[0.02] border-accent/20">
          <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <DollarSign size={22} />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider text-accent">Total Combined Revenue</span>
            <h3 className="text-xl font-bold mt-1 text-accent font-display">Rs. {combinedTotal.toLocaleString()}</h3>
            <p className="text-[9px] text-muted mt-0.5">Approved ledger balance</p>
          </div>
        </div>
      </div>

      {/* Sales Growth Trend Graph */}
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

      {/* Completed Sign Orders Awaiting Approval */}
      {pendingApprovalOrders.length > 0 && (
        <div className="glass-panel p-5 rounded-lg border border-amber-500/20 bg-amber-500/[0.02] space-y-4">
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
                className="bg-card border border-border p-4 rounded-lg flex flex-col justify-between gap-3 shadow-sm hover:border-amber-500/30 transition-all"
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
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm shadow-green-500/10"
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
      <div className="glass-panel p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-xs"
            placeholder="Search by client or product..."
          />
          <SlidersHorizontal className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Method Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted font-medium">Payment:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-2 py-1.5 border border-border rounded bg-background focus:outline-none text-xs font-semibold"
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
              className="px-2 py-1.5 border border-border rounded bg-background focus:outline-none text-xs font-semibold"
            >
              <option value="all">All Sources</option>
              <option value="order">Sign Orders</option>
              <option value="direct">Direct Sales</option>
            </select>
          </div>
        </div>
      </div>

      {/* Unified Sales Ledger Table */}
      <div className="glass-panel rounded-lg overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
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
                    <td className="p-4 font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-muted" />
                        {new Date(item.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
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

      {/* Log Custom Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-lg border border-border p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <DollarSign className="text-accent" />
                Log Direct Sale
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                  placeholder="e.g. Acme Corporation"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                  Product / Service Description *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                  placeholder="e.g. Custom Neon Sign Vector Layout"
                  required
                />
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
                    className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-bold"
                    placeholder="Amount in Rs."
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                    Sales Date *
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
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-semibold"
                >
                  <option value="cash">Cash</option>
                  <option value="online_banking">Fonepay</option>
                  <option value="esewa">Esewa</option>
                  <option value="cheque">Cheque</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-20 px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm resize-none"
                  placeholder="Payment details, delivery remarks, discounts, etc."
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
                  {submitting ? "Logging..." : "Log Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};
