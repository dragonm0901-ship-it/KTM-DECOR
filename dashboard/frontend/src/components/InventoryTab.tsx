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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card p-4 rounded-lg border border-border">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <Package className="text-accent" />
            Material Inventory
          </h1>
          <p className="text-xs text-muted mt-1">
            Track stock levels of raw materials, neon colors, spacers, converters, and acrylic backboards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleExportClick}
            disabled={exporting}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs transition-all h-9 disabled:opacity-50"
          >
            <Package size={16} />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>

          {user?.role === "admin" && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-1.5 py-2 px-4 bg-accent hover:bg-accent-dark text-white rounded font-bold text-xs transition-all shadow-md shadow-accent/15 h-9"
            >
              <Plus size={16} />
              Register New Material
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-lg flex items-center gap-4 border border-border">
          <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Package size={22} />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Registered Materials</span>
            <h3 className="text-lg font-bold mt-1 text-foreground font-display">{totalItems} items</h3>
            <p className="text-[9px] text-muted mt-0.5">Active items in inventory</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-lg flex items-center gap-4 border border-border">
          <div className="h-12 w-12 rounded-lg bg-amber-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <SlidersHorizontal size={22} />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Low Stock Alerts</span>
            <h3 className="text-lg font-bold mt-1 text-amber-500 font-display">{lowStockItems} items</h3>
            <p className="text-[9px] text-muted mt-0.5">Need replenishment soon</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-lg flex items-center gap-4 border border-border">
          <div className="h-12 w-12 rounded-lg bg-red-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Minus size={22} />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Out of Stock</span>
            <h3 className="text-lg font-bold mt-1 text-red-500 font-display">{outOfStockItems} items</h3>
            <p className="text-[9px] text-muted mt-0.5">Production blocker risk</p>
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
            placeholder="Search materials by name or category..."
          />
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs font-semibold">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-muted font-medium">Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-2 py-1.5 border border-border rounded bg-background focus:outline-none text-xs font-semibold"
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
            <span className="text-muted font-medium">Stock Status:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-2 py-1.5 border border-border rounded bg-background focus:outline-none text-xs font-semibold"
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
      <div className="glass-panel rounded-lg overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-card text-muted border-b border-border uppercase font-semibold tracking-wider text-[10px]">
                <th className="p-4">Material Name</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Stock Level</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Alert Limit</th>
                {user?.role === "admin" && <th className="p-4 text-center">Quick Adjust</th>}
                {user?.role === "admin" && <th className="p-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
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
                    <tr key={item._id} className="hover:bg-border/20 transition-colors">
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
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${status.badge}`}>
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
                              className="p-1 bg-red-600 rounded text-white hover:bg-red-700 border border-red-600 transition-all shadow-sm"
                              title="Decrement stock by 1"
                            >
                              <Minus size={11} />
                            </button>
                            <button
                              onClick={() => handleAdjustQuantity(item, 1)}
                              className="p-1 bg-green-600 rounded text-white hover:bg-green-700 border border-green-600 transition-all shadow-sm"
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
                              className="p-1.5 bg-accent rounded text-white hover:bg-accent-dark transition-colors shadow-sm"
                              title="Edit Record"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1.5 bg-red-600 rounded text-white hover:bg-red-700 transition-colors shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-lg border border-border p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <Package className="text-accent" />
                {editingItem ? "Edit Material Record" : "Register New Material"}
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
                  Material Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                  placeholder="e.g. Red Neon Flex Flexcoils (6mm)"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                  Category *
                </label>
                {isCreatingNewCategory ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Connectors"
                      className="flex-1 px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                      required
                    />
                    {existingCategories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewCategory(false)}
                        className="px-3 border border-border rounded text-xs hover:bg-border text-muted transition-colors font-bold"
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
                      className="flex-1 px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-semibold"
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
                  <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-bold"
                    placeholder="Quantity"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                    Unit Type *
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                    placeholder="e.g. rolls, sheets, pcs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
                  Alert Limit *
                </label>
                <input
                  type="number"
                  value={alertLevel}
                  onChange={(e) => setAlertLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-bold"
                  placeholder="e.g. 5"
                  min="0"
                  required
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
