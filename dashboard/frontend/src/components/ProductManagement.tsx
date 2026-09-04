import React, { useState } from "react";
import { useStore, Product } from "../store/useStore";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Image as ImageIcon,
  X,
  Info
} from "./ui/solar-icons";
import { compressImage } from "../utils/imageCompressor";

// Allowed Categories and Subcategories matching the main website
const CATEGORIES = [
  "Acrylic Backlit Signage",
  "Neon Sign",
  "3D Signage",
  "2D Board",
  "House/Office Nameplate",
  "Wooden Signage",
  "2.5D Signage",
  "Acrylic Table Lamp",
  "3D Number Plate",
  "Double Sided Round Light Board"
];

const SUB_CATEGORIES: Record<string, string[]> = {
  "Acrylic Backlit Signage": ["Lobby & Reception", "Corporate Office", "Retail Storefront", "Luxury Showrooms"],
  "Neon Sign": ["Custom Script", "Bar & Restaurant", "Boutique & Salon", "Event Backdrop"],
  "3D Signage": ["Brushed Metal", "Glowing Halo", "Block Acrylic", "Fabricated Steel"],
  "2D Board": ["Directional & Directory", "Restaurant Menu", "Safety & Informational", "Exterior Panels"],
  "House/Office Nameplate": ["Executive Desk", "Premium Residential", "Modern Metallic", "Glass Finish"],
  "Wooden Signage": ["Laser Engraved", "Earthy Rustic Plank", "Live Edge Wood", "Wood-Acrylic Hybrid"],
  "2.5D Signage": ["Multi-Layered relief", "Textured CNC Cut", "Geometric Art Panel", "Abstract Relief"],
  "Acrylic Table Lamp": ["Branded Display Lamp", "3D Wireframe Illusion", "Bedside Glow Accent", "Minimalist Icon Lamp"],
  "3D Number Plate": ["Luxury Car Plate", "Bike Number Plate", "Villa Address Plaque", "Floating Mount Plate"],
  "Double Sided Round Light Board": ["Projecting Bracket Sign", "LED Rotating Box", "Vintage Flange Sign", "Urban Under-Canopy"]
};

