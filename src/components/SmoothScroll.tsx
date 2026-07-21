"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

    // Mobile-only text reveal animations
    let ctx = gsap.context(() => {
      if (isMobile) {
        // Target only main section headings and their direct description paragraphs (excluding card details and shop lists)
        const revealElements = Array.from(document.querySelectorAll(
          "main section:not(#hero) h2, main section:not(#hero) h2 + p"
        )).filter((el) => {
          return !el.closest(".no-mobile-animate, .shop-card, .portfolio-card, .step-card, .service-card");
        });

        revealElements.forEach((el) => {
          gsap.fromTo(el,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 92%",
                toggleActions: "play none none reverse",
              }
            }
          );
        });
      }
    });

    return () => {
      if (lenis) lenis.destroy();
      if (rafId !== null) cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, []);

  return <>{children}</>;
}
