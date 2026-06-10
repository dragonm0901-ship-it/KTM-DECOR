import React, { useState } from "react";
import { useStore, Purchase } from "../store/useStore";
import {
  Briefcase,
  Plus,
  Trash2,
  SlidersHorizontal,
  X,
  Calendar,
  User,
  Edit2,
  Eye
} from "./ui/solar-icons";

interface FormPurchaseItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export const PurchaseTab: React.FC = () => {
  const { purchases, createPurchase, updatePurchaseStatus, updatePurchase, deletePurchase, user, exportStatement } = useStore();

  // Statement Export States
  const [exportMonth, setExportMonth] = useState((new Date().getMonth() + 1).toString());
  const [exportYear, setExportYear] = useState(new Date().getFullYear().toString());
  const [exporting, setExporting] = useState(false);

  const handleExportClick = async () => {
    setExporting(true);
    try {
      await exportStatement("purchases", exportMonth, exportYear);
    } catch (err) {
      alert("Failed to export purchases statement: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setExporting(false);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [expandedPurchaseId, setExpandedPurchaseId] = useState<string | null>(null);

  // Form States
  const [supplier, setSupplier] = useState("");
  const [itemsList, setItemsList] = useState<FormPurchaseItem[]>([
    { name: "", quantity: 1, unit: "pcs", price: 0 }
  ]);
  const [status, setStatus] = useState<Purchase["status"]>("pending");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Calculations
  const totalPurchases = purchases.reduce((sum, p) => sum + p.amount, 0);
  const pendingPurchases = purchases.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  // Filtered List
  const filteredPurchases = purchases.filter((p) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      p.supplier.toLowerCase().includes(query) ||
      p.itemDetails.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingPurchase(null);
    setSupplier("");
    setItemsList([{ name: "", quantity: 1, unit: "pcs", price: 0 }]);
    setStatus("pending");
    setDate(new Date().toISOString().split("T")[0]);
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEditModal = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setSupplier(purchase.supplier);
    setItemsList(
      purchase.items && purchase.items.length > 0
        ? purchase.items.map((item) => ({ ...item }))
        : [{ name: purchase.itemDetails || "", quantity: 1, unit: "pcs", price: purchase.amount }]
    );
    setStatus(purchase.status);
    setDate(new Date(purchase.date).toISOString().split("T")[0]);
    setFormError("");
    setShowModal(true);
  };

  const handleAddItem = () => {
    setItemsList([...itemsList, { name: "", quantity: 1, unit: "pcs", price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (itemsList.length === 1) return;
    setItemsList(itemsList.filter((_, idx) => idx !== index));
  };

  const handleUpdateItem = (index: number, field: keyof FormPurchaseItem, value: any) => {
    const updated = [...itemsList];
    updated[index] = {
      ...updated[index],
      [field]: field === "quantity" || field === "price" ? Number(value) || 0 : value
    };
    setItemsList(updated);
  };

  const calculatedTotalAmount = itemsList.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!supplier.trim()) {
      setFormError("Supplier name is required.");
      return;
    }

    const invalidItem = itemsList.find(item => !item.name.trim() || item.quantity <= 0 || item.price <= 0);
    if (invalidItem) {
      setFormError("Please enter valid name, quantity and price for all items.");
      return;
    }

    // Auto generate details summary text for backward compatibility
    const itemDetailsText = itemsList
      .map(item => `${item.name} (${item.quantity} ${item.unit} @ Rs. ${item.price})`)
      .join(", ");

    setSubmitting(true);
    try {
      if (editingPurchase) {
        // Update existing purchase
        await updatePurchase(editingPurchase._id, {
          supplier,
          itemDetails: itemDetailsText,
          amount: calculatedTotalAmount,
          status,
          items: itemsList,
          date
        });
      } else {
        // Create new purchase
        await createPurchase({
          supplier,
          itemDetails: itemDetailsText,
          amount: calculatedTotalAmount,
          status,
          items: itemsList,
          date
        });
      }
      setShowModal(false);
      setEditingPurchase(null);
    } catch (err: any) {
      setFormError(err.message || "Failed to save purchase.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Purchase["status"]) => {
    try {
      await updatePurchaseStatus(id, newStatus);
    } catch (err) {
      console.error("Failed to update purchase status", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this purchase log?")) {
      try {
        await deletePurchase(id);
      } catch (err) {
        console.error("Failed to delete purchase log", err);
      }
    }
  };

  const getStatusBadge = (status: Purchase["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-600 border-green-600 text-white";
      case "partial":
        return "bg-amber-600 border-amber-600 text-white";
      default:
        return "bg-red-600 border-red-600 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card p-4 rounded-lg border border-border">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <Briefcase className="text-accent" />
            Purchases Tracker
          </h1>
          <p className="text-xs text-muted mt-1">
            Log raw material stock orders, imports, and payments made to suppliers and vendors.
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
            Log Supplier Purchase
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-lg flex items-center gap-4 border border-border">
          <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Briefcase size={22} />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Total Purchases Cost</span>
            <h3 className="text-xl font-extrabold mt-1 text-foreground font-display">Rs. {totalPurchases.toLocaleString()}</h3>
            <p className="text-[9px] text-muted mt-0.5">{purchases.length} vendor invoices</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-lg flex items-center gap-4 border border-border">
          <div className="h-12 w-12 rounded-lg bg-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <SlidersHorizontal size={22} className="rotate-90" />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Outstanding Vendor Dues</span>
            <h3 className="text-xl font-extrabold mt-1 text-red-500 font-display">Rs. {pendingPurchases.toLocaleString()}</h3>
            <p className="text-[9px] text-muted mt-0.5">{purchases.filter((p) => p.status === "pending").length} unpaid invoices</p>
          </div>
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
            placeholder="Search by supplier name or items description..."
          />
          <SlidersHorizontal className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted" />
        </div>

        <div className="flex items-center gap-2 text-xs w-full md:w-auto">
          <span className="text-muted font-medium">Payment Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 border border-border rounded bg-background focus:outline-none text-xs font-semibold"
          >
            <option value="all">All Invoices</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="glass-panel rounded-lg overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-card text-muted border-b border-border uppercase font-semibold tracking-wider text-[10px]">
                <th className="p-4">Date</th>
                <th className="p-4">Supplier / Vendor</th>
                <th className="p-4">Purchased Item Details</th>
                <th className="p-4 font-medium">Logged By</th>
                <th className="p-4 text-center">Payment Status</th>
                <th className="p-4 text-right">Invoice Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    No supplier purchase invoices logged matching these criteria.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <React.Fragment key={purchase._id}>
                    <tr className="hover:bg-border/20 transition-colors">
                      <td className="p-4 font-semibold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-muted" />
                          {new Date(purchase.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        {purchase.supplier}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-foreground max-w-xs truncate" title={purchase.itemDetails}>
                            {purchase.itemDetails}
                          </span>
                          {purchase.items && purchase.items.length > 0 && (
                            <button
                              onClick={() => setExpandedPurchaseId(expandedPurchaseId === purchase._id ? null : purchase._id)}
                              className="text-[10px] text-accent font-bold self-start mt-0.5 hover:underline"
                            >
                              {expandedPurchaseId === purchase._id ? "Hide breakdown" : `View breakdown (${purchase.items.length} items)`}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-muted">
                        <div className="flex items-center gap-1.5">
                          <User size={11} className="text-accent" />
                          {purchase.createdBy?.name || "System"}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <select
                          value={purchase.status}
                          onChange={(e) => handleStatusChange(purchase._id, e.target.value as any)}
                          className={`px-2 py-1 text-[9px] font-bold rounded border uppercase cursor-pointer focus:outline-none ${getStatusBadge(purchase.status)}`}
                        >
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                          <option value="partial">Partial</option>
                        </select>
                      </td>
                      <td className="p-4 text-right font-extrabold text-foreground">
                        Rs. {purchase.amount.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingPurchase(viewingPurchase?._id === purchase._id ? null : purchase)}
                            className="p-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 transition-colors shadow-sm"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          {user?.role === "admin" && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(purchase)}
                                className="p-1.5 bg-amber-600 rounded text-white hover:bg-amber-700 transition-colors shadow-sm"
                                title="Edit Purchase"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(purchase._id)}
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

                    {/* Collapsible itemized details sub-row */}
                    {expandedPurchaseId === purchase._id && purchase.items && purchase.items.length > 0 && (
                      <tr className="bg-border/5">
                        <td colSpan={7} className="p-4 border-b border-border">
                          <div className="glass-panel p-4 rounded border border-border/80 max-w-2xl animate-fade-in">
                            <h4 className="font-bold text-[10px] uppercase text-muted tracking-wider mb-2.5">
                              Itemized Invoice Breakdown
                            </h4>
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="text-muted border-b border-border/60 uppercase font-semibold text-[9px]">
                                  <th className="pb-2">Material / Item</th>
                                  <th className="pb-2 text-center">Qty</th>
                                  <th className="pb-2 text-right">Unit Price</th>
                                  <th className="pb-2 text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/40">
                                {purchase.items.map((item, index) => (
                                  <tr key={index} className="text-foreground hover:bg-border/10 transition-colors">
                                    <td className="py-2 font-semibold">{item.name}</td>
                                    <td className="py-2 text-center font-bold">
                                      {item.quantity} <span className="text-[9px] font-normal text-muted">{item.unit}</span>
                                    </td>
                                    <td className="py-2 text-right">Rs. {item.price.toLocaleString()}</td>
                                    <td className="py-2 text-right font-bold">
                                      Rs. {(item.quantity * item.price).toLocaleString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-2xl rounded-lg border border-border p-6 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <Briefcase className="text-accent" />
                {editingPurchase ? "Edit Purchase Invoice" : "Log Supplier Purchase"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                    Supplier / Vendor Name *
                  </label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                    placeholder="e.g. Nepal Acrylic Supplies Pvt. Ltd."
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                    Invoice Date *
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

              {/* Structured Line Items Entry */}
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-border/80 pb-1">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Purchase Items *</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 py-1 px-2.5 bg-accent hover:bg-accent-dark text-white rounded text-[10px] font-bold transition-all shadow-sm"
                  >
                    <Plus size={10} /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {itemsList.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center bg-border/20 p-2.5 rounded border border-border/40">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(index, "name", e.target.value)}
                          placeholder="Item description (e.g. Acrylic Sheets)"
                          className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background focus:outline-none"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.quantity || ""}
                          onChange={(e) => handleUpdateItem(index, "quantity", e.target.value)}
                          placeholder="Qty"
                          min="1"
                          className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background focus:outline-none font-bold text-center"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(index, "unit", e.target.value)}
                          placeholder="Unit (pcs)"
                          className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background focus:outline-none text-center"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.price || ""}
                          onChange={(e) => handleUpdateItem(index, "price", e.target.value)}
                          placeholder="Price"
                          min="0"
                          className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background focus:outline-none text-right font-bold"
                          required
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          disabled={itemsList.length === 1}
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                    Payment Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-semibold"
                  >
                    <option value="pending">Pending (Unpaid)</option>
                    <option value="partial">Partial Payment</option>
                    <option value="paid">Fully Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                    Total Amount (Rs.)
                  </label>
                  <input
                    type="text"
                    value={`Rs. ${calculatedTotalAmount.toLocaleString()}`}
                    readOnly
                    className="w-full px-3 py-2 border border-border rounded bg-border/20 text-sm font-extrabold text-foreground focus:outline-none select-none"
                  />
                </div>
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
                  {submitting ? "Saving..." : editingPurchase ? "Update Invoice" : "Log Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingPurchase && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-lg border border-border p-6 shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <Eye className="text-accent" />
                Purchase Details
              </h2>
              <button
                onClick={() => setViewingPurchase(null)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-0.5">Supplier / Vendor</span>
                  <span className="text-sm font-bold text-foreground">{viewingPurchase.supplier}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-0.5">Invoice Date</span>
                  <span className="text-sm font-semibold text-foreground">
                    {new Date(viewingPurchase.date).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-0.5">Payment Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getStatusBadge(viewingPurchase.status)}`}>
                    {viewingPurchase.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-0.5">Total Amount</span>
                  <span className="text-lg font-extrabold text-foreground font-display">Rs. {viewingPurchase.amount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-0.5">Logged By</span>
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <User size={12} className="text-accent" />
                  {viewingPurchase.createdBy?.name || "System"}
                </span>
              </div>

              {/* Itemized Breakdown */}
              {viewingPurchase.items && viewingPurchase.items.length > 0 ? (
                <div className="border-t border-border pt-3">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-2">Itemized Invoice Breakdown</span>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-muted border-b border-border/60 uppercase font-semibold text-[9px]">
                        <th className="pb-2">Material / Item</th>
                        <th className="pb-2 text-center">Qty</th>
                        <th className="pb-2 text-right">Unit Price</th>
                        <th className="pb-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {viewingPurchase.items.map((item, index) => (
                        <tr key={index} className="text-foreground">
                          <td className="py-2 font-semibold">{item.name}</td>
                          <td className="py-2 text-center font-bold">
                            {item.quantity} <span className="text-[9px] font-normal text-muted">{item.unit}</span>
                          </td>
                          <td className="py-2 text-right">Rs. {item.price.toLocaleString()}</td>
                          <td className="py-2 text-right font-bold">Rs. {(item.quantity * item.price).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border-t border-border pt-3">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-wider block mb-1">Item Details</span>
                  <p className="text-sm text-foreground font-medium">{viewingPurchase.itemDetails}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4 mt-4">
              {user?.role === "admin" && (
                <button
                  onClick={() => {
                    handleOpenEditModal(viewingPurchase);
                    setViewingPurchase(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded text-xs hover:bg-amber-700 transition-colors shadow-sm font-bold"
                >
                  <Edit2 size={13} /> Edit Purchase
                </button>
              )}
              <button
                onClick={() => setViewingPurchase(null)}
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
