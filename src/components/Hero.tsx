"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Check } from "@/components/ui/solar-icons";
import Image from "next/image";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

// Features for the mobile layout
const features = [
  "Custom neon signs & LED boards",
  "3D acrylic & metal lettering",
  "Professional installation",
  "Free design mockup included",
];

// Cards for the Desktop layout
const rawCards = [
  // Center Card (Main Focus)
  { src: "/products/product_5_main.png", alt: "Custom LED neon sign fabricated in Kathmandu Nepal", left: "50%", top: "50%", width: "28vw", height: "35vw" },
  
  // Left Cluster
  { src: "/products/product_1_main.png", alt: "3D acrylic backlit signage lettering Nepal", left: "26%", top: "45%", width: "15vw", height: "20vw" },
  { src: "/products/product_8_main.png", alt: "Bespoke cafe neon light board Kathmandu", left: "20%", top: "15%", width: "14vw", height: "18vw" },
  { src: "/products/product_6_main.png", alt: "Commercial 2D double-sided outdoor light board Nepal", left: "15%", top: "75%", width: "15vw", height: "20vw" },
  
  // Right Cluster
  { src: "/products/product_4_main.png", alt: "Architectural illuminated logo and storefront sign Nepal", left: "74%", top: "55%", width: "15vw", height: "18vw" },
  { src: "/products/product_9_main.png", alt: "Handcrafted resin and acrylic modern wall clock decor", left: "80%", top: "20%", width: "16vw", height: "20vw" },
  { src: "/products/product_10_main.png", alt: "Custom executive wooden nameplate for office entrance", left: "85%", top: "75%", width: "18vw", height: "15vw" },
  
  // Top/Bottom Center Edges
  { src: "/hero-images/hero2.webp", alt: "KTM DECOR artisan crafting custom neon signs in Balkot workshop", left: "55%", top: "12%", width: "16vw", height: "13vw" },
];

const cards = rawCards.map((c, i) => {
  const wNum = parseInt(c.width);
  const hNum = parseInt(c.height);
  return {
    id: i,
    src: c.src,
    alt: c.alt,
    widthVal: c.width,
    style: {
      left: c.left,
      top: c.top,
      width: `clamp(${wNum * 7}px, ${c.width}, ${wNum * 15}px)`,
      height: `clamp(${hNum * 7}px, ${c.height}, ${hNum * 15}px)`,
      transform: "translate(-50%, -50%)",
      zIndex: i === 0 ? 10 : 1 // ensure center is on top
    }
  };
});

