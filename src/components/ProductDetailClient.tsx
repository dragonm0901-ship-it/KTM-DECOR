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
import { CATALOG_DETAILS } from "@/data/catalog-details";
import {
  Leaf,
  Sun,
  Wrench,
  Gem,
  ShieldCheck,
  Sparkles,
  Settings,
  Ruler,
  Gift,
  Clock,
  Eye,
  Infinity as InfinityIcon,
  Home,
  Monitor,
  Coffee,
  Camera,
  ShoppingBag as BagIcon,
  Heart,
  Truck,
  CloudRain,
  BedDouble,
  Star as LucideStar,
  Layers,
  Lightbulb,
  Plug,
  Clock as ClockIcon,
  Wrench as WrenchIcon,
  ShieldAlert,
  Palette
} from "lucide-react";

// ── CUSTOM GALLERY MAPPING FOR MAIN STOREFRONT ASSETS ──
const GALLERY_MAPPING: Record<string, string[]> = {
  "Acrylic Backlit Signage": [
    "/images/light-boards-nivati.webp",
    "/images/custom-decor-collage.webp",
    "/images/workshop.webp"
  ],
  "Neon Sign": [
    "/images/neon-momo.webp",
    "/images/neon-taso.webp",
    "/images/hero-04.webp"
  ],
  "3D Signage": [
    "/images/3d-letters-salt.webp",
    "/images/dimensional-ktm.webp",
    "/images/custom-decor-collage.webp"
  ],
  "2D Board": [
    "/images/custom-decor-collage.webp",
    "/images/laser-cnc.webp",
    "/images/light-boards-nivati.webp"
  ],
  "House/Office Nameplate": [
    "/images/name-plates.webp",
    "/images/dimensional-ktm.webp",
    "/images/laser-cnc.webp"
  ],
  "Wooden Signage": [
    "/images/laser-cnc.webp",
    "/images/workshop.webp",
    "/images/name-plates.webp"
  ],
  "2.5D Signage": [
    "/images/dimensional-ktm.webp",
    "/images/3d-letters-salt.webp",
    "/images/custom-decor-collage.webp"
  ],
  "Acrylic Table Lamp": [
    "/images/hero-04.webp",
    "/images/neon-taso.webp",
    "/images/neon-momo.webp"
  ],
  "3D Number Plate": [
    "/images/about-hero.webp",
    "/images/dimensional-ktm.webp",
    "/images/3d-letters-salt.webp"
  ],
  "Double Sided Round Light Board": [
    "/images/light-boards-nivati.webp",
    "/images/custom-decor-collage.webp",
    "/images/workshop.webp"
  ]
};

const getGalleryUrls = (product: Product): string[] => {
  const gallery = [product.image];
  if (product.image_urls && product.image_urls.length > 0) {
    product.image_urls.forEach((img) => {
      if (img && img !== product.image && !gallery.includes(img)) {
        gallery.push(img);
      }
    });
    return gallery;
  }
  const categoryImages = GALLERY_MAPPING[product.category] || [];
  categoryImages.forEach((img) => {
    if (img !== product.image && !gallery.includes(img)) {
      gallery.push(img);
    }
  });
  return gallery;
};

interface ProductVariant {
  option_name: string;
  price: number;
  compare_at_price?: number;
}

