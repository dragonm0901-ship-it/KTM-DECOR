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
  Download,
  Eye
} from "./ui/solar-icons";
import { formatNepali } from "../utils/nepaliDate";
import { OrderPhotoGalleryModal } from "./ui/OrderPhotoGalleryModal";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryType, setGalleryType] = useState<"product" | "location">("product");
  const [galleryIndex, setGalleryIndex] = useState(0);

  if (!order) return null;

  const productImages = Array.isArray(order.productImages) && order.productImages.length > 0
    ? order.productImages
    : (order.productImageUrl ? [order.productImageUrl] : []);

  const locationImages = Array.isArray(order.locationImages) && order.locationImages.length > 0
    ? order.locationImages
    : (order.locationImageUrl ? [order.locationImageUrl] : []);

  const handleOpenGallery = (type: "product" | "location", index: number = 0) => {
    setGalleryType(type);
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
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
        className="bg-card w-full max-w-2xl rounded-[28px] border border-border/80 p-5 sm:p-7 shadow-2xl animate-scale-up my-4 max-h-[calc(100dvh-32px)] sm:max-h-[90vh] overflow-y-auto text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-display flex items-center gap-2 text-foreground">
                <Package className="text-accent" />
                Order Detail Overview
              </h2>
              <span className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full tracking-wider text-white shadow-xs ${
                order.stage === "paid"
                  ? "bg-emerald-600"
                  : order.stage === "delivered" || order.approved
                  ? "bg-blue-600"
                  : order.stage === "completed"
                  ? "bg-purple-600"
                  : order.stage === "manufacturing"
                  ? "bg-red-600"
                  : "bg-amber-600"
              }`}>
                {order.stage}
              </span>
            </div>
            {/* Header Dates Bar (Always visible in UI and print PDF) */}
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted">
              <div className="flex items-center gap-1 font-medium">
                <span className="text-muted uppercase text-[10px] font-bold">Order Date (अर्डर मिति):</span>
                <strong className="text-foreground">{formatNepali(order.orderDate || order.createdAt)}</strong>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1 font-medium">
                <span className="text-muted uppercase text-[10px] font-bold">Delivery Target (डेलिभरी):</span>
                <strong className="text-foreground">{formatNepali(order.deliveryDate)}</strong>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 screen-only">
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
              }}
              className="flex items-center gap-1.5 py-2 px-4 text-black rounded-2xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer"
              title="Download PDF / Print"
            >
              <Download size={13} />
              PDF / Print
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-foreground p-1.5 rounded-xl hover:bg-muted/20 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* COLUMN 1: PRODUCT & MFG */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-border/60 pb-1.5">
              Product & Design Specifications
            </h3>

            <div className="space-y-1.5">
              <div className="text-[10px] text-muted uppercase font-semibold">Product Name</div>
              <div className="text-xs font-bold text-foreground bg-border/20 px-3.5 py-2.5 rounded-2xl border border-border/60">{order.productName}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-[10px] text-muted uppercase font-semibold">Size</div>
                <div className="text-xs font-bold bg-border/20 px-3 py-2 rounded-2xl border border-border/60">{order.size}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-muted uppercase font-semibold">Color</div>
                <div className="text-xs font-bold bg-border/20 px-3 py-2 rounded-2xl border border-border/60">{order.color}</div>
              </div>
            </div>

            {/* Multi-Photos Showcase */}
            <div className="space-y-3">
              {/* Product Design Photos (Max 6) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-muted uppercase font-semibold">
                  <span className="flex items-center gap-1">
                    <Package size={12} className="text-accent" />
                    <span>Product Sign Photos ({productImages.length}/6)</span>
                  </span>
                  {productImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleOpenGallery("product", 0)}
                      className="text-accent font-bold hover:underline lowercase text-[10px] flex items-center gap-0.5"
                    >
                      <Eye size={10} /> view all ({productImages.length})
                    </button>
                  )}
                </div>
                {productImages.length === 0 ? (
                  <div className="h-16 rounded-2xl border border-dashed border-border/80 bg-background/50 flex items-center justify-center text-muted text-[10px] font-bold uppercase">
                    No Sign Photos Attached
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {productImages.map((img, idx) => (
                      <div
                        key={`modal-prod-${idx}`}
                        onClick={() => handleOpenGallery("product", idx)}
                        className="relative h-16 rounded-2xl border border-border/80 overflow-hidden bg-background/60 group cursor-pointer hover:border-accent hover:shadow-md transition-all"
                      >
                        <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-0 right-0 bg-black/75 text-[7px] font-black text-white px-1 rounded-tl">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Site Photos (Max 4) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-[10px] text-muted uppercase font-semibold">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-accent" />
                    <span>Installation / Site Photos ({locationImages.length}/4)</span>
                  </span>
                  {locationImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleOpenGallery("location", 0)}
                      className="text-accent font-bold hover:underline lowercase text-[10px] flex items-center gap-0.5"
                    >
                      <Eye size={10} /> view all ({locationImages.length})
                    </button>
                  )}
                </div>
                {locationImages.length === 0 ? (
                  <div className="h-16 rounded-2xl border border-dashed border-border/80 bg-background/50 flex items-center justify-center text-muted text-[10px] font-bold uppercase">
                    No Site Photos Attached
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {locationImages.map((img, idx) => (
                      <div
                        key={`modal-loc-${idx}`}
                        onClick={() => handleOpenGallery("location", idx)}
                        className="relative h-16 rounded-2xl border border-border/80 overflow-hidden bg-background/60 group cursor-pointer hover:border-accent hover:shadow-md transition-all"
                      >
                        <img src={img} alt={`Site ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-0 right-0 bg-black/75 text-[7px] font-black text-white px-1 rounded-tl">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Manufacturing notes */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-muted uppercase font-semibold">Manufacturing Notes / Specs</div>
              <div className="p-3.5 bg-accent/5 border border-dashed border-accent/20 rounded-2xl text-xs text-muted min-h-[70px] whitespace-pre-wrap leading-relaxed max-h-[120px] overflow-y-auto">
                {order.manufacturingNotes || "No specific manufacturing description provided."}
              </div>
            </div>

          </div>

          {/* COLUMN 2: CLIENT & FINANCIALS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-border/60 pb-1.5">
              Client & Pricing Overview
            </h3>

            <div className="space-y-3 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
              <div className="text-xs text-foreground font-bold flex items-center gap-2">
                <User size={13} className="text-accent" />
                {order.customerName}
              </div>
              <div className="text-xs text-muted flex items-center gap-2">
                <Phone size={11} />
                {order.customerContact}
              </div>
              {order.customerEmail && (
                <div className="text-xs text-muted flex items-center gap-2">
                  <Mail size={11} />
                  {order.customerEmail}
                </div>
              )}
              <div className="text-xs text-muted flex items-start gap-2 border-t border-border/60 pt-2.5 mt-2 leading-relaxed font-medium">
                <MapPin size={12} className="text-accent flex-shrink-0 mt-0.5" />
                <span>{order.customerAddress}</span>
              </div>
            </div>

            {/* Pricing summary */}
            <div className="space-y-2 p-4 bg-background/60 border border-border/80 rounded-2xl shadow-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted">Product Base Price:</span>
                <span className="font-semibold text-foreground">Rs. {order.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted">Delivery Cost:</span>
                <span className="font-semibold text-foreground">Rs. {order.deliveryPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted">Installation Cost:</span>
                <span className="font-semibold text-foreground">Rs. {order.installationPrice.toLocaleString()}</span>
              </div>
              <div className="border-t border-border/70 pt-2 flex justify-between text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Advance Payment Received:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Rs. {order.advancePayment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-red-500 font-bold">Remaining Outstanding Due:</span>
                <span className="font-bold text-red-500">Rs. {order.duePayment.toLocaleString()}</span>
              </div>
              <div className="border-t border-border/80 pt-2.5 mt-2 flex justify-between items-center">
                <span className="text-xs font-extrabold uppercase text-muted tracking-wide">Final Net Pricing:</span>
                <strong className="text-base text-accent font-display">Rs. {order.totalPrice.toLocaleString()}</strong>
              </div>
            </div>

            {/* Platform, Payment & Timeline Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
              <div className="space-y-1">
                <span className="text-muted block text-[10px] uppercase font-semibold">Order Date (अर्डर)</span>
                <div className="font-bold text-foreground">
                  {formatNepali(order.orderDate || order.createdAt)}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-muted block text-[10px] uppercase font-semibold">Delivery Target (डेलिभरी)</span>
                <div className="font-bold text-foreground flex items-center gap-1">
                  <Clock size={11} className="text-accent" />
                  {formatNepali(order.deliveryDate)}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-muted block text-[10px] uppercase font-semibold">Project Lead</span>
                <div className="font-bold text-foreground">
                  {order.assignee?.name || "Unassigned"}
                </div>
              </div>
              <div className="space-y-1 pt-2.5 border-t border-border/40">
                <span className="text-muted block text-[10px] uppercase font-semibold">Sales Platform</span>
                <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider text-white shadow-xs ${
                  order.orderFrom === "tiktok"
                    ? "bg-black"
                    : order.orderFrom === "instagram"
                    ? "bg-pink-600"
                    : order.orderFrom === "whatsapp"
                    ? "bg-emerald-600"
                    : "bg-blue-600"
                }`}>
                  {order.orderFrom}
                </span>
              </div>
              <div className="space-y-1 pt-2.5 border-t border-border/40">
                <span className="text-muted block text-[10px] uppercase font-semibold">Payment Method</span>
                <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider text-white shadow-xs ${
                  order.paymentMethod === "esewa"
                    ? "bg-teal-600"
                    : order.paymentMethod === "online_banking"
                    ? "bg-indigo-600"
                    : order.paymentMethod === "cheque"
                    ? "bg-amber-600"
                    : "bg-emerald-700"
                }`}>
                  {order.paymentMethod.replace("_", " ")}
                </span>
              </div>
              <div className="space-y-1 pt-2.5 border-t border-border/40">
                <span className="text-muted block text-[10px] uppercase font-semibold">Approval Status</span>
                <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full text-white shadow-xs ${
                  order.approved ? "bg-emerald-600" : "bg-neutral-600"
                }`}>
                  {order.approved ? "Verified ✓" : "Pending"}
                </span>
              </div>
            </div>

          </div>

        </div>

        <div className="flex justify-end border-t border-border/60 pt-4 mt-6 screen-only">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-border/80 bg-card hover:bg-muted/20 text-foreground rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* Fullscreen Photo Gallery Lightbox */}
      <OrderPhotoGalleryModal
        order={order}
        isOpen={galleryOpen}
        initialType={galleryType}
        initialIndex={galleryIndex}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  );
};
