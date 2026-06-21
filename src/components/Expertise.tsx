"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const expertise = [
  {
    title: "Acrylic Backlit Signage",
    description: "Transform your business front or reception desk with our premium backlit signage. Handcrafted from heavy cast acrylic and fitted with high-intensity uniform LED panels to offer a glowing architectural silhouette that commands attention.",
    image: "/images/light-boards-nivati.webp"
  },
  {
    title: "Neon Sign",
    description: "Bring vibrant color and modern aesthetic energy to any room or commercial bar with our hand-bent glowing neon signs. Mounted on contoured clear acrylic backings, these low-voltage LED tubes run perfectly cold and completely silent.",
    image: "/images/neon-momo.webp"
  },
  {
    title: "3D Signage",
    description: "Add physical depth and structural branding authority with our heavy-duty fabricated 3D lettering signs. Combining stainless steel and block acrylic elements, these signs cast beautiful drop-shadows on corporate reception backdrops.",
    image: "/images/3d-letters-salt.webp"
  },
  {
    title: "2D Board",
    description: "Clean, highly visible, and built to withstand the elements, our flat e-commerce 2D boards are ideal for retail pricing menus, company directional indexes, and regulatory safety displays. Features crisp beveled edges.",
    image: "/hero-images/hero1.webp"
  },
  {
    title: "House/Office Nameplate",
    description: "Welcome guests or designate your workspace in premium style with our elegant custom nameplates. Blending natural wood inserts, glass frames, and polished brass plates for a timeless, executive presentation.",
    image: "/images/name-plates.webp"
  },
  {
    title: "Wooden Signage",
    description: "Bring natural warmth and artisanal character to your brand with our CNC-carved solid timber signs. Sanded to a smooth furniture finish and treated with weatherproofing oils, these pieces showcase gorgeous, unique wood grains.",
    image: "/images/laser-cnc.webp"
  },
  {
    title: "2.5D Signage",
    description: "A stunning cross between fine sculpture and modern signage, our 2.5D layered signs utilize overlapping panels and relief textures to create a spectacular physical depth layout that changes with ambient light angles.",
    image: "/images/dimensional-ktm.webp"
  },
  {
    title: "Acrylic Table Lamp",
    description: "Light up your workspace or bedside table with our mesmerizing 3D-optical illusion acrylic lamps. Features a solid wood base with glowing warm LEDs that shine through a custom laser-etched pattern overlay.",
    image: "/hero-images/hero2.webp"
  },
  {
    title: "3D Number Plate",
    description: "Stand out on the road or define your home address with our high-contrast 3D number plates. Fabricated with raised bold numbers on carbon fiber templates to ensure durability, high visibility, and luxury styles.",
    image: "/hero-images/hero3.webp"
  },
  {
    title: "Double Sided Round Light Board",
    description: "Ensure maximum foot-traffic views from both street directions with our heavy-duty projecting round light boxes. Built with waterproof metal frames and double-sided glowing acrylic faces to shine brightly through night storms.",
    image: "/images/light-boards-nivati.webp"
  }
];

export default function Expertise() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (typeof window === "undefined") return;

    // Reveal Grid Cards staggered on scroll
    gsap.fromTo(
      ".expertise-card",
      {
        y: 60,
        opacity: 0,
        scale: 0.95
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: {
          amount: 0.5,
          grid: "auto",
          ease: "power1.out"
        },
        scrollTrigger: {
          trigger: ".expertise-grid-container",
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {expertise.map((item, index) => (
            <div
              key={index}
              className="expertise-card relative flex flex-col h-[240px] sm:h-[300px] md:h-[350px] rounded-[6px] border border-border bg-card/30 backdrop-blur-md overflow-hidden"
            >
              {/* Card Image Area */}
              <div className="relative w-full h-[55%] overflow-hidden bg-muted">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover pointer-events-none"
                  draggable={false}
                  priority={index < 5}
                />
                {/* Gradient vignette for transition to dark card bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Card Text Area */}
              <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow justify-start">
                <h4 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-foreground mb-1 line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2 sm:line-clamp-3 md:line-clamp-4">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
