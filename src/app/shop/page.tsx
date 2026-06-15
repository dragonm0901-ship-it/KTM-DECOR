"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Search, 
  SlidersHorizontal, 
  ShoppingBag, 
  Plus, 
  Star, 
  Filter, 
  Sparkles,
  TrendingUp,
  Package,
  X
} from "@/components/ui/solar-icons";
import gsap from "gsap";
import { CATEGORIES, SUB_CATEGORIES, PRODUCTS, Product } from "@/data/shop-data";

export default function ShopPage() {
  // --- FILTERS & SORTING STATE ---
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedBadge, setSelectedBadge] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "name-az">("featured");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(PRODUCTS);
  const [dbProducts, setDbProducts] = useState<Product[]>(PRODUCTS);

  // Mount logic: Fetch products from express backend
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const currentApiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:5001");
        const res = await fetch(`${currentApiUrl}/api/products`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDbProducts(data);
          }
        }
      } catch (err) {
        console.warn("Express backend API is offline. Using local static products fallback.", err);
      }
    };
    fetchCatalog();
  }, []);
  
  // UI Panels states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);

  // --- GLOBAL CART DISPATCH TRIGGER ---
  const addToCart = (product: Product, qty: number = 1) => {
    window.dispatchEvent(
      new CustomEvent("ktm-decor-add-to-cart", {
        detail: { product, quantity: qty }
      })
    );
  };

  // --- FILTER & SORT ENGINE ---
  useEffect(() => {
    let result = dbProducts;

    // A. Category Filter
    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory);
    }

    // B. Subcategory Filter
    if (activeSubCategory) {
      result = result.filter(p => p.subCategory === activeSubCategory);
    }

    // C. Search Query Filter
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // D. Price Slider Filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // E. Product Badge Filter
    if (selectedBadge !== "All") {
      result = result.filter(p => p.badge === selectedBadge);
    }

    // F. Sorting Logic
    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-az") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(result);
  }, [activeCategory, activeSubCategory, searchQuery, priceRange, selectedBadge, sortBy, dbProducts]);

  // Stagger GSAP Entrance animations on Filter Card Changes
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".shop-card");
    
    gsap.fromTo(cards, 
      { opacity: 0, y: 15, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.04, ease: "power2.out" }
    );
  }, [filteredProducts]);

  // Helper dynamic counts calculators
  const getProductCountByCategory = (cat: string) => {
    if (cat === "All") return dbProducts.length;
    return dbProducts.filter(p => p.category === cat).length;
  };

  const getProductCountBySubCategory = (sub: string) => {
    return dbProducts.filter(p => p.subCategory === sub).length;
  };

  return (
    <div className="min-h-screen pt-28 md:pt-36 lg:pt-44 pb-20 px-4 sm:px-6 lg:px-8 bg-background text-foreground w-full">
      <div className="w-full max-w-none">
        
        {/* ── HEADER ROW ── */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12 border-b border-border/40 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs tracking-widest font-black text-accent uppercase">
              <TrendingUp className="w-3.5 h-3.5" /> High-Fidelity Signs Catalog
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">Shop.</h1>
            <p className="text-muted text-sm sm:text-base max-w-lg">
              Explore our premium range of pre-designed decor items. Click any sign to view full product details, specs, and reviews!
            </p>
          </div>
          
          {/* Dynamic Search Box */}
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent transition-colors z-10" />
            <input 
              type="text" 
              placeholder="Search by name, tags, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-card border border-border rounded-[4px] text-sm outline-none focus:border-accent transition-all text-foreground"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── SLEEK TOP FILTER & CATEGORY TOOLBAR ── */}
        <div className="flex flex-col gap-5 mb-10 border-b border-border/30 pb-6 w-full">
          {/* Categories List (Horizontal Scrolling Scrollbar-free Row) */}
          <div className="w-full overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-2.5 w-max">
              {CATEGORIES.map((cat) => {
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setActiveSubCategory(null);
                    }}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                      isSelected 
                        ? "bg-accent border-accent text-white shadow-md shadow-accent/20" 
                        : "bg-card border-border hover:bg-border/60 text-muted"
                    }`}
                  >
                    {cat} {cat !== "All" && `(${getProductCountByCategory(cat)})`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategories (Only displayed when active category has subcategories) */}
          {activeCategory !== "All" && SUB_CATEGORIES[activeCategory] && (
            <div className="w-full overflow-x-auto no-scrollbar py-1 border-t border-border/10 pt-4">
              <div className="flex items-center gap-2 w-max">
                <button
                  onClick={() => setActiveSubCategory(null)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    !activeSubCategory 
                      ? "bg-accent/10 border-accent text-accent" 
                      : "bg-card border-border hover:bg-border/60 text-muted"
                  }`}
                >
                  All {activeCategory}
                </button>
                {SUB_CATEGORIES[activeCategory].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubCategory(sub)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                      activeSubCategory === sub 
                        ? "bg-accent/10 border-accent text-accent" 
                        : "bg-card border-border/80 hover:bg-border/60 text-muted/80"
                    }`}
                  >
                    {sub} ({getProductCountBySubCategory(sub)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filter Badges & Auxiliary Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-border/10">
            {/* Badge Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted mr-1">Tags:</span>
              {["All", "Best Seller", "New", "Custom"].map((badge) => (
                <button
                  key={badge}
                  onClick={() => setSelectedBadge(badge)}
                  className={`px-3.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    selectedBadge === badge 
                      ? "bg-accent/10 border-accent text-accent font-black" 
                      : "bg-card border-border hover:bg-border/40 text-muted"
                  }`}
                >
                  {badge}
                </button>
              ))}
            </div>

            {/* Price Max & Sorting controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Max Price Slider */}
              <div className="flex items-center gap-3 bg-card border border-border px-3.5 py-2 rounded-md text-xs font-semibold">
                <span className="text-muted font-medium">Max Price:</span>
                <input 
                  type="range" 
                  min="15000" 
                  max="95000" 
                  step="5000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-28 sm:w-36 accent-accent cursor-pointer h-1 rounded"
                />
                <span className="text-accent font-bold font-sans">Rs. {priceRange[1].toLocaleString()}</span>
              </div>

              {/* Sorting Options Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3.5 py-2 bg-card border border-border rounded-md text-xs font-bold uppercase tracking-wide text-foreground focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low-High</option>
                  <option value="price-high">Price: High-Low</option>
                  <option value="name-az">A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTIVE FILTERS SUMMARY ROW ── */}
        {(activeCategory !== "All" || activeSubCategory || selectedBadge !== "All" || searchQuery || priceRange[1] < 100000) && (
          <div className="flex flex-wrap items-center gap-2 mb-8 bg-card/45 border border-border/30 p-3 rounded-[4px] animate-in fade-in duration-300">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted mr-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-accent" /> Active Filters:
            </span>
            
            {activeCategory !== "All" && (
              <button 
                onClick={() => {
                  setActiveCategory("All");
                  setActiveSubCategory(null);
                }}
                className="px-2.5 py-1 bg-background border border-border hover:border-red-500 hover:text-red-500 rounded-[3px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <span>Category: {activeCategory}</span>
                <X className="w-2.5 h-2.5" />
              </button>
            )}

            {activeSubCategory && (
              <button 
                onClick={() => setActiveSubCategory(null)}
                className="px-2.5 py-1 bg-background border border-border hover:border-red-500 hover:text-red-500 rounded-[3px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <span>Subcategory: {activeSubCategory}</span>
                <X className="w-2.5 h-2.5" />
              </button>
            )}

            {selectedBadge !== "All" && (
              <button 
                onClick={() => setSelectedBadge("All")}
                className="px-2.5 py-1 bg-background border border-border hover:border-red-500 hover:text-red-500 rounded-[3px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <span>Tag: {selectedBadge}</span>
                <X className="w-2.5 h-2.5" />
              </button>
            )}

            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="px-2.5 py-1 bg-background border border-border hover:border-red-500 hover:text-red-500 rounded-[3px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <span>Search: "{searchQuery}"</span>
                <X className="w-2.5 h-2.5" />
              </button>
            )}

            {priceRange[1] < 100000 && (
              <button 
                onClick={() => setPriceRange([priceRange[0], 100000])}
                className="px-2.5 py-1 bg-background border border-border hover:border-red-500 hover:text-red-500 rounded-[3px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <span>Price: &lt; Rs. {priceRange[1].toLocaleString()}</span>
                <X className="w-2.5 h-2.5" />
              </button>
            )}

            <button 
              onClick={() => {
                setActiveCategory("All");
                setActiveSubCategory(null);
                setSelectedBadge("All");
                setSearchQuery("");
                setPriceRange([0, 100000]);
              }}
              className="text-[10px] font-bold text-accent hover:underline uppercase tracking-wider ml-auto px-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* ── PRODUCTS PANEL (FULL SCREEN WIDTH) ── */}
        <div className="w-full">
          {filteredProducts.length > 0 ? (
            <>
              <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 w-full">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="shop-card group flex flex-col justify-between h-full bg-card/20 rounded-xl border border-border/60 hover:border-accent/40 shadow-md hover:shadow-2xl overflow-hidden transition-all duration-300">
                    
                    {/* Image Stage wrapper (Full-width inside Card, Square) */}
                    <Link href={`/shop/${product.id}`} className="relative aspect-square w-full overflow-hidden block bg-card">
                      <Image 
                        src={product.image} 
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 lg:group-hover:scale-105"
                      />
                      
                      {/* Hover Actions overlay */}
                      <div 
                        className="absolute inset-0 z-20 bg-black/45 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 hidden lg:flex items-center justify-center gap-2.5 p-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div 
                          className="px-4 py-2.5 bg-white hover:bg-neutral-100 text-black rounded-md flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all truncate"
                          title="View Product Details"
                        >
                          <ShoppingBag className="w-4 h-4 text-accent flex-shrink-0" />
                          <span>Details</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart(product, 1);
                          }}
                          className="p-2.5 bg-accent text-white rounded-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-accent/20 flex-shrink-0"
                          title="Quick Add to Cart"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </Link>

                    {/* Technical details block */}
                    <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">
                          {product.subCategory}
                        </span>
                        
                        <Link href={`/shop/${product.id}`} className="block">
                          <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground hover:text-accent transition-colors leading-snug line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      {/* Pricing Tag and Direct Add CTAs */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/20 mt-2">
                        <span className="text-sm sm:text-base font-extrabold text-foreground">
                          Rs. {product.price.toLocaleString()}
                        </span>
                        
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-accent/10 active:scale-95"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Removed Show More Button because catalog size is capped at 12 items */}
            </>
          ) : (
            <div className="py-24 text-center bg-card rounded-lg border border-dashed border-border/80">
              <Package className="w-12 h-12 text-muted mx-auto mb-4 animate-pulse" />
              <p className="text-muted text-sm font-medium mb-4">No signage designs match your active search or filters.</p>
              <button 
                onClick={() => {
                  setActiveCategory("All");
                  setActiveSubCategory(null);
                  setPriceRange([0, 100000]);
                  setSearchQuery("");
                  setSelectedBadge("All");
                  setSortBy("featured");
                }}
                className="px-5 py-2.5 bg-accent text-white text-xs font-bold tracking-widest uppercase rounded-[4px] shadow shadow-accent/20"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
