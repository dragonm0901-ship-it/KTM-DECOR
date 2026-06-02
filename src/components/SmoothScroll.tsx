"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Mobile-only text reveal animations
    let ctx = gsap.context(() => {
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
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
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  return <>{children}</>;
}