const getCategoryVariants = (category: string, basePrice: number): ProductVariant[] => {
  if (category === "House/Office Nameplate") {
    return [
      { option_name: "Standard (12x6 inch)", price: basePrice, compare_at_price: Math.round((basePrice * 1.25) / 100) * 100 },
      { option_name: "Executive (16x8 inch)", price: Math.round((basePrice * 1.4) / 100) * 100, compare_at_price: Math.round((basePrice * 1.8) / 100) * 100 },
      { option_name: "Premium (20x10 inch)", price: Math.round((basePrice * 1.8) / 100) * 100, compare_at_price: Math.round((basePrice * 2.3) / 100) * 100 }
    ];
  }
  if (category === "Acrylic Table Lamp") {
    return [
      { option_name: "Bedside Mini", price: basePrice, compare_at_price: Math.round((basePrice * 1.3) / 100) * 100 },
      { option_name: "Desk Standard", price: Math.round((basePrice * 1.35) / 100) * 100, compare_at_price: Math.round((basePrice * 1.7) / 100) * 100 },
      { option_name: "Lounge Premium", price: Math.round((basePrice * 1.7) / 100) * 100, compare_at_price: Math.round((basePrice * 2.2) / 100) * 100 }
    ];
  }
  if (category === "3D Number Plate") {
    return [
      { option_name: "Bike Plate", price: basePrice, compare_at_price: Math.round((basePrice * 1.3) / 100) * 100 },
      { option_name: "Car Standard", price: Math.round((basePrice * 1.5) / 100) * 100, compare_at_price: Math.round((basePrice * 1.9) / 100) * 100 },
      { option_name: "Car Premium (Metal Frame)", price: Math.round((basePrice * 1.95) / 100) * 100, compare_at_price: Math.round((basePrice * 2.5) / 100) * 100 }
    ];
  }
  
  // Standard signage sizes
  return [
    { option_name: "1.5x1.5 feet", price: basePrice, compare_at_price: Math.round((basePrice * 1.3) / 100) * 100 },
    { option_name: "2x2 feet", price: Math.round((basePrice * 1.45) / 100) * 100, compare_at_price: Math.round((basePrice * 1.85) / 100) * 100 },
    { option_name: "2.5x2.5 feet", price: Math.round((basePrice * 1.8) / 100) * 100, compare_at_price: Math.round((basePrice * 2.3) / 100) * 100 },
    { option_name: "3x3 feet", price: Math.round((basePrice * 2.25) / 100) * 100, compare_at_price: Math.round((basePrice * 3.0) / 100) * 100 }
  ];
};

const getProductFeatures = (product: Product): string[] => {
  const baseFeatures = [
    "Crafted with high-grade, durable materials built to last.",
    "Engineered using state-of-the-art CNC precision cutting technology.",
    "Concealed wiring design offers a clean, architectural-grade installation.",
    "Fully customizable sizes, colors, and layout configurations available."
  ];
  if (product.category === "Neon Sign") {
    return [
      "Low-voltage 12V silicon flex neon tubing runs cold and silent.",
      "Mounted on high-clarity 6mm acrylic backing sheet.",
      ...baseFeatures
    ];
  }
  if (product.category === "Acrylic Backlit Signage" || product.category === "Double Sided Round Light Board") {
    return [
      "Equipped with high-efficiency uniform LED backlighting.",
      "Even diffusion layout prevents shadows or light spots.",
      ...baseFeatures
    ];
  }
  return baseFeatures;
};

const getProductPerfectFor = (product: Product): string[] => {
  const categoryPerfectFor: Record<string, string[]> = {
    "Acrylic Backlit Signage": ["Reception areas", "Corporate offices", "Boutique storefronts", "Showrooms"],
    "Neon Sign": ["Cafes and restaurants", "Creative studios", "Event backdrops", "Modern residential spaces"],
    "3D Signage": ["Corporate headquarters", "Building facades", "Reception walls", "Retail showrooms"],
    "2D Board": ["Directional directories", "Restaurant menus", "Safety notices", "Retail pricing boards"],
    "House/Office Nameplate": ["Executive suites", "Residential entryways", "Meeting room signs", "Premium gifts"],
    "Wooden Signage": ["Rustic cafes", "Eco-friendly retail concepts", "Custom office awards", "Home bars"],
    "2.5D Signage": ["Modern office lounges", "Artistic feature walls", "Exhibition displays", "Premium showrooms"],
    "Acrylic Table Lamp": ["Bedside lighting", "Office desks", "Accent display lighting", "Corporate gifts"],
    "3D Number Plate": ["Luxury vehicles", "Premium motorbikes", "Club parking plaques", "Showroom cars"],
    "Double Sided Round Light Board": ["Street projection signs", "Storefront brackets", "Under-canopy displays", "Night clubs"]
  };
  return categoryPerfectFor[product.category] || ["Corporate offices", "Retail outlets", "Custom installations"];
};

interface Review {
  reviewer_name: string;
  rating: number;
  review_date: string;
  review_text: string;
  is_verified: boolean;
}

