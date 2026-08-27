"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { Quote } from "@/components/ui/solar-icons";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const containerRef = useRef<HTMLElement>(null);
  const [hoveredPart, setHoveredPart] = useState<'content' | 'background' | 'none'>('none');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Text Reveal Animations (desktop only to prevent mobile CLS and invisible text)
      if (window.innerWidth >= 1024) {
        const revealTexts = document.querySelectorAll(".reveal-text");
        revealTexts.forEach((text) => {
          gsap.fromTo(text, 
            { y: 60, opacity: 0 },
            { 
              y: 0, 
              opacity: 1, 
              duration: 1.0, 
              ease: "power3.out",
              scrollTrigger: {
                trigger: text,
                start: "top 88%",
              }
            }
          );
        });
      }

      // Stat Counters
      const stats = document.querySelectorAll(".stat-number");
      stats.forEach((stat) => {
        const target = parseInt(stat.getAttribute("data-target") || "0");
        gsap.to(stat, {
          innerText: target,
          duration: 2.5,
          snap: { innerText: 1 },
          ease: "power2.out",
          scrollTrigger: {
            trigger: stat,
            start: "top 95%",
            once: true,
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="about" className="relative overflow-hidden bg-background text-foreground">
      {/* 1. Founder Story */}
      <div 
        className="founder-section relative py-20 md:py-32 px-4 sm:px-6 md:px-8 overflow-hidden transition-all duration-700"
      >
        {/* Background Image of Patan Durbar Square */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none transition-all duration-1000 dark:opacity-40">
          <Image
            src="/images/about-hero.webp"
            alt="Patan Durbar Square Background"
            fill
            sizes="100vw"
            className={`object-cover object-center transition-all duration-1000 grayscale opacity-30 contrast-[1.1] ${
              hoveredPart === 'content'
                ? 'lg:grayscale lg:opacity-30 lg:contrast-[1.1]' 
                : 'lg:grayscale lg:opacity-45 lg:contrast-100'
            }`}
            quality={50}
          />
          {/* Soft uniform overlay to ensure optimal contrast and premium integration */}
          <div className="absolute inset-0 bg-background/5 dark:bg-background/10 transition-colors duration-500" />
          {/* Top/bottom vertical fade to guarantee seamless color transition between sections */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background transition-colors duration-500" />
        </div>
 
        {/* Content Card container */}
        <div 
          className={`relative z-10 max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 lg:gap-24 items-center rounded-[4px] border p-5 sm:p-8 md:p-16 lg:p-20 bg-white dark:bg-black border-accent/25 shadow-[0_30px_70px_-15px_rgba(254,145,76,0.15)] scale-[1.015] lg:transition-all lg:duration-700 lg:ease-[cubic-bezier(0.16,1,0.3,1)] ${
            hoveredPart === 'content'
              ? 'lg:bg-white lg:dark:bg-black lg:border-accent/25 lg:shadow-[0_30px_70px_-15px_rgba(254,145,76,0.15)] lg:scale-[1.015]' 
              : 'lg:bg-card/92 lg:dark:bg-card/85 lg:border-border/60 lg:scale-[1.0]'
          }`}
          onMouseEnter={(e) => {
            if (typeof window !== "undefined" && window.innerWidth < 1024) return;
            e.stopPropagation();
            setHoveredPart('content');
          }}
          onMouseLeave={(e) => {
            if (typeof window !== "undefined" && window.innerWidth < 1024) return;
            e.stopPropagation();
            setHoveredPart('none');
          }}
        >
          {/* Image Column */}
          <div className="relative aspect-[4/5] rounded-[4px] overflow-hidden bg-foreground/5 shadow-lg group">
             <Image 
              src="/images/kishor.webp" 
              alt="Founder Kishor G.C." 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
              className={`object-cover transition-all duration-700 scale-105 ${
                hoveredPart === 'content' ? 'lg:scale-105' : 'lg:scale-100'
              } md:grayscale md:group-hover:grayscale-0 md:hover:grayscale-0`}
              quality={60}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          
          <div className="space-y-8 lg:pr-8 xl:pr-16 lg:pl-8 w-full max-w-xl lg:max-w-2xl mx-auto lg:mx-0">
            <span className="inline-block text-[10px] font-bold tracking-[0.3em] uppercase text-accent">The Vision</span>
            <h2 className="reveal-text text-4xl md:text-6xl font-extrabold tracking-tighter leading-[1.1] text-foreground">
              Crafting Nepal&apos;s <br />
              <span className="text-accent">nightscape.</span>
            </h2>
            <div className="space-y-6 text-lg leading-relaxed">
              <p className={`reveal-text transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] text-foreground font-bold ${
                hoveredPart === 'content'
                  ? 'lg:text-foreground lg:font-bold'
                  : 'lg:text-foreground/95 lg:font-semibold'
              }`}>
                Founded by <span className={`transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] text-accent font-black ${
                  hoveredPart === 'content' ? 'lg:text-accent lg:font-black' : 'lg:text-foreground lg:font-bold'
                }`}>Kishor G.C.</span>, KTM DECOR began as a small experiment in a garage, fueled by a passion for light and design. We didn&apos;t just want to make signs; we wanted to create glowing landmarks.
              </p>
              <p className={`reveal-text transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] text-foreground font-bold ${
                hoveredPart === 'content'
                  ? 'lg:text-foreground lg:font-bold'
                  : 'lg:text-foreground/95 lg:font-semibold'
              }`}>
                Today, we are a team of dedicated artisans and engineers who believe that every brand has a story that deserves to be illuminated. From the buzzing streets of Thamel to corporate hubs, our work speaks for itself.
              </p>
            </div>
            <div className="pt-8 border-t border-border transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Quote className="w-5 h-5 text-accent" />
                  </div>
                  <p className={`text-sm italic transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] text-foreground font-semibold ${
                    hoveredPart === 'content'
                      ? 'lg:text-foreground lg:font-semibold'
                      : 'lg:text-foreground/90 lg:font-medium'
                  }`}>
                    &quot;We don&apos;t sell signs. We sell the feeling of walking into a space that truly belongs to you.&quot;
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats (Minimal Footer of About) */}
      <div className="py-16 md:py-24 px-4 sm:px-6 md:px-8 border-t border-border">
        <div className="max-w-[1500px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
           {[
             { label: "Projects", val: 500, suffix: "+" },
             { label: "Cities", val: 12, suffix: "" },
             { label: "Satisfaction", val: 100, suffix: "%" },
             { label: "Support", val: 24, suffix: "/7" }
           ].map((stat, i) => (
             <div key={i} className="flex flex-col items-center text-center">
                <span className="text-5xl md:text-7xl font-black tracking-tighter text-foreground">
                  <span className="stat-number tabular-nums" data-target={stat.val}>0</span>
                  <span className="text-accent">{stat.suffix}</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted mt-2">{stat.label}</span>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
