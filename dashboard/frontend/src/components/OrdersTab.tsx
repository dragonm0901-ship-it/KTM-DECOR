import React, { useState } from "react";
import { useStore, Order } from "../store/useStore";
import {
  Plus,
  Trash2,
  Edit2,
  Package,
  User,
  Phone,
  Mail,
  Search,
  Upload,
  X,
  MapPin,
  Clock,
  Eye
} from "./ui/solar-icons";
import { OrderDetailModal } from "./OrderDetailModal";
import { compressImage } from "../utils/imageCompressor";
import { NepaliDatePicker } from "./ui/NepaliDatePicker";
import { formatNepali } from "../utils/nepaliDate";
import { OrderPhotoStack } from "./ui/OrderPhotoStack";
import { OrderPhotoGalleryModal } from "./ui/OrderPhotoGalleryModal";

export const OrdersTab: React.FC = () => {
  const { orders, createOrder, updateOrder, deleteOrder, user, users } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedViewOrder, setSelectedViewOrder] = useState<Order | null>(null);

  // Form States
  const [productName, setProductName] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryPrice, setDeliveryPrice] = useState("0");
  const [installationPrice, setInstallationPrice] = useState("0");
  const [advancePayment, setAdvancePayment] = useState("0");
  const [color, setColor] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [locationImages, setLocationImages] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderFrom, setOrderFrom] = useState<Order["orderFrom"]>("direct");
  const [paymentMethod, setPaymentMethod] = useState<Order["paymentMethod"]>("cash");
  const [manufacturingNotes, setManufacturingNotes] = useState("");
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [assigneeId, setAssigneeId] = useState("");
  const [stage, setStage] = useState<Order["stage"]>("design");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    | "createdAt_desc"
    | "createdAt_asc"
    | "deliveryDate_asc"
    | "deliveryDate_desc"
    | "totalPrice_desc"
    | "totalPrice_asc"
  >("createdAt_desc");

  // Lightbox Photo Gallery State
  const [galleryOrder, setGalleryOrder] = useState<Order | null>(null);
  const [galleryType, setGalleryType] = useState<"product" | "location">("product");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleOpenGallery = (order: Order, type: "product" | "location") => {
    setGalleryOrder(order);
    setGalleryType(type);
    setIsGalleryOpen(true);
  };

  const openCreateModal = () => {
    setEditingOrder(null);
    setProductName("");
    setSize("");
    setPrice("");
    setDeliveryPrice("0");
    setInstallationPrice("0");
    setAdvancePayment("0");
    setColor("");
    setProductImages([]);
    setLocationImages([]);
    setCustomerName("");
    setCustomerContact("");
    setCustomerEmail("");
    setCustomerAddress("");
    setOrderFrom("direct");
    setPaymentMethod("cash");
    setManufacturingNotes("");
    setOrderDate(new Date().toISOString().split("T")[0]);
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDeliveryDate(d.toISOString().split("T")[0]);
    setAssigneeId("");
    setStage("design");
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setProductName(order.productName);
    setSize(order.size);
    setPrice(order.price.toString());
    setDeliveryPrice(order.deliveryPrice.toString());
    setInstallationPrice(order.installationPrice.toString());
    setAdvancePayment((order.advancePayment || 0).toString());
    setColor(order.color);
    const pImgs = Array.isArray(order.productImages) && order.productImages.length > 0
      ? order.productImages
      : (order.productImageUrl ? [order.productImageUrl] : []);
    const lImgs = Array.isArray(order.locationImages) && order.locationImages.length > 0
      ? order.locationImages
      : (order.locationImageUrl ? [order.locationImageUrl] : []);
    setProductImages(pImgs);
    setLocationImages(lImgs);
    setCustomerName(order.customerName);
    setCustomerContact(order.customerContact);
    setCustomerEmail(order.customerEmail || "");
    setCustomerAddress(order.customerAddress);
    setOrderFrom(order.orderFrom);
    setPaymentMethod(order.paymentMethod);
    setManufacturingNotes(order.manufacturingNotes || "");
    setOrderDate(order.orderDate ? order.orderDate.split("T")[0] : (order.createdAt ? order.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]));
    setDeliveryDate(order.deliveryDate ? order.deliveryDate.split("T")[0] : "");
    setAssigneeId(order.assignee?._id || "");
    setStage(order.stage);
    setFormError("");
    setShowModal(true);
  };

  const handleMultiImageAdd = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "product" | "location"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxAllowed = type === "product" ? 6 : 4;
    const currentList = type === "product" ? productImages : locationImages;
    const remainingSlots = maxAllowed - currentList.length;

    if (remainingSlots <= 0) {
      alert(`Maximum of ${maxAllowed} ${type === "product" ? "product" : "location/site"} photos reached.`);
      e.target.value = "";
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    try {
      const compressedList = await Promise.all(
        filesToProcess.map((file) => compressImage(file))
      );

      if (type === "product") {
        setProductImages((prev) => [...prev, ...compressedList].slice(0, 6));
      } else {
        setLocationImages((prev) => [...prev, ...compressedList].slice(0, 4));
      }
      setFormError("");
    } catch (err: any) {
      setFormError(err.message || "Failed to process selected image(s).");
    } finally {
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number, type: "product" | "location") => {
    if (type === "product") {
      setProductImages((prev) => prev.filter((_, idx) => idx !== index));
    } else {
      setLocationImages((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (
      !productName.trim() ||
      !size.trim() ||
      !price ||
      !color.trim() ||
      !customerName.trim() ||
      !customerContact.trim() ||
      !customerAddress.trim() ||
      !deliveryDate
    ) {
      setFormError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    const orderData = {
      productName,
      size,
      price: Number(price),
      deliveryPrice: Number(deliveryPrice) || 0,
      installationPrice: Number(installationPrice) || 0,
      advancePayment: Number(advancePayment) || 0,
      color,
      productImages: productImages.slice(0, 6),
      productImageUrl: productImages[0] || "",
      locationImages: locationImages.slice(0, 4),
      locationImageUrl: locationImages[0] || "",
      customerName,
      customerContact,
      customerEmail,
      customerAddress,
      orderFrom,
      paymentMethod,
      manufacturingNotes,
      orderDate: orderDate || new Date().toISOString().split("T")[0],
      deliveryDate,
      assignee: assigneeId || null,
    };

    try {
      if (editingOrder) {
        if (user?.role === "admin") {
          await updateOrder(editingOrder._id, orderData);
          if (stage !== editingOrder.stage) {
            await useStore.getState().updateOrderProgress(editingOrder._id, stage);
          }
        } else {
          // Staff can only update progress
          if (stage !== editingOrder.stage) {
            await useStore.getState().updateOrderProgress(editingOrder._id, stage);
          }
        }
      } else {
        await createOrder(orderData);
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err.message || "Something went wrong while saving the order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(orderId);
      } catch (err) {
        console.error("Failed to delete order", err);
      }
    }
  };

  // Filter & Sort orders strictly by date
  const filteredOrders = React.useMemo(() => {
    return orders
      .filter((o) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          o.productName.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query) ||
          o.customerContact.includes(query) ||
          o.customerAddress.toLowerCase().includes(query) ||
          (o.assignee && o.assignee.name.toLowerCase().includes(query)) ||
          (o.customerEmail && o.customerEmail.toLowerCase().includes(query));

        const matchesSource = sourceFilter === "all" || o.orderFrom === sourceFilter;
        const matchesStage = stageFilter === "all" || o.stage === stageFilter;

        return matchesSearch && matchesSource && matchesStage;
      })
      .sort((a, b) => {
        if (sortBy === "createdAt_desc") {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        }
        if (sortBy === "createdAt_asc") {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeA - timeB;
        }
        if (sortBy === "deliveryDate_asc") {
          const timeA = new Date(a.deliveryDate || 0).getTime();
          const timeB = new Date(b.deliveryDate || 0).getTime();
          return timeA - timeB;
        }
        if (sortBy === "deliveryDate_desc") {
          const timeA = new Date(a.deliveryDate || 0).getTime();
          const timeB = new Date(b.deliveryDate || 0).getTime();
          return timeB - timeA;
        }
        if (sortBy === "totalPrice_desc") {
          return (b.totalPrice || 0) - (a.totalPrice || 0);
        }
        if (sortBy === "totalPrice_asc") {
          return (a.totalPrice || 0) - (b.totalPrice || 0);
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [orders, searchQuery, sourceFilter, stageFilter, sortBy]);

  const getSourceBadge = (source: Order["orderFrom"]) => {
    switch (source) {
      case "tiktok":
        return "bg-black text-white shadow-xs font-bold";
      case "instagram":
        return "bg-pink-600 text-white shadow-xs font-bold";
      case "whatsapp":
        return "bg-emerald-600 text-white shadow-xs font-bold";
      case "direct":
        return "bg-blue-600 text-white shadow-xs font-bold";
      default:
        return "bg-slate-700 text-white shadow-xs font-bold";
    }
  };

  const getPaymentBadge = (method: Order["paymentMethod"]) => {
    switch (method) {
      case "esewa":
        return "bg-teal-600 text-white shadow-xs font-bold";
      case "online_banking":
        return "bg-indigo-600 text-white shadow-xs font-bold";
      case "cheque":
        return "bg-amber-600 text-white shadow-xs font-bold";
      case "cash":
      default:
        return "bg-emerald-700 text-white shadow-xs font-bold";
    }
  };

  const calculateUrgency = (dateStr: string, approved: boolean, stage?: string) => {
    if (stage === "paid") return { label: "Paid", subLabel: "", color: "bg-emerald-600 text-white font-extrabold shadow-xs" };
    if (approved || stage === "delivered") return { label: "Delivered", subLabel: "", color: "bg-blue-600 text-white font-extrabold shadow-xs" };
    if (!dateStr) return { label: "No Deadline", subLabel: "", color: "bg-slate-600 text-white font-bold shadow-xs" };
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const delivery = new Date(dateStr);
    delivery.setHours(0, 0, 0, 0);

    const diffTime = delivery.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: "Overdue", subLabel: `(${Math.abs(diffDays)}d ago)`, color: "bg-red-600 text-white font-extrabold shadow-xs animate-pulse-dots" };
    } else if (diffDays === 0) {
      return { label: "Urgent", subLabel: "(Today)", color: "bg-red-600 text-white font-extrabold shadow-xs" };
    } else if (diffDays <= 2) {
      return { label: "High", subLabel: `(${diffDays === 1 ? "Tomorrow" : `${diffDays}d left`})`, color: "bg-amber-600 text-white font-extrabold shadow-xs" };
    } else if (diffDays <= 4) {
      return { label: "Medium", subLabel: `(${diffDays}d left)`, color: "bg-yellow-600 text-white font-extrabold shadow-xs" };
    } else {
      return { label: "Normal", subLabel: `(${diffDays}d left)`, color: "bg-blue-600 text-white font-extrabold shadow-xs" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <Package className="text-accent" />
            Manual Orders Registry
          </h1>
          <p className="text-xs text-muted mt-1">
            Create, update, and manage offline and online business orders for KTM DECOR.
          </p>
        </div>

        {user?.role === "admin" && (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-accent hover:bg-accent-dark text-white rounded font-bold text-xs transition-all shadow-md shadow-accent/15 self-start sm:self-auto"
          >
            <Plus size={16} />
            Post New Order
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs transition-all duration-200"
            placeholder="Search by customer, address, product, or assignee..."
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Source Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted font-medium">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold cursor-pointer transition-all duration-200"
            >
              <option value="all">All Sources</option>
              <option value="tiktok">Tiktok</option>
              <option value="instagram">Instagram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="direct">Direct Order</option>
            </select>
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted font-medium">Progress:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold cursor-pointer transition-all duration-200"
            >
              <option value="all">All Stages</option>
              <option value="design">Design</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="completed">Completed</option>
              <option value="delivered">Delivered</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold cursor-pointer transition-all duration-200"
            >
              <option value="createdAt_desc">Entry Date (Newest First)</option>
              <option value="createdAt_asc">Entry Date (Oldest First)</option>
              <option value="deliveryDate_asc">Delivery Date (Earliest First)</option>
              <option value="deliveryDate_desc">Delivery Date (Latest First)</option>
              <option value="totalPrice_desc">Total Amount (Highest First)</option>
              <option value="totalPrice_asc">Total Amount (Lowest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-card text-muted border-b border-border uppercase font-semibold tracking-wider text-[10px]">
                <th className="p-4 min-w-[240px]">Product Info & Images</th>
                <th className="p-4 min-w-[190px]">Customer & Channel</th>
                <th className="p-4 min-w-[220px]">Delivery & Assignee</th>
                <th className="p-4 min-w-[160px]">Pricing Details</th>
                <th className="p-4 min-w-[145px] text-center">Progress Status</th>
                <th className="p-3 w-14 min-w-[56px] text-center sticky right-0 bg-card z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.06)] border-l border-border/80">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted">
                    No orders matching selected criteria
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-border/20 transition-colors animate-fade-in group">
                    <td className="p-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Stacked Product Image */}
                          <OrderPhotoStack
                            images={order.productImages && order.productImages.length > 0 ? order.productImages : (order.productImageUrl ? [order.productImageUrl] : [])}
                            type="product"
                            size="md"
                            onClick={() => handleOpenGallery(order, "product")}
                          />
                          {/* Stacked Location Image */}
                          <OrderPhotoStack
                            images={order.locationImages && order.locationImages.length > 0 ? order.locationImages : (order.locationImageUrl ? [order.locationImageUrl] : [])}
                            type="location"
                            size="md"
                            onClick={() => handleOpenGallery(order, "location")}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{order.productName}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted">
                            <span>Size: <strong className="text-foreground">{order.size}</strong></span>
                            <span>•</span>
                            <span>Color: <strong className="text-foreground">{order.color}</strong></span>
                          </div>
                          {order.manufacturingNotes && (
                            <p className="text-[10px] text-muted mt-1.5 bg-border/20 px-1.5 py-0.5 rounded leading-normal border border-border/40 font-medium max-w-xs break-words">
                              <span className="text-[8px] text-accent uppercase font-extrabold mr-1 tracking-wider">Note:</span>
                              {order.manufacturingNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <User size={12} className="text-accent" />
                          {order.customerName}
                        </div>
                        <div className="text-[10px] text-muted flex items-center gap-1.5">
                          <Phone size={10} />
                          {order.customerContact}
                        </div>
                        {order.customerEmail && (
                          <div className="text-[10px] text-muted flex items-center gap-1.5">
                            <Mail size={10} />
                            {order.customerEmail}
                          </div>
                        )}
                        <div className="text-[10px] text-muted flex items-center gap-1.5 font-medium">
                          <MapPin size={10} className="text-accent" />
                          {order.customerAddress}
                        </div>
                        {/* Channel & Payment Method Badges */}
                        <div className="flex items-center gap-1.5 pt-1 mt-1 border-t border-border/40">
                          <span className={`px-1.5 py-0.2 border text-[8px] font-bold rounded uppercase tracking-wider ${getSourceBadge(order.orderFrom)}`}>
                            {order.orderFrom}
                          </span>
                          <span className={`px-1.5 py-0.2 border text-[8px] font-bold rounded uppercase tracking-wider ${getPaymentBadge(order.paymentMethod)}`}>
                            {order.paymentMethod.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 min-w-[220px]">
                      <div className="space-y-1.5 bg-border/10 p-2.5 rounded-xl border border-border/60">
                        <div className="text-[10px] text-muted flex items-center justify-between">
                          <span className="font-semibold text-muted uppercase text-[9px] tracking-wider">Order:</span>
                          <span className="font-bold text-foreground bg-background px-2 py-0.5 rounded border border-border/50">{formatNepali(order.orderDate || order.createdAt)}</span>
                        </div>
                        <div className="text-[11px] text-foreground flex items-center justify-between pt-1 border-t border-border/40">
                          <span className="flex items-center gap-1 font-bold text-accent text-[9px] uppercase tracking-wider">
                            <Clock size={11} /> Target:
                          </span>
                          <span className="font-extrabold text-foreground">{formatNepali(order.deliveryDate)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
                          {(() => {
                            const urgency = calculateUrgency(order.deliveryDate, order.approved, order.stage);
                            return (
                              <div className={`px-2 py-0.5 rounded text-center leading-tight shadow-xs ${urgency.color}`}>
                                <span className="block text-[9px] uppercase font-black tracking-wider">{urgency.label}</span>
                                {urgency.subLabel && (
                                  <span className="block text-[7.5px] font-bold opacity-95 leading-none mt-0.5">{urgency.subLabel}</span>
                                )}
                              </div>
                            );
                          })()}
                          <div className="text-[10px] text-muted font-medium truncate max-w-[110px] text-right" title={order.assignee?.name || "Unassigned"}>
                            Lead: <strong className="text-foreground">{order.assignee?.name || "Unassigned"}</strong>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 text-right w-max ml-auto">
                        <div className="text-[10px] text-muted-foreground flex flex-col items-end gap-0.5 mb-1">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Adv: Rs. {(order.advancePayment || 0).toLocaleString()}</span>
                          <span className="text-red-500 font-bold">Due: Rs. {(order.duePayment || 0).toLocaleString()}</span>
                        </div>
                        <div className="font-extrabold text-foreground border-t border-border/70 pt-1 mt-1">Total: Rs. {order.totalPrice.toLocaleString()}</div>
                        <div className="text-[9px] text-muted space-x-1">
                          <span>Base: {order.price.toLocaleString()}</span>
                          <span>|</span>
                          <span>Del: {order.deliveryPrice}</span>
                          <span>|</span>
                          <span>Inst: {order.installationPrice}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={order.stage}
                        disabled={order.approved && order.stage === "paid" && user?.role !== "admin"}
                        onChange={async (e) => {
                          const targetStage = e.target.value as Order["stage"];
                          if (targetStage === order.stage) return;
                          
                          if (window.confirm(`Are you sure you want to change status to ${targetStage.toUpperCase()}?`)) {
                            try {
                              await useStore.getState().updateOrderProgress(order._id, targetStage);
                            } catch (err: any) {
                              alert(err.message || "Failed to update order progress.");
                            }
                          }
                        }}
                        className={`px-2.5 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border-0 cursor-pointer focus:outline-none shadow-sm text-white transition-colors ${
                          order.stage === "paid"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : order.stage === "delivered" || order.approved
                            ? "bg-blue-600 hover:bg-blue-700"
                            : order.stage === "completed"
                            ? "bg-purple-600 hover:bg-purple-700"
                            : order.stage === "manufacturing"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-amber-600 hover:bg-amber-700"
                        }`}
                      >
                        <option value="design" className="bg-card text-foreground font-bold">Design Process</option>
                        <option value="manufacturing" className="bg-card text-foreground font-bold">Manufacturing Process</option>
                        <option value="completed" className="bg-card text-foreground font-bold">Completed</option>
                        <option value="delivered" className="bg-card text-foreground font-bold">Delivered</option>
                        <option value="paid" className="bg-card text-foreground font-bold">Paid</option>
                      </select>
                      {order.approved && (
                        <div className="text-[8px] text-green-600 dark:text-green-400 font-extrabold mt-1 uppercase tracking-wider">
                          Verified & Approved ✓
                        </div>
                      )}
                    </td>
                    {/* Sticky Vertically Stacked Actions Column */}
                    <td className="p-3 w-14 min-w-[56px] text-center sticky right-0 bg-card z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.06)] border-l border-border/80 group-hover:bg-border/10 transition-colors">
                      <div className="flex flex-col items-center justify-center gap-1.5 mx-auto">
                        <button
                          onClick={() => setSelectedViewOrder(order)}
                          className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm"
                          title="View Full Details"
                        >
                          <Eye size={13} />
                        </button>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => openEditModal(order)}
                            className="p-1.5 bg-accent hover:bg-accent-dark text-white rounded-lg transition-all shadow-sm"
                            title="Edit Order"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        {user?.role === "admin" && (
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-sm"
                            title="Delete Order"
                          >
                            <Trash2 size={13} />
                          </button>
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

      {/* Creation/Editing Modal */}
      {showModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm pt-10 sm:pt-0 px-2 pb-6 sm:p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-2xl rounded-lg border border-border p-3 sm:p-6 shadow-2xl animate-scale-up mt-1 mb-4 sm:my-4 max-h-[40vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <Package className="text-accent" />
                {editingOrder 
                  ? (user?.role === "admin" ? "Edit Registry Order" : "View Details / Status") 
                  : "Post Manual Client Order"}
              </h2>
              <button
                type="button"
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* COLUMN 1: PRODUCT INFO */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-border pb-1">
                    1. Product & Design Details
                  </h3>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm disabled:opacity-75 disabled:bg-border/10"
                      placeholder="e.g. Backlit LED Reception Sign"
                      required
                      disabled={user?.role !== "admin"}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Size *
                      </label>
                      <input
                        type="text"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm disabled:opacity-75 disabled:bg-border/10"
                        placeholder="e.g. 2 x 3 ft"
                        required
                        disabled={user?.role !== "admin"}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Color *
                      </label>
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm disabled:opacity-75 disabled:bg-border/10"
                        placeholder="e.g. Warm White"
                        required
                        disabled={user?.role !== "admin"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Base Price *
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-2.5 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-bold disabled:opacity-75 disabled:bg-border/10"
                        placeholder="Rs."
                        min="0"
                        required
                        disabled={user?.role !== "admin"}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Delivery Cost
                      </label>
                      <input
                        type="number"
                        value={deliveryPrice}
                        onChange={(e) => setDeliveryPrice(e.target.value)}
                        className="w-full px-2.5 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm disabled:opacity-75 disabled:bg-border/10"
                        placeholder="Rs."
                        min="0"
                        disabled={user?.role !== "admin"}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Install Cost
                      </label>
                      <input
                        type="number"
                        value={installationPrice}
                        onChange={(e) => setInstallationPrice(e.target.value)}
                        className="w-full px-2.5 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm disabled:opacity-75 disabled:bg-border/10"
                        placeholder="Rs."
                        min="0"
                        disabled={user?.role !== "admin"}
                      />
                    </div>
                  </div>

                  {/* Calculated total summary */}
                  <div className="p-3 bg-accent/5 border border-accent/10 rounded flex justify-between items-center text-xs">
                    <span className="font-bold text-muted uppercase tracking-wide">Estimated Order Total:</span>
                    <strong className="text-base text-accent font-display">
                      Rs. {((Number(price) || 0) + (Number(deliveryPrice) || 0) + (Number(installationPrice) || 0)).toLocaleString()}
                    </strong>
                  </div>

                  {/* Advance & Due Payment Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Advance Payment (Prepaid)
                      </label>
                      <input
                        type="number"
                        value={advancePayment}
                        onChange={(e) => setAdvancePayment(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-bold text-emerald-600 dark:text-emerald-400 disabled:opacity-75 disabled:bg-border/10"
                        placeholder="Rs."
                        min="0"
                        disabled={user?.role !== "admin"}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Calculated Due Amount
                      </label>
                      <div className="px-3 py-2.5 border border-border rounded bg-border/20 text-sm font-bold text-red-500">
                        Rs. {Math.max(0, ((Number(price) || 0) + (Number(deliveryPrice) || 0) + (Number(installationPrice) || 0) - (Number(advancePayment) || 0))).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Order Date, Delivery Date & Assignee Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Order Date (अर्डर मिति) *
                      </label>
                      <NepaliDatePicker
                        value={orderDate}
                        onChange={(iso) => setOrderDate(iso)}
                        disabled={user?.role !== "admin"}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Delivery Target (डेलिभरी) *
                      </label>
                      <NepaliDatePicker
                        value={deliveryDate}
                        onChange={(iso) => setDeliveryDate(iso)}
                        disabled={user?.role !== "admin"}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Assign Project Lead
                      </label>
                      <select
                        value={assigneeId}
                        onChange={(e) => setAssigneeId(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-semibold cursor-pointer disabled:opacity-75 disabled:bg-border/10"
                        disabled={user?.role !== "admin"}
                      >
                        <option value="">Select Assignee</option>
                        {users
                          .filter((u) => u.email !== "staff@ktmdecor.com")
                          .map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name} ({u.role === "admin" ? "Admin" : "Staff"})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Order Stage Selection (Only when editing) */}
                  {editingOrder && (
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Order Stage (Progress Status)
                      </label>
                      <select
                        value={stage}
                        onChange={(e) => setStage(e.target.value as Order["stage"])}
                        className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-semibold cursor-pointer"
                      >
                        <option value="design">Design Process</option>
                        <option value="manufacturing">Manufacturing Process</option>
                        <option value="completed">Completed</option>
                        <option value="delivered">Delivered</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  )}

                  {/* Multi-Image Uploads System */}
                  <div className="space-y-4 pt-1">
                    {/* Product Photos (Max 6) */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                          <Package size={12} className="text-accent" />
                          <span>Product Sign Photos</span>
                        </label>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          productImages.length === 6 ? "bg-amber-500/15 text-amber-600" : "bg-accent/10 text-accent"
                        }`}>
                          {productImages.length}/6 Uploaded
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {productImages.map((imgUrl, idx) => (
                          <div
                            key={`prod-preview-${idx}`}
                            className="relative h-16 rounded-xl border border-border overflow-hidden bg-background group shadow-xs"
                          >
                            <img src={imgUrl} alt={`Product ${idx + 1}`} className="h-full w-full object-cover" />
                            <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[7px] font-bold text-white text-center py-0.5">
                              #{idx + 1}
                            </span>
                            {user?.role === "admin" && (
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx, "product")}
                                className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors shadow-sm"
                                title="Remove photo"
                              >
                                <X size={10} />
                              </button>
                            )}
                          </div>
                        ))}

                        {user?.role === "admin" && productImages.length < 6 && (
                          <label className="h-16 flex flex-col items-center justify-center border-2 border-dashed border-border/80 hover:border-accent hover:bg-accent/[0.03] rounded-xl cursor-pointer transition-all text-center p-1 group">
                            <Upload size={14} className="text-accent group-hover:scale-110 transition-transform mb-0.5" />
                            <span className="text-[8px] font-bold text-muted group-hover:text-foreground leading-tight">
                              Add Photo
                            </span>
                            <span className="text-[6px] text-muted/60">
                              (Max {6 - productImages.length} left)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleMultiImageAdd(e, "product")}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Location/Site Photos (Max 4) */}
                    <div className="space-y-2 pt-1 border-t border-border/50">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin size={12} className="text-accent" />
                          <span>Installation / Site Photos</span>
                        </label>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          locationImages.length === 4 ? "bg-amber-500/15 text-amber-600" : "bg-accent/10 text-accent"
                        }`}>
                          {locationImages.length}/4 Uploaded
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {locationImages.map((imgUrl, idx) => (
                          <div
                            key={`loc-preview-${idx}`}
                            className="relative h-16 rounded-xl border border-border overflow-hidden bg-background group shadow-xs"
                          >
                            <img src={imgUrl} alt={`Site ${idx + 1}`} className="h-full w-full object-cover" />
                            <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[7px] font-bold text-white text-center py-0.5">
                              #{idx + 1}
                            </span>
                            {user?.role === "admin" && (
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx, "location")}
                                className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors shadow-sm"
                                title="Remove photo"
                              >
                                <X size={10} />
                              </button>
                            )}
                          </div>
                        ))}

                        {user?.role === "admin" && locationImages.length < 4 && (
                          <label className="h-16 flex flex-col items-center justify-center border-2 border-dashed border-border/80 hover:border-accent hover:bg-accent/[0.03] rounded-xl cursor-pointer transition-all text-center p-1 group">
                            <Upload size={14} className="text-accent group-hover:scale-110 transition-transform mb-0.5" />
                            <span className="text-[8px] font-bold text-muted group-hover:text-foreground leading-tight">
                              Add Site Photo
                            </span>
                            <span className="text-[6px] text-muted/60">
                              (Max {4 - locationImages.length} left)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleMultiImageAdd(e, "location")}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* COLUMN 2: CUSTOMER & SOURCE */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-border pb-1">
                    2. Client & Sales Channel
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm disabled:opacity-75 disabled:bg-border/10"
                        placeholder="e.g. Ram Prasad"
                        required
                        disabled={user?.role !== "admin"}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Contact Number *
                      </label>
                      <input
                        type="text"
                        value={customerContact}
                        onChange={(e) => setCustomerContact(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm disabled:opacity-75 disabled:bg-border/10"
                        placeholder="e.g. 9841XXXXXX"
                        required
                        disabled={user?.role !== "admin"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Customer Address *
                    </label>
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full h-12 px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm resize-none disabled:opacity-75 disabled:bg-border/10"
                      placeholder="e.g. New Baneshwor, Kathmandu"
                      required
                      disabled={user?.role !== "admin"}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm disabled:opacity-75 disabled:bg-border/10"
                        placeholder="e.g. client@domain.com"
                        disabled={user?.role !== "admin"}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Order Placed From *
                      </label>
                      <select
                        value={orderFrom}
                        onChange={(e) => setOrderFrom(e.target.value as any)}
                        className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-semibold disabled:opacity-75 disabled:bg-border/10 cursor-pointer"
                        required
                        disabled={user?.role !== "admin"}
                      >
                        <option value="direct">Direct Order</option>
                        <option value="tiktok">Tiktok</option>
                        <option value="instagram">Instagram</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Payment Method *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-semibold disabled:opacity-75 disabled:bg-border/10 cursor-pointer"
                      required
                      disabled={user?.role !== "admin"}
                    >
                      <option value="cash">Cash</option>
                      <option value="online_banking">Online Banking (Fonepay)</option>
                      <option value="esewa">Esewa</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Manufacturing Notes / Description
                    </label>
                    <textarea
                      value={manufacturingNotes}
                      onChange={(e) => setManufacturingNotes(e.target.value)}
                      className="w-full h-20 px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm resize-none disabled:opacity-75 disabled:bg-border/10"
                      placeholder="e.g. Bending instructions, spacing, wiring length, back support material specs..."
                      disabled={user?.role !== "admin"}
                    />
                  </div>

                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-border pt-4">
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
                  {submitting ? "Saving Order..." : editingOrder ? "Save Changes" : "Post Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <OrderDetailModal
        order={selectedViewOrder}
        onClose={() => setSelectedViewOrder(null)}
      />
      <OrderPhotoGalleryModal
        order={galleryOrder}
        isOpen={isGalleryOpen}
        initialType={galleryType}
        onClose={() => setIsGalleryOpen(false)}
      />
    </div>
  );
};
