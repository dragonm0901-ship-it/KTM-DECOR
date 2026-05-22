"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Star, 
  Check, 
  MessageCircle, 
  ChevronRight,
  Package
} from "@/components/ui/solar-icons";
import { PRODUCTS, Product } from "@/data/shop-data";

export default function ProductDetailClient() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedPopup, setAddedPopup] = useState(false);

  useEffect(() => {
    if (!id) return;
    const foundProduct = PRODUCTS.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      window.scrollTo(0, 0);
    }
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen pt-28 md:pt-36 lg:pt-44 pb-20 px-6 md:px-12 bg-background text-foreground flex flex-col items-center justify-center text-center">
        <Package className="w-16 h-16 text-muted mb-4 animate-pulse" />
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Product Not Found</h1>
        <p className="text-muted text-sm mb-6 max-w-sm">The product you are looking for does not exist or has been removed from our catalog.</p>
        <Link 
          href="/shop" 
          className="px-6 py-3.5 bg-accent text-white text-xs font-bold tracking-widest uppercase rounded-[4px] shadow shadow-accent/20"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  // Filter up to 4 suggested products from the same category (excluding current product)
  const suggestions = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  // --- GLOBAL CART DISPATCH TRIGGER ---
  const handleAddToCart = () => {
    window.dispatchEvent(
      new CustomEvent("ktm-decor-add-to-cart", {
        detail: { product, quantity }
      })
    );
    setAddedPopup(true);
    setTimeout(() => setAddedPopup(false), 2200);
  };

  // --- DIRECT SINGLE ITEM WHATSAPP BUY NOW ---
  const handleWhatsAppBuyNow = () => {
    const totalCost = product.price * quantity;
    const shipping = totalCost >= 50000 ? 0 : 1500;
    const grandTotal = totalCost + shipping;

    const shippingText = shipping === 0 
      ? "Rs. 0 (FREE Shipping Applied! 🎉)" 
      : `Rs. ${shipping.toLocaleString()}`;

    const message = `*KTM DECOR - DIRECT PRODUCT ORDER* 🛍️
------------------------------------------
👋 Hi KTM DECOR! I would like to buy this product directly from your catalog.

*📦 PRODUCT DETAILS:*
• *Product Name:* ${product.name}
• *Category:* ${product.category} [${product.subCategory}]
• *Quantity Ordered:* ${quantity}

*💰 FINANCIAL SUMMARY:*
• *Unit Price:* Rs. ${product.price.toLocaleString()} each
• *Subtotal Cost:* Rs. ${totalCost.toLocaleString()}
• *Standard Shipping:* ${shippingText}
• *GRAND TOTAL COST:* Rs. ${grandTotal.toLocaleString()}
------------------------------------------
🚀 Please verify stock/color availability and let me know the estimated delivery and payment schedules!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "9779706247439"; 
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="min-h-screen pt-28 md:pt-36 lg:pt-44 pb-20 px-6 md:px-12 bg-background text-foreground">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted mb-8 border-b border-border/20 pb-4">
          <Link href="/shop" className="hover:text-accent transition-colors flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
          </Link>
          <ChevronRight className="w-3 h-3 text-muted/40" />
          <span className="text-muted/60">{product.category}</span>
          <ChevronRight className="w-3 h-3 text-muted/40" />
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* 2-Column Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          <div className="relative aspect-[4/5] rounded-[4px] overflow-hidden bg-card border border-border/80 shadow-sm w-full">
            <Image 
              src={product.image} 
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              className="object-cover"
              priority
            />
          </div>

          {/* Right Column: Dynamic Parameters & Actions */}
          <div className="space-y-8">
            
            {/* Header Info */}
            <div className="space-y-3 pb-4 border-b border-border/20">
              <span className="text-xs font-black text-accent uppercase tracking-[0.25em] block">
                {product.subCategory}
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-foreground leading-[1.1]">
                {product.name}
              </h1>
            </div>

            {/* Description Text */}
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-foreground/50">Overview Description</h3>
              <p className="text-sm sm:text-base text-muted leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* Detailed technical specifications checklist */}
            <div className="space-y-4 pt-2">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-foreground/50">Technical Specifications</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-muted-foreground font-medium">
                {product.specs.map((spec, i) => (
                  <li key={i} className="flex items-start gap-2.5 leading-normal">
                    <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5 bg-accent/15 rounded-full p-0.5" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dynamic Price Calculation card */}
            <div className="p-6 border border-border bg-card/40 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">Unit Price</span>
                <span className="text-xs font-bold text-muted uppercase tracking-wider">Quantity Multiplier</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter">
                  Rs. {(product.price * quantity).toLocaleString()}
                </span>
                
                {/* Custom Stepper */}
                <div className="flex items-center border border-border rounded bg-background">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-muted hover:text-foreground text-xs transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-black tabular-nums text-foreground">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-muted hover:text-foreground text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Shipping calculator tip */}
              <div className="flex justify-between items-center text-xs font-bold border-t border-border/30 pt-4 text-muted uppercase tracking-wider">
                <span>Valley Shipping</span>
                <span className={product.price * quantity >= 50000 ? "text-green-500 font-black tracking-widest text-[10px]" : "text-foreground font-black"}>
                  {product.price * quantity >= 50000 ? "FREE Valley Delivery applied! 🎉" : "Rs. 1,500"}
                </span>
              </div>
            </div>

            {/* Interactive Buy and Cart CTA triggers */}
            <div className="space-y-3 pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-accent hover:bg-accent-light text-white text-xs font-bold tracking-widest uppercase rounded-[4px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/25"
                >
                  <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                  <span>Add to Shopping Cart</span>
                </button>

                <button
                  onClick={handleWhatsAppBuyNow}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[#25D366] hover:bg-[#20b858] text-white text-xs font-bold tracking-widest uppercase rounded-[4px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#25D366]/20"
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Buy Now via WhatsApp</span>
                </button>
              </div>

              {/* Dual WhatsApp Contact Info */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-bold text-muted uppercase tracking-wider bg-card/35 border border-border/40 p-3 rounded">
                <span>Primary WhatsApp: <a href="https://wa.me/9779706247439" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">+977 9706247439</a></span>
                <span className="hidden sm:inline text-muted/30">|</span>
                <span>Backup Line: <a href="https://wa.me/9779706247438" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground hover:underline">+977 9706247438</a></span>
              </div>
            </div>

          </div>

        </div>

        {/* Suggested Products Section */}
        {suggestions.length > 0 && (
          <div className="mt-20 pt-16 border-t border-border/30">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-foreground mb-8 flex items-center gap-2">
              <Star className="w-5 h-5 text-accent animate-pulse fill-accent" /> Suggested Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {suggestions.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.id}`}
                  className="group flex flex-col justify-between h-full bg-card/15 rounded-[4px] border border-transparent hover:border-border/30 hover:bg-card/40 transition-all p-2 sm:p-3"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/5] rounded-[4px] overflow-hidden bg-card border border-border/80 mb-3">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
                      className="object-cover transition-transform duration-700 lg:group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Text Details */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-black text-muted uppercase tracking-widest block">{p.subCategory}</span>
                    <h3 className="text-xs sm:text-sm font-bold tracking-tight text-foreground truncate hover:text-accent transition-colors">
                      {p.name}
                    </h3>
                    <span className="text-xs sm:text-sm font-black text-foreground block pt-1">
                      Rs. {p.price.toLocaleString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Added to cart notification popup */}
      {addedPopup && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[49] bg-green-600 border border-green-500 text-white px-6 py-3.5 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce">
          <Check className="w-4 h-4 bg-white/20 rounded-full p-0.5 flex-shrink-0" />
          <span className="text-xs font-bold tracking-wider uppercase truncate max-w-[240px]">
            {product.name} added to cart!
          </span>
        </div>
      )}

    </div>
  );
}
