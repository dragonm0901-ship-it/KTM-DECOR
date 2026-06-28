"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PRODUCTS } from "@/data/shop-data";

gsap.registerPlugin(ScrollTrigger);

const SHORT_DESCRIPTIONS: Record<string, string> = {
  "1": "CNC-routed timber signage with premium weatherproof outdoor finishes.",
  "2": "Premium backlit logo signs for business facades and receptionist backdrops.",
  "3": "Multi-layered panel signs forming sculpture-like relief depths and textures.",
  "4": "Double-sided projecting sign boxes visible from both street directions.",
  "5": "Hand-bent custom LED neon signs to illuminate corporate walls or spaces.",
  "6": "Durable and weather-proof flat directory, menu, and directional boards.",
  "7": "Multi-dimensional logo letters fabricated from cast acrylic and stainless steel.",
  "8": "Precision laser cutting and CNC engraving on wood, acrylic, and metals.",
  "9": "Custom designer clocks handcrafted with wood, acrylic, and epoxy resin.",
  "10": "Premium bold raised numbers mounted on heavy weatherproof templates.",
  "11": "Bespoke executive office and home entrance signs using wood, brass, and glass.",
  "12": "Laser-etched 3D illusion desktop lamps on warm illuminated wood bases."
};

const getCategoryGradient = (category: string) => {
  switch (category) {
    case "Acrylic Backlit Signage":
      return "from-cyan-500/20 to-blue-500/30";
    case "Neon Sign":
      return "from-pink-500/20 to-fuchsia-500/30";
    case "3D Signage":
      return "from-amber-500/20 to-yellow-600/30";
    case "2D Board":
      return "from-slate-500/20 to-zinc-500/30";
    case "House/Office Nameplate":
      return "from-orange-500/20 to-amber-500/30";
    case "Wooden Signage":
      return "from-yellow-700/20 to-amber-800/30";
    case "2.5D Signage":
      return "from-teal-500/20 to-emerald-500/30";
    case "Acrylic Table Lamp":
      return "from-green-400/20 to-emerald-500/30";
    case "3D Number Plate":
      return "from-slate-700/20 to-zinc-800/30";
    case "Double Sided Round Light Board":
      return "from-yellow-500/20 to-orange-500/30";
    case "Laser & CNC Products":
      return "from-red-500/20 to-rose-600/30";
    case "Customized Wall Clock":
      return "from-indigo-500/20 to-violet-600/30";
    default:
      return "from-accent/20 to-accent/30";
  }
};

export default function Expertise() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (typeof window === "undefined") return;

    // 1. Reveal Grid Cards: Speed & stagger dynamically adapt to scroll velocity (plays once)
    ScrollTrigger.create({
      trigger: ".expertise-grid-container",
      start: "top 88%",
      once: true,
      onEnter: (self) => {
        const velocity = Math.abs(self.getVelocity());
        // Clamp duration: very fast scroll = 0.22s, slow scroll = 0.55s
        const duration = gsap.utils.clamp(0.22, 0.55, 1200 / (velocity || 1200));

        gsap.fromTo(
          ".expertise-card",
          {
            y: 30,
            opacity: 0,
            scale: 0.98
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: duration,
            ease: "power4.out",
            stagger: {
              amount: duration * 0.4,
              grid: "auto",
              ease: "power2.out"
            }
          }
        );
      }
    });

    // 2. Real-time scroll speed skew/tilt effect (continuous)
    const skewSetter = gsap.quickTo(".expertise-card", "skewY", { duration: 0.35, ease: "power3.out" });
    const clamp = gsap.utils.clamp(-5, 5); // Limit to max 5 degrees skew for a premium look

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
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      id="expertise" 
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background text-foreground py-16 md:py-24 border-b border-border/40"
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative w-full px-4 sm:px-6 md:px-12 z-10 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black tracking-[0.25em] uppercase border border-accent/20 rounded-[4px] mb-3 text-accent bg-accent/5">
            Our Expertise
          </span>
          <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight text-foreground">
            Everything we touch <br className="hidden sm:inline" /> turns to <span className="text-accent">light.</span>
          </h3>
          <p className="mt-4 text-sm md:text-base text-muted-foreground font-medium max-w-lg">
            Discover our wide range of custom illumination and precision signcrafting products.
          </p>
        </div>
      </div>

      {/* Grid Container */}
      <div className="expertise-grid-container relative w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {PRODUCTS.map((item, index) => (
            <Link
              key={item.id}
              href={`/shop/${item.id}`}
              className="expertise-card group relative aspect-square sm:aspect-[4/5] rounded-[8px] border border-border bg-background block opacity-0 overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/5"
            >
              {/* Image BG */}
              <div className="absolute inset-0 transition-transform duration-700 lg:group-hover:scale-105">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                  draggable={false}
                  priority={index < 4}
                />
              </div>

              {/* Hover color gradient glow */}
              <div className={`absolute inset-0 bg-gradient-to-t ${getCategoryGradient(item.category)} opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 z-10`} />

              {/* Dark overlay for typography contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 z-10" />

              {/* Info — always visible on mobile (compact), hover-reveal on desktop */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-5 lg:translate-y-6 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-500 z-20">
                <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.25em] uppercase text-white/65 block mb-0.5 sm:mb-1.5">
                  {item.category}
                </span>
                <h4 className="text-[10px] sm:text-base md:text-lg lg:text-xl font-extrabold tracking-tighter text-white mb-1 sm:mb-2 leading-tight truncate">
                  {item.name}
                </h4>
                <p className="text-[9px] sm:text-xs text-white/80 font-medium leading-normal line-clamp-2 sm:line-clamp-3 mb-2 sm:mb-3">
                  {SHORT_DESCRIPTIONS[item.id] || item.description}
                </p>
                <div className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase text-accent flex items-center gap-1 group-hover:translate-x-1 transition-all duration-300">
                  View Details &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
