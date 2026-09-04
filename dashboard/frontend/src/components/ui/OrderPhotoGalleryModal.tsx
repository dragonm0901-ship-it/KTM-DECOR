import React, { useState, useEffect, useCallback } from "react";
import { Order } from "../../store/useStore";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Package,
  MapPin,
  Maximize2
} from "./solar-icons";

interface OrderPhotoGalleryModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  initialType?: "product" | "location";
  initialIndex?: number;
}

export const OrderPhotoGalleryModal: React.FC<OrderPhotoGalleryModalProps> = ({
  order,
  isOpen,
  onClose,
  initialType = "product",
  initialIndex = 0,
}) => {
  const [activeTab, setActiveTab] = useState<"product" | "location">(initialType);
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Normalize image arrays
  const productImages: string[] = React.useMemo(() => {
    if (!order) return [];
    if (order.productImages && order.productImages.length > 0) {
      return order.productImages.filter(Boolean);
    }
    return order.productImageUrl ? [order.productImageUrl] : [];
  }, [order]);

  const locationImages: string[] = React.useMemo(() => {
    if (!order) return [];
    if (order.locationImages && order.locationImages.length > 0) {
      return order.locationImages.filter(Boolean);
    }
    return order.locationImageUrl ? [order.locationImageUrl] : [];
  }, [order]);

  const currentList = activeTab === "product" ? productImages : locationImages;

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      const type = initialType === "location" && locationImages.length > 0 ? "location" : "product";
      setActiveTab(type);
      const list = type === "product" ? productImages : locationImages;
      const safeIndex = initialIndex < list.length ? initialIndex : 0;
      setCurrentIndex(safeIndex);
      setIsZoomed(false);
    }
  }, [isOpen, initialType, initialIndex, productImages, locationImages]);

  // Adjust index if current tab changes
  const handleTabSwitch = (tab: "product" | "location") => {
    setActiveTab(tab);
    setCurrentIndex(0);
    setIsZoomed(false);
  };

  const handlePrev = useCallback(() => {
    if (currentList.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : currentList.length - 1));
    setIsZoomed(false);
  }, [currentList.length]);

  const handleNext = useCallback(() => {
    if (currentList.length <= 1) return;
    setCurrentIndex((prev) => (prev < currentList.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
  }, [currentList.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || !order) return null;

  const currentImage = currentList[currentIndex] || "";

  const handleDownload = () => {
    if (!currentImage) return;
    const a = document.createElement("a");
    a.href = currentImage;
    a.download = `${order.productName.replace(/\s+/g, "_")}_${activeTab}_photo_${currentIndex + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/45 backdrop-blur-[2px] animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Compact Porcelain-Themed Modal Container */}
      <div className="relative w-full max-w-3xl h-auto max-h-[82vh] flex flex-col bg-card text-foreground border border-border/80 rounded-[28px] shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-card shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-2xl bg-accent/10 text-accent shrink-0">
              {activeTab === "product" ? <Package size={17} /> : <MapPin size={17} />}
            </div>
            <div className="truncate">
              <h3 className="text-xs sm:text-sm font-bold truncate text-foreground leading-tight">
                {order.productName}
              </h3>
              <p className="text-[10px] text-muted truncate mt-0.5">
                Client: <strong className="text-foreground">{order.customerName}</strong> • {activeTab === "product" ? "Product Design Photos" : "Installation / Site Photos"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {currentImage && (
              <>
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="p-1.5 hover:bg-muted/20 text-muted hover:text-foreground rounded-xl transition-all"
                  title={isZoomed ? "Actual Size / Fit to Screen" : "Zoom View"}
                >
                  <Maximize2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1.5 hover:bg-muted/20 text-muted hover:text-foreground rounded-xl transition-all"
                  title="Download Image"
                >
                  <Download size={15} />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-red-500/10 text-muted hover:text-red-500 rounded-xl transition-all ml-1"
              title="Close (Esc)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Category Tabs Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-muted/10 border-b border-border/60 shrink-0 text-xs">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleTabSwitch("product")}
              style={activeTab === "product" ? { background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)" } : undefined}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer ${
                activeTab === "product"
                  ? "text-black shadow-xs"
                  : "bg-card border border-border/80 text-muted hover:text-foreground hover:bg-muted/20"
              }`}
            >
              <Package size={13} />
              <span>Product Photos</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                activeTab === "product" ? "bg-black/20 text-black" : "bg-neutral-200 dark:bg-neutral-800 text-foreground"
              }`}>
                {productImages.length}/6
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch("location")}
              style={activeTab === "location" ? { background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)" } : undefined}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer ${
                activeTab === "location"
                  ? "text-black shadow-xs"
                  : "bg-card border border-border/80 text-muted hover:text-foreground hover:bg-muted/20"
              }`}
            >
              <MapPin size={13} />
              <span>Site Photos</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                activeTab === "location" ? "bg-black/20 text-black" : "bg-neutral-200 dark:bg-neutral-800 text-foreground"
              }`}>
                {locationImages.length}/4
              </span>
            </button>
          </div>

          {currentList.length > 0 && (
            <div className="text-[10px] font-bold text-muted uppercase tracking-wider hidden sm:block">
              Photo {currentIndex + 1} of {currentList.length}
            </div>
          )}
        </div>

        {/* Main Image Stage */}
        <div className="relative flex-1 bg-background/60 flex items-center justify-center p-3 sm:p-4 overflow-auto min-h-[220px]">
          {currentList.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2 text-muted">
              <div className="h-11 w-11 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto text-muted">
                {activeTab === "product" ? <Package size={20} /> : <MapPin size={20} />}
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                No {activeTab === "product" ? "product design" : "site location"} photos attached
              </p>
              <p className="text-[10px] text-muted">
                {activeTab === "product" ? "Up to 6 product photos can be uploaded" : "Up to 4 site photos can be uploaded"} during order entry.
              </p>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Prev Button */}
              {currentList.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-1 sm:left-3 z-20 p-2 sm:p-2.5 rounded-full bg-card/90 hover:bg-card text-foreground hover:text-accent shadow-md border border-border/80 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Previous Photo (Left Arrow)"
                >
                  <ChevronLeft size={18} />
                </button>
              )}

              {/* Displayed Image */}
              <div className="w-full flex items-center justify-center overflow-auto p-1">
                <img
                  src={currentImage}
                  alt={`${order.productName} ${activeTab} ${currentIndex + 1}`}
                  className={`rounded-2xl object-contain transition-all duration-200 ${
                    isZoomed
                      ? "max-h-none max-w-none cursor-zoom-out"
                      : "max-h-[46vh] sm:max-h-[50vh] w-auto max-w-full cursor-zoom-in shadow-md border border-border/80 bg-card"
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
              </div>

              {/* Next Button */}
              {currentList.length > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-1 sm:right-3 z-20 p-2 sm:p-2.5 rounded-full bg-card/90 hover:bg-card text-foreground hover:text-accent shadow-md border border-border/80 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Next Photo (Right Arrow)"
                >
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        {currentList.length > 1 && (
          <div className="px-5 py-3 bg-card border-t border-border/60 shrink-0 overflow-x-auto">
            <div className="flex items-center justify-center gap-2 min-w-max mx-auto">
              {currentList.map((imgUrl, idx) => (
                <button
                  key={`thumb-${idx}`}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`relative h-11 w-13 sm:h-12 sm:w-14 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    currentIndex === idx
                      ? "border-accent scale-105 shadow-sm ring-2 ring-accent/20"
                      : "border-border/80 opacity-60 hover:opacity-100 hover:border-accent/60"
                  }`}
                >
                  <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 right-0 bg-black/80 text-[7px] font-black px-1 text-white rounded-tl">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
