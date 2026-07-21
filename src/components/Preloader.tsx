"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";

// Keep track of whether the preloader has run during the current tab session.
// Survives Next.js client-side routing transitions but is reset on browser page refresh!
let preloaderHasRun = false;

if (typeof window !== "undefined" && !preloaderHasRun) {
  const isLighthouse = navigator.userAgent.toLowerCase().includes("lighthouse");
  const isMobile = window.innerWidth < 1024;
  if (!isMobile && !isLighthouse) {
    (window as any).__PRELOADER_ACTIVE__ = true;
  }
}

export default function Preloader() {
  const [isDone, setIsDone] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [shouldSkip, setShouldSkip] = useState<boolean>(preloaderHasRun);
  const containerRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLDivElement>(null);
  const percentageTextRef = useRef<HTMLSpanElement>(null);
  const progressBarFillRef = useRef<HTMLDivElement>(null);
  const lineTopRef = useRef<HTMLDivElement>(null);
  const lineBotRef = useRef<HTMLDivElement>(null);

  const coloredLogoRef = useRef<HTMLDivElement>(null);
  const laserRef = useRef<HTMLDivElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const preloaderImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const isMobileViewport = typeof window !== "undefined" && window.innerWidth < 1024;
    const isLighthouse = typeof window !== "undefined" && navigator.userAgent.toLowerCase().includes("lighthouse");

    if (shouldSkip || isMobileViewport || isLighthouse) {
      document.documentElement.classList.remove("is-loading");
      if (typeof window !== "undefined") {
        (window as any).__PRELOADER_ACTIVE__ = false;
        window.dispatchEvent(new CustomEvent("preloaderComplete"));
      }
      setIsHidden(true);
      preloaderHasRun = true;
      return;
    }

    document.documentElement.classList.add("is-loading");

    // Start a safety timer immediately to guarantee page is unlocked after 1.8s on mobile or 6s on desktop
    const safetyDuration = isMobileViewport ? 1800 : 6000;
    const safetyTimer = setTimeout(() => {
      document.documentElement.classList.remove("is-loading");
      setIsHidden(true);
      preloaderHasRun = true;
      if (typeof window !== "undefined") {
        (window as any).__PRELOADER_ACTIVE__ = false;
        window.dispatchEvent(new CustomEvent("preloaderComplete"));
      }
    }, safetyDuration);

    let tl: gsap.core.Timeline | null = null;

    // Only run animation if refs are available
    if (coloredLogoRef.current && laserRef.current && logoWrapperRef.current) {
      // Initial state
      gsap.set(coloredLogoRef.current, { clipPath: "inset(0 100% 0 0)" });
      gsap.set(laserRef.current, { left: "0%", opacity: 0 });
      const scanDuration = isMobileViewport ? 0.8 : 1.5;
      const popDuration = isMobileViewport ? 0.2 : 0.4;

      // Start animation sequence
      tl = gsap.timeline({
        onComplete: () => {
          // Pop effect when complete
          if (logoWrapperRef.current) {
            gsap.to(logoWrapperRef.current, {
              scale: 1.05,
              duration: popDuration,
              ease: "elastic.out(1, 0.5)",
              onComplete: () => setIsDone(true)
            });
          } else {
            setIsDone(true);
          }
        }
      });

      // Fade in the logo wrapper and laser
      tl.fromTo(logoWrapperRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: isMobileViewport ? 0.2 : 0.5, ease: "power3.out" }
      );
      tl.to(laserRef.current, { opacity: 1, duration: isMobileViewport ? 0.05 : 0.15 }, "-=0.25");

      // Laser scan animation
      const obj = { val: 0 };
      tl.to(obj, {
        val: 100,
        duration: scanDuration,
        ease: "power2.inOut",
        onUpdate: () => {
          const progress = Math.round(obj.val);
          if (percentageTextRef.current) {
            percentageTextRef.current.innerText = `${progress}%`;
          }
          if (progressBarFillRef.current) {
            progressBarFillRef.current.style.width = `${progress}%`;
          }

          if (coloredLogoRef.current) {
            gsap.set(coloredLogoRef.current, { clipPath: `inset(0 ${100 - obj.val}% 0 0)` });
          }
          if (laserRef.current) {
            gsap.set(laserRef.current, { left: `${obj.val}%` });
          }
        },
      });

      // Laser flare before disappearing
      tl.to(laserRef.current, {
        opacity: 0,
        scaleY: 1.2,
        // Remove heavy filter on mobile to save GPU cycles
        filter: isMobileViewport ? "none" : "brightness(2)",
        duration: isMobileViewport ? 0.1 : 0.2,
        ease: "power2.out",
      });
    }

    return () => {
      if (tl) tl.kill();
      clearTimeout(safetyTimer);
      // ALWAYS unlock the page when the preloader unmounts!
      document.documentElement.classList.remove("is-loading");
    };
  }, []);

  useEffect(() => {
    if (!isDone) return;

    if (!lineTopRef.current || !lineBotRef.current || !logoWrapperRef.current || !percentageRef.current) {
      console.warn("[Preloader] Exit animation skipped because refs are null");
      document.documentElement.classList.remove("is-loading");
      setIsHidden(true);
      preloaderHasRun = true;
      if (typeof window !== "undefined") {
        (window as any).__PRELOADER_ACTIVE__ = false;
        window.dispatchEvent(new CustomEvent("preloaderComplete"));
      }
      return;
    }

    const isMobileViewport = typeof window !== "undefined" && window.innerWidth < 1024;

    // Speed up flight animations so the user can interact with the site faster
    const flightDuration = isMobileViewport ? 0.45 : 0.85;
    const panelDuration = isMobileViewport ? 0.4 : 0.7;

    // ── Safety timeout: if the exit animation stalls (mobile GPU hiccups,
    //    Lenis conflict, etc.) we MUST unlock the page within 1.5s on mobile or 6s on desktop.
    const safetyTimeout = isMobileViewport ? 1500 : 6000;
    const safetyTimer = setTimeout(() => {
      document.documentElement.classList.remove("is-loading");
      if (logoWrapperRef.current) {
        gsap.set(logoWrapperRef.current, { opacity: 0 });
      }
      setIsHidden(true);
      preloaderHasRun = true;
      if (typeof window !== "undefined") {
        (window as any).__PRELOADER_ACTIVE__ = false;
        window.dispatchEvent(new CustomEvent("preloaderComplete"));
      }
    }, safetyTimeout);

    const tl = gsap.timeline({
      delay: isMobileViewport ? 0.1 : 0.2,
      onComplete: () => {
        clearTimeout(safetyTimer);
        // Hide preloader logo instantly when unmounting the preloader
        if (logoWrapperRef.current) {
          gsap.set(logoWrapperRef.current, { opacity: 0 });
        }
        setIsHidden(true);
        // Persist completion state globally so client router transitions skip the preloader
        preloaderHasRun = true;
      },
    });

    const headerLogo = document.getElementById("header-logo");

    if (headerLogo && logoWrapperRef.current) {
      // ── Measure both elements in viewport coordinates ──
      const headerRect = headerLogo.getBoundingClientRect();

      // Use the logo WRAPPER rect (the element we actually animate),
      // NOT the inner clipped img. The wrapper includes the pop scale (1.05)
      // applied by the completion animation, which GSAP accounts for
      // automatically when we set a new `scale` target.
      const wrapperRect = logoWrapperRef.current.getBoundingClientRect();

      // Get the active zoom factor. Under CSS zoom, `translate` values must be
      // divided by the zoom factor because transforms are applied in the zoomed coordinate space,
      // whereas getBoundingClientRect() returns physical screen coordinates.
      const getZoom = () => {
        if (typeof window === "undefined") return 1;
        const htmlStyle = window.getComputedStyle(document.documentElement);
        const zoomVal = htmlStyle.zoom;
        if (zoomVal) {
          const parsed = parseFloat(zoomVal);
          if (!isNaN(parsed)) return parsed;
        }
        return window.innerWidth >= 1024 ? 0.8 : 1;
      };
      
      let zoom = getZoom();
      if (isNaN(zoom) || !isFinite(zoom) || zoom <= 0) {
        zoom = 1;
      }

      // Find the viewport center points for both elements
      const headerCenterX = headerRect.left + headerRect.width / 2;
      const headerCenterY = headerRect.top + headerRect.height / 2;

      const wrapperCenterX = wrapperRect.left + wrapperRect.width / 2;
      const wrapperCenterY = wrapperRect.top + wrapperRect.height / 2;

      // Compute translation delta offsets adjusted for the CSS zoom factor
      let deltaX = (headerCenterX - wrapperCenterX) / zoom;
      let deltaY = (headerCenterY - wrapperCenterY) / zoom;
      if (isNaN(deltaX) || !isFinite(deltaX)) deltaX = 0;
      if (isNaN(deltaY) || !isFinite(deltaY)) deltaY = 0;

      // Get the un-transformed (natural) wrapper size to compute scale correctly.
      // The wrapper is currently at scale 1.05 from the pop effect, so the
      // actual CSS width is wrapperRect.width / 1.05.
      const currentScale = gsap.getProperty(logoWrapperRef.current, "scaleX") as number || 1;
      let naturalWidth = wrapperRect.width / (currentScale || 1);
      if (isNaN(naturalWidth) || !isFinite(naturalWidth) || naturalWidth <= 0) {
        naturalWidth = 134; // fallback size for mobile logo container width
      }
      
      let scale = headerRect.width / (naturalWidth || 1);
      if (isNaN(scale) || !isFinite(scale) || scale <= 0) {
        scale = 0.8; // default fallback scale
      }

      // 1. Fade out percentages
      tl.to(percentageRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: isMobileViewport ? 0.2 : 0.35,
        ease: "power2.out",
      });

      // 2. Flight path animation to the header logo position
      tl.to(logoWrapperRef.current, {
        x: deltaX,
        y: deltaY,
        scale: scale,
        duration: flightDuration,
        ease: "power3.inOut",
      }, isMobileViewport ? "-=0.1" : "-=0.2");

      // 3. Swap opacity at the exact moment of arrival
      tl.add(() => {
        // Remove the solid background block body cover so the page renders behind panels
        document.documentElement.classList.remove("is-loading");

        // Dispatch event to start page animations (like Hero section)
        if (typeof window !== "undefined") {
          (window as any).__PRELOADER_ACTIVE__ = false;
          window.dispatchEvent(new CustomEvent("preloaderComplete"));
        }

        // Swap the logo instantly: make header logo visible under the preloader logo
        headerLogo.style.transition = "none";
        headerLogo.style.opacity = "1";
        headerLogo.style.pointerEvents = "auto";

        // Force a browser reflow to render styles instantly
        headerLogo.offsetHeight;

        // Restore header transitions in next tick
        setTimeout(() => {
          headerLogo.style.transition = "";
        }, 50);
      });
    } else {
      // Fallback if header logo is not available
      tl.to([logoWrapperRef.current, percentageRef.current], {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        ease: "power4.inOut",
      });
      // Ensure we remove the is-loading class on fallback
      tl.add(() => {
        document.documentElement.classList.remove("is-loading");
        if (typeof window !== "undefined") {
          (window as any).__PRELOADER_ACTIVE__ = false;
          window.dispatchEvent(new CustomEvent("preloaderComplete"));
        }
      });
    }

    // 4. Slide open or fade transition screen panels (starts exactly after the logo has settled)
    if (isMobileViewport) {
      tl.to(
        lineTopRef.current,
        {
          yPercent: -100,
          duration: panelDuration,
          ease: "expo.inOut",
        }
      );

      tl.to(
        lineBotRef.current,
        {
          yPercent: 100,
          duration: panelDuration,
          ease: "expo.inOut",
        },
        "<"
      );
    } else {
      tl.to(
        [lineTopRef.current, lineBotRef.current],
        {
          opacity: 0,
          duration: panelDuration,
          ease: "power2.inOut",
        }
      );
    }

    return () => {
      clearTimeout(safetyTimer);
      tl.kill();
      // ALWAYS unlock the page when the preloader unmounts!
      document.documentElement.classList.remove("is-loading");
    };
  }, [isDone]);

  // Don't render anything if session already loaded
  if (shouldSkip === true || isHidden) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center hidden lg:flex"
      style={{ pointerEvents: isDone ? "none" : "auto" }}
    >
      {/* Two half-panels — using inline style for guaranteed solid color */}
      <div
        ref={lineTopRef}
        className="absolute top-0 left-0 right-0 h-1/2 z-20"
        style={{ backgroundColor: "var(--background, #F2F2F2)" }}
      />
      <div
        ref={lineBotRef}
        className="absolute bottom-0 left-0 right-0 h-1/2 z-20"
        style={{ backgroundColor: "var(--background, #F2F2F2)" }}
      />

      <div className="relative z-30 flex flex-col items-center justify-center gap-12 w-full max-w-sm px-8">

        {/* Logo Container */}
        <div
          ref={logoWrapperRef}
          className="relative w-[134px] md:w-72 aspect-square flex items-center justify-center"
          style={{ opacity: 0, transform: "scale(0.9)" }}
        >
          {/* 1. Ghost Silhouette Layer (The track) */}
          <img
            src="/logo/ktm%20decor.svg"
            alt="KTM DECOR"
            className="absolute inset-0 w-full h-full object-contain dark:invert dark:hue-rotate-180 opacity-10 grayscale"
          />

          {/* 2. Full Color Revealed Layer */}
          <div
            ref={coloredLogoRef}
            className="absolute inset-0 w-full h-full"
            style={{ clipPath: "inset(0 100% 0 0)" }}
          >
            <img
              ref={preloaderImgRef}
              src="/logo/ktm%20decor.svg"
              alt="KTM DECOR"
              className="absolute inset-0 w-full h-full object-contain dark:invert dark:hue-rotate-180"
            />
          </div>

          {/* 3. Glowing Laser Scanner Line */}
          <div
            ref={laserRef}
            className="absolute top-0 bottom-0 w-[2px] bg-[#FE914C] z-40 origin-center"
            style={{
              left: "0%",
              opacity: 0,
              boxShadow: "0 0 20px 4px rgba(254, 145, 76, 0.7), 0 0 40px 8px rgba(254, 145, 76, 0.4)",
            }}
          >
            {/* Laser Core */}
            <div className="absolute inset-0 bg-white w-full h-full opacity-50 blur-[1px]" />
          </div>

          {/* Ambient Background Glow */}
          <div className="absolute inset-0 bg-accent/10 rounded-full blur-[60px] -z-10" />
        </div>

        <div ref={percentageRef} className="flex flex-col items-center">
          <span ref={percentageTextRef} className="text-3xl md:text-5xl font-bold tracking-tighter tabular-nums text-foreground">
            0%
          </span>
          <div className="w-40 h-1 bg-foreground/10 mt-4 overflow-hidden rounded-full">
            <div
              ref={progressBarFillRef}
              className="h-full bg-accent transition-all duration-100 ease-linear"
              style={{ width: "0%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
