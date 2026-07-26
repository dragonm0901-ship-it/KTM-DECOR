"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MessageCircle, X, MapPin, User, Phone, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import { Product } from "@/data/shop-data";

interface DirectWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedVariant?: {
    option_name: string;
    price: number;
    compare_at_price?: number;
  } | null;
  quantity: number;
}

const REGION_OPTIONS: Record<string, string> = {
  kathmandu: "Kathmandu Valley (Inside)",
  lalitpur: "Lalitpur District",
  bhaktapur: "Bhaktapur District",
  outside_valley: "Outside Kathmandu Valley",
};

export const DirectWhatsAppModal: React.FC<DirectWhatsAppModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedVariant,
  quantity,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryRegion, setDeliveryRegion] = useState("kathmandu");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Lock body scroll when modal/temporary page is open to prevent underlying site scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  // Auto-fill from localStorage on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem("ktm_decor_customer_info");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.customerName) setCustomerName(parsed.customerName);
          if (parsed.customerPhone) setCustomerPhone(parsed.customerPhone);
          if (parsed.customerEmail) setCustomerEmail(parsed.customerEmail);
          if (parsed.deliveryRegion) setDeliveryRegion(parsed.deliveryRegion);
          if (parsed.customerAddress) setCustomerAddress(parsed.customerAddress);
          if (parsed.deliveryNotes) setDeliveryNotes(parsed.deliveryNotes);
        }
      } catch (err) {
        console.error("Failed to load customer info from localStorage", err);
      }
    }
  }, [isOpen]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeName = selectedVariant ? `${product.name} (${selectedVariant.option_name})` : product.name;
  const totalCost = activePrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert("Please fill in all required fields (Name, Phone, Region, and Address).");
      return;
    }

    // Save user info to localStorage for seamless reuse across direct buy & cart checkout
    try {
      const customerData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        deliveryRegion,
        customerAddress: customerAddress.trim(),
        deliveryNotes: deliveryNotes.trim(),
      };
      localStorage.setItem("ktm_decor_customer_info", JSON.stringify(customerData));
    } catch (err) {
      console.error("Failed to save customer info to localStorage", err);
    }

    const regionLabel = REGION_OPTIONS[deliveryRegion] || deliveryRegion;

    const message = `🛍️ *KTM DECOR - DIRECT PRODUCT ORDER*
------------------------------------------
👋 Hi KTM DECOR team! I would like to order this product directly via your website catalog.

👤 *CUSTOMER & DELIVERY INFO:*
• *Full Name:* ${customerName.trim()}
• *Phone Contact:* ${customerPhone.trim()}
• *Email Address:* ${customerEmail.trim() || "Not provided (Optional)"}
• *Delivery Region:* ${regionLabel}
• *Exact Street Address:* ${customerAddress.trim()}
• *Delivery Notes:* ${deliveryNotes.trim() || "No specific instructions"}

📦 *ORDERED ITEM:*
• *Product Name:* ${activeName}
• *Category:* ${product.category} [${product.subCategory}]
• *Quantity Ordered:* ${quantity}
• *Unit Price:* Rs. ${activePrice.toLocaleString()} each
• *Total Product Price:* Rs. ${totalCost.toLocaleString()} (Excl. delivery fee)
------------------------------------------
🚀 Please verify availability, confirm delivery charge for ${regionLabel}, and guide me on payment & delivery schedule!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "9779706247439";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/80 sm:backdrop-blur-md flex items-center justify-center p-0 sm:p-6 overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] max-w-lg bg-background dark:bg-zinc-950 border-0 sm:border sm:border-border/80 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all transform animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatsapp-modal-title"
      >
        {/* Top Header Banner (Mobile Back Button + Title) */}
        <div className="relative bg-[#25D366] px-3.5 py-3 sm:p-5 text-white flex-shrink-0 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Back Button on Mobile */}
              <button
                onClick={onClose}
                type="button"
                className="sm:hidden p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors flex-shrink-0"
                aria-label="Back to product"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>

              <div className="hidden sm:block p-2 bg-white/15 rounded-xl backdrop-blur-sm">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>

              <div>
                <h2 id="whatsapp-modal-title" className="text-xs sm:text-base font-black tracking-tight uppercase">
                  Direct Order via WhatsApp
                </h2>
                <p className="text-[9px] sm:text-xs text-white/90 font-medium truncate max-w-[210px] sm:max-w-none">
                  Enter details to complete checkout on WhatsApp
                </p>
              </div>
            </div>

            {/* Close Button on Desktop */}
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body - Optimized to fit within single vh on mobile */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-5 text-foreground flex-1 overscroll-contain">
          
          {/* Mini Product Summary Box - Ultra Compact for Mobile */}
          <div className="flex items-center gap-3 bg-card/70 dark:bg-zinc-900/70 border border-border/60 p-2.5 sm:p-3.5 rounded-xl">
            <div className="relative w-12 h-12 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-border/40 bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="inline-block text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                  {product.category}
                </span>
                <span className="text-[10px] sm:text-xs font-black text-accent">
                  Total: Rs. {totalCost.toLocaleString()}
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold truncate text-foreground leading-tight" title={activeName}>
                {activeName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] sm:text-[11px] text-muted-foreground font-semibold">
                <span>Qty: <strong className="text-foreground">{quantity}</strong></span>
                <span>•</span>
                <span>Unit: <strong className="text-foreground">Rs. {activePrice.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            
            <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
              <h4 className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-accent" /> Customer Info
              </h4>
              <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground/70 uppercase">
                * Required Fields
              </span>
            </div>

            <div className="space-y-2.5 sm:space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Sagar Luitel"
                    className="w-full pl-8 pr-3 py-2 sm:py-2.5 text-xs sm:text-xs bg-white dark:bg-zinc-900 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
              </div>

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">
                    Phone Contact <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 98XXXXXXXX"
                      className="w-full pl-8 pr-3 py-2 sm:py-2.5 text-xs sm:text-xs bg-white dark:bg-zinc-900 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </label>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-1 py-0.2 rounded">
                      Optional
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. name@domain.com"
                      className="w-full pl-8 pr-3 py-2 sm:py-2.5 text-xs sm:text-xs bg-white dark:bg-zinc-900 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Region */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">
                  Delivery Region <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  <select
                    value={deliveryRegion}
                    onChange={(e) => setDeliveryRegion(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 sm:py-2.5 text-xs sm:text-xs font-bold uppercase tracking-wide bg-white dark:bg-zinc-900 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all appearance-none"
                  >
                    <option value="kathmandu">Kathmandu Valley (Inside)</option>
                    <option value="lalitpur">Lalitpur District</option>
                    <option value="bhaktapur">Bhaktapur District</option>
                    <option value="outside_valley">Outside Kathmandu Valley</option>
                  </select>
                </div>
              </div>

              {/* Exact Address */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">
                  Exact Street / Location Details <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="e.g. Thamel, Ward 26, Near Standard Chartered"
                  className="w-full px-3 py-2 sm:py-2.5 text-xs sm:text-xs bg-white dark:bg-zinc-900 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>

              {/* Delivery Notes */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 sm:mb-1">
                  Special Instructions <span className="text-[8px] font-normal text-muted-foreground/60">(Optional)</span>
                </label>
                <textarea
                  rows={1}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Deliver after office hours..."
                  className="w-full px-3 py-1.5 text-xs sm:text-xs bg-white dark:bg-zinc-900 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
                />
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[9px] sm:text-[10px] text-muted-foreground font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Direct official WhatsApp order line (+977 9706247439)</span>
            </div>

            {/* Submit Button */}
            <div className="pt-1 pb-2 sm:pb-0">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 bg-[#25D366] hover:bg-[#20b858] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#25D366]/25 hover:shadow-xl hover:shadow-[#25D366]/35"
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                <span>Confirm & Order via WhatsApp</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
