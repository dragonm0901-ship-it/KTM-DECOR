"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
    category: "Brand Mascot Neon",
    title: "Urban Wolf Studio",
    description:
      "Witness the translation of a high-precision polygonal vector art sketch into a dual-intensity neon masterwork. Every node and angle of the original line sketch is CNC-profiled on a premium solid acrylic backing and hand-fitted with glowing LED strips.",
    beforeImage: "/images/laser-cnc.webp",
    afterImage: "/images/neon-taso.webp",
  },
  {
    category: "Storefront Signage",
    title: "CRAFT Coffee Roasters",
    description:
      "From a cozy hand-drawn vintage logo sketch to an elegant, high-profile physical storefront sign. Engineered with water-resistant warm amber and soft white LED neon to withstand exterior outdoor conditions while delivering a cozy, inviting street glow.",
    beforeImage: "/images/workshop.webp",
    afterImage: "/images/light-boards-nivati.webp",
  },
];

export default function BeforeAfter() {
  const [activeCase, setActiveCase] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use refs instead of state to prevent 60fps React re-renders on mobile during drag
  const currentPosRef = useRef(50);
  const clipDivRef = useRef<HTMLDivElement>(null);
  const handleDivRef = useRef<HTMLDivElement>(null);

  const activeData = cases[activeCase];

  // Drag calculation helper - Direct DOM mutation for buttery smooth 60fps
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !clipDivRef.current || !handleDivRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
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
      handleMove(e.touches[0].clientX);
    };

    const onTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("touchmove", onTouchMove, { passive: true });
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
    setIsDragging(true);
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  return (
    <section id="before-after" className="relative py-24 md:py-32 bg-background text-foreground overflow-hidden border-t border-border">
      {/* Background Neon Ambient Glows - Softer on White */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-accent/[0.02] rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
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

        {/* Full Width Layout for Bigger Slider */}
        <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="relative w-full aspect-[4/3] md:aspect-[16/9] select-none rounded-[4px] overflow-hidden border border-border shadow-[0_20px_50px_rgba(0,0,0,0.12)] cursor-ew-resize bg-neutral-900 group touch-none"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCase}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Underneath: After Image (Illuminated sign) */}
                  <Image
                    src={activeData.afterImage}
                    alt="Final Illuminated Neon Sign"
                    fill
                    className="object-cover pointer-events-none"
                    sizes="(max-width: 1024px) 100vw, 1200px"
                  />

                  {/* Overlaid: Before Image (Draft Sketch) - Clipped */}
                  <div
                    ref={clipDivRef}
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - currentPosRef.current}% 0 0)` }}
                  >
                    <Image
                      src={activeData.beforeImage}
                      alt="Initial Design Draft Sketch"
                      fill
                      className="object-cover pointer-events-none"
                      sizes="(max-width: 1024px) 100vw, 1200px"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Glowing Slider Line and Handle */}
              <div
                ref={handleDivRef}
                className="absolute top-0 bottom-0 w-[3px] bg-accent -translate-x-1/2 pointer-events-none z-20 shadow-[0_0_15px_#FF8C00,0_0_30px_#FF8C00]"
                style={{ left: `${currentPosRef.current}%` }}
              >
                {/* Grab Button */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/80 backdrop-blur-md border-2 border-accent text-accent shadow-[0_0_20px_rgba(255,140,0,0.5)] flex items-center justify-center transition-transform duration-150 scale-100 group-hover:scale-105 active:scale-95 z-30 cursor-grab active:cursor-grabbing">
                  <MoveHorizontal className="w-5 h-5 text-accent animate-pulse" />
                </div>
              </div>

              {/* Labels Badges Overlays */}
              <div className="absolute bottom-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md text-white/70 text-[9px] font-bold tracking-widest uppercase rounded-[4px] border border-white/5 pointer-events-none">
                Initial Concept Sketch
              </div>
              <div className="absolute bottom-4 right-4 z-20 px-3 py-1 bg-accent/80 backdrop-blur-md text-white text-[9px] font-bold tracking-widest uppercase rounded-[4px] shadow-lg shadow-accent/20 border border-accent pointer-events-none">
                Final Neon Sign
              </div>
            </div>

            {/* Case Selector Navigation Buttons - Soft Light styling */}
            <div className="flex justify-center gap-3">
              {cases.map((c, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveCase(i);
                    currentPosRef.current = 50;
                    if (clipDivRef.current && handleDivRef.current) {
                      clipDivRef.current.style.clipPath = `inset(0 50% 0 0)`;
                      handleDivRef.current.style.left = `50%`;
                    }
                  }}
                  className={`px-5 py-2.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
                    i === activeCase
                      ? "bg-accent text-white border-accent shadow-lg shadow-accent/25 hover:scale-[1.03]"
                      : "bg-card hover:bg-foreground/5 text-muted hover:text-foreground border-border"
                  }`}
                >
                  {c.category}
                </button>
              ))}
            </div>
          </div>
        </div>
    </section>
  );
}
