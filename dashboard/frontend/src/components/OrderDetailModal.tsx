import React from "react";
import { Order } from "../store/useStore";
import {
  Package,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Clock
} from "./ui/solar-icons";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-2xl rounded-lg border border-border p-6 shadow-2xl animate-scale-up my-8 max-h-[90vh] overflow-y-auto text-left">
        <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
          <h2 className="text-lg font-bold font-display flex items-center gap-2">
            <Package className="text-accent" />
            Order Detail Overview
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* COLUMN 1: PRODUCT & MFG */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-border pb-1">
              Product & Design Specifications
            </h3>

            <div className="space-y-2">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Product Name</div>
              <div className="text-xs font-bold text-foreground bg-border/20 px-3 py-2 rounded">{order.productName}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Size</div>
                <div className="text-xs font-bold bg-border/20 px-2.5 py-1.5 rounded">{order.size}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Color</div>
                <div className="text-xs font-bold bg-border/20 px-2.5 py-1.5 rounded">{order.color}</div>
              </div>
            </div>

            {/* Dual Photos View */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Design Image</div>
                <div className="h-28 rounded border border-border overflow-hidden bg-background relative flex items-center justify-center">
                  {order.productImageUrl ? (
                    <img src={order.productImageUrl} alt="Product Design" className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-[10px] text-muted uppercase font-bold">No Image</span>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Location / Site Image</div>
                <div className="h-28 rounded border border-border overflow-hidden bg-background relative flex items-center justify-center">
                  {order.locationImageUrl ? (
                    <img src={order.locationImageUrl} alt="Installation Site" className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-[10px] text-muted uppercase font-bold">No Image</span>
                  )}
                </div>
              </div>
            </div>

            {/* Manufacturing notes */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Manufacturing Notes / Specs</div>
              <div className="p-3 bg-accent/5 border border-dashed border-accent/20 rounded text-xs text-muted-foreground min-h-[70px] whitespace-pre-wrap leading-relaxed max-h-[120px] overflow-y-auto">
                {order.manufacturingNotes || "No specific manufacturing description provided."}
              </div>
            </div>

          </div>

          {/* COLUMN 2: CLIENT & FINANCIALS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-border pb-1">
              Client & Pricing Overview
            </h3>

            <div className="space-y-3 bg-border/10 p-3 rounded-lg border border-border">
              <div className="text-xs text-foreground font-bold flex items-center gap-2">
                <User size={13} className="text-accent" />
                {order.customerName}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Phone size={11} />
                {order.customerContact}
              </div>
              {order.customerEmail && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Mail size={11} />
                  {order.customerEmail}
                </div>
              )}
              <div className="text-xs text-muted-foreground flex items-start gap-2 border-t border-border/55 pt-2 mt-2 leading-relaxed font-medium">
                <MapPin size={12} className="text-accent flex-shrink-0 mt-0.5" />
                <span>{order.customerAddress}</span>
              </div>
            </div>

            {/* Pricing summary */}
            <div className="space-y-2 p-3 bg-background border border-border rounded-lg">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Product Base Price:</span>
                <span className="font-semibold text-foreground">Rs. {order.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Delivery Cost:</span>
                <span className="font-semibold text-foreground">Rs. {order.deliveryPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Installation Cost:</span>
                <span className="font-semibold text-foreground">Rs. {order.installationPrice.toLocaleString()}</span>
              </div>
              <div className="border-t border-border/70 pt-1.5 flex justify-between text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Advance Payment Received:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Rs. {order.advancePayment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-red-500 font-bold">Remaining Outstanding Due:</span>
                <span className="font-bold text-red-500">Rs. {order.duePayment.toLocaleString()}</span>
              </div>
              <div className="border-t border-border/80 pt-2 mt-1.5 flex justify-between items-center">
                <span className="text-xs font-extrabold uppercase text-muted tracking-wide">Final Net Pricing:</span>
                <strong className="text-base text-accent font-display">Rs. {order.totalPrice.toLocaleString()}</strong>
              </div>
            </div>

            {/* Platform, Payment & Deadline */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Sales Platform</span>
                <span className="inline-block px-2 py-0.5 border text-[9px] font-bold rounded uppercase tracking-wider bg-border/20 text-foreground text-center">
                  {order.orderFrom}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Payment Method</span>
                <span className="inline-block px-2 py-0.5 border text-[9px] font-bold rounded uppercase tracking-wider bg-border/20 text-foreground text-center">
                  {order.paymentMethod.replace("_", " ")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border-t border-border/40 pt-3">
              <div className="space-y-1">
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Delivery Target</span>
                <div className="font-bold text-foreground flex items-center gap-1">
                  <Clock size={11} className="text-accent" />
                  {new Date(order.deliveryDate).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Project Lead</span>
                <div className="font-bold text-foreground">
                  {order.assignee?.name || "No lead assigned"}
                </div>
              </div>
            </div>

          </div>

        </div>

        <div className="flex justify-end border-t border-border pt-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-accent hover:bg-accent-dark text-white rounded text-xs font-bold transition-all shadow-md shadow-accent/15"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
