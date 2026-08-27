import React from "react";
import { Package, MapPin, Eye } from "./solar-icons";

interface OrderPhotoStackProps {
  images: string[];
  type: "product" | "location";
  label?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

export const OrderPhotoStack: React.FC<OrderPhotoStackProps> = ({
  images,
  type,
  label,
  size = "md",
  onClick,
  className = "",
}) => {
  const validImages = images.filter(Boolean);
  const count = validImages.length;
  const displayLabel = label || (type === "product" ? "Sign" : "Site");

  // Size variations
  const sizeClasses = {
    sm: "h-9 w-9 text-[8px]",
    md: "h-11 w-11 text-[9px]",
    lg: "h-16 w-16 text-xs",
  };

  const badgeSizeClasses = {
    sm: "text-[7px] px-1 py-0.2",
    md: "text-[8px] px-1.5 py-0.5",
    lg: "text-[10px] px-2 py-0.5",
  };

  if (count === 0) {
    return (
      <div
        className={`relative ${sizeClasses[size]} rounded-xl border border-dashed border-border/70 bg-card/40 flex flex-col items-center justify-center text-muted/50 select-none ${className}`}
        title={`No ${type === "product" ? "product" : "site"} photos`}
      >
        {type === "product" ? <Package size={size === "sm" ? 12 : 16} /> : <MapPin size={size === "sm" ? 12 : 16} />}
        <span className="text-[7px] font-bold uppercase mt-0.5 tracking-tighter opacity-70">
          {displayLabel}
        </span>
      </div>
    );
  }

  const primaryImage = validImages[0];

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer select-none inline-block ${className}`}
      title={`Click to view all ${count} ${type === "product" ? "product" : "site"} photos`}
    >
      {/* Stack Layers (Back Cards) if 2 or more images */}
      {count > 1 && (
        <>
          <div className="absolute inset-0 bg-border/80 dark:bg-border/60 rounded-xl transform translate-x-1.5 -translate-y-1 rotate-3 border border-border/60 shadow-sm pointer-events-none transition-transform group-hover:translate-x-2 group-hover:-translate-y-1.5 group-hover:rotate-6" />
          {count > 2 && (
            <div className="absolute inset-0 bg-accent/20 rounded-xl transform -translate-x-1 -translate-y-0.5 -rotate-2 border border-accent/30 shadow-xs pointer-events-none transition-transform group-hover:-translate-x-1.5 group-hover:-translate-y-1 group-hover:-rotate-4" />
          )}
        </>
      )}

      {/* Main Front Thumbnail */}
      <div
        className={`relative ${sizeClasses[size]} rounded-xl border border-border/90 bg-card overflow-hidden shadow-sm transition-all duration-200 group-hover:border-accent group-hover:shadow-md group-hover:scale-105 z-10`}
      >
        <img
          src={primaryImage}
          alt={`${displayLabel} thumbnail`}
          className="h-full w-full object-cover"
        />

        {/* Hover overlay with Eye icon */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[0.5px] opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
          <Eye size={size === "sm" ? 12 : 16} />
        </div>

        {/* Bottom Label Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-[7px] text-white text-center py-0.5 leading-none font-bold uppercase tracking-wider">
          {displayLabel}
        </div>
      </div>

      {/* Multi-Photo Indicator Badge */}
      {count > 1 && (
        <span
          className={`absolute -top-1.5 -right-1.5 z-20 bg-accent text-white font-black rounded-full shadow-md border border-background flex items-center gap-0.5 ${badgeSizeClasses[size]} animate-pulse-subtle`}
        >
          +{count - 1}
        </span>
      )}
    </div>
  );
};
