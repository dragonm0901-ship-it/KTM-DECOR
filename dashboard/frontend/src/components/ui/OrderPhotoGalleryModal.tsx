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
      {/* Compact Light-Themed Modal Container */}
      <div className="relative w-full max-w-3xl h-auto max-h-[82vh] flex flex-col bg-white text-gray-800 border border-gray-200/90 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Light Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-accent/10 text-accent shrink-0">
              {activeTab === "product" ? <Package size={17} /> : <MapPin size={17} />}
            </div>
            <div className="truncate">
              <h3 className="text-xs sm:text-sm font-bold truncate text-gray-900 leading-tight">
                {order.productName}
              </h3>
              <p className="text-[10px] text-gray-500 truncate mt-0.5">
                Client: <strong className="text-gray-700">{order.customerName}</strong> • {activeTab === "product" ? "Product Design Photos" : "Installation / Site Photos"}
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
                  className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-lg transition-all"
                  title={isZoomed ? "Actual Size / Fit to Screen" : "Zoom View"}
                >
                  <Maximize2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-lg transition-all"
                  title="Download Image"
                >
                  <Download size={15} />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all ml-1"
              title="Close (Esc)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Category Tabs Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50/80 border-b border-gray-100 shrink-0 text-xs">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleTabSwitch("product")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 text-xs ${
                activeTab === "product"
                  ? "bg-accent text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Package size={13} />
              <span>Product Photos</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                activeTab === "product" ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {productImages.length}/6
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch("location")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 text-xs ${
                activeTab === "location"
                  ? "bg-accent text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <MapPin size={13} />
              <span>Site Photos</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                activeTab === "location" ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
              }`}>
                {locationImages.length}/4
              </span>
            </button>
          </div>

          {currentList.length > 0 && (
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">
              Photo {currentIndex + 1} of {currentList.length}
            </div>
          )}
        </div>

        {/* Main Image Stage (Clean Light Background) */}
        <div className="relative flex-1 bg-slate-50 flex items-center justify-center p-3 sm:p-4 overflow-auto min-h-[220px]">
          {currentList.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2 text-gray-400">
              <div className="h-11 w-11 rounded-xl bg-gray-200/60 flex items-center justify-center mx-auto text-gray-400">
                {activeTab === "product" ? <Package size={20} /> : <MapPin size={20} />}
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                No {activeTab === "product" ? "product design" : "site location"} photos attached
              </p>
              <p className="text-[10px] text-gray-400">
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
                  className="absolute left-1 sm:left-3 z-20 p-2 sm:p-2.5 rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-accent shadow-md border border-gray-200/80 transition-all hover:scale-105 active:scale-95"
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
                  className={`rounded-xl object-contain transition-all duration-200 ${
                    isZoomed
                      ? "max-h-none max-w-none cursor-zoom-out"
                      : "max-h-[46vh] sm:max-h-[50vh] w-auto max-w-full cursor-zoom-in shadow-md border border-gray-200/70 bg-white"
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
              </div>

              {/* Next Button */}
              {currentList.length > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-1 sm:right-3 z-20 p-2 sm:p-2.5 rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-accent shadow-md border border-gray-200/80 transition-all hover:scale-105 active:scale-95"
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
          <div className="px-4 py-2.5 bg-white border-t border-gray-100 shrink-0 overflow-x-auto">
            <div className="flex items-center justify-center gap-2 min-w-max mx-auto">
              {currentList.map((imgUrl, idx) => (
                <button
                  key={`thumb-${idx}`}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`relative h-11 w-13 sm:h-12 sm:w-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    currentIndex === idx
                      ? "border-accent scale-105 shadow-sm ring-2 ring-accent/20"
                      : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300"
                  }`}
                >
                  <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 right-0 bg-gray-900/80 text-[7px] font-black px-1 text-white rounded-tl">
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
