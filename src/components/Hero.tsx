"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight, Check } from "@/components/ui/solar-icons";
import Image from "next/image";

const features = [
  "Custom neon signs & LED boards",
  "3D acrylic & metal lettering",
  "Professional installation",
  "Free design mockup included",
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLUListElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);

  const sectionRectRef = useRef<DOMRect | null>(null);
  const collageRectRef = useRef<DOMRect | null>(null);
  const quickToRef = useRef<{
    x1: Function; y1: Function;
    x2: Function; y2: Function;
    x3: Function; y3: Function;
    xb1: Function; yb1: Function;
    xb2: Function; yb2: Function;
  } | null>(null);

  const updateRects = () => {
    if (sectionRef.current) {
      sectionRectRef.current = sectionRef.current.getBoundingClientRect();
    }
    if (collageRef.current) {
      collageRectRef.current = collageRef.current.getBoundingClientRect();
    }
  };

  useEffect(() => {
    let ctx: gsap.Context;

    if (window.innerWidth >= 1024) {
      quickToRef.current = {
        x1: gsap.quickTo(".parallax-layer-1", "x", { duration: 0.8, ease: "power2.out" }),
        y1: gsap.quickTo(".parallax-layer-1", "y", { duration: 0.8, ease: "power2.out" }),
        x2: gsap.quickTo(".parallax-layer-2", "x", { duration: 0.8, ease: "power2.out" }),
        y2: gsap.quickTo(".parallax-layer-2", "y", { duration: 0.8, ease: "power2.out" }),
        x3: gsap.quickTo(".parallax-layer-3", "x", { duration: 0.8, ease: "power2.out" }),
        y3: gsap.quickTo(".parallax-layer-3", "y", { duration: 0.8, ease: "power2.out" }),
        xb1: gsap.quickTo(".parallax-layer-badge-1", "x", { duration: 0.8, ease: "power2.out" }),
        yb1: gsap.quickTo(".parallax-layer-badge-1", "y", { duration: 0.8, ease: "power2.out" }),
        xb2: gsap.quickTo(".parallax-layer-badge-2", "x", { duration: 0.8, ease: "power2.out" }),
        yb2: gsap.quickTo(".parallax-layer-badge-2", "y", { duration: 0.8, ease: "power2.out" }),
      };
    }

    if (window.innerWidth >= 1024) {
      window.addEventListener("resize", updateRects);
      window.addEventListener("scroll", updateRects);
    }

    const triggerEntrance = () => {
      ctx = gsap.context(() => {
        let mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
          const tl = gsap.timeline();

          // 1. Neon Ignition Sequence
          const ignite = gsap.timeline();
          ignite.to(".neon-glow-accent", { opacity: 0.15, duration: 0.05 })
                .to(".neon-glow-accent", { opacity: 0.05, duration: 0.04 })
                .to(".neon-glow-accent", { opacity: 0.55, duration: 0.08 })
                .to(".neon-glow-accent", { opacity: 0.1, duration: 0.06 })
                .to(".neon-glow-accent", { opacity: 1, duration: 0.15 })
                .to(".neon-glow-accent", { opacity: 0.3, duration: 0.1 })
                .to(".neon-glow-accent", { opacity: 1, duration: 0.8, ease: "power2.out" });

          // Badge
          tl.fromTo(badgeRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
          // Title lines
          tl.fromTo(".hero-line", { y: "100%", opacity: 0 }, { y: "0%", opacity: 1, duration: 1, stagger: 0.1, ease: "expo.out" }, "-=0.3");
          // Subtext
          tl.fromTo([subtextRef.current, ".hero-subtext-mobile"], { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.6");
          // CTAs
          tl.fromTo(ctaRef.current, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.5");
          // Features
          tl.fromTo(".hero-feature", { x: -15, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }, "-=0.4");
          // Cards
          tl.fromTo(".hero-card", { y: 60, opacity: 0, scale: 0.92 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, stagger: 0.12, ease: "power3.out" }, "-=0.8");
        });

      }, sectionRef);
    };

    // MutationObserver to perfectly sync reveal animations with the preloader split exit
    const startEntranceObserver = () => {
      const isPreloading = document.documentElement.classList.contains("is-loading");
      if (!isPreloading) {
        triggerEntrance();
        observer.disconnect();
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          startEntranceObserver();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Fire immediately in case preloader is already exited (e.g. page hot-reloads)
    startEntranceObserver();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateRects);
      window.removeEventListener("scroll", updateRects);
      if (ctx) ctx.revert();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (window.innerWidth < 1024) return;
    const { clientX, clientY } = e;

    if (!sectionRectRef.current || !collageRectRef.current) {
      updateRects();
    }

    // 1. Active Grid Hover Tracking (tracks relative to Section container)
    const sectionRect = sectionRectRef.current;
    if (sectionRect && sectionRef.current) {
      const relativeX = clientX - sectionRect.left;
      const relativeY = clientY - sectionRect.top;
      
      sectionRef.current.style.setProperty("--grid-mouse-x", `${relativeX}px`);
      sectionRef.current.style.setProperty("--grid-mouse-y", `${relativeY}px`);
      sectionRef.current.style.setProperty("--grid-hover-opacity", "1");
    }

    // 2. Parallax Collage Card Shifts (Desktop Only)
    const collageRect = collageRectRef.current;
    if (collageRect) {
      const { width, height, left, top } = collageRect;
      
      // Calculate cursor coordinate relative to the center of the collage container
      const x = (clientX - (left + width / 2)) / (width / 2); // -1 to 1
      const y = (clientY - (top + height / 2)) / (height / 2); // -1 to 1
      
      if (quickToRef.current) {
        quickToRef.current.x1(x * 6);
        quickToRef.current.y1(y * 6);
        quickToRef.current.x2(-x * 10);
        quickToRef.current.y2(-y * 10);
        quickToRef.current.x3(x * 12);
        quickToRef.current.y3(y * 12);
        quickToRef.current.xb1(-x * 15);
        quickToRef.current.yb1(-y * 15);
        quickToRef.current.xb2(x * 18);
        quickToRef.current.yb2(y * 18);
      }
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth < 1024) return;

    // Reset Grid Hover Highlight opacity
    if (sectionRef.current) {
      sectionRef.current.style.setProperty("--grid-hover-opacity", "0");
    }

    if (quickToRef.current) {
      quickToRef.current.x1(0);
      quickToRef.current.y1(0);
      quickToRef.current.x2(0);
      quickToRef.current.y2(0);
      quickToRef.current.x3(0);
      quickToRef.current.y3(0);
      quickToRef.current.xb1(0);
      quickToRef.current.yb1(0);
      quickToRef.current.xb2(0);
      quickToRef.current.yb2(0);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex items-center bg-background overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 lg:pt-40 lg:pb-28"
    >
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 items-center">

          {/* ── Top Content: Badge + Headline + Subtext ── */}
          <div className="order-1 lg:order-1 lg:col-span-7 lg:row-span-2">
            {/* Status Badge */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-[4px] bg-accent/[0.06] border border-accent/15 mb-8 md:mb-10 opacity-0"
            >
              <span className="text-[11px] font-bold tracking-wide text-foreground/70">
                Trusted by 200+ businesses in Nepal
              </span>
            </div>

            {/* Main Headline */}
            <h1
              ref={titleRef}
              className="text-[clamp(3rem,8vw,7rem)] font-extrabold leading-[0.92] tracking-[-0.04em] mb-8 md:mb-10 text-foreground"
            >
              <span className="block overflow-hidden">
                <span className="hero-line block">Your space,</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hero-line block">
                  custom{" "}
                  <span className="text-accent">illuminated.</span>
                </span>
              </span>
            </h1>

            {/* Subtext (Desktop Only) */}
            <p
              ref={subtextRef}
              className="hidden lg:block text-lg md:text-xl max-w-lg leading-relaxed mb-10 md:mb-12 text-muted opacity-0"
            >
              Premium neon signs and illuminated decor crafted with precision
              to bring your brand&apos;s story to life.
            </p>

            {/* CTAs + Features — visible on desktop only (hidden on mobile, shown below images) */}
            <div className="hidden lg:block">
              <div
                ref={ctaRef}
                className="flex flex-col sm:flex-row items-start gap-4 mb-12 opacity-0"
              >
                <a
                  href="/shop"
                  className="group relative overflow-hidden flex items-center gap-3 px-9 py-4 bg-accent text-white rounded-[4px] text-[11px] font-bold tracking-widest uppercase hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-lg shadow-accent/25"
                >
                  {/* Glowing Laser-Precision Shimmer Overlay */}
                  <span className="animate-laser-sheen absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                  
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href="/start-project"
                  className="px-9 py-4 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100 text-[11px] font-bold tracking-widest uppercase rounded-[4px] transition-all duration-300"
                >
                  Create a Design
                </a>
              </div>

              <ul ref={featuresRef} className="space-y-3">
                {features.map((feat, i) => (
                  <li
                    key={i}
                    className="hero-feature flex items-center gap-3 text-sm md:text-base text-muted opacity-0"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-accent" />
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Image Collage ── */}
          <div ref={collageRef} className="order-2 lg:order-2 lg:col-span-5 relative min-h-[320px] md:min-h-[640px] lg:min-h-[720px]">

            {/* Main large card */}
            <div className="hero-card parallax-layer-1 absolute top-0 right-[-5%] md:right-[-20%] w-[63%] lg:w-[90%] md:w-[88%] aspect-[3/4] rounded-[4px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-neutral-200/50 z-10 opacity-0">
              <Image
                src="/hero-images/hero3.webp"
                alt="Custom neon sign installation"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 60vw, 35vw"
                priority
              />
            </div>

            {/* Secondary floating card - left */}
            <div className="hero-card parallax-layer-2 absolute bottom-4 left-[8%] md:left-0 w-[50%] lg:w-[72%] md:w-[68%] aspect-[4/3] rounded-[4px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-neutral-200/50 z-20 opacity-0">
              <Image
                src="/hero-images/hero2.webp"
                alt="LED signage craftsmanship"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 28vw"
                priority
              />
            </div>

            {/* Small accent card - top left */}
            <div className="hero-card parallax-layer-3 absolute top-[15%] left-[-2%] md:left-[-10%] w-[35%] lg:w-[50%] md:w-[46%] aspect-square rounded-[4px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-neutral-200/50 z-30 opacity-0">
              <Image
                src="/hero-images/hero1.webp"
                alt="Illuminated decor detail"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 35vw, 20vw"
              />
            </div>

            {/* Floating data badge */}
            <div className="hero-card parallax-layer-badge-1 absolute top-[8%] left-[20%] md:left-[22%] z-40 bg-card rounded-[2px] md:rounded-[4px] shadow-[0_6px_15px_rgba(0,0,0,0.15)] md:shadow-[0_12px_35px_rgba(0,0,0,0.15)] border border-border px-3 py-2 md:px-5 md:py-3.5 opacity-0 text-foreground scale-95 md:scale-100">
              <p className="text-[7px] md:text-[10px] font-bold text-muted uppercase tracking-wider mb-0 md:mb-0.5">Projects Delivered</p>
              <p className="text-sm md:text-2xl font-black tracking-tight text-foreground">500+</p>
            </div>

            {/* Floating rating badge */}
            <div className="hero-card parallax-layer-badge-2 absolute bottom-[20%] left-[62%] md:left-[58%] z-40 bg-card rounded-[2px] md:rounded-[4px] shadow-[0_6px_15px_rgba(0,0,0,0.15)] md:shadow-[0_12px_35px_rgba(0,0,0,0.15)] border border-border px-3 py-2 md:px-5 md:py-3.5 opacity-0 text-foreground scale-95 md:scale-100">
              <p className="text-[7px] md:text-[10px] font-bold text-muted uppercase tracking-wider mb-0 md:mb-0.5">Client Rating</p>
              <div className="flex items-center gap-1 md:gap-1.5">
                <span className="text-sm md:text-2xl font-black tracking-tight text-foreground">4.9</span>
                <span className="text-accent text-[8px] md:text-sm">★★★★★</span>
              </div>
            </div>

          </div>

          {/* ── Mobile-only: CTAs + Features (below images) ── */}
          <div className="order-3 lg:hidden">
            {/* Subtext (Mobile Only - Positioned below images) */}
            <p className="hero-subtext-mobile text-base md:text-lg leading-relaxed mb-8 text-muted opacity-0">
              Premium neon signs and illuminated decor crafted with precision
              to bring your brand&apos;s story to life.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
              <a
                href="/shop"
                className="group relative overflow-hidden flex items-center gap-3 px-9 py-4 bg-accent text-white rounded-[4px] text-[11px] font-bold tracking-widest uppercase hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-lg shadow-accent/25"
              >
                {/* Glowing Laser-Precision Shimmer Overlay */}
                <span className="animate-laser-sheen absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="/start-project"
                className="px-9 py-4 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100 text-[11px] font-bold tracking-widest uppercase rounded-[4px] transition-all duration-300"
              >
                Create a Design
              </a>
            </div>

            <ul className="space-y-3">
              {features.map((feat, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm md:text-base text-muted"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-accent" />
                  </span>
                  {feat}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* CNC Blueprint Grid Backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
        {/* Base Grid Layer (always visible, breathing) */}
        <div className="absolute inset-0 bg-cnc-grid animate-pulse-dots opacity-[0.65] dark:opacity-[0.45]" />
        
        {/* Hover Highlight Grid Layer (reactive to cursor, upscaled dots) */}
        <div className="absolute inset-0 bg-cnc-grid-hover grid-hover-layer" />
      </div>

      {/* Volumetric Neon Spotlight Backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Layer 1: Flagship KTM Orange Core (pulsing, cathode ignition) */}
        <div className="neon-glow-accent absolute top-1/4 right-[-10%] w-[600px] h-[600px] bg-accent/[0.08] rounded-full blur-[130px] opacity-0" />
        
        {/* Layer 2: Deep Amber/Warm Scatter (widest range, steady ambient ambient) */}
        <div className="neon-glow-accent absolute top-[15%] right-[-15%] w-[800px] h-[800px] bg-accent-light/[0.035] rounded-full blur-[160px] opacity-0" />
        
        {/* Layer 3: Chromatic Amethyst split (rich high-end dark studio tint) */}
        <div className="neon-glow-accent absolute top-[30%] right-[-5%] w-[700px] h-[700px] bg-[#B336FF]/[0.03] rounded-full blur-[140px] opacity-0" />
        
        {/* Layer 4: Bottom Left Fill Orb */}
        <div className="neon-glow-accent absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/[0.04] rounded-full blur-[110px] opacity-0" />
      </div>
    </section>
  );
}
