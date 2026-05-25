"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import MarqueeSlider from "@/components/ui/marquee-slider";

gsap.registerPlugin(ScrollTrigger);

const expertise = [
  {
    title: "Acrylic Backlit Signage",
    description: "Transform your business front or reception desk with our premium backlit signage. Handcrafted from heavy cast acrylic and fitted with high-intensity uniform LED panels to offer a glowing architectural silhouette that commands attention.",
    image: "/hero-images/hero1.webp"
  },
  {
    title: "Neon Sign",
    description: "Bring vibrant color and modern aesthetic energy to any room or commercial bar with our hand-bent glowing neon signs. Mounted on contoured clear acrylic backings, these low-voltage LED tubes run perfectly cold and completely silent.",
    image: "/hero-images/hero2.webp"
  },
  {
    title: "3D Signage",
    description: "Add physical depth and structural branding authority with our heavy-duty fabricated 3D lettering signs. Combining stainless steel and block acrylic elements, these signs cast beautiful drop-shadows on corporate reception backdrops.",
    image: "/hero-images/hero3.webp"
  },
  {
    title: "2D Board",
    description: "Clean, highly visible, and built to withstand the elements, our flat e-commerce 2D boards are ideal for retail pricing menus, company directional indexes, and regulatory safety displays. Features crisp beveled edges.",
    image: "/hero-images/hero1.webp"
  },
  {
    title: "House/Office Nameplate",
    description: "Welcome guests or designate your workspace in premium style with our elegant custom nameplates. Blending natural wood inserts, glass frames, and polished brass plates for a timeless, executive presentation.",
    image: "/hero-images/hero2.webp"
  },
  {
    title: "Wooden Signage",
    description: "Bring natural warmth and artisanal character to your brand with our CNC-carved solid timber signs. Sanded to a smooth furniture finish and treated with weatherproofing oils, these pieces showcase gorgeous, unique wood grains.",
    image: "/hero-images/hero3.webp"
  },
  {
    title: "2.5D Signage",
    description: "A stunning cross between fine sculpture and modern signage, our 2.5D layered signs utilize overlapping panels and relief textures to create a spectacular physical depth layout that changes with ambient light angles.",
    image: "/hero-images/hero1.webp"
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
    image: "/hero-images/hero1.webp"
  }
];

export default function Expertise() {
  const containerRef = useRef<HTMLElement>(null);
  const [activeExpertiseIndex, setActiveExpertiseIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Expertise Slider Reveal
      gsap.fromTo(".expertise-slider-wrapper", 
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".expertise-slider-wrapper",
            start: "top 80%",
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Slowly transition the background collage index automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveExpertiseIndex((prev) => (prev + 1) % expertise.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={containerRef} id="expertise" className="relative min-h-screen lg:min-h-[125vh] flex flex-col justify-center overflow-hidden bg-background text-foreground py-12 md:py-24">
      {/* Cinematic Background Collage - Hidden on Mobile, Active on Desktop */}
      <div className="hidden md:block absolute inset-0 z-0 pointer-events-none select-none">
        {expertise.map((item, idx) => (
          <div 
            key={idx} 
            className={`absolute inset-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
              idx === activeExpertiseIndex 
                ? 'opacity-[0.35] dark:opacity-[0.22] scale-[1.03] blur-none' 
                : 'opacity-0 scale-[1.0] blur-sm'
            }`}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="100vw"
              className="object-cover object-center grayscale contrast-[1.1]"
            />
          </div>
        ))}
        {/* Soft uniform overlay to ensure optimal contrast */}
        <div className="absolute inset-0 bg-background/5 dark:bg-background/10 transition-colors duration-500" />
        {/* Top/bottom vertical fade to guarantee seamless color transition between sections */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background transition-colors duration-500" />
      </div>

      <div className="relative w-full px-4 sm:px-6 md:px-12 z-10 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-10 md:mb-20">
          <span className="inline-block text-[10px] font-bold tracking-[0.3em] uppercase text-accent mb-4">Our Expertise</span>
          <h3 className="text-3xl md:text-5xl font-extrabold tracking-tighter">Everything we touch <br /> turns to <span className="text-accent">light.</span></h3>
        </div>
      </div>

      <div className="expertise-slider-wrapper opacity-0 w-full mt-6 md:mt-10 z-10">
        <div className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden">
          <MarqueeSlider cards={expertise} />
        </div>
      </div>
    </section>
  );
}