const getProductReviews = (product: Product): Review[] => {
  return [
    {
      reviewer_name: "Aashish Shrestha",
      rating: 5,
      review_date: "2026-05-12",
      review_text: "The craftsmanship is exceptional. It fits perfectly on our main wall. The ordering process was seamless and delivery inside Kathmandu was on time.",
      is_verified: true
    },
    {
      reviewer_name: "Pooja Gurung",
      rating: 5,
      review_date: "2026-04-28",
      review_text: "Very satisfied with the build quality and attention to detail. The installation was neat and customer service was helpful throughout.",
      is_verified: true
    },
    {
      reviewer_name: "Saurav Joshi",
      rating: 4,
      review_date: "2026-03-15",
      review_text: "Highly recommend KTM DECOR. Excellent service, responsive and professional. The signage looks very premium.",
      is_verified: true
    }
  ];
};

// Helper to render flyer feature icons
const renderFeatureIcon = (icon: string) => {
  const props = { className: "w-5 h-5 text-accent" };
  switch (icon) {
    case "leaf": return <Leaf {...props} />;
    case "sun": return <Sun {...props} />;
    case "wrench": return <Wrench {...props} />;
    case "diamond": return <Gem {...props} />;
    case "shield": return <ShieldCheck {...props} />;
    case "sparkles": return <Sparkles {...props} />;
    case "settings": return <Settings {...props} />;
    case "ruler": return <Ruler {...props} />;
    case "gift": return <Gift {...props} />;
    case "clock": return <Clock {...props} />;
    case "eye": return <Eye {...props} />;
    case "infinity": return <InfinityIcon {...props} />;
    default: return <Sparkles {...props} />;
  }
};

// Helper to render ideal-for icons
const renderIdealForIcon = (icon: string) => {
  const props = { className: "w-8 h-8 text-accent mb-2" };
  switch (icon) {
    case "house": return <Home {...props} />;
    case "monitor": return <Monitor {...props} />;
    case "coffee": return <Coffee {...props} />;
    case "gift": return <Gift {...props} />;
    case "camera": return <Camera {...props} />;
    case "bag": return <BagIcon {...props} />;
    case "settings": return <Settings {...props} />;
    case "heart": return <Heart {...props} />;
    case "truck": return <Truck {...props} />;
    case "cloud": return <CloudRain {...props} />;
    case "bed": return <BedDouble {...props} />;
    default: return <Home {...props} />;
  }
};

// Helper to render spec icons
const getSpecIcon = (key: string) => {
  const props = { className: "w-4 h-4 text-accent/80" };
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes("material") || lowerKey.includes("base")) return <Layers {...props} />;
  if (lowerKey.includes("light") || lowerKey.includes("glow") || lowerKey.includes("lighting")) return <Lightbulb {...props} />;
  if (lowerKey.includes("power") || lowerKey.includes("voltage")) return <Plug {...props} />;
  if (lowerKey.includes("thickness") || lowerKey.includes("dimensions")) return <Ruler {...props} />;
  if (lowerKey.includes("color")) return <Palette {...props} />;
  if (lowerKey.includes("installation") || lowerKey.includes("mounting")) return <WrenchIcon {...props} />;
  if (lowerKey.includes("lifespan") || lowerKey.includes("durability")) return <ClockIcon {...props} />;
  return <ShieldAlert {...props} />;
};

// Retrieve catalog-details matching product ID, fallback if missing
const getCatalogDetails = (product: Product) => {
  if (CATALOG_DETAILS[product.id]) {
    return CATALOG_DETAILS[product.id];
  }
  
  const specMap: Record<string, string> = {};
  if (product.specs && product.specs.length > 0) {
    product.specs.forEach((spec) => {
      const idx = spec.indexOf(":");
      if (idx !== -1) {
        const key = spec.substring(0, idx).trim();
        const val = spec.substring(idx + 1).trim();
        specMap[key] = val;
      } else {
        specMap[spec.slice(0, 15)] = spec;
      }
    });
  } else {
    specMap["Material"] = "Premium Quality Materials";
    specMap["Installation"] = "Wall Mounted / Custom";
    specMap["Lifespan"] = "5+ Years";
  }

  const fallbackFeatures = [
    {
      title: "PREMIUM QUALITY",
      description: "Crafted with industrial-grade materials built for longevity.",
      icon: "diamond" as const
    },
    {
      title: "FULLY CUSTOMIZED",
      description: "Tailored to your specific brand, logo, and design requirements.",
      icon: "wrench" as const
    },
    {
      title: "DURABLE & RELIABLE",
      description: "Designed for reliable, long-lasting performance.",
      icon: "shield" as const
    }
  ];

  return {
    titleWhite1: product.name.split(" ")[0] || "CUSTOM",
    titleGold: product.name.split(" ").slice(1).join(" ") || "PRODUCT",
    description: product.description,
    startingPrice: `Rs. ${product.price.toLocaleString()}`,
    priceNote: "Price varies according to size and custom design.",
    customDesignNote: "Custom Design Your Text, Logo or Artwork",
    features: fallbackFeatures,
    specsTable: specMap,
    idealFor: [
      { label: "OFFICES & WORKSPACES", icon: "monitor" as const },
      { label: "SHOPS & CAFES", icon: "coffee" as const },
      { label: "HOMES", icon: "house" as const }
    ],
    quote: `${product.name.toUpperCase()} ADDS A PREMIUM AND PROFESSIONAL FINISH TO ANY SPACE.`
  };
};

