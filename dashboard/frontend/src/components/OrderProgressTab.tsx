import React, { useState } from "react";
import { useStore, Order } from "../store/useStore";
import {
  Truck,
  User,
  Phone,
  Package,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Eye
} from "./ui/solar-icons";
import { OrderDetailModal } from "./OrderDetailModal";
import { formatNepaliShort } from "../utils/nepaliDate";
import { OrderPhotoStack } from "./ui/OrderPhotoStack";
import { OrderPhotoGalleryModal } from "./ui/OrderPhotoGalleryModal";

export const OrderProgressTab: React.FC = () => {
  const { orders, updateOrderProgress, approveOrder, user, users } = useStore();
  const [errorMsg, setErrorMsg] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedViewOrder, setSelectedViewOrder] = useState<Order | null>(null);

  // Gallery Modal State
  const [galleryOrder, setGalleryOrder] = useState<Order | null>(null);
  const [galleryType, setGalleryType] = useState<"product" | "location">("product");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const handleOpenGallery = (order: Order, type: "product" | "location") => {
    setGalleryOrder(order);
    setGalleryType(type);
    setIsGalleryOpen(true);
  };

  const stages: { id: Order["stage"]; label: string; color: string; desc: string }[] = [
    {
      id: "design",
      label: "Design Process",
      color: "bg-amber-600 text-white font-extrabold shadow-xs",
      desc: "Client review & vector mockups"
    },
    {
      id: "manufacturing",
      label: "Manufacturing",
      color: "bg-red-600 text-white font-extrabold shadow-xs",
      desc: "Acrylic cutting, neon bending & assembly"
    },
    {
      id: "completed",
      label: "Completed",
      color: "bg-purple-600 text-white font-extrabold shadow-xs",
      desc: "Ready for delivery & installation"
    },
    {
      id: "delivered",
      label: "Delivered",
      color: "bg-blue-600 text-white font-extrabold shadow-xs",
      desc: "Received by client & payment verified"
    },
    {
      id: "paid",
      label: "Paid",
      color: "bg-emerald-600 text-white font-extrabold shadow-xs",
      desc: "Delivered and balance fully settled"
    }
  ];

  const handleMove = async (orderId: string, currentStage: Order["stage"], direction: "back" | "forward") => {
    setErrorMsg("");
    setUpdatingId(orderId);

    const stageOrder: Order["stage"][] = ["design", "manufacturing", "completed", "delivered", "paid"];
    const currentIndex = stageOrder.indexOf(currentStage);
    const nextIndex = direction === "forward" ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex < 0 || nextIndex >= stageOrder.length) {
      setUpdatingId(null);
      return;
    }

    const targetStage = stageOrder[nextIndex];

    try {
      if (targetStage === "delivered" && user?.role === "admin") {
        await approveOrder(orderId);
      } else {
        await updateOrderProgress(orderId, targetStage);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update order stage.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApproveAndDeliver = async (orderId: string) => {
    setErrorMsg("");
    setUpdatingId(orderId);
    try {
      await approveOrder(orderId);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to approve order.");
    } finally {
      setUpdatingId(null);
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <Truck className="text-accent" />
          Order Progress Workspace
        </h1>
        <p className="text-xs text-muted mt-1">
          Track production, design, and manufacturing stages of customer signs. Admins approve completion to release sales graph revenue.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs bg-red-600 border border-red-600 text-white rounded font-semibold animate-slide-up">
          {errorMsg}
        </div>
      )}

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stages.map((stage) => {
          const stageOrders = orders.filter((o) => o.stage === stage.id);

          return (
            <div
              key={stage.id}
              className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm flex flex-col min-h-[500px]"
            >
              {/* Stage Header */}
              <div className="border-b border-border pb-3 mb-4">
                <div className={`px-2.5 py-1 text-xs font-extrabold uppercase rounded border w-max mb-1.5 ${stage.color}`}>
                  {stage.label} ({stageOrders.length})
                </div>
                <p className="text-[10px] text-muted leading-snug">{stage.desc}</p>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[600px]">
                {stageOrders.length === 0 ? (
                  <div className="h-full border border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-muted">
                    <Package size={24} className="opacity-35 mb-1.5" />
                    <span className="text-[10px] uppercase font-bold tracking-wide">Empty Column</span>
                  </div>
                ) : (
                  stageOrders.map((order) => {
                    const isUpdating = updatingId === order._id;
                    const urgency = calculateUrgency(order.deliveryDate, order.approved, order.stage);

                    return (
                      <div
                        key={order._id}
                        className={`p-3.5 bg-card border rounded-md shadow-sm space-y-3 transition-all relative min-w-0 overflow-hidden ${
                          order.stage === "paid"
                            ? "border-green-500/30 dark:border-green-500/20 bg-green-500/[0.01]"
                            : order.stage === "delivered"
                            ? "border-blue-500/30 dark:border-blue-500/20 bg-blue-500/[0.01]"
                            : "border-border hover:border-accent/50"
                        } ${isUpdating ? "opacity-55 pointer-events-none" : ""}`}
                      >
                        {/* Urgency Badge & Deadline */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className={`px-2 py-0.5 rounded text-center leading-tight shadow-xs ${urgency.color}`}>
                            <span className="block text-[8px] uppercase font-black tracking-wider">{urgency.label}</span>
                            {urgency.subLabel && (
                              <span className="block text-[7px] font-bold opacity-95 leading-none mt-0.5">{urgency.subLabel}</span>
                            )}
                          </div>
                          <span className="text-[9px] text-muted flex items-center gap-1 font-semibold">
                            <Clock size={9} />
                            {order.deliveryDate ? formatNepaliShort(order.deliveryDate) : "TBD"}
                          </span>
                        </div>

                        {/* Stacked Preview Images */}
                        <div className="flex items-center gap-3 pt-0.5">
                          <OrderPhotoStack
                            images={order.productImages && order.productImages.length > 0 ? order.productImages : (order.productImageUrl ? [order.productImageUrl] : [])}
                            type="product"
                            size="md"
                            onClick={() => handleOpenGallery(order, "product")}
                          />
                          <OrderPhotoStack
                            images={order.locationImages && order.locationImages.length > 0 ? order.locationImages : (order.locationImageUrl ? [order.locationImageUrl] : [])}
                            type="location"
                            size="md"
                            onClick={() => handleOpenGallery(order, "location")}
                          />
                        </div>

                        {/* Title & Specs */}
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-semibold text-xs leading-snug text-foreground break-words flex-1">
                              {order.productName}
                            </h4>
                            <button
                              onClick={() => setSelectedViewOrder(order)}
                              className="p-1 bg-blue-600 rounded text-white hover:bg-blue-700 transition-colors flex-shrink-0 shadow-sm"
                              title="View Details"
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[9px] text-muted">
                            <span>Size: <strong>{order.size}</strong></span>
                            <span>•</span>
                            <span>Color: <strong>{order.color}</strong></span>
                          </div>
                        </div>

                        {/* Customer & Address */}
                        <div className="p-2 bg-background border border-border/80 rounded space-y-1 text-[10px]">
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            <User size={10} className="text-accent" />
                            {order.customerName}
                          </div>
                          <div className="text-muted flex items-center gap-1.5">
                            <Phone size={8} />
                            {order.customerContact}
                          </div>
                          <div className="text-muted flex items-start gap-1.5 border-t border-border/55 pt-1 mt-1 font-medium leading-tight">
                            <MapPin size={9} className="text-accent mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{order.customerAddress}</span>
                          </div>
                        </div>

                        {order.manufacturingNotes && (
                          <div className="p-2 bg-accent/5 border border-dashed border-accent/20 rounded text-[9px] text-muted-foreground leading-snug">
                            <strong className="text-accent uppercase text-[8px] tracking-wider block mb-0.5">Mfg Notes:</strong>
                            <p className="line-clamp-3 font-medium">{order.manufacturingNotes}</p>
                          </div>
                        )}

                        {/* Lead Assignee Selection */}
                        <div className="flex items-center gap-1.5 bg-background border border-border/80 rounded px-2 py-1 min-w-0 w-full overflow-hidden">
                          <span className="text-muted font-bold uppercase text-[8px] tracking-wider shrink-0">Lead:</span>
                          <select
                            value={order.assignee?._id || ""}
                            onChange={async (e) => {
                              const newAssigneeId = e.target.value;
                              setErrorMsg("");
                              setUpdatingId(order._id);
                              try {
                                await updateOrderProgress(order._id, undefined, newAssigneeId || null);
                              } catch (err: any) {
                                setErrorMsg(err.message || "Failed to update assignee.");
                              } finally {
                                setUpdatingId(null);
                              }
                            }}
                            className="px-1.5 py-0.5 border border-border rounded bg-card focus:outline-none focus:ring-1 focus:ring-accent text-[8.5px] font-semibold flex-1 min-w-0 w-full truncate cursor-pointer text-foreground"
                          >
                            <option value="">Unassigned</option>
                            {users
                              .filter((u) => u.email !== "staff@ktmdecor.com")
                              .map((u) => (
                                <option key={u._id} value={u._id}>
                                  {u.name} ({u.role === "admin" ? "Admin" : "Staff"})
                                </option>
                              ))}
                          </select>
                        </div>

                        {/* Metadata Row */}
                        <div className="flex justify-between items-center pt-1 border-t border-border/70">
                          <span className={`px-1.5 py-0.5 border text-[8px] font-bold rounded uppercase ${getSourceBadge(order.orderFrom)}`}>
                            {order.orderFrom}
                          </span>
                          <span className="font-bold text-accent text-[11px] flex items-center">
                            <DollarSign size={10} />
                            {order.totalPrice.toLocaleString()}
                          </span>
                        </div>

                        {/* Status/Actions */}
                        <div className="space-y-2 pt-2 border-t border-border/70">
                          {/* Approval Banner for Admin */}
                          {stage.id === "completed" && (
                            <>
                              {user?.role === "admin" ? (
                                <button
                                  onClick={() => handleApproveAndDeliver(order._id)}
                                  className="w-full py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm shadow-green-500/10"
                                >
                                  <CheckCircle size={10} />
                                  Approve & Deliver
                                </button>
                              ) : (
                                <div className="p-1.5 border border-dashed border-amber-500/30 bg-amber-500/5 text-amber-500 text-[9px] font-extrabold uppercase rounded text-center tracking-wide flex items-center justify-center gap-1">
                                  <Clock size={10} />
                                  Admin Approval Pending
                                </div>
                              )}
                            </>
                          )}

                          {/* Approved state indicator */}
                          {order.approved && stage.id === "delivered" && (
                            <div className="p-1.5 bg-blue-600 border border-blue-600 text-white text-[9px] font-bold uppercase rounded text-center tracking-wide flex items-center justify-center gap-1 shadow-sm">
                              <CheckCircle size={10} />
                              Delivered & Approved
                            </div>
                          )}
                          {order.approved && stage.id === "paid" && (
                            <div className="p-1.5 bg-green-600 border border-green-600 text-white text-[9px] font-bold uppercase rounded text-center tracking-wide flex items-center justify-center gap-1 shadow-sm">
                              <CheckCircle size={10} />
                              Paid & Approved
                            </div>
                          )}

                          {/* Directional navigation */}
                          <div className="flex items-center justify-between gap-2">
                            {stage.id !== "design" && (
                              <button
                                onClick={() => handleMove(order._id, order.stage, "back")}
                                className="flex-1 py-1 px-2 border border-border hover:bg-border rounded text-[9px] font-bold text-muted hover:text-foreground transition-all flex items-center justify-center gap-1"
                                title="Move Back"
                              >
                                <ArrowLeft size={10} />
                                Back
                              </button>
                            )}

                            {/* Only show next if not paid (since paid is terminal) */}
                            {stage.id !== "paid" && (
                              <button
                                onClick={() => handleMove(order._id, order.stage, "forward")}
                                className="flex-1 py-1 px-2 border border-border hover:bg-border rounded text-[9px] font-bold text-muted hover:text-foreground transition-all flex items-center justify-center gap-1"
                                title="Move Forward"
                              >
                                Next
                                <ArrowRight size={10} />
                              </button>
                            )}
                          </div>

                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed View Modal */}
      <OrderDetailModal
        order={selectedViewOrder}
        onClose={() => setSelectedViewOrder(null)}
      />

      {/* Lightbox Photo Gallery Modal */}
      <OrderPhotoGalleryModal
        order={galleryOrder}
        isOpen={isGalleryOpen}
        initialType={galleryType}
        onClose={() => setIsGalleryOpen(false)}
      />

    </div>
  );
};
