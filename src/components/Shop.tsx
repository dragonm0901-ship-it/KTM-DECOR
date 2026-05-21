"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PRODUCTS, CATEGORIES } from "@/data/shop-data";

gsap.registerPlugin(ScrollTrigger);

// Helper to get category hover gradients for premium aesthetics
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
    default:
      return "from-accent/20 to-accent/30";
  }
};

export default function Shop() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Select 1 representative product from each of the first 8 categories
  const featuredProjects = CATEGORIES.filter((c) => c !== "All").slice(0, 8).map((cat) => {
    const prod = PRODUCTS.find((p) => p.category === cat);
    return prod || PRODUCTS[0];
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate heading on scroll
      gsap.fromTo(
        headingRef.current,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
          },
        }
      );

      // Animate grid cards on scroll
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll(".portfolio-card");
        gsap.fromTo(
          cards,
          { y: 30, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.06,
            ease: "power3.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="shop" className="py-32 px-6 md:px-12 bg-card rounded-[4px] mb-20 text-foreground">
      <div className="max-w-7xl mx-auto">
        {/* Label */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase border border-border rounded-[4px] mb-10">
          Featured Collection
        </span>

        {/* Heading */}
        <h2
          ref={headingRef}
          className="text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[0.9] tracking-tighter mb-12 opacity-0"
        >
          Shop our
          <br />
          <span className="text-accent">collection.</span>
        </h2>

        {/* Grid — 4-column layout on desktop (showing 8 cards over 2 rows) */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          {featuredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/shop/${project.id}`}
              className="portfolio-card group relative aspect-square sm:aspect-[4/5] rounded-[4px] overflow-hidden cursor-pointer border border-border opacity-0 bg-background block"
            >
              {/* Image BG */}
              <div className="absolute inset-0 transition-transform duration-700 lg:group-hover:scale-105">
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Hover color gradient glow */}
              <div className={`absolute inset-0 bg-gradient-to-t ${getCategoryGradient(project.category)} opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 z-10`} />

              {/* Dark overlay for typography contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500 z-10" />

              {/* Info — always visible on mobile (compact), hover-reveal on desktop */}
              <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-5 lg:translate-y-6 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-500 z-20">
                <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.2em] uppercase text-white/65 block mb-0.5 sm:mb-1.5">
                  {project.category}
                </span>
                <h3 className="text-xs sm:text-lg font-extrabold tracking-tighter text-white mb-1 sm:mb-4 leading-tight truncate">
                  {project.name}
                </h3>
                <div className="flex justify-between items-center mb-1 sm:mb-4">
                  <span className="text-xs sm:text-base font-bold text-white tracking-tighter">Rs. {project.price.toLocaleString()}</span>
                </div>
                <div className="hidden sm:flex w-full py-2.5 bg-accent text-white text-[9px] font-bold uppercase tracking-[0.2em] rounded-[4px] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 items-center justify-center">
                  Buy Now
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Premium View Collection Button leading to /shop */}
        <div className="flex justify-center mt-10 sm:mt-20 px-4 sm:px-0">
          <Link
            href="/shop"
            className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 sm:px-12 sm:py-5 bg-accent hover:bg-accent/90 text-white rounded-[4px] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-lg shadow-accent/20 cursor-pointer"
          >
            <span>View Full Collection</span>
            <svg
              className="w-4 h-4 text-white transform group-hover:translate-x-1.5 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
