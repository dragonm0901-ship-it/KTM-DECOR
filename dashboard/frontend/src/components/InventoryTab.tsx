import React, { useState } from "react";
import { useStore, InventoryItem } from "../store/useStore";
import {
  Package,
  Plus,
  Trash2,
  SlidersHorizontal,
  X,
  Minus,
  Edit2,
  Search
} from "./ui/solar-icons";

export const InventoryTab: React.FC = () => {
  const { inventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem, user, exportInventory } = useStore();

  // Statement Export States
  const [exporting, setExporting] = useState(false);

  const handleExportClick = async () => {
    setExporting(true);
    try {
      await exportInventory();
    } catch (err) {
      alert("Failed to export inventory CSV: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setExporting(false);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Dynamic Categories extracted from the current inventory items list
  const existingCategories = Array.from(
    new Set(inventoryItems.map((item) => item.category).filter(Boolean))
  ).sort();

  // Form States
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [alertLevel, setAlertLevel] = useState("5");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Calculations
  const totalItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter((i) => i.quantity <= i.alertLevel && i.quantity > 0).length;
  const outOfStockItems = inventoryItems.filter((i) => i.quantity === 0).length;

  // Filtered List
  const filteredItems = inventoryItems.filter((i) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      i.name.toLowerCase().includes(query) ||
      i.category.toLowerCase().includes(query);

    let matchesStock = true;
    if (stockFilter === "low") {
      matchesStock = i.quantity <= i.alertLevel && i.quantity > 0;
    } else if (stockFilter === "out") {
      matchesStock = i.quantity === 0;
    } else if (stockFilter === "in") {
      matchesStock = i.quantity > i.alertLevel;
    }

    const matchesCategory = selectedCategoryFilter === "all" || i.category === selectedCategoryFilter;

    return matchesSearch && matchesStock && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName("");
    const defaultCat = existingCategories[0] || "Neon Lights";
    setCategory(defaultCat);
    setIsCreatingNewCategory(existingCategories.length === 0);
    setNewCategoryName("");
    setQuantity("");
    setUnit("pcs");
    setAlertLevel("5");
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setIsCreatingNewCategory(false);
    setNewCategoryName("");
    setQuantity(item.quantity.toString());
    setUnit(item.unit);
    setAlertLevel(item.alertLevel.toString());
    setFormError("");
    setShowModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const finalCategory = isCreatingNewCategory ? newCategoryName.trim() : category;

    if (!name.trim() || !finalCategory || !quantity.trim() || !unit.trim()) {
      setFormError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    const itemData = {
      name,
      category: finalCategory,
      quantity: Number(quantity),
      unit,
      alertLevel: Number(alertLevel)
    };

    try {
      if (editingItem) {
        await updateInventoryItem(editingItem._id, itemData);
      } else {
        await createInventoryItem(itemData);
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save item.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustQuantity = async (item: InventoryItem, delta: number) => {
    const targetQty = Math.max(0, item.quantity + delta);
    if (targetQty === item.quantity) return;

    try {
      await updateInventoryItem(item._id, { quantity: targetQty });
    } catch (err) {
      console.error("Failed to adjust quantity", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this inventory item?")) {
      try {
        await deleteInventoryItem(id);
      } catch (err) {
        console.error("Failed to delete inventory item", err);
      }
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return { label: "Out of Stock", badge: "bg-red-600 border-red-600 text-white" };
    } else if (item.quantity <= item.alertLevel) {
      return { label: "Low Stock", badge: "bg-amber-600 border-amber-600 text-white font-bold" };
    } else {
      return { label: "In Stock", badge: "bg-green-600 border-green-600 text-white" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Actions Bar */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleExportClick}
          disabled={exporting}
          className="flex items-center justify-center gap-1.5 py-2 px-4 bg-card border border-border/80 hover:bg-muted/20 text-foreground rounded-2xl font-bold text-xs transition-all shadow-xs h-10 disabled:opacity-50 cursor-pointer"
        >
          <Package size={15} />
          {exporting ? "Exporting..." : "Export CSV"}
        </button>

        {user?.role === "admin" && (
          <button
            onClick={handleOpenAddModal}
            style={{
              background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-5 text-black rounded-2xl font-bold text-xs transition-all shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-95 h-10 cursor-pointer"
          >
            <Plus size={16} />
            Register Material
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-card border border-border/80 rounded-[28px] shadow-xs p-6 flex items-center gap-4 hover:shadow-md transition-all">
          <div
            style={{ background: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)" }}
            className="h-12 w-12 rounded-2xl text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20"
          >
            <Package size={22} />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Registered Materials</span>
            <h3 className="text-xl font-bold mt-1 text-foreground font-display">{totalItems} items</h3>
            <p className="text-[10px] text-muted mt-0.5 font-medium">Active items in inventory</p>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-[28px] shadow-xs p-6 flex items-center gap-4 hover:shadow-md transition-all">
          <div
            style={{ background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)" }}
            className="h-12 w-12 rounded-2xl text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/20"
          >
            <SlidersHorizontal size={22} />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Low Stock Alerts</span>
            <h3 className="text-xl font-bold mt-1 text-amber-500 font-display">{lowStockItems} items</h3>
            <p className="text-[10px] text-muted mt-0.5 font-medium">Need replenishment soon</p>
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-[28px] shadow-xs p-6 flex items-center gap-4 hover:shadow-md transition-all">
          <div
            style={{ background: "linear-gradient(135deg, #F87171 0%, #EF4444 50%, #DC2626 100%)" }}
            className="h-12 w-12 rounded-2xl text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/20"
          >
            <Minus size={22} />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Out of Stock</span>
            <h3 className="text-xl font-bold mt-1 text-red-500 font-display">{outOfStockItems} items</h3>
            <p className="text-[10px] text-muted mt-0.5 font-medium">Production blocker risk</p>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-card border border-border/80 rounded-[28px] shadow-xs p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 border border-border/80 rounded-2xl bg-background/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold placeholder:text-muted/60 transition-all"
            placeholder="Search materials by name or category..."
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs font-semibold">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-muted font-medium text-[11px]">Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3.5 py-2 border border-border/80 rounded-2xl bg-background/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold cursor-pointer transition-all"
            >
              <option value="all">All Categories</option>
              {existingCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-2">
            <span className="text-muted font-medium text-[11px]">Stock Status:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3.5 py-2 border border-border/80 rounded-2xl bg-background/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold cursor-pointer transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="in">In Stock Only</option>
              <option value="low">Low Stock Alert</option>
              <option value="out">Out of Stock Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory List Table */}
      <div className="bg-card border border-border/80 rounded-[28px] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-muted/10 text-muted border-b border-border/70 uppercase font-bold tracking-wider text-[10px]">
                <th className="p-4">Material Name</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Stock Level</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Alert Limit</th>
                {user?.role === "admin" && <th className="p-4 text-center">Quick Adjust</th>}
                {user?.role === "admin" && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === "admin" ? 7 : 5} className="p-8 text-center text-muted">
                    No inventory items matching these filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item._id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 font-bold text-foreground">
                        {item.name}
                      </td>
                      <td className="p-4 font-semibold text-muted">
                        {item.category}
                      </td>
                      <td className="p-4 text-center font-extrabold text-foreground text-sm">
                        {item.quantity} <span className="text-[10px] font-normal text-muted">{item.unit}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider shadow-2xs ${status.badge}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-center font-semibold text-muted">
                        {item.alertLevel} {item.unit}
                      </td>
                      {user?.role === "admin" && (
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleAdjustQuantity(item, -1)}
                              className="p-1.5 bg-card border border-border/80 rounded-xl text-foreground hover:bg-muted/20 transition-all shadow-2xs cursor-pointer"
                              title="Decrement stock by 1"
                            >
                              <Minus size={11} />
                            </button>
                            <button
                              onClick={() => handleAdjustQuantity(item, 1)}
                              className="p-1.5 bg-card border border-border/80 rounded-xl text-foreground hover:bg-muted/20 transition-all shadow-2xs cursor-pointer"
                              title="Increment stock by 1"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </td>
                      )}
                      {user?.role === "admin" && (
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 bg-card border border-border/80 rounded-xl text-foreground hover:bg-muted/20 transition-all shadow-2xs cursor-pointer"
                              title="Edit Record"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1.5 bg-card border border-border/80 rounded-xl text-red-500 hover:bg-red-500/10 transition-all shadow-2xs cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 sm:p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-md rounded-[28px] border border-border/80 p-6 sm:p-7 shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 border-b border-border/60 pb-3">
              <h2 className="text-base sm:text-lg font-bold font-display flex items-center gap-2.5">
                <div
                  style={{ background: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)" }}
                  className="p-2 text-white rounded-xl shadow-xs shrink-0"
                >
                  <Package size={18} />
                </div>
                {editingItem ? "Edit Material Record" : "Register New Material"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-foreground p-1.5 rounded-xl hover:bg-muted/20 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3.5 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Material Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold transition-all"
                  placeholder="e.g. Red Neon Flex Flexcoils (6mm)"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                {isCreatingNewCategory ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Connectors"
                      className="flex-1 px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold transition-all"
                      required
                    />
                    {existingCategories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewCategory(false)}
                        className="px-4 border border-border/80 rounded-2xl text-xs hover:bg-muted/20 text-foreground transition-all font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === "__new_cat__") {
                          setIsCreatingNewCategory(true);
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="flex-1 px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold cursor-pointer transition-all"
                    >
                      {existingCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__new_cat__">+ Create New Category...</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-bold transition-all"
                    placeholder="Quantity"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Unit Type *
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold transition-all"
                    placeholder="e.g. rolls, sheets, pcs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                  Alert Limit *
                </label>
                <input
                  type="number"
                  value={alertLevel}
                  onChange={(e) => setAlertLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-bold transition-all"
                  placeholder="e.g. 5"
                  min="0"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-border/60 pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-border/80 rounded-2xl text-xs hover:bg-muted/20 transition-all font-bold text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
                  }}
                  className="px-6 py-2.5 text-black rounded-2xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingItem ? "Save Changes" : "Register Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
