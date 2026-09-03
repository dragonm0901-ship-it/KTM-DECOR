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
  Clock,
  RotateCcw
} from "./ui/solar-icons";
import { Printer, Download } from "lucide-react";
import { OrderDetailModal } from "./OrderDetailModal";
import { StatementPreviewModal } from "./StatementPreviewModal";
import { RevenueGrowthChart } from "./RevenueGrowthChart";
import {
  NEPALI_MONTHS,
  NEPALI_YEARS,
  getCurrentNepaliDate,
  formatNepali,
  formatArchiveStatementLabel,
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
    downloadArchive,
    fetchStatementData,
    fetchArchiveData,
    resyncSales
  } = useStore();
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [resyncing, setResyncing] = useState(false);

  // Statement PDF Preview Modal States
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

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

  const handlePreviewClick = async () => {
    try {
      setPreviewLoading(true);
      setPreviewModalOpen(true);
      const data = await fetchStatementData("sales", exportMonth, exportYear);
      setPreviewData(data);
    } catch (err) {
      alert("Failed to load sales statement: " + (err instanceof Error ? err.message : String(err)));
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
      alert("Failed to load archived sales statement: " + (err instanceof Error ? err.message : String(err)));
      setPreviewModalOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

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

  const handleResyncClick = async () => {
    if (!window.confirm("Resynchronize all historical order sales in the database with base product prices and clear Redis cache?")) {
      return;
    }
    setResyncing(true);
    try {
      const res = await resyncSales();
      alert(res.message || "Successfully resynced sales in database!");
    } catch (err: any) {
      alert("Failed to resync sales: " + (err.message || String(err)));
    } finally {
      setResyncing(false);
    }
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all"); // all, order, direct

  // Map orders by ID for guaranteed accurate base price resolution
  const ordersMap = new Map((Array.isArray(orders) ? orders : []).map((o) => [o._id.toString(), o]));

  // Calculations
  const orderSalesTotal = sales
    .filter((s) => s.orderId)
    .reduce((sum, s) => {
      const orderIdStr = (typeof s.orderId === "object" && s.orderId !== null)
        ? (s.orderId as any)._id?.toString()
        : s.orderId?.toString();
      const matchedOrder = orderIdStr ? ordersMap.get(orderIdStr) : undefined;

      const pPrice = matchedOrder
        ? (Number(matchedOrder.price) || 0)
        : (s.orderId && typeof s.orderId === "object" && "price" in s.orderId)
          ? (Number((s.orderId as any).price) || 0)
          : (Number(s.amount) || 0);
      return sum + pPrice;
    }, 0);

  const directSalesTotal = sales
    .filter((s) => !s.orderId)
    .reduce((sum, s) => sum + s.amount, 0);

  const combinedTotal = orderSalesTotal + directSalesTotal;
  const totalDuePayment = orders.reduce((acc, o) => acc + (o.duePayment || 0), 0);

  // Merging orders and custom sales for a unified ledger
  const unifiedSales = sales.map((s) => {
    const isOrder = !!s.orderId;
    const orderIdStr = (typeof s.orderId === "object" && s.orderId !== null)
      ? (s.orderId as any)._id?.toString()
      : s.orderId?.toString();
    const matchedOrder = orderIdStr ? ordersMap.get(orderIdStr) : undefined;
    const orderObj = matchedOrder || ((s.orderId && typeof s.orderId === "object") ? s.orderId as Order : undefined);
    const productPrice = matchedOrder
      ? (Number(matchedOrder.price) || 0)
      : (orderObj && "price" in orderObj)
        ? (Number(orderObj.price) || 0)
        : s.amount;

    return {
      type: (isOrder ? "order" : "direct") as "order" | "direct",
      id: s._id,
      client: s.clientName,
      product: s.productName,
      amount: productPrice,
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
            onClick={handlePreviewClick}
            style={{
              background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-black text-[11px] rounded-xl font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer hover:opacity-95"
            title="Preview and Print PDF Sales Statement"
          >
            <Printer size={13} />
            <span>Preview / Print PDF</span>
          </button>
          <button
            onClick={handleExportClick}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-[11px] rounded-xl font-bold hover:bg-accent-dark transition-all disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
          {user?.role === "admin" && (
            <button
              onClick={handleResyncClick}
              disabled={resyncing}
              title="Resynchronize all order sales in the database to base product prices and purge Redis cache"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border text-foreground text-[11px] rounded-xl font-bold hover:bg-muted/40 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <RotateCcw size={13} className={`text-accent ${resyncing ? "animate-spin" : ""}`} />
              <span>{resyncing ? "Syncing..." : "Resync DB"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Archived Monthly Statements */}
      {user?.role === "admin" && statementArchives.filter((a) => a.type === "sales").length > 0 && (
        <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar size={14} className="text-accent" />
            Archived Monthly Sales Statements (PDF & CSV)
          </h3>
          <div className="flex flex-wrap gap-2">
            {statementArchives
              .filter((a) => a.type === "sales")
              .map((archive) => (
                <div
                  key={archive._id}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border bg-background hover:bg-accent/[0.04] hover:border-accent/30 text-xs font-bold transition-all"
                >
                  <button
                    onClick={() => handlePreviewArchive(archive._id)}
                    className="flex items-center gap-1.5 text-foreground hover:text-accent transition-colors"
                    title="Preview / Print PDF"
                  >
                    <TrendingUp size={12} className="text-accent" />
                    <span>{formatArchiveStatementLabel(archive)}</span>
                  </button>
                  <button
                    onClick={() => downloadArchive(archive._id, archive.filename)}
                    className="text-muted hover:text-accent p-1 ml-1 rounded hover:bg-accent/10 transition-colors"
                    title="Download CSV"
                  >
                    <Download size={12} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Total Sales (Signature Sunset Gradient Hero Card) */}
        <div
          className="relative rounded-[28px] p-6 shadow-xl shadow-orange-500/10 overflow-hidden flex items-center justify-between transition-all hover:scale-[1.01]"
          style={{
            background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
          }}
        >
          <div className="relative z-10 space-y-1">
            <span className="text-xs font-semibold text-black/85 uppercase tracking-wider block">Total Sales (Product Revenue)</span>
            <h3 className="text-3xl sm:text-4xl font-semibold font-display text-black leading-none mt-1">Rs. {combinedTotal.toLocaleString()}</h3>
            <p className="text-xs text-black/75 font-medium mt-1">Excludes delivery & fitting charges</p>
          </div>
          <div className="p-3 bg-black text-white rounded-2xl shadow-md shrink-0 relative z-10">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Total Outstanding Dues (Crisp Porcelain Card) */}
        <div className="bg-card border border-border/80 shadow-sm hover:shadow-md transition-all p-6 rounded-[28px] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted font-bold uppercase tracking-wider block">Total Outstanding Dues</span>
            <h3 className="text-3xl sm:text-4xl font-semibold font-display text-red-500 leading-none mt-1">Rs. {totalDuePayment.toLocaleString()}</h3>
            <p className="text-xs text-muted mt-1">{orders.filter(o => o.duePayment > 0).length} pending accounts</p>
          </div>
          <div className="p-3 bg-red-600 text-white rounded-2xl shadow-xs shrink-0">
            <DollarSign size={24} className="text-white" />
          </div>
        </div>
      </div>

      {/* Sales Growth Trend Graph */}
      <RevenueGrowthChart
        sales={sales}
        orders={orders}
        title="Revenue Over Time"
      />

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

      {/* Statement PDF Preview Modal */}
      <StatementPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        data={previewData}
        loading={previewLoading}
        onDownloadCsv={handleExportClick}
      />
    </div>
  );
};
