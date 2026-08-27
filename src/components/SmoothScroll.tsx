"use client";

import { useEffect } from "react";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

    // Skip Lenis on mobile — native scroll is smooth enough and Lenis
    // causes forced reflows + continuous rAF overhead that kills PageSpeed
    let lenis: any = null;
    let rafId: number | null = null;

    if (!isMobile) {
      // Dynamically import Lenis only on desktop to avoid loading its JS on mobile
      import("lenis").then(({ default: Lenis }) => {
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
        });

        function raf(time: number) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
      });
    }

    return () => {
      if (lenis) lenis.destroy();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return <>{children}</>;
}