export default function Hero() {
  // Desktop Refs
  const desktopContainerRef = useRef<HTMLElement>(null);
  const desktopSceneRef = useRef<HTMLDivElement>(null);
  const desktopTextRef = useRef<HTMLDivElement>(null);
  const desktopTextInnerRef = useRef<HTMLDivElement>(null);
  const desktopOverlayRef = useRef<HTMLDivElement>(null);

  // Mobile Refs (from committed version)
  const mobileSectionRef = useRef<HTMLElement>(null);
  const mobileBadgeRef = useRef<HTMLDivElement>(null);
  const mobileTitleRef = useRef<HTMLHeadingElement>(null);
  const mobileSubtextRef = useRef<HTMLParagraphElement>(null);
  const mobileCtaRef = useRef<HTMLDivElement>(null);
  const mobileFeaturesRef = useRef<HTMLUListElement>(null);
  const mobileCollageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mm: gsap.MatchMedia | null = null;

    const startAnimations = () => {
      mm = gsap.matchMedia();

      // ── DESKTOP ANIMATION TRIGGER (min-width: 1024px) ──
      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: desktopContainerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          }
        });

        // 3D Scene animation spans full timeline duration (1.0)
        tl.fromTo(desktopSceneRef.current, 
          { rotateX: 60, scale: 2, y: "50vh", z: -200 }, 
          { rotateX: 0, scale: 1, y: "15vh", z: 0, ease: "none", duration: 1.0 },
          0
        );

        // Fading ease effect: pop out of blur as animation starts
        tl.fromTo(desktopSceneRef.current,
          { filter: "blur(12px)" },
          { filter: "blur(0px)", ease: "power2.out", duration: 0.3 },
          0
        );

        // Hero text fades out and moves up in the first 25% of the scroll trigger (0.25 / 1.0)
        // We animate the outer container (desktopTextRef) to avoid conflict with the entrance animation
        tl.to(desktopTextRef.current, {
          opacity: 0,
          y: -150,
          scale: 0.9,
          ease: "power2.out",
          duration: 0.25,
        }, 0);

        // Overlay fades out in the first 25% of scroll trigger
        tl.to(desktopOverlayRef.current, {
          opacity: 0,
          ease: "power1.inOut",
          duration: 0.25,
        }, 0);

        // Desktop Entrance Animations
        gsap.fromTo(".hero-card-3d", 
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1.5, stagger: 0.05, ease: "power3.out", delay: 0.2 }
        );

        // Entrance animation targets the inner container (desktopTextInnerRef) to prevent any conflict
        gsap.fromTo(desktopTextInnerRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 }
        );
      });

      // ── MOBILE: LCP is static for instant paint. Fast animation on secondary decorative elements. ──
      mm.add("(max-width: 1023px)", () => {
        gsap.fromTo(".hero-mobile-secondary",
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }
        );
      });
    };

    if (typeof window !== "undefined" && (window as any).__PRELOADER_ACTIVE__) {
      const handlePreloaderComplete = () => {
        startAnimations();
        window.removeEventListener("preloaderComplete", handlePreloaderComplete);
      };
      window.addEventListener("preloaderComplete", handlePreloaderComplete);
      return () => {
        window.removeEventListener("preloaderComplete", handlePreloaderComplete);
        if (mm) (mm as any).revert();
      };
    } else {
      startAnimations();
      return () => {
        if (mm) (mm as any).revert();
      };
    }
  }, []);

  return (
    <>
      {/* ── DESKTOP VIEW (min-width: 1024px) ── */}
      <section 
        ref={desktopContainerRef} 
        id="hero"
        className="hidden lg:block relative h-[350vh] lg:h-[400vh] bg-background"
      >
        {/* Sticky Viewport - locks to screen while scrolling */}
        <div className="sticky top-0 h-screen lg:h-[125vh] w-full overflow-hidden flex items-center justify-center bg-background [perspective:800px]">
          
          {/* Ambient Grid Backdrop */}
          <div className="absolute inset-0 bg-cnc-grid opacity-[0.3] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none z-0" />

          {/* Ambient Volumetric Glows */}
          <div className="absolute top-1/4 right-1/4 w-[60vw] h-[60vw] bg-[radial-gradient(circle_at_center,rgba(179,54,255,0.08)_0%,transparent_60%)] rounded-full pointer-events-none z-0" />

          {/* 3D Scene Wrapper - The massive grid that rotates */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center [transform-style:preserve-3d] pointer-events-none z-10">
            <div 
              ref={desktopSceneRef} 
              className="relative w-[180vw] h-[150vh] max-w-[2500px] max-h-[1500px] [transform-style:preserve-3d] pointer-events-none"
              style={{ transformOrigin: "center center", filter: "blur(12px)" }}
            >
              {cards.map((card) => (
                <div 
                  key={card.id} 
                  className="hero-card-3d absolute [transform-style:preserve-3d] pointer-events-auto cursor-default"
                  style={{
                    left: card.style.left,
                    top: card.style.top,
                    width: card.style.width,
                    height: card.style.height,
                    transform: card.style.transform,
                    zIndex: card.style.zIndex
                  }}
                >
                  {/* Actual Image Card */}
                  <div className="relative w-full h-full rounded-[4px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-card/50 backdrop-blur-sm border border-white/5">
                    <Image 
                      src={card.src} 
                      alt={card.alt || "Custom neon sign and 3D signage in Nepal"} 
                      fill 
                      className="object-cover" 
                      sizes={`(max-width: 1024px) 30vw, ${card.widthVal}`}
                      priority={card.id === 0}
                      fetchPriority={card.id === 0 ? "high" : "low"}
                      quality={card.id === 0 ? 60 : 50}
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dimmer Overlay (Fades out on scroll) */}
          <div ref={desktopOverlayRef} className="absolute inset-0 bg-neutral-200/50 dark:bg-background/70 pointer-events-none z-20" />

          {/* Hero Text Content - Overlaid directly center */}
          <div 
            ref={desktopTextRef}
            className="relative z-30 flex flex-col items-center justify-center text-center px-6 w-full max-w-4xl mx-auto pointer-events-auto"
          >
            <div
              ref={desktopTextInnerRef}
              className="w-full flex flex-col items-center justify-center"
            >
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-[4px] bg-accent border border-accent/10 mb-8 md:mb-10 shadow-2xl">
                <span className="text-[11px] md:text-xs font-bold tracking-widest uppercase text-white">
                  Trusted by 2000+ businesses in Nepal
                </span>
              </div>

              {/* Main Headline with semantic crawlability */}
              <h1 className="text-[clamp(3.5rem,10vw,8.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em] mb-6 md:mb-8 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)]">
                <span className="sr-only">KTM DECOR - Nepal&apos;s Leading Custom LED Neon Signs & 3D Signboards in Kathmandu</span>
                <span className="block">Your space,</span>
                <span className="block mt-2">
                  custom <span className="text-accent relative inline-block drop-shadow-[0_2px_12px_rgba(254,145,76,0.5)]">
                    illuminated.
                    <div className="absolute -bottom-2 left-0 w-full h-[6px] bg-accent/60 blur-[6px] rounded-full" />
                  </span>
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-lg md:text-xl max-w-2xl leading-relaxed mb-10 text-white/80 font-medium">
                Nepal&apos;s premier custom LED neon signs, 3D backlit signboards, and architectural decor crafted in Kathmandu with valley-wide installation.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link
                  href="/shop"
                  className="group relative overflow-hidden flex items-center gap-3 px-10 py-5 bg-accent text-white rounded-[4px] text-[12px] font-bold tracking-widest uppercase hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-[0_0_40px_rgba(254,145,76,0.4)]"
                >
                  <span className="animate-laser-sheen absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                  <span>Explore Collection</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="/start-project"
                  className="px-10 py-5 bg-white text-black hover:bg-neutral-200 text-[12px] font-bold tracking-widest uppercase rounded-[4px] transition-all duration-300 shadow-xl"
                >
                  Create a Design
                </a>
              </div>
            </div>
          </div>

        </div>
        {/* Bottom vertical fade to guarantee seamless transition to below section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
      </section>

      {/* ── MOBILE VIEW (max-width: 1023px) ── */}
      <section
        ref={mobileSectionRef}
        id="hero"
        className="lg:hidden relative min-h-screen flex items-center bg-background overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24"
      >
        <div className="relative z-10 w-full px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 gap-6 items-center">

            {/* ── Top Content: Badge + Headline ── */}
            <div className="order-1 flex flex-col items-center text-center">
              {/* Status Badge — static, no animation */}
              <div
                ref={mobileBadgeRef}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-[4px] bg-accent border border-accent/15 mb-4"
              >
                <span className="text-[8px] font-bold tracking-wide text-white">
                  Trusted by 2000+ businesses in Nepal
                </span>
              </div>

              {/* Main Headline */}
              <h1
                ref={mobileTitleRef}
                className="text-[clamp(1.75rem,5.5vw,3rem)] font-extrabold leading-[0.95] tracking-[-0.03em] mb-4 text-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_4px_16px_rgba(0,0,0,0.75)] w-full"
              >
                <span className="sr-only">KTM DECOR | Custom LED Neon Signs & 3D Signboards in Nepal</span>
                <span className="block">Your space,</span>
                <span className="block mt-2">
                  custom <span className="text-accent drop-shadow-[0_2px_10px_rgba(254,145,76,0.45)]">illuminated.</span>
                </span>
              </h1>
            </div>

            {/* ── Image Collage (Mobile Restored) ── */}
            <div 
              ref={mobileCollageRef} 
              className="order-2 relative min-h-[320px] md:min-h-[500px]"
            >
              {/* Main large card (LCP Element - paints instantly on first frame) */}
              <div className="absolute top-0 right-[-5%] w-[63%] aspect-[3/4] rounded-[4px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-neutral-200/50 z-10 opacity-100">
                <Image
                  src="/products/product_5_main.png"
                  alt="Custom LED neon sign installation in Kathmandu cafe"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 63vw, 400px"
                  priority
                  fetchPriority="high"
                  quality={60}
                />
              </div>

              {/* Secondary floating card - left */}
              <div className="hero-mobile-secondary absolute bottom-4 left-[8%] w-[50%] aspect-[4/3] rounded-[4px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-neutral-200/50 z-20">
                <Image
                  src="/hero-images/hero2.webp"
                  alt="Crafting 3D acrylic LED light board in Nepal"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 300px"
                  loading="lazy"
                  quality={50}
                />
              </div>

              {/* Small accent card - top left */}
              <div className="hero-mobile-secondary absolute top-[15%] left-[-2%] w-[35%] aspect-square rounded-[4px] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-neutral-200/50 z-30">
                <Image
                  src="/products/product_1_main.png"
                  alt="Illuminated custom architectural decor Nepal"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 35vw, 200px"
                  loading="lazy"
                  quality={50}
                />
              </div>

              {/* Floating data badge */}
              <div className="hero-mobile-secondary absolute top-[8%] left-[20%] z-40 bg-card rounded-[2px] shadow-[0_6px_15px_rgba(0,0,0,0.15)] border border-border px-3 py-2 text-foreground">
                <p className="text-[7px] font-bold text-muted uppercase tracking-wider mb-0">Projects Delivered</p>
                <p className="text-sm font-black tracking-tight text-foreground">500+</p>
              </div>

              {/* Floating rating badge */}
              <div className="hero-mobile-secondary absolute bottom-[20%] left-[62%] z-40 bg-card rounded-[2px] shadow-[0_6px_15px_rgba(0,0,0,0.15)] border border-border px-3 py-2 text-foreground">
                <p className="text-[7px] font-bold text-muted uppercase tracking-wider mb-0">Client Rating</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-black tracking-tight text-foreground">4.9</span>
                  <span className="text-accent text-[8px]">★★★★★</span>
                </div>
              </div>
            </div>

            {/* ── Mobile-only: CTAs + Features (below images) ── */}
            <div className="order-3 flex flex-col items-center text-center">
              {/* Subtext */}
              <p className="text-base md:text-lg leading-relaxed mb-8 text-muted max-w-xl">
                Premium neon signs and illuminated decor crafted with precision
                to bring your brand&apos;s story to life.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 w-full">
                <Link
                  href="/shop"
                  className="group relative overflow-hidden flex items-center justify-center gap-3 px-9 py-4 bg-accent text-white rounded-[4px] text-[11px] font-bold tracking-widest uppercase hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-lg shadow-accent/25 w-full sm:w-auto"
                >
                  <span className="animate-laser-sheen absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="/start-project"
                  className="flex items-center justify-center px-9 py-4 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100 text-[11px] font-bold tracking-widest uppercase rounded-[4px] transition-all duration-300 w-full sm:w-auto"
                >
                  Create a Design
                </a>
              </div>

              <ul ref={mobileFeaturesRef} className="space-y-3 w-fit mx-auto text-left">
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

        {/* CNC Blueprint Grid Backdrop (Mobile spotlights/glows) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
          <div className="absolute inset-0 bg-cnc-grid animate-pulse-dots opacity-[0.65] dark:opacity-[0.45]" />
        </div>


        {/* Bottom vertical fade to guarantee seamless transition to below section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
      </section>
    </>
  );
}
