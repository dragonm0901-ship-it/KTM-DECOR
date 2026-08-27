"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PRODUCTS } from "@/data/shop-data";

gsap.registerPlugin(ScrollTrigger);

const SHORT_DESCRIPTIONS: Record<string, string> = {
  "1": "Premium CNC-routed timber and business boards in Nepal for shops and cafes.",
  "2": "Backlit logo signs and light boards in Nepal for elegant office branding.",
  "3": "Multi-layered 3D panel business boards in Nepal with sculpted depths.",
  "4": "Double-sided projecting round light boards in Nepal for storefront visibility.",
  "5": "Handcrafted LED neon signs and neon lights in Nepal to illuminate your space.",
  "6": "Durable flat-panel direction boards and business boards in Nepal.",
  "7": "Dimensional 3D acrylic letters and premium light boards in Nepal.",
  "8": "Precision laser-cut wooden and acrylic home decor in Nepal.",
  "9": "Custom designer wall clocks for luxury home decor in Nepal.",
  "10": "Raised acrylic vehicle number plates and outdoor plaques in Kathmandu.",
  "11": "Bespoke executive office nameplates and premium home decor in Nepal.",
  "12": "Laser-etched 3D table lamps for modern ambient home decor in Nepal."
};

export default function Expertise() {
  const containerRef = useRef<HTMLElement>(null);
  const [shouldLoadImages, setShouldLoadImages] = useState(false);
  const dbProducts = PRODUCTS;

  useEffect(() => {
    // Allow hero section and LCP to paint uninhibited before requesting catalog images
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        const handle = (window as any).requestIdleCallback(() => setShouldLoadImages(true), { timeout: 1200 });
        return () => (window as any).cancelIdleCallback(handle);
      } else {
        const timer = setTimeout(() => setShouldLoadImages(true), 600);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useGSAP(() => {
    if (typeof window === "undefined") return;

    if (window.innerWidth >= 1024) {
      // 1. Reveal Grid Cards: Snappy, minimal entrance animation on desktop
      ScrollTrigger.create({
        trigger: ".expertise-grid-container",
        start: "top 95%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            ".expertise-card",
            { y: 15, opacity: 0.8 },
            {
              y: 0,
              opacity: 1,
              duration: 0.3,
              ease: "power2.out",
              stagger: 0.03
            }
          );
        }
      });

      // 2. Real-time scroll speed skew/tilt effect (desktop only)
      const skewSetter = gsap.quickTo(".expertise-card", "skewY", { duration: 0.35, ease: "power3.out" });
      const clamp = gsap.utils.clamp(-5, 5);

      ScrollTrigger.create({
        trigger: ".expertise-grid-container",
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          const skew = clamp(velocity / -600);
          skewSetter(skew);
        },
        onLeave: () => skewSetter(0),
        onLeaveBack: () => skewSetter(0)
      });
    }
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      id="expertise" 
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background text-foreground py-16 md:py-24 border-b border-border/40"
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative w-full px-4 sm:px-6 md:px-8 z-10 max-w-[1500px] mx-auto">
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black tracking-[0.25em] uppercase border border-accent/20 rounded-[4px] mb-3 text-accent bg-accent/5">
            Our Expertise
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight text-foreground">
            Everything we touch <br className="hidden sm:inline" /> turns to <span className="text-accent">light.</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-muted font-medium max-w-lg">
            Discover our wide range of custom illumination and precision signcrafting products.
          </p>
        </div>
      </div>

      {/* Grid Container */}
      <div className="expertise-grid-container relative w-full max-w-[1500px] mx-auto px-4 sm:px-6 md:px-8 z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-3 sm:gap-y-8 sm:gap-x-6 md:gap-x-8">
          {dbProducts.map((item, index) => (
            <Link
              key={item.id}
              href={`/shop/${item.id}`}
              prefetch={false}
              className="expertise-card group block cursor-pointer"
            >
              {/* Inner card container containing the image and hover details */}
              <div className="relative aspect-[4/5] rounded-[4px] border border-border bg-card/60 overflow-hidden transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-accent/5">
                {/* Image BG */}
                <div className="absolute inset-0 transition-transform duration-700 lg:group-hover:scale-105">
                  {shouldLoadImages ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover"
                      draggable={false}
                      loading="lazy"
                      quality={50}
                    />
                  ) : (
                    <div className="w-full h-full bg-foreground/5 animate-pulse" />
                  )}
                </div>

                {/* Dark overlay for typography contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent hidden lg:block lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 z-10" />

                {/* Info — hover-reveal on desktop only (hidden on mobile for cleaner UI) */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-5 hidden lg:block lg:translate-y-6 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-500 z-20">
                  <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-white/75 block mb-0.5 sm:mb-1.5">
                    {item.category}
                  </span>
                  <p className="text-[10px] sm:text-base md:text-lg lg:text-xl font-extrabold tracking-tighter text-white mb-1 sm:mb-2 leading-tight truncate">
                    {item.name}
                  </p>
                  <p className="text-[9px] sm:text-xs text-white/80 font-medium leading-normal line-clamp-2 sm:line-clamp-3 mb-2 sm:mb-3">
                    {SHORT_DESCRIPTIONS[item.id] || item.description}
                  </p>
                  <div className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase text-accent-light flex items-center gap-1 group-hover:translate-x-1 transition-all duration-300">
                    View Details &rarr;
                  </div>
                </div>
              </div>

              {/* Product Info below the card */}
              <div className="mt-3 px-1 space-y-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-accent uppercase tracking-widest hidden sm:block">
                  {item.category}
                </span>
                <h3 className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-foreground group-hover:text-accent transition-colors duration-300 line-clamp-2 leading-snug">
                  {item.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