export const ProductManagement: React.FC = () => {
  const { products, createProduct, updateProduct, deleteProduct, user } = useStore();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStock, setSelectedStock] = useState("All");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subCategory, setSubCategory] = useState(SUB_CATEGORIES[CATEGORIES[0]][0]);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("");
  const [stockStatus, setStockStatus] = useState<Product["stockStatus"]>("In Stock");
  const [productImages, setProductImages] = useState<string[]>(["", "", "", "", ""]);
  const [imageInputModes, setImageInputModes] = useState<("file" | "url")[]>(["file", "file", "file", "file", "file"]);
  const [imageUrls, setImageUrls] = useState<string[]>(["", "", "", "", ""]);
  const [specsText, setSpecsText] = useState("");

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Enforce Admin guard
  if (user?.role !== "admin") {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Access Denied. Admin privilege required.
      </div>
    );
  }

  // Handle Category Change inside the form
  const handleFormCategoryChange = (cat: string) => {
    setCategory(cat);
    const subs = SUB_CATEGORIES[cat] || [];
    if (subs.length > 0) {
      setSubCategory(subs[0]);
    } else {
      setSubCategory("");
    }
  };

  // Convert File to Compressed Base64 for a specific slot
  const handleSlotFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImage(file);
      setProductImages((prev) => {
        const next = [...prev];
        next[index] = compressedBase64;
        return next;
      });
    } catch (err: any) {
      alert(err.message || "Failed to process image file.");
    } finally {
      e.target.value = "";
    }
  };

  // Handle URL change for a specific slot
  const handleSlotUrlChange = (index: number, val: string) => {
    setImageUrls((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    setProductImages((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  // Clear a specific slot
  const clearSlot = (index: number) => {
    setProductImages((prev) => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
    setImageUrls((prev) => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
  };

  // Toggle input mode for a slot
  const toggleSlotInputMode = (index: number, mode: "file" | "url") => {
    setImageInputModes((prev) => {
      const next = [...prev];
      next[index] = mode;
      return next;
    });
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setCategory(CATEGORIES[0]);
    setSubCategory(SUB_CATEGORIES[CATEGORIES[0]][0]);
    setPrice("");
    setDescription("");
    setBadge("");
    setStockStatus("In Stock");
    setProductImages(["", "", "", "", ""]);
    setImageInputModes(["file", "file", "file", "file", "file"]);
    setImageUrls(["", "", "", "", ""]);
    setSpecsText("");
    setFormError("");
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (prod: Product) => {
    setEditingId(prod.id);
    setName(prod.name);
    setCategory(prod.category);
    setSubCategory(prod.subCategory);
    setPrice(prod.price.toString());
    setDescription(prod.description);
    setBadge(prod.badge || "");
    setStockStatus(prod.stockStatus);
    setSpecsText(prod.specs.join("\n"));
    setFormError("");

    // Populate the 5 image slots
    const imgs = [prod.image || ""];
    if (prod.image_urls && Array.isArray(prod.image_urls)) {
      prod.image_urls.forEach((url) => {
        if (url && imgs.length < 5) {
          imgs.push(url);
        }
      });
    }
    while (imgs.length < 5) {
      imgs.push("");
    }
    setProductImages(imgs);

    // Determine input modes and temp URLs
    const modes: ("file" | "url")[] = [];
    const tempUrls: string[] = [];
    imgs.forEach((img) => {
      if (img.startsWith("data:image")) {
        modes.push("file");
        tempUrls.push("");
      } else {
        modes.push("url");
        tempUrls.push(img);
      }
    });
    setImageInputModes(modes);
    setImageUrls(tempUrls);

    setModalOpen(true);
  };

  // Save Form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !price || !description.trim()) {
      setFormError("Please fill out all required fields.");
      return;
    }

    // Main image (slot 0) is required
    const mainImage = productImages[0];
    if (!mainImage) {
      setFormError("Product Main Image (Slot 1) is required.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError("Please enter a valid price.");
      return;
    }

    const specs = specsText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Additional images are slots 1, 2, 3, 4
    const additionalImages = productImages.slice(1).filter((img) => img !== "");

    const productData = {
      name: name.trim(),
      category,
      subCategory,
      price: priceNum,
      image: mainImage,
      image_urls: additionalImages,
      badge: badge.trim() || undefined,
      description: description.trim(),
      specs,
      stockStatus
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateProduct(editingId, productData);
      } else {
        await createProduct(productData);
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  // Inline Quick Updates
  const handleQuickPriceUpdate = async (prod: Product, newPriceStr: string) => {
    const nextPrice = parseFloat(newPriceStr);
    if (isNaN(nextPrice) || nextPrice < 0) return;
    try {
      await updateProduct(prod.id, { price: nextPrice });
    } catch (err) {
      console.error("Quick price update failed", err);
    }
  };

  const handleQuickStockUpdate = async (prod: Product, nextStock: Product["stockStatus"]) => {
    try {
      await updateProduct(prod.id, { stockStatus: nextStock });
    } catch (err) {
      console.error("Quick stock status update failed", err);
    }
  };

  const handleQuickBadgeUpdate = async (prod: Product, nextBadge: string) => {
    try {
      await updateProduct(prod.id, { badge: nextBadge.trim() || undefined });
    } catch (err) {
      console.error("Quick badge update failed", err);
    }
  };

  // Delete Action
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      try {
        await deleteProduct(id);
      } catch (err) {
        console.error("Delete product failed", err);
      }
    }
  };

  // Filters Engine
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesStock = selectedStock === "All" || p.stockStatus === selectedStock;

    return matchesSearch && matchesCat && matchesStock;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP ACTIONS BAR */}
      <div className="flex items-center justify-end">
        <button
          onClick={openCreateModal}
          style={{
            background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-black rounded-2xl font-bold text-xs transition-all shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          Add New Product
        </button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-card border border-border/80 rounded-[28px] shadow-xs p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative group">
          <input
            type="text"
            placeholder="Search catalog products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-border/80 rounded-2xl bg-background/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold placeholder:text-muted/60 transition-all"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted group-focus-within:text-accent transition-colors" />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3.5 py-2 border border-border/80 bg-background/60 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-foreground font-semibold cursor-pointer transition-all"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Stock Status Filter */}
        <select
          value={selectedStock}
          onChange={(e) => {
            setSelectedStock(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3.5 py-2 border border-border/80 bg-background/60 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-foreground font-semibold cursor-pointer transition-all"
        >
          <option value="All">All Stock Statuses</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Custom Order Only">Custom Order Only</option>
        </select>
      </div>

      {/* CATALOG DATA TABLE */}
      <div className="bg-card border border-border/80 rounded-[28px] shadow-xs overflow-hidden overflow-x-auto">
        {paginatedProducts.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <ImageIcon className="mx-auto text-muted/30 mb-3" size={48} />
            <h3 className="font-bold text-sm text-foreground">No Products Found</h3>
            <p className="text-xs text-muted mt-1">Try resetting filters or search query.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-border/70 bg-muted/10 text-[10px] font-bold text-muted uppercase tracking-wider">
                <th className="p-4 w-20">Preview</th>
                <th className="p-4">Name / ID</th>
                <th className="p-4 w-48">Category</th>
                <th className="p-4 w-32">Price (Rs.)</th>
                <th className="p-4 w-32">Badge</th>
                <th className="p-4 w-40">Stock Status</th>
                <th className="p-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {paginatedProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-muted/10 transition-colors">
                  {/* Image Preview */}
                  <td className="p-4">
                    <div className="relative h-12 w-10 bg-muted/20 border border-border/80 rounded-xl overflow-hidden flex items-center justify-center">
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon size={18} className="text-muted/40" />
                      )}
                    </div>
                  </td>

                  {/* Name and ID */}
                  <td className="p-4">
                    <div className="font-bold text-foreground line-clamp-1">{prod.name}</div>
                    <div className="text-[10px] text-muted font-mono mt-0.5">ID: {prod.id}</div>
                  </td>

                  {/* Category / Sub */}
                  <td className="p-4">
                    <div className="font-semibold text-foreground">{prod.category}</div>
                    <div className="text-[10px] text-muted mt-0.5 uppercase tracking-wide font-medium">
                      {prod.subCategory}
                    </div>
                  </td>

                  {/* Price (Inline Editable) */}
                  <td className="p-4">
                    <div className="relative flex items-center">
                      <span className="text-xs text-muted absolute left-2 font-semibold">Rs.</span>
                      <input
                        type="number"
                        defaultValue={prod.price}
                        onBlur={(e) => handleQuickPriceUpdate(prod, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleQuickPriceUpdate(prod, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className="w-full pl-8 pr-2 py-1.5 border border-transparent rounded-xl bg-transparent focus:bg-background/80 focus:border-border/80 text-foreground text-xs font-bold tabular-nums focus:outline-none transition-all"
                      />
                    </div>
                  </td>

                  {/* Badge (Inline Editable) */}
                  <td className="p-4">
                    <input
                      type="text"
                      defaultValue={prod.badge || ""}
                      onBlur={(e) => handleQuickBadgeUpdate(prod, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleQuickBadgeUpdate(prod, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      placeholder="None"
                      className="w-full px-2 py-1.5 border border-transparent rounded-xl bg-transparent focus:bg-background/80 focus:border-border/80 text-foreground text-xs font-semibold focus:outline-none transition-all"
                    />
                  </td>

                  {/* Stock Status Select (Inline Editable) */}
                  <td className="p-4">
                    <select
                      value={prod.stockStatus}
                      onChange={(e) => handleQuickStockUpdate(prod, e.target.value as Product["stockStatus"])}
                      className={`text-xs font-semibold rounded-xl bg-transparent border border-transparent hover:border-border/80 px-2 py-1 focus:bg-background/80 focus:outline-none cursor-pointer ${
                        prod.stockStatus === "In Stock"
                          ? "text-green-600 dark:text-green-400"
                          : prod.stockStatus === "Low Stock"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-muted"
                      }`}
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Custom Order Only">Custom Order Only</option>
                    </select>
                  </td>

                  {/* Edit / Delete Buttons */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 rounded-xl bg-card border border-border/80 text-foreground hover:bg-muted/20 transition-all shadow-2xs cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id, prod.name)}
                        className="p-1.5 rounded-xl bg-card border border-border/80 text-red-500 hover:bg-red-500/10 transition-all shadow-2xs cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs font-bold text-muted uppercase tracking-wider">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-border/80 bg-card rounded-xl hover:bg-muted/20 text-foreground disabled:opacity-40 transition-all shadow-xs cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-border/80 bg-card rounded-xl hover:bg-muted/20 text-foreground disabled:opacity-40 transition-all shadow-xs cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* CREATE / EDIT DIALOG MODAL */}
      {modalOpen && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 pt-20 sm:p-4 overflow-y-auto">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

          {/* Form Card */}
          <div className="bg-card border border-border/80 rounded-[28px] shadow-2xl w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto z-10 flex flex-col p-6 sm:p-8 space-y-5 animate-slide-up relative">
            <button
              onClick={() => setModalOpen(false)}
              className="p-1.5 rounded-xl hover:bg-muted/20 text-muted hover:text-foreground absolute right-5 top-5 transition-all cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <h2 className="text-base sm:text-lg font-bold font-display text-foreground border-b border-border/60 pb-3">
              {editingId ? "Edit Product Details" : "Create New Product Listing"}
            </h2>

            {formError && (
              <div className="p-3.5 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-semibold flex items-center gap-2">
                <Info size={14} className="flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-muted uppercase tracking-wider">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Name */}
                <div>
                  <label className="block mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., Neon Script Sign"
                    className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background/60 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent normal-case font-medium transition-all"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block mb-1.5">Price (Rs.) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-muted font-bold">Rs.</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="5000"
                      className="w-full pl-10 pr-3.5 py-2.5 border border-border/80 rounded-2xl bg-background/60 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-bold transition-all"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Select */}
                <div>
                  <label className="block mb-1.5">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => handleFormCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background/60 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-bold cursor-pointer transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub Category Select */}
                <div>
                  <label className="block mb-1.5">Sub Category *</label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background/60 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-bold cursor-pointer transition-all"
                  >
                    {(SUB_CATEGORIES[category] || []).map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Badge Label */}
                <div>
                  <label className="block mb-1.5">Product Badge Label</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="E.g., Best Seller, New, Hot Buy (Optional)"
                    className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background/60 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent normal-case font-medium transition-all"
                  />
                </div>

                {/* Stock Status */}
                <div>
                  <label className="block mb-1.5">Stock Status *</label>
                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value as Product["stockStatus"])}
                    className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background/60 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-bold cursor-pointer transition-all"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Custom Order Only">Custom Order Only</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1.5">Description Overview *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of material composition, usage parameters..."
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background/60 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent normal-case font-medium resize-none transition-all"
                  required
                />
              </div>

              {/* Specs List */}
              <div>
                <label className="mb-1.5 flex justify-between">
                  <span>Technical Specifications Checklist</span>
                  <span className="text-[10px] text-muted normal-case font-medium">One spec per line</span>
                </label>
                <textarea
                  rows={4}
                  value={specsText}
                  onChange={(e) => setSpecsText(e.target.value)}
                  placeholder="12V flex neon tubing&#10;Frosted Cast Acrylic faceplate&#10;Include 12V transformer"
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background/60 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent normal-case font-medium resize-none transition-all"
                />
              </div>

              {/* IMAGE LOADER WIDGET */}
              <div className="border border-border/80 rounded-2xl p-4 bg-muted/10 space-y-4">
                <span className="font-bold text-xs text-foreground block border-b border-border/60 pb-2">Product Images (Up to 5 Images)</span>
                <div className="space-y-4 divide-y divide-border/40">
                  {[0, 1, 2, 3, 4].map((index) => {
                    const isMain = index === 0;
                    const mode = imageInputModes[index];
                    const img = productImages[index];
                    const urlVal = imageUrls[index];

                    return (
                      <div key={index} className={`pt-4 ${index === 0 ? "pt-0 border-t-0" : "border-t"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
                            Slot {index + 1} {isMain ? "(Main Image - Required)" : "(Additional Image)"}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => toggleSlotInputMode(index, "file")}
                              className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold border transition-all cursor-pointer ${
                                mode === "file"
                                  ? "bg-accent border-accent text-white shadow-2xs"
                                  : "border-border/80 text-muted hover:text-foreground hover:bg-muted/20"
                              }`}
                            >
                              File
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleSlotInputMode(index, "url")}
                              className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold border transition-all cursor-pointer ${
                                mode === "url"
                                  ? "bg-accent border-accent text-white shadow-2xs"
                                  : "border-border/80 text-muted hover:text-foreground hover:bg-muted/20"
                              }`}
                            >
                              URL
                            </button>
                            {img && (
                              <button
                                type="button"
                                onClick={() => clearSlot(index)}
                                className="px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold border border-red-500/35 hover:bg-red-500/10 text-red-500 transition-all cursor-pointer"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>

                        {mode === "file" ? (
                          <div className="flex items-center gap-4">
                            <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/80 hover:border-accent hover:bg-accent/5 rounded-2xl p-4 cursor-pointer transition-all w-full group">
                              <ImageIcon size={18} className="text-muted group-hover:text-accent mb-1 transition-colors" />
                              <span className="text-[9px] text-muted font-black uppercase tracking-wider text-center group-hover:text-foreground">
                                Upload image {index + 1}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleSlotFileChange(index, e)}
                                className="hidden"
                              />
                            </label>
                            {img && (
                              <div className="h-16 w-14 border border-border/80 bg-muted/20 rounded-2xl overflow-hidden relative flex-shrink-0 shadow-xs">
                                <img src={img} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <input
                              type="text"
                              value={urlVal}
                              onChange={(e) => handleSlotUrlChange(index, e.target.value)}
                              placeholder={`https://example.com/image-${index + 1}.jpg`}
                              className="flex-1 w-full px-3.5 py-2 border border-border/80 rounded-2xl bg-background/60 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent normal-case font-medium transition-all"
                            />
                            {img && (
                              <div className="h-10 w-10 border border-border/80 bg-muted/20 rounded-xl overflow-hidden flex-shrink-0 shadow-xs">
                                <img src={img} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SAVE / CANCEL BUTTONS */}
              <div className="flex gap-3 justify-end pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-border/80 rounded-2xl font-bold text-xs text-foreground hover:bg-muted/20 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
                  }}
                  className="px-6 py-2.5 text-black rounded-2xl font-bold text-xs transition-all shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving Listing..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
