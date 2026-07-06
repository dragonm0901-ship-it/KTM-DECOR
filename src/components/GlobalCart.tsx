"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import { 
  ShoppingBag, 
  X, 
  Trash2, 
  Minus, 
  Plus, 
  Check, 
  MapPin, 
  MessageCircle, 
  Info 
} from "@/components/ui/solar-icons";
import { Product } from "@/data/shop-data";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function GlobalCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedPopupName, setAddedPopupName] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // GSAP Right-Side Slide Animation
  useEffect(() => {
    if (isCartOpen) {
      const finalWidth = window.innerWidth >= 1024 ? "600px" : (window.innerWidth >= 640 ? "480px" : "100%");

      // Set initial state offscreen to the right
      gsap.set(drawerRef.current, {
        x: "100%",
        top: 0,
        bottom: 0,
        right: 0,
        width: finalWidth,
        height: "100%",
        borderRadius: "0px",
        borderWidth: "0px",
        opacity: 1,
        position: "fixed",
        zIndex: 150,
        overflow: "hidden"
      });

      gsap.set(contentRef.current, { opacity: 0, y: 15 });
      gsap.set(backdropRef.current, { opacity: 0 });

      const tl = gsap.timeline();

      // Fade in backdrop
      tl.to(backdropRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      }, 0);

      // Slide in drawer
      tl.to(drawerRef.current, {
        x: "0%",
        duration: 0.4,
        ease: "power3.out"
      }, 0);

      // Fade/rise content
      tl.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      }, 0.15);
    }
  }, [isCartOpen]);

  const handleCloseWithAnimation = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setIsCartOpen(false);
      }
    });

    tl.to(contentRef.current, {
      opacity: 0,
      y: 15,
      duration: 0.25,
      ease: "power2.in"
    }, 0);

    tl.to(backdropRef.current, {
      opacity: 0,
      duration: 0.35,
      ease: "power2.in"
    }, 0.05);

    tl.to(drawerRef.current, {
      x: "100%",
      duration: 0.35,
      ease: "power3.in"
    }, 0.05);
  };

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryRegion, setDeliveryRegion] = useState("kathmandu");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // --- 1. LOCAL STORAGE & INITIALIZATION ---
  useEffect(() => {
    const savedCart = localStorage.getItem("ktm_decor_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart storage: ", e);
      }
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("ktm_decor_cart", JSON.stringify(newCart));
    window.dispatchEvent(new CustomEvent("ktm-decor-cart-updated"));
  };

  useEffect(() => {
    const handleOpen = () => setIsCartOpen(true);
    window.addEventListener("ktm-decor-open-cart", handleOpen);
    return () => window.removeEventListener("ktm-decor-open-cart", handleOpen);
  }, []);

  // --- 2. GLOBAL EVENT LISTENER FOR ADDING ITEMS ---
  useEffect(() => {
    const handleAdd = (e: Event) => {
      const customEvent = e as CustomEvent<{ product: Product; quantity?: number }>;
      const product = customEvent.detail.product;
      const quantity = customEvent.detail.quantity || 1;
      
      const existingIndex = cart.findIndex(item => item.product.id === product.id);
      let newCart = [...cart];

      if (existingIndex > -1) {
        newCart[existingIndex].quantity += quantity;
      } else {
        newCart.push({ product, quantity });
      }

      saveCart(newCart);
      
      // Visual feedback popup
      setAddedPopupName(product.name);
      setTimeout(() => setAddedPopupName(null), 2200);
    };

    window.addEventListener("ktm-decor-add-to-cart", handleAdd);
    return () => window.removeEventListener("ktm-decor-add-to-cart", handleAdd);
  }, [cart]);

  // --- 3. CART ACTIONS ---
  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map(item => 
      item.product.id === productId ? { ...item, quantity: newQty } : item
    );
    saveCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getSubtotal = () => {
    return cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  };

  const getShippingFee = () => {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= 50000 ? 0 : 1500;
  };

  const getGrandTotal = () => {
    return getSubtotal() + getShippingFee();
  };

  const getCartTotalItems = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  // --- 4. CHECKOUT INTAKE LEAD COMPILER TO WHATSAPP ---
  const handleCheckoutToWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName || !customerPhone || !customerAddress) {
      alert("Please fill in Name, Phone, and Address to place order.");
      return;
    }

    const regionNames: Record<string, string> = {
      kathmandu: "Kathmandu Valley (Inside)",
      lalitpur: "Lalitpur District",
      bhaktapur: "Bhaktapur District",
      outside_valley: "Outside Kathmandu Valley"
    };

    const itemsText = cart.map((item, idx) => {
      if (item.product.price === 0) {
        return `${idx + 1}️⃣ *${item.product.name}* (Qty: ${item.quantity})
   - Category: ${item.product.category} [${item.product.subCategory}]
   - Specifications:
     ${item.product.specs.map(spec => `• ${spec}`).join("\n     ")}
   - Price: Quote Pending (Fabrication team to calculate)`;
      }
      const totalItemVal = item.product.price * item.quantity;
      return `${idx + 1}️⃣ *${item.product.name}* (Qty: ${item.quantity})
   - Category: ${item.product.category} [${item.product.subCategory}]
   - Price: Rs. ${item.product.price.toLocaleString()} each (Total: Rs. ${totalItemVal.toLocaleString()})`;
    }).join("\n\n");

    const shippingText = getShippingFee() === 0 
      ? "Rs. 0 (FREE Shipping Applied! 🎉)" 
      : `Rs. ${getShippingFee().toLocaleString()}`;

    const hasCustomItems = cart.some(item => item.product.price === 0);
    const customQuoteNotice = hasCustomItems 
      ? "\n⚠️ *Note:* Cart contains custom configurations. Total price excludes custom signs (Quote Pending)." 
      : "";

    const message = `*KTM DECOR - E-COMMERCE SHOP CHECKOUT* 🛍️
------------------------------------------
👋 Hi KTM DECOR team! I would like to place an order for the following items in my shopping cart.

*👤 CUSTOMER & SHIPPING INFO:*
• *Name:* ${customerName}
• *Phone Contact:* ${customerPhone}
• *Delivery Region:* ${regionNames[deliveryRegion]}
• *Exact Address:* ${customerAddress}
• *Delivery Notes/Instructions:* ${deliveryNotes || "No specific instructions"}

*📦 ORDERED ITEMS:*
${itemsText}

*💰 FINANCIAL SUMMARY:*
• *Subtotal Amount:* Rs. ${getSubtotal().toLocaleString()}
• *Standard Shipping:* ${shippingText}
• *GRAND TOTAL COST:* Rs. ${getGrandTotal().toLocaleString()}${customQuoteNotice}
------------------------------------------
🚀 Please review the catalog selections, verify color/stock availability, and let me know the estimated delivery and payment schedules!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "9779706247439"; 
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <>


      {/* Added to cart bottom bubble */}
      {addedPopupName && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[49] bg-green-600 border border-green-500 text-white px-6 py-3.5 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce">
          <Check className="w-4 h-4 bg-white/20 rounded-full p-0.5 flex-shrink-0" />
          <span className="text-xs font-bold tracking-wider uppercase truncate max-w-[240px]">
            {addedPopupName} added to cart!
          </span>
        </div>
      )}

      {/* Backdrop (rendered outside the drawer wrapper to prevent clipping & z-index dimming) */}
      <div 
        ref={backdropRef}
        onClick={handleCloseWithAnimation}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] ${
          isCartOpen ? "block" : "hidden"
        }`}
      />

      {/* Cart Drawer */}
      <div 
        ref={drawerRef}
        className={`fixed top-0 bottom-0 right-0 w-full sm:w-[480px] lg:w-[600px] bg-white dark:bg-zinc-950 border-l border-border z-[150] shadow-2xl flex-col transition-colors duration-500 text-foreground ${
          isCartOpen ? "flex" : "hidden"
        }`}
      >
        {/* Content Container (fade-in) */}
        <div ref={contentRef} className="flex-1 flex flex-col h-full opacity-0">
          
          {/* Header */}
          <div className="p-6 border-b border-border/40 flex justify-between items-center bg-white dark:bg-zinc-950 transition-colors duration-500">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-black uppercase tracking-tighter">Your Shopping Cart</h2>
              <span className="bg-accent/15 text-accent px-2 py-0.5 rounded text-[10px] font-black tracking-wider">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
            <button 
              onClick={handleCloseWithAnimation}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-foreground/5 hover:scale-105 active:scale-95 transition-all"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Scrollable list & Checkout Form */}
          <div 
            data-lenis-prevent
            className="flex-1 relative overflow-y-auto p-6 space-y-8 no-scrollbar"
          >
            {cart.length > 0 ? (
              <>
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/50">Items in Cart</h3>
                  <div className="divide-y divide-border/40 space-y-3">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex gap-4 pt-3 first:pt-0">
                        <div className="relative w-16 h-20 rounded bg-white dark:bg-zinc-900 border border-border overflow-hidden flex-shrink-0">
                          <Image src={item.product.image} alt={item.product.name} fill className="object-cover" unoptimized />
                        </div>
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="pr-6 relative">
                            <span className="text-[8px] font-black text-muted-foreground/75 uppercase tracking-widest block">{item.product.subCategory}</span>
                            <h4 className="text-xs font-bold text-foreground truncate">{item.product.name}</h4>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">
                              {item.product.price === 0 ? "Quote Pending" : `Rs. ${item.product.price.toLocaleString()} each`}
                            </span>
                            <button 
                              onClick={() => removeFromCart(item.product.id)}
                              className="absolute right-0 top-0 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <div className="flex-1 min-w-0 flex items-center justify-between mt-2">
                            <div className="flex items-center border border-border rounded bg-transparent">
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="px-2 py-1 text-muted-foreground hover:text-foreground text-xs"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-xs font-bold tabular-nums text-foreground">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="px-2 py-1 text-muted-foreground hover:text-foreground text-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-xs font-black tracking-tight text-foreground">
                              {item.product.price === 0 ? "Quote Pending" : `Rs. ${(item.product.price * item.quantity).toLocaleString()}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculations */}
                <div className="p-4 border border-border bg-white dark:bg-zinc-900/40 rounded-lg space-y-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <div className="flex justify-between items-center text-foreground">
                    <span>Cart Subtotal</span>
                    <span className="font-black text-foreground">Rs. {getSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivery Shipping</span>
                    <span className={getShippingFee() === 0 ? "text-green-600 dark:text-green-400 font-black text-[10px] tracking-widest" : "text-foreground font-black"}>
                      {getShippingFee() === 0 ? "FREE Valley Delivery" : `Rs. ${getShippingFee().toLocaleString()}`}
                    </span>
                  </div>

                  {getShippingFee() > 0 && (
                    <div className="flex items-start gap-1.5 p-2 bg-accent/[0.03] border border-accent/15 rounded text-[9px] text-muted-foreground normal-case leading-relaxed font-medium">
                      <Info className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                      <span>
                        Add signs worth <strong>Rs. {(50000 - getSubtotal()).toLocaleString()}</strong> more to unlock <strong>FREE Valley Delivery!</strong>
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm font-black border-t border-border/40 pt-3 text-foreground tracking-tight">
                    <span>Grand Total Cost</span>
                    <span className="text-accent text-base">Rs. {getGrandTotal().toLocaleString()}</span>
                  </div>
                </div>

                  {/* Shipping Form */}
                  <form onSubmit={handleCheckoutToWhatsApp} className="space-y-4 border-t border-border/40 pt-6">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-accent" /> Shipping Details
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-[10px] tracking-wider uppercase text-muted-foreground/80 block mb-1">Customer Full Name *</label>
                        <input 
                          type="text" 
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Sagar Luitel"
                          className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-border rounded-[4px] text-foreground focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-[10px] tracking-wider uppercase text-muted-foreground/80 block mb-1">Contact Phone Number *</label>
                        <input 
                          type="tel" 
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="e.g. 9706247439"
                          className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-border rounded-[4px] text-foreground focus:outline-none focus:border-accent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-[10px] tracking-wider uppercase text-muted-foreground/80 block mb-1">Valley Region *</label>
                          <select
                            value={deliveryRegion}
                            onChange={(e) => setDeliveryRegion(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-border rounded-[4px] text-[10px] font-bold tracking-wide uppercase text-foreground focus:outline-none focus:border-accent"
                          >
                            <option value="kathmandu" className="bg-white dark:bg-zinc-900 text-foreground">KTM (Valley Inside)</option>
                            <option value="lalitpur" className="bg-white dark:bg-zinc-900 text-foreground">Lalitpur District</option>
                            <option value="bhaktapur" className="bg-white dark:bg-zinc-900 text-foreground">Bhaktapur District</option>
                            <option value="outside_valley" className="bg-white dark:bg-zinc-900 text-foreground">Outside Valley</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-[10px] tracking-wider uppercase text-muted-foreground/80 block mb-1">Exact Street / Area *</label>
                          <input 
                            type="text" 
                            required
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder="e.g. Thamel Shop-4"
                            className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-border rounded-[4px] text-foreground focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-[10px] tracking-wider uppercase text-muted-foreground/80 block mb-1">Delivery Custom Notes (Optional)</label>
                        <textarea 
                          rows={2}
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          placeholder="e.g. Please deliver after office hours."
                          className="w-full px-3 py-2.5 bg-white dark:bg-zinc-900 border border-border rounded-[4px] text-foreground focus:outline-none focus:border-accent resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#25D366] text-white text-xs font-bold tracking-widest uppercase rounded-[4px] hover:bg-[#20b858] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#25D366]/20"
                    >
                      <MessageCircle className="w-4 h-4 flex-shrink-0" />
                      Checkout to WhatsApp
                    </button>

                    <div className="flex flex-col gap-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider bg-white dark:bg-zinc-900/40 border border-border/45 p-2.5 rounded mt-3 text-center">
                      <span>Primary WhatsApp: <a href="https://wa.me/9779706247439" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">+977 9706247439</a></span>
                      <span>Backup Support Line: <a href="https://wa.me/9779706247438" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground hover:underline">+977 9706247438</a></span>
                    </div>
                  </form>
                </>
              ) : (
                <div className="py-24 text-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4 animate-pulse" />
                  <p className="text-muted-foreground text-sm font-medium mb-6">Your shopping cart is currently empty.</p>
                  <button 
                    onClick={handleCloseWithAnimation}
                    className="px-5 py-2.5 bg-accent text-white text-xs font-bold tracking-widest uppercase rounded-[4px]"
                  >
                    Back to Catalog
                  </button>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-border/40 bg-white dark:bg-zinc-950 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Direct Lead Dispatcher v2.0</span>
                <button 
                  onClick={clearCart}
                  className="text-muted-foreground hover:text-red-500 font-bold uppercase tracking-wider"
                >
                  Clear All Items
                </button>
              </div>
            )}
        </div>
      </div>
    </>
  );
}
