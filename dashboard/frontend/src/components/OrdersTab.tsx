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
  const [productImageUrl, setProductImageUrl] = useState("");
  const [locationImageUrl, setLocationImageUrl] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [orderFrom, setOrderFrom] = useState<Order["orderFrom"]>("direct");
  const [paymentMethod, setPaymentMethod] = useState<Order["paymentMethod"]>("cash");
  const [manufacturingNotes, setManufacturingNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [assigneeId, setAssigneeId] = useState("");
  const [stage, setStage] = useState<Order["stage"]>("design");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const openCreateModal = () => {
    setEditingOrder(null);
    setProductName("");
    setSize("");
    setPrice("");
    setDeliveryPrice("0");
    setInstallationPrice("0");
    setAdvancePayment("0");
    setColor("");
    setProductImageUrl("");
    setLocationImageUrl("");
    setCustomerName("");
    setCustomerContact("");
    setCustomerEmail("");
    setCustomerAddress("");
    setOrderFrom("direct");
    setPaymentMethod("cash");
    setManufacturingNotes("");
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
    setProductImageUrl(order.productImageUrl || "");
    setLocationImageUrl(order.locationImageUrl || "");
    setCustomerName(order.customerName);
    setCustomerContact(order.customerContact);
    setCustomerEmail(order.customerEmail || "");
    setCustomerAddress(order.customerAddress);
    setOrderFrom(order.orderFrom);
    setPaymentMethod(order.paymentMethod);
    setManufacturingNotes(order.manufacturingNotes || "");
    setDeliveryDate(order.deliveryDate ? order.deliveryDate.split("T")[0] : "");
    setAssigneeId(order.assignee?._id || "");
    setStage(order.stage);
    setFormError("");
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "product" | "location") => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError("Image size should be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "product") {
          setProductImageUrl(reader.result as string);
        } else {
          setLocationImageUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
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
      productImageUrl,
      locationImageUrl,
      customerName,
      customerContact,
      customerEmail,
      customerAddress,
      orderFrom,
      paymentMethod,
      manufacturingNotes,
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

  // Filter orders
  const filteredOrders = orders.filter((o) => {
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
  });

  const getSourceBadge = (source: Order["orderFrom"]) => {
    switch (source) {
      case "tiktok":
        return "bg-black text-white dark:bg-zinc-800 border-zinc-700";
      case "instagram":
        return "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300 border-pink-200/50";
      case "whatsapp":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-200/50";
      case "direct":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200/50";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-border";
    }
  };

  const getPaymentBadge = (method: Order["paymentMethod"]) => {
    switch (method) {
      case "esewa":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200/50";
      case "online_banking":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200/50";
      case "cheque":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200/50";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200/50";
    }
  };

  const calculateUrgency = (dateStr: string, approved: boolean) => {
    if (approved) return { label: "Delivered", color: "bg-green-500/10 border-green-500/20 text-green-500" };
    if (!dateStr) return { label: "No Deadline", color: "bg-gray-150 text-gray-500 border-border" };
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const delivery = new Date(dateStr);
    delivery.setHours(0, 0, 0, 0);

    const diffTime = delivery.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Overdue (${Math.abs(diffDays)}d ago)`, color: "bg-red-500/15 border-red-500/30 text-red-500 animate-pulse-dots" };
    } else if (diffDays === 0) {
      return { label: "Urgent (Today)", color: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 font-bold" };
    } else if (diffDays <= 2) {
      return { label: `High (${diffDays === 1 ? "Tomorrow" : "2d left"})`, color: "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400 font-bold" };
    } else if (diffDays <= 4) {
      return { label: `Medium (${diffDays}d left)`, color: "bg-yellow-500/10 border-yellow-500/25 text-yellow-600 dark:text-yellow-400" };
    } else {
      return { label: `Normal (${diffDays}d left)`, color: "bg-blue-500/10 border-blue-500/20 text-blue-500" };
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
      <div className="glass-panel p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-xs"
            placeholder="Search by customer, address, product, or assignee..."
          />
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Source Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted font-medium">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-2 py-1.5 border border-border rounded bg-background focus:outline-none text-xs font-semibold"
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
              className="px-2 py-1.5 border border-border rounded bg-background focus:outline-none text-xs font-semibold"
            >
              <option value="all">All Stages</option>
              <option value="design">Design</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="completed">Completed</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="glass-panel rounded-lg overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-card text-muted border-b border-border uppercase font-semibold tracking-wider text-[10px]">
                <th className="p-4">Product Info & Images</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Delivery & Assignee</th>
                <th className="p-4">Source & Pay</th>
                <th className="p-4">Pricing Details</th>
                <th className="p-4 text-center">Progress Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    No orders matching selected criteria
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-border/20 transition-colors animate-fade-in">
                    <td className="p-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          {/* Product Image */}
                          <div className="h-10 w-10 rounded border border-border bg-card flex flex-col items-center justify-center overflow-hidden flex-shrink-0 relative group">
                            {order.productImageUrl ? (
                              <img src={order.productImageUrl} alt="Product" className="object-cover h-full w-full" />
                            ) : (
                              <Package className="text-muted/60" size={16} />
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[7px] text-white text-center py-0.5 leading-none opacity-0 group-hover:opacity-100 transition-opacity">
                              Sign
                            </div>
                          </div>
                          {/* Location Image */}
                          <div className="h-10 w-10 rounded border border-border bg-card flex flex-col items-center justify-center overflow-hidden flex-shrink-0 relative group">
                            {order.locationImageUrl ? (
                              <img src={order.locationImageUrl} alt="Location" className="object-cover h-full w-full" />
                            ) : (
                              <MapPin className="text-muted/60" size={14} />
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[7px] text-white text-center py-0.5 leading-none opacity-0 group-hover:opacity-100 transition-opacity">
                              Site
                            </div>
                          </div>
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
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                          <Clock size={11} className="text-accent" />
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </div>
                        <span className={`inline-block px-1.5 py-0.5 border text-[9px] font-extrabold uppercase rounded tracking-wide ${calculateUrgency(order.deliveryDate, order.approved).color}`}>
                          {calculateUrgency(order.deliveryDate, order.approved).label}
                        </span>
                        <div className="text-[10px] text-muted font-medium mt-1">
                          Assignee: <strong className="text-foreground">{order.assignee?.name || "Unassigned"}</strong>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-2 py-0.5 border text-[9px] font-bold rounded uppercase w-max tracking-wide ${getSourceBadge(order.orderFrom)}`}>
                          {order.orderFrom}
                        </span>
                        <span className={`px-2 py-0.5 border text-[9px] font-bold rounded uppercase w-max tracking-wide ${getPaymentBadge(order.paymentMethod)}`}>
                          {order.paymentMethod.replace("_", " ")}
                        </span>
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
                        disabled={order.approved && user?.role !== "admin"}
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
                        className={`px-2.5 py-1.5 text-[10px] font-extrabold uppercase rounded border cursor-pointer focus:outline-none ${
                          order.approved
                            ? "bg-green-500/10 border-green-500/20 text-green-500"
                            : order.stage === "completed"
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
                            : order.stage === "manufacturing"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            : "bg-purple-500/10 border-purple-500/20 text-purple-500"
                        }`}
                      >
                        <option value="design" className="bg-card text-foreground font-bold">Design Process</option>
                        <option value="manufacturing" className="bg-card text-foreground font-bold">Manufacturing Process</option>
                        <option value="completed" className="bg-card text-foreground font-bold">Completed</option>
                        <option value="delivered" className="bg-card text-foreground font-bold">
                          Delivered
                        </option>
                      </select>
                      {order.approved && (
                        <div className="text-[8px] text-green-600 dark:text-green-400 font-extrabold mt-1 uppercase tracking-wider">
                          Verified & Approved ✓
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedViewOrder(order)}
                          className="p-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 transition-colors shadow-sm"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => openEditModal(order)}
                            className="p-1.5 bg-accent rounded text-white hover:bg-accent-dark transition-colors shadow-sm"
                            title="Edit Order"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {user?.role === "admin" && (
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="p-1.5 bg-red-600 rounded text-white hover:bg-red-700 transition-colors shadow-sm"
                            title="Delete Order"
                          >
                            <Trash2 size={14} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-2xl rounded-lg border border-border p-6 shadow-2xl animate-scale-up my-8 max-h-[90vh] overflow-y-auto">
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

                  {/* Delivery date & Assignee Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Delivery Deadline *
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-semibold disabled:opacity-75 disabled:bg-border/10"
                        required
                        disabled={user?.role !== "admin"}
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
                      </select>
                    </div>
                  )}

                  {/* Image uploads */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Product Photo *
                      </label>
                      <div className="flex flex-col gap-2">
                        {productImageUrl && (
                          <div className="h-16 w-full border border-border rounded overflow-hidden bg-background">
                            <img src={productImageUrl} alt="Product preview" className="h-full w-full object-cover" />
                          </div>
                        )}
                        {user?.role === "admin" && (
                          <label className="flex flex-col items-center justify-center border border-dashed border-border rounded p-2.5 hover:bg-border/20 cursor-pointer transition-colors text-center text-muted">
                            <Upload size={14} className="text-accent mb-0.5" />
                            <span className="text-[8px] font-bold uppercase tracking-wider">Upload Product</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, "product")}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        Location/Site Photo
                      </label>
                      <div className="flex flex-col gap-2">
                        {locationImageUrl && (
                          <div className="h-16 w-full border border-border rounded overflow-hidden bg-background">
                            <img src={locationImageUrl} alt="Location preview" className="h-full w-full object-cover" />
                          </div>
                        )}
                        {user?.role === "admin" && (
                          <label className="flex flex-col items-center justify-center border border-dashed border-border rounded p-2.5 hover:bg-border/20 cursor-pointer transition-colors text-center text-muted">
                            <Upload size={14} className="text-accent mb-0.5" />
                            <span className="text-[8px] font-bold uppercase tracking-wider">Upload Location</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, "location")}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Customer Address *
                    </label>
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full h-16 px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm resize-none disabled:opacity-75 disabled:bg-border/10"
                      placeholder="e.g. New Baneshwor, Kathmandu (Near Civil Hospital)"
                      required
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
                      className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-semibold disabled:opacity-75 disabled:bg-border/10"
                      required
                      disabled={user?.role !== "admin"}
                    >
                      <option value="direct">Direct Order (Physical Store)</option>
                      <option value="tiktok">Tiktok</option>
                      <option value="instagram">Instagram</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Payment Method *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm font-semibold disabled:opacity-75 disabled:bg-border/10"
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
    </div>
  );
};