export default function ProductDetailClient() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(() => {
    if (!id) return null;
    return PRODUCTS.find(p => p.id === id) || null;
  });
  const [quantity, setQuantity] = useState(1);
  const [addedPopup, setAddedPopup] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState<boolean>(() => {
    if (!id) return true;
    return !PRODUCTS.some(p => p.id === id);
  });

  // CUSTOM STATE HOOKS FOR GALLERIES, VARIANTS AND TABS
  const [selectedImage, setSelectedImage] = useState<string>(() => {
    if (!id) return "";
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return "";
    return p.image;
  });
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
    if (!id) return null;
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return null;
    const vars = p.variants && p.variants.length > 0 
      ? p.variants 
      : getCategoryVariants(p.category, p.price);
    return vars[0] || null;
  });
  const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
  const [variantsList, setVariantsList] = useState<ProductVariant[]>(() => {
    if (!id) return [];
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return [];
    return p.variants && p.variants.length > 0 
      ? p.variants 
      : getCategoryVariants(p.category, p.price);
  });
  const [galleryUrls, setGalleryUrls] = useState<string[]>(() => {
    if (!id) return [];
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return [];
    return getGalleryUrls(p);
  });

  // Fetch product detail on ID change
  useEffect(() => {
    if (!id) return;

    // Synchronously set to local static product if available to show it instantly
    const foundProduct = PRODUCTS.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      const urls = getGalleryUrls(foundProduct);
      setGalleryUrls(urls);
      setSelectedImage(urls[0] || foundProduct.image);
      const vars = foundProduct.variants && foundProduct.variants.length > 0 
        ? foundProduct.variants 
        : getCategoryVariants(foundProduct.category, foundProduct.price);
      setVariantsList(vars);
      setSelectedVariant(vars[0] || null);
      setLoading(false);
    } else {
      setProduct(null);
      setLoading(true);
    }

    const fetchDetail = async () => {
      try {
        const currentApiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:5001");
        const res = await fetch(`${currentApiUrl}/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            setProduct(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Express backend API details fetch offline. Using local static fallback.", err);
      }
      
      // Fallback if not found in db and not previously loaded
      if (!foundProduct) {
        setProduct(null);
        setLoading(false);
      }
    };
    fetchDetail();
    window.scrollTo(0, 0);
  }, [id]);

  // Handle dynamic population when product resolves
  useEffect(() => {
    if (product) {
      const urls = getGalleryUrls(product);
      setGalleryUrls(urls);
      setSelectedImage(urls[0] || product.image);
      const vars = product.variants && product.variants.length > 0 
        ? product.variants 
        : getCategoryVariants(product.category, product.price);
      setVariantsList(vars);
      setSelectedVariant(vars[0] || null);
    }
  }, [product]);

  // Fetch all products for dynamic suggestions
  useEffect(() => {
    const fetchAllForSuggestions = async () => {
      try {
        const currentApiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:5001");
        const res = await fetch(`${currentApiUrl}/api/products`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAllProducts(data);
          }
        }
      } catch (err) {
        console.warn("Express backend API offline for suggestions. Using static catalog.", err);
      }
    };
    fetchAllForSuggestions();
  }, []);

  if (!product) {
    if (loading) {
      return (
        <div className="min-h-screen pt-28 md:pt-36 lg:pt-44 pb-20 px-6 sm:px-8 md:px-12 bg-background text-foreground flex flex-col items-center justify-center text-center">
          <Package className="w-16 h-16 text-accent mb-4 animate-spin" />
          <h1 className="text-xl font-bold uppercase tracking-tighter mb-2">Loading product details...</h1>
          <p className="text-muted text-xs max-w-sm font-medium">Please wait while we fetch the latest specifications from the workshop catalog.</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen pt-28 md:pt-36 lg:pt-44 pb-20 px-6 sm:px-8 md:px-12 bg-background text-foreground flex flex-col items-center justify-center text-center">
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
  const suggestions = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  // --- GLOBAL CART DISPATCH TRIGGER WITH OVERRIDDEN VARIANT PRICE & DETAILS ---
  const handleAddToCart = () => {
    const customizedProduct = {
      ...product,
      name: selectedVariant ? `${product.name} (${selectedVariant.option_name})` : product.name,
      price: selectedVariant ? selectedVariant.price : product.price,
    };
    window.dispatchEvent(
      new CustomEvent("ktm-decor-add-to-cart", {
        detail: { product: customizedProduct, quantity }
      })
    );
    setAddedPopup(true);
    setTimeout(() => setAddedPopup(false), 2200);
  };

  // --- DIRECT SINGLE ITEM WHATSAPP BUY NOW ---
  const handleWhatsAppBuyNow = () => {
    const activePrice = selectedVariant ? selectedVariant.price : product.price;
    const activeName = selectedVariant ? `${product.name} (${selectedVariant.option_name})` : product.name;
    const totalCost = activePrice * quantity;

    const message = `KTM DECOR - DIRECT PRODUCT ORDER
------------------------------------------
Hi KTM DECOR! I would like to buy this product directly from your catalog.

PRODUCT DETAILS:
- Product Name: ${activeName}
- Category: ${product.category} [${product.subCategory}]
- Quantity Ordered: ${quantity}

FINANCIAL SUMMARY:
- Unit Price: Rs. ${activePrice.toLocaleString()} each
- Total Cost (Excluding Delivery): Rs. ${totalCost.toLocaleString()}
------------------------------------------
Please verify availability, let me know the delivery charges, and estimate the delivery and payment schedules!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "9779706247439"; 
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="min-h-screen pt-28 sm:pt-28 md:pt-36 lg:pt-44 pb-20 px-4 sm:px-8 md:px-12 bg-background text-foreground">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[9px] sm:text-xs font-bold uppercase tracking-wider text-muted mb-4 md:mb-8 border-b border-border/20 pb-2 md:pb-4">
          <Link href="/shop" className="hover:text-accent transition-colors flex items-center gap-1.5 flex-shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
          </Link>
          <ChevronRight className="w-3 h-3 text-muted/40 flex-shrink-0" />
          <span className="text-muted/60 flex-shrink-0">{product.category}</span>
          <ChevronRight className="w-3 h-3 text-muted/40 flex-shrink-0" />
          <span className="text-foreground truncate max-w-[130px] sm:max-w-none" title={product.name}>
            {product.name}
          </span>
        </div>

        {/* 2-Column Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Image Gallery Slider */}
          <div className="space-y-3 sm:space-y-4 w-full">
            <div className="relative aspect-[4/3] sm:aspect-[4/5] rounded-[4px] overflow-hidden bg-card border border-border/80 shadow-sm w-full group">
              <Image 
                src={selectedImage || product.image} 
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
            </div>
            
            {galleryUrls.length > 1 && (
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
                {galleryUrls.map((url, i) => {
                  const isActive = url === selectedImage;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(url)}
                      className={`relative w-14 h-16 sm:w-20 sm:h-24 rounded-[4px] overflow-hidden bg-card border flex-shrink-0 transition-all ${
                        isActive
                          ? "border-accent shadow-sm scale-95"
                          : "border-border/60 hover:border-accent/40"
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`${product.name} image thumbnail ${i + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Parameters & Actions */}
          <div className="space-y-4 sm:space-y-8">
            
            {/* Header Info */}
            <div className="space-y-1.5 sm:space-y-3 pb-3 border-b border-border/20">
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.25em] block">
                {product.subCategory}
              </span>
              {(() => {
                const catDetails = getCatalogDetails(product);
                return (
                  <h1 className="text-xl sm:text-3xl md:text-5xl font-display font-black tracking-tighter text-foreground leading-[1.1] uppercase">
                    {catDetails.titleWhite1}{" "}
                    <span className="text-accent">{catDetails.titleGold}</span>
                    {catDetails.titleWhite2 && ` ${catDetails.titleWhite2}`}
                  </h1>
                );
              })()}
            </div>

            {/* Description Text */}
            <div className="space-y-2">
              <h3 className="text-[9px] uppercase tracking-[0.2em] font-black text-foreground/50">Overview Description</h3>
              <p className="text-xs sm:text-base text-muted leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* Flyer Price Badge */}
            {(() => {
              const catDetails = getCatalogDetails(product);
              const priceText = catDetails.startingPrice.replace("Rs.", "").replace("NPR", "").split("/")[0].trim();
              const suffixText = catDetails.startingPrice.split("/")[1] || "Piece";
              return (
                <div className="bg-card/35 border border-border/40 rounded-lg p-3.5 sm:p-5 space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase font-black text-muted tracking-widest block mb-1">
                        STARTING PRICE
                      </span>
                      <div className="relative inline-flex items-baseline bg-gradient-to-r from-accent to-accent-light text-black px-3.5 py-1.5 sm:px-5 sm:py-2.5 font-display font-black text-lg sm:text-2xl rounded-r-lg skew-x-[-12deg] shadow-lg shadow-accent/20">
                        <span className="skew-x-[12deg] text-xs font-bold mr-1">Rs.</span>
                        <span className="skew-x-[12deg] text-xl sm:text-3xl tracking-tighter">
                          {priceText}
                        </span>
                        <span className="skew-x-[12deg] text-[10px] sm:text-xs font-bold uppercase ml-1 opacity-75">
                          / {suffixText}
                        </span>
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1.5 sm:mt-2 font-medium">
                        {catDetails.priceNote}
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-2.5 max-w-[200px] border border-accent/20 bg-accent/5 p-2 sm:p-2.5 rounded-lg">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <LucideStar className="w-3.5 h-3.5 text-accent fill-accent" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-accent uppercase tracking-wider leading-relaxed">
                        {catDetails.customDesignNote}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Sizing / Variant Selector */}
            {variantsList.length > 0 && (
              <div className="space-y-2 sm:space-y-4">
                <h3 className="text-[9px] uppercase tracking-[0.2em] font-black text-foreground/50">Select Dimensions</h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {variantsList.map((v) => {
                    const isSelected = selectedVariant?.option_name === v.option_name;
                    return (
                      <button
                        key={v.option_name}
                        onClick={() => setSelectedVariant(v)}
                        className={`flex items-center justify-between px-2.5 py-2.5 sm:px-4 sm:py-3.5 rounded-[4px] border transition-all text-left group ${
                          isSelected
                            ? "border-accent bg-accent/[0.03] text-foreground font-bold"
                            : "border-border hover:border-accent/30 text-muted-foreground hover:bg-card/30"
                        }`}
                      >
                        <span className="text-[10px] sm:text-xs uppercase tracking-wide">{v.option_name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-accent animate-in fade-in zoom-in duration-200" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dynamic Price Calculation card */}
            <div className="p-4 sm:p-6 border border-border bg-card/40 rounded-lg space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider">Unit Price</span>
                {selectedVariant?.compare_at_price && (
                  <span className="text-[9px] sm:text-[10px] font-black text-red-500 uppercase tracking-widest px-2 py-0.5 sm:px-2.5 sm:py-1 bg-red-500/10 border border-red-500/15 rounded-[3px]">
                    Save Rs. {(selectedVariant.compare_at_price - selectedVariant.price).toLocaleString()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-xl sm:text-3xl font-black text-foreground tracking-tighter">
                    Rs. {((selectedVariant ? selectedVariant.price : product.price) * quantity).toLocaleString()}
                  </span>
                  {selectedVariant?.compare_at_price && (
                    <span className="text-[10px] sm:text-xs font-semibold text-muted line-through">
                      Rs. {(selectedVariant.compare_at_price * quantity).toLocaleString()}
                    </span>
                  )}
                </div>
                
                {/* Stepper */}
                <div className="flex items-center border border-border rounded bg-background">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-muted hover:text-foreground text-[10px] sm:text-xs transition-colors"
                  >
                    <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <span className="px-3 sm:px-4 text-[10px] sm:text-xs font-black tabular-nums text-foreground">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-muted hover:text-foreground text-[10px] sm:text-xs transition-colors"
                  >
                    <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </div>

              {/* Delivery notice */}
              <div className="flex justify-center items-center text-[10px] sm:text-xs font-black border-t border-border/30 pt-3 sm:pt-4 text-muted-foreground uppercase tracking-wider text-center">
                <span>Delivery charges are excluded in the price above</span>
              </div>
            </div>

            {/* Interactive Buy and Cart CTA triggers */}
            <div className="space-y-2.5 sm:space-y-3 pt-2 sm:pt-4">
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-4 bg-accent md:hover:bg-accent-light text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase rounded-[4px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/25"
                >
                  <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Add to Shopping Cart</span>
                </button>

                <button
                  onClick={handleWhatsAppBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-4 bg-[#25D366] md:hover:bg-[#20b858] text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase rounded-[4px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#25D366]/20"
                >
                  <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Buy Now via WhatsApp</span>
                </button>
              </div>

              {/* Dual WhatsApp Contact Info */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-wider bg-card/35 border border-border/40 p-2.5 sm:p-3 rounded">
                <span>Primary WhatsApp: <a href="https://wa.me/9779706247439" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">+977 9706247439</a></span>
                <span className="hidden sm:inline text-muted/30">|</span>
                <span>Backup Line: <a href="https://wa.me/9779706247438" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground hover:underline">+977 9706247438</a></span>
              </div>
            </div>

          </div>

        </div>

        {/* Tabbed Content Sections */}
        <div className="mt-16 border-b border-border/40">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === "details"
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === "reviews"
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              Reviews ({getProductReviews(product).length})
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === "details" ? (
          (() => {
            const catDetails = getCatalogDetails(product);
            return (
              <div className="py-8 space-y-12 animate-in fade-in duration-300">
                {/* Features (Circular Cards) */}
                <div className="space-y-6">
                  <h3 className="text-sm uppercase tracking-[0.2em] font-black text-accent border-b border-accent/20 pb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> key features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {catDetails.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-4 p-5 rounded-lg bg-card/25 border border-border/40 hover:border-accent/30 transition-all group">
                        <div className="w-12 h-12 rounded-full border border-accent/30 bg-accent/5 flex items-center justify-center flex-shrink-0 group-hover:border-accent/80 group-hover:bg-accent/10 transition-all shadow-[0_0_10px_rgba(254,145,76,0.05)]">
                          {renderFeatureIcon(feature.icon)}
                        </div>
                        <div>
                          <h4 className="font-display font-black text-accent text-sm tracking-wider uppercase">
                            {feature.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed font-medium">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Grid: Specs & Ideal For */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4 border-t border-border/10">
                  {/* Material & Features Table */}
                  <div className="space-y-6">
                    <h3 className="text-sm uppercase tracking-[0.2em] font-black text-accent border-b border-accent/20 pb-2 flex items-center gap-2">
                      <Layers className="w-4 h-4" /> material & features
                    </h3>
                    <div className="border border-border/40 rounded-lg overflow-hidden bg-card/10">
                      <table className="w-full text-left border-collapse">
                        <tbody>
                          {Object.entries(catDetails.specsTable).map(([key, val], idx) => (
                            <tr key={key} className={`border-b border-border/15 hover:bg-card/20 transition-all ${idx % 2 === 0 ? "bg-card/5" : ""}`}>
                              <td className="px-4 py-3 text-xs sm:text-sm font-bold text-accent uppercase tracking-wider flex items-center gap-2.5">
                                {getSpecIcon(key)}
                                <span>{key}</span>
                              </td>
                              <td className="px-4 py-3 text-xs sm:text-sm text-foreground font-medium">
                                {val}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Ideal For Grid */}
                  <div className="space-y-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm uppercase tracking-[0.2em] font-black text-accent border-b border-accent/20 pb-2 flex items-center gap-2">
                        <Home className="w-4 h-4" /> ideal for
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                        {catDetails.idealFor.map((item, i) => (
                          <div key={i} className="flex flex-col items-center justify-center p-4 rounded-lg bg-card/20 border border-border/40 hover:border-accent/40 text-center transition-all group">
                            <div className="w-14 h-14 rounded-full border border-border/80 flex items-center justify-center bg-card/40 group-hover:border-accent group-hover:scale-105 transition-all">
                              {renderIdealForIcon(item.icon)}
                            </div>
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-muted group-hover:text-accent mt-3 transition-colors">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quote Star Banner */}
                    <div className="mt-8 relative overflow-hidden border border-[#fe914c]/20 bg-[#fe914c]/[0.02] p-6 rounded-lg shadow-inner">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl -mr-8 -mt-8" />
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/10 mt-1">
                          <LucideStar className="w-5 h-5 text-accent fill-accent" />
                        </div>
                        <p className="text-xs sm:text-sm font-display font-black text-foreground leading-relaxed uppercase tracking-wider">
                          {catDetails.quote}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Fabrication Guarantee */}
                <div className="space-y-4 pt-6 border-t border-border/10">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-black text-accent">Ordering & Fabrication Guarantee</h3>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-3xl font-medium">
                    Every sign from KTM DECOR is individually crafted in our Kathmandu workshop by skilled artisans. We source premium industrial-grade acrylics, robust low-voltage light fittings, and anti-corrosive backings to ensure longevity and superior performance. Standard fabrication cycles average 5 to 7 business days from design sign-off.
                  </p>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="py-8 space-y-8 animate-in fade-in duration-300">
            {/* Rating summary */}
            <div className="flex flex-col md:flex-row gap-6 md:items-center bg-card/30 border border-border/40 p-6 rounded-lg">
              <div className="text-center md:border-r md:border-border/30 md:pr-8">
                <div className="text-5xl font-black text-foreground tracking-tighter">4.9</div>
                <div className="flex items-center justify-center gap-1 my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                  ))}
                </div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted">Based on {product.reviewsCount || 15} reviews</div>
              </div>
              
              <div className="flex-1 space-y-2 max-w-md">
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="w-12">5 Stars</span>
                  <div className="flex-1 h-2 bg-border/40 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[92%]" />
                  </div>
                  <span className="w-8 text-right">92%</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="w-12">4 Stars</span>
                  <div className="flex-1 h-2 bg-border/40 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[8%]" />
                  </div>
                  <span className="w-8 text-right">8%</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="w-12">3 Stars</span>
                  <div className="flex-1 h-2 bg-border/40 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[0%]" />
                  </div>
                  <span className="w-8 text-right">0%</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="w-12">2 Stars</span>
                  <div className="flex-1 h-2 bg-border/40 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[0%]" />
                  </div>
                  <span className="w-8 text-right">0%</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="w-12">1 Star</span>
                  <div className="flex-1 h-2 bg-border/40 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[0%]" />
                  </div>
                  <span className="w-8 text-right">0%</span>
                </div>
              </div>
            </div>

            {/* List of customer reviews */}
            <div className="space-y-6 divide-y divide-border/20">
              {getProductReviews(product).map((review, i) => (
                <div key={i} className={`space-y-2 ${i > 0 ? "pt-6" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-foreground block">{review.reviewer_name}</span>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest block mt-0.5">{review.review_date}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3.5 h-3.5 ${
                            starIdx < review.rating ? "text-accent fill-accent" : "text-border/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {review.is_verified && (
                    <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded">
                      Verified Purchase
                    </span>
                  )}
                  
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {review.review_text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Products Section */}
        {suggestions.length > 0 && (
          <div className="mt-20 pt-16 border-t border-border/30">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-foreground mb-8 flex items-center gap-2">
              <Star className="w-5 h-5 text-accent fill-accent" /> Suggested Products
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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[49] bg-green-600 border border-green-500 text-white px-6 py-3.5 rounded-lg shadow-2xl flex items-center gap-3">
          <Check className="w-4 h-4 bg-white/20 rounded-full p-0.5 flex-shrink-0" />
          <span className="text-xs font-bold tracking-wider uppercase truncate max-w-[240px]">
            {product.name} added to cart
          </span>
        </div>
      )}

    </div>
  );
}
