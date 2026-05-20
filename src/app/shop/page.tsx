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
  const [visibleCount, setVisibleCount] = useState(20);
  
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
    let result = PRODUCTS;

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
    setVisibleCount(20);
  }, [activeCategory, activeSubCategory, searchQuery, priceRange, selectedBadge, sortBy]);

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
    if (cat === "All") return PRODUCTS.length;
    return PRODUCTS.filter(p => p.category === cat).length;
  };

  const getProductCountBySubCategory = (sub: string) => {
    return PRODUCTS.filter(p => p.subCategory === sub).length;
  };

  return (
    <div className="min-h-screen pt-44 pb-20 px-6 md:px-12 bg-background text-foreground">
      <div className="max-w-[1400px] mx-auto">
        
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

        {/* ── MAIN LAYOUT GRID: SIDEBAR & PRODUCTS PANEL ── */}
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* A. DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-border/40 pr-8">
            <div className="sticky top-32 space-y-9">
              
              {/* Category Filter accordion list */}
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-foreground/50">
                  Categories
                </h3>
                <div className="space-y-2.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected = activeCategory === cat;
                    return (
                      <div key={cat} className="space-y-2">
                        <button
                          onClick={() => {
                            setActiveCategory(cat);
                            setActiveSubCategory(null);
                          }}
                          className={`w-full text-left text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-between py-0.5 ${
                            isSelected ? "text-accent" : "text-muted hover:text-foreground"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                            {cat}
                          </span>
                          <span className="text-[9px] opacity-60">({getProductCountByCategory(cat)})</span>
                        </button>

                        {/* Nested Subcategories */}
                        {isSelected && cat !== "All" && SUB_CATEGORIES[cat] && (
                          <div className="pl-3.5 pt-1.5 pb-1 border-l border-border/60 space-y-2 ml-1 animate-in slide-in-from-left-1 duration-200">
                            <button
                              onClick={() => setActiveSubCategory(null)}
                              className={`w-full text-left text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${
                                !activeSubCategory ? "text-accent" : "text-muted hover:text-foreground"
                              }`}
                            >
                              <span>All {cat}</span>
                            </button>
                            {SUB_CATEGORIES[cat].map((sub) => (
                              <button
                                key={sub}
                                onClick={() => setActiveSubCategory(sub)}
                                className={`w-full text-left text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${
                                  activeSubCategory === sub ? "text-accent" : "text-muted/70 hover:text-foreground"
                                }`}
                              >
                                <span>{sub}</span>
                                <span className="text-[8px] opacity-50">({getProductCountBySubCategory(sub)})</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sorting Options Dropdown */}
              <div className="space-y-3.5">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-foreground/50">
                  Sort Products
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-card border border-border rounded-[4px] text-xs font-bold tracking-wide uppercase text-foreground focus:outline-none focus:border-accent"
                >
                  <option value="featured">Featured / Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-az">Alphabetical: A to Z</option>
                </select>
              </div>

              {/* Badge Pills filters */}
              <div className="space-y-3.5">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-foreground/50">
                  Product Badges
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {["All", "Best Seller", "New", "Custom"].map((badge) => (
                    <button
                      key={badge}
                      onClick={() => setSelectedBadge(badge)}
                      className={`px-3 py-1.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider transition-all border ${
                        selectedBadge === badge 
                          ? "bg-accent/10 border-accent text-accent" 
                          : "bg-card border-border hover:bg-foreground/[0.02] text-muted"
                      }`}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Max slider Filter */}
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-foreground/50 flex justify-between items-center">
                  <span>Max Price Range</span>
                  <span className="text-accent tracking-normal font-bold">Rs. {priceRange[1].toLocaleString()}</span>
                </h3>
                <div className="space-y-2">
                  <input 
                    type="range" 
                    min="5000" 
                    max="100000" 
                    step="5000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-accent h-1.5 bg-border rounded-[4px] appearance-none cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[9px] font-bold tracking-wider text-muted uppercase">
                    <span>Rs. 5,000</span>
                    <span>Rs. 100,000</span>
                  </div>
                </div>
              </div>

            </div>
          </aside>

          {/* B. PRODUCT ITEMS GRID DISPLAY PANEL */}
          <div className="flex-1">
            
            {/* Mobile Filter & Sort Headers Row */}
            <div className="lg:hidden flex items-center justify-between mb-8 border-b border-border/20 pb-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-[4px] text-xs font-bold uppercase tracking-wider hover:border-accent transition-all text-foreground"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
                Filters
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">{filteredProducts.length} Signs found</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-card border border-border rounded-[4px] px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-foreground focus:outline-none"
                >
                  <option value="featured">Sort: Default</option>
                  <option value="price-low">Price: Low-High</option>
                  <option value="price-high">Price: High-Low</option>
                  <option value="name-az">Name: A-Z</option>
                </select>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <>
                <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.slice(0, visibleCount).map((product) => (
                    <div key={product.id} className="shop-card group flex flex-col justify-between h-full bg-card/15 rounded-[4px] border border-transparent hover:border-border/30 hover:bg-card/40 transition-all p-3.5">
                      
                      {/* Image Stage wrapper */}
                      <div className="relative aspect-[4/5] rounded-[4px] overflow-hidden bg-card border border-border/80 mb-3.5 z-10">
                        <Image 
                          src={product.image} 
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        
                        {/* Real-time Hover Drawer Actions overlays */}
                        <div className="absolute inset-0 z-20 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-1.5 p-1.5">
                          <Link 
                            href={`/shop/${product.id}`}
                            className="px-3 py-2.5 bg-white hover:bg-neutral-100 text-black rounded-[4px] flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all truncate"
                            title="View Product Details"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                            <span>Details</span>
                          </Link>
                          <button 
                            onClick={() => addToCart(product, 1)}
                            className="p-2.5 bg-accent text-white rounded-[4px] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-accent/20 flex-shrink-0"
                            title="Quick Add to Cart"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Technical details block */}
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-muted uppercase tracking-widest block">{product.subCategory}</span>
                        
                        <Link href={`/shop/${product.id}`} className="block">
                          <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate hover:text-accent transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Pricing Tag and Direct Add CTAs */}
                        <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-border/40">
                          <span className="text-sm sm:text-base font-black tracking-tighter text-foreground">
                            Rs. {product.price.toLocaleString()}
                          </span>
                          
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="px-3 py-2 bg-accent/10 hover:bg-accent hover:text-white border border-accent/20 rounded-[4px] text-[9px] sm:text-xs font-black uppercase tracking-wider transition-all text-accent"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      </div>
                  ))}
                </div>

                {/* Pagination Show More Button */}
                {filteredProducts.length > visibleCount && (
                  <div className="flex flex-col items-center justify-center mt-12 gap-4">
                    <span className="text-[10px] text-muted font-bold uppercase tracking-wider">
                      Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} items
                    </span>
                    <button
                      onClick={() => setVisibleCount(prev => prev + 20)}
                      className="group flex items-center justify-center gap-3 px-10 py-4 bg-card border border-border hover:border-accent/40 text-foreground hover:text-accent rounded-[4px] text-[10px] font-bold tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md hover:shadow-accent/5 cursor-pointer"
                    >
                      <span>Show More</span>
                      <Plus className="w-4 h-4 text-accent transform group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                  </div>
                )}
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

      {/* ── MOBILE OVERLAY FILTER SIDEBAR DRAWER ── */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-background p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            
            <div className="flex items-center justify-between mb-8 border-b border-border/40 pb-4">
              <h2 className="text-xl font-black tracking-tighter uppercase flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-accent" /> Catalog Filters
              </h2>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="p-2 border border-border rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 space-y-8 overflow-y-auto pr-1 no-scrollbar">
              
              {/* Category selector */}
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-foreground/45">Categories</h3>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setActiveSubCategory(null);
                      }}
                      className={`px-3 py-2 rounded-[4px] text-[10px] font-bold uppercase tracking-wider transition-all border ${
                        activeCategory === cat 
                          ? "bg-accent border-accent text-white" 
                          : "bg-card border-border text-muted"
                      }`}
                    >
                      {cat} ({getProductCountByCategory(cat)})
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub Categories filters */}
              {activeCategory !== "All" && SUB_CATEGORIES[activeCategory] && (
                <div className="space-y-3">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-foreground/45">Sub Categories</h3>
                  <div className="space-y-2 text-xs font-bold uppercase tracking-wider">
                    <button 
                      onClick={() => setActiveSubCategory(null)}
                      className={`block w-full text-left py-1 ${!activeSubCategory ? "text-accent" : "text-muted"}`}
                    >
                      All {activeCategory}
                    </button>
                    {SUB_CATEGORIES[activeCategory].map((sub) => (
                      <button 
                        key={sub}
                        onClick={() => setActiveSubCategory(sub)}
                        className={`block w-full text-left py-1 ${activeSubCategory === sub ? "text-accent" : "text-muted"}`}
                      >
                        {sub} ({getProductCountBySubCategory(sub)})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Badge selector */}
              <div className="space-y-3">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-foreground/45">Product Tag Badges</h3>
                <div className="flex flex-wrap gap-1.5">
                  {["All", "Best Seller", "New", "Custom"].map((badge) => (
                    <button
                      key={badge}
                      onClick={() => setSelectedBadge(badge)}
                      className={`px-3 py-1.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider transition-all border ${
                        selectedBadge === badge 
                          ? "bg-accent/10 border-accent text-accent" 
                          : "bg-card border-border text-muted"
                      }`}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Max slider */}
              <div className="space-y-3">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-foreground/45 flex justify-between items-center">
                  <span>Price Limit</span>
                  <span className="text-accent font-bold font-sans">Rs. {priceRange[1].toLocaleString()}</span>
                </h3>
                <input 
                  type="range" 
                  min="5000" 
                  max="100000" 
                  step="5000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-accent"
                />
              </div>
            </div>

            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="mt-6 w-full py-4 bg-accent text-white rounded-[4px] font-bold uppercase tracking-widest text-xs shadow-lg shadow-accent/20"
            >
              Show {filteredProducts.length} Results
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
