"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { MoveHorizontal } from "@/components/ui/solar-icons";

interface CaseData {
  category: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
}

const cases: CaseData[] = [
  {
    category: "Wood Engraving",
    title: "Couple Portrait",
    description: "",
    beforeImage: "/images/couple-portrait-before.jpg",
    afterImage: "/images/couple-portrait-after.jpg",
  },
  {
    category: "Acrylic Light",
    title: "Acrylic Table Lamp",
    description: "",
    beforeImage: "/images/acrylic-lamp-before.jpg",
    afterImage: "/images/acrylic-lamp-after.jpg",
  },
];


function BeforeAfterSlider({ caseData }: { caseData: CaseData }) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const currentPosRef = useRef(50);
  const clipDivRef = useRef<HTMLDivElement>(null);
  const handleDivRef = useRef<HTMLDivElement>(null);
  const containerRectRef = useRef<DOMRect | null>(null);

  // Set initial styles on mount and reset them on case change
  useEffect(() => {
    if (clipDivRef.current && handleDivRef.current) {
      clipDivRef.current.style.clipPath = `inset(0 ${100 - currentPosRef.current}% 0 0)`;
      handleDivRef.current.style.left = `${currentPosRef.current}%`;
    }
  }, [caseData]);

  // Drag calculation helper - Direct DOM mutation using cached rect for buttery smooth 60fps
  const handleMove = useCallback((clientX: number) => {
    if (!containerRectRef.current || !clipDivRef.current || !handleDivRef.current) return;
    const rect = containerRectRef.current;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    currentPosRef.current = percentage;
    clipDivRef.current.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    handleDivRef.current.style.left = `${percentage}%`;
  }, []);

  // Document-level events for seamless dragging when leaving container bounds
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      if (e.cancelable) {
        e.preventDefault(); // Prevents vertical page scroll jitter during horizontal dragging
      }
      handleMove(e.touches[0].clientX);
    };

    const onTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, handleMove]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (containerRef.current) {
      containerRectRef.current = containerRef.current.getBoundingClientRect();
    }
    setIsDragging(true);
    if (containerRectRef.current) {
      const rect = containerRectRef.current;
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      currentPosRef.current = percentage;
      if (clipDivRef.current) clipDivRef.current.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
      if (handleDivRef.current) handleDivRef.current.style.left = `${percentage}%`;
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current) {
      containerRectRef.current = containerRef.current.getBoundingClientRect();
    }
    setIsDragging(true);
    if (e.touches.length > 0 && containerRectRef.current) {
      const rect = containerRectRef.current;
      const x = e.touches[0].clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      currentPosRef.current = percentage;
      if (clipDivRef.current) clipDivRef.current.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
      if (handleDivRef.current) handleDivRef.current.style.left = `${percentage}%`;
    }
  }, []);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 3:4 Aspect Ratio Frame */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="relative w-full aspect-[3/4] select-none rounded-[8px] overflow-hidden border border-border shadow-[0_20px_50px_rgba(0,0,0,0.12)] cursor-ew-resize bg-neutral-900 group touch-none"
      >
        {/* Underneath: After Image (Illuminated sign) */}
        <Image
          src={caseData.afterImage}
          alt={`${caseData.title} Final`}
          fill
          className="object-cover pointer-events-none"
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={60}
        />

        {/* Overlaid: Before Image (Draft Sketch) - Clipped */}
        <div
          ref={clipDivRef}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          <Image
            src={caseData.beforeImage}
            alt={`${caseData.title} Before`}
            fill
            className="object-cover pointer-events-none"
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={60}
          />
        </div>

        {/* Glowing Slider Line and Handle */}
        <div
          ref={handleDivRef}
          className="absolute top-0 bottom-0 w-[3px] bg-accent -translate-x-1/2 pointer-events-none z-20 shadow-[0_0_15px_#FF8C00,0_0_30px_#FF8C00]"
        >
          {/* Grab Button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/80 backdrop-blur-md border-2 border-accent text-accent shadow-[0_0_20px_rgba(255,140,0,0.5)] flex items-center justify-center transition-transform duration-150 scale-100 group-hover:scale-105 active:scale-95 z-30 cursor-grab active:cursor-grabbing">
            <MoveHorizontal className="w-4.5 h-4.5 text-accent animate-pulse" />
          </div>
        </div>

        {/* Labels Badges Overlays */}
        <div className="absolute bottom-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md text-white/70 text-[9px] font-bold tracking-widest uppercase rounded-[4px] border border-white/5 pointer-events-none">
          Concept
        </div>
        <div className="absolute bottom-4 right-4 z-20 px-3 py-1 bg-accent/80 backdrop-blur-md text-white text-[9px] font-bold tracking-widest uppercase rounded-[4px] shadow-lg shadow-accent/20 border border-accent pointer-events-none">
          Final
        </div>
      </div>

      {/* Case Details */}
      <div className="px-1 space-y-2">
        <span className="text-[10px] font-bold text-accent uppercase tracking-widest block">
          {caseData.category}
        </span>
        <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground leading-none">
          {caseData.title}
        </h3>
        {caseData.description && (
          <p className="text-muted-foreground text-sm leading-relaxed font-medium">
            {caseData.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function BeforeAfter() {
  return (
    <section id="before-after" className="relative py-24 md:py-32 bg-background text-foreground overflow-hidden border-t border-border">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(254,145,76,0.1)_0%,transparent_65%)] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(254,145,76,0.04)_0%,transparent_65%)] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/25 rounded-[4px] text-accent text-[9px] font-black tracking-[0.25em] uppercase mb-4">
            Concept to Masterwork
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-6">
            Vision to Light
          </h2>
          <p className="text-muted text-base md:text-lg leading-relaxed">
            Drag the slider to reveal the precision engineering that bridges raw initial concepts and sketches with stunning, high-fidelity physical illuminated signs.
          </p>
        </div>

        {/* 2 Column Grid for Portrait Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-20 w-full">
          {cases.map((c, index) => (
            <BeforeAfterSlider key={index} caseData={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

