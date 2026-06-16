import React, { useState } from "react";
import { Order } from "../store/useStore";
import {
  Package,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Download
} from "./ui/solar-icons";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  if (!order) return null;

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 sm:p-4 overflow-y-auto">
      {/* Print styles override */}
      <style>{`
        @page {
          margin: 0;
          size: A4 portrait;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #order-detail-print, #order-detail-print * {
            visibility: visible;
          }
          #order-detail-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-height: none !important;
            overflow: visible !important;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
            padding: 10mm 12mm !important;
            margin: 0 !important;
            font-size: 10px !important;
          }
          /* Force compact typography for printing */
          h2 {
            font-size: 15px !important;
            margin-bottom: 8px !important;
          }
          h3 {
            font-size: 11px !important;
            margin-bottom: 4px !important;
            padding-bottom: 2px !important;
          }
          .text-xs {
            font-size: 10px !important;
          }
          .text-sm {
            font-size: 11px !important;
          }
          .text-base {
            font-size: 13px !important;
          }
          /* Compact grids & gaps */
          .grid {
            gap: 12px !important;
          }
          .space-y-4 > * + * {
            margin-top: 8px !important;
          }
          .space-y-3 > * + * {
            margin-top: 6px !important;
          }
          .space-y-2 > * + * {
            margin-top: 4px !important;
          }
          .p-3 {
            padding: 8px !important;
          }
          .p-4 {
            padding: 10px !important;
          }
          .mb-6 {
            margin-bottom: 8px !important;
          }
          .mt-6 {
            margin-top: 8px !important;
          }
          /* Ensure images display in full without cropping */
          .print-img {
            object-fit: contain !important;
            background-color: #f9fafb !important;
          }
          .screen-only {
            display: none !important;
          }
          /* High contrast print colors */
          .text-muted-foreground, .text-muted {
            color: #374151 !important; /* gray-700 */
          }
          .text-foreground {
            color: #000000 !important;
          }
          .bg-card {
            background-color: #ffffff !important;
          }
          .border {
            border-color: #9ca3af !important; /* gray-400 */
          }
          .bg-border/20, .bg-accent/5, .bg-background {
            background-color: #f3f4f6 !important;
          }
        }
      `}</style>

      <div 
        id="order-detail-print" 
        className="bg-card w-full max-w-2xl rounded-lg border border-border p-4 sm:p-6 shadow-2xl animate-scale-up my-4 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto text-left"
      >
        <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
          <h2 className="text-lg font-bold font-display flex items-center gap-2">
            <Package className="text-accent" />
            Order Detail Overview
          </h2>
          <div className="flex items-center gap-2 screen-only">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1 py-1.5 px-3 bg-accent hover:bg-accent-dark text-white rounded text-[10px] font-bold transition-all shadow-md shadow-accent/15"
              title="Download PDF / Print"
            >
              <Download size={12} />
              PDF / Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-foreground p-1"
            >
              <X size={20} />
            </button>
          </div>
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
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Design Image</div>
                <div className="h-20 sm:h-24 rounded border border-border overflow-hidden bg-background relative flex items-center justify-center">
                  {order.productImageUrl ? (
                    <img 
                      src={order.productImageUrl} 
                      alt="Product Design" 
                      className="object-contain w-full h-full cursor-pointer hover:scale-105 transition-transform duration-300 bg-border/20 print-img"
                      onClick={() => setActiveImageUrl(order.productImageUrl || null)}
                    />
                  ) : (
                    <span className="text-[10px] text-muted uppercase font-bold">No Image</span>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Location / Site Image</div>
                <div className="h-20 sm:h-24 rounded border border-border overflow-hidden bg-background relative flex items-center justify-center">
                  {order.locationImageUrl ? (
                    <img 
                      src={order.locationImageUrl} 
                      alt="Installation Site" 
                      className="object-contain w-full h-full cursor-pointer hover:scale-105 transition-transform duration-300 bg-border/20 print-img"
                      onClick={() => setActiveImageUrl(order.locationImageUrl || null)}
                    />
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

        <div className="flex justify-end border-t border-border pt-4 mt-6 screen-only">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-accent hover:bg-accent-dark text-white rounded text-xs font-bold transition-all shadow-md shadow-accent/15"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* Lightbox for Zoomed Image */}
      {activeImageUrl && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 transition-all duration-300 cursor-pointer select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setActiveImageUrl(null);
            }
          }}
        >
          <div className="relative max-w-[85vw] max-h-[70vh] sm:max-w-[90vw] sm:max-h-[85vh] flex items-center justify-center">
            <button
              className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors screen-only flex items-center justify-center"
              onClick={() => setActiveImageUrl(null)}
            >
              <X size={20} />
            </button>
            <img 
              src={activeImageUrl} 
              alt="Full Preview" 
              className="max-w-full max-h-[70vh] sm:max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-default animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
