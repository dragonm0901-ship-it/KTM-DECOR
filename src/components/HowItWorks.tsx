"use client";

import { useRef } from "react";
import Image from "next/image";
import { MessageSquare, PenTool, Wrench, Truck, Plus, Settings } from "@/components/ui/solar-icons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: MessageSquare,
    title: "Consultation",
    description:
      "Share your vision with us. We discuss design ideas, dimensions, materials and placement to understand exactly what you need.",
  },
  {
    icon: PenTool,
    title: "Design & Mockup",
    description:
      "Our designers create a detailed digital mockup showing colours, sizes and how the final piece will look in your space.",
  },
  {
    icon: Wrench,
    title: "Fabrication",
    description:
      "Using premium materials and precision tools, our team handcrafts your custom piece with meticulous attention to detail.",
  },
  {
    icon: Truck,
    title: "Delivery & Install",
    description:
      "We deliver and professionally install your finished piece, ensuring it looks perfect and is ready to shine.",
  },
  {
    icon: Settings,
    title: "Repair",
    description:
      "We provide comprehensive maintenance and repair services to keep your custom signs looking and functioning like new.",
  },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (typeof window === "undefined") return;

    if (window.innerWidth < 1024) {
      // Mobile: Snappy, smooth scroll-triggered slide-up
      const stepCards = gsap.utils.toArray<HTMLElement>(".step-card");
      stepCards.forEach((card) => {
        gsap.fromTo(card,
          { 
            y: 25, 
            opacity: 0
          },
          {
            y: 0,
            opacity: 1,
            ease: "power3.out",
            duration: 0.5,
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    } else {
      // Desktop: Snappy staggered sequential slide up
      gsap.fromTo(".step-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".step-card-grid",
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="process" className="py-24 md:py-32 px-6 md:px-12 bg-background text-foreground relative overflow-hidden">
      {/* Premium Laser-Process Background Image at 50% Opacity (Extended top and bottom to eliminate high-DPI subpixel rounding gaps) */}
      <div className="absolute top-[-8px] bottom-[-8px] left-0 right-0 z-0 opacity-50 pointer-events-none select-none">
        <Image
          src="/images/laser-cnc.webp"
          alt="KTM DECOR Laser Cutting"
          fill
          sizes="100vw"
          className="object-cover object-center grayscale contrast-[1.1] transition-all duration-500"
        />
        {/* Theme-adaptive blend mask tailored to the bg-background section wrapper */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/45 dark:from-background dark:via-background/85 dark:to-background/55 transition-colors duration-500" />
        {/* Top/bottom vertical fade to guarantee seamless color transition and block subpixel gaps */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background transition-colors duration-500" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Centered Header */}
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-16 md:mb-20">
          {/* Label */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase border border-border rounded-[4px] mb-8 bg-background/50 backdrop-blur-sm">
            How It Works
          </span>

          {/* Heading */}
          <h2 className="text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[0.9] tracking-tighter mb-8">
            From idea to <span className="text-accent">installation.</span>
          </h2>
          
          {/* CTA */}
          <div>
            <a
              href="/start-project"
              className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-[4px] text-[10px] font-bold tracking-widest uppercase hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-lg shadow-accent/20"
            >
              Start Your Project
              <Plus className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 5-Card Spacious Grid Layout (Centered Bottom Row via 6-col Grid) */}
        <div className="step-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            return (
              <div
                key={i}
                className={`step-card group relative p-8 md:p-10 rounded-[4px] bg-neutral-50/70 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-white/5 shadow-sm hover:border-accent/40 hover:shadow-xl hover:-translate-y-2 transition-[border-color,box-shadow,background-color,transform] duration-300 ease-out will-change-transform backdrop-blur-sm min-h-[380px] flex flex-col justify-between overflow-hidden lg:col-span-2 ${i === 3 ? "lg:col-start-2" : ""}`}
              >
                {/* Background decorative neon glow aura */}
                <div className="step-card-aura absolute -bottom-10 -right-10 w-36 h-36 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/12 transition-all duration-500 pointer-events-none" />
                
                {/* Top header containing Icon */}
                <div className="mb-8">
                  <div className="step-card-icon w-14 h-14 rounded-[4px] bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white group-hover:scale-110 transition-all duration-500">
                    <StepIcon className="w-6 h-6" />
                  </div>
                </div>

                {/* Bottom detail card block */}
                <div className="flex-1 flex flex-col justify-end">
                  {/* Step Title */}
                  <h3 className="step-card-title text-2xl md:text-3xl font-black text-neutral-900 dark:text-white mb-4 tracking-tight group-hover:text-accent transition-colors duration-300">
                    {step.title}
                  </h3>
                  
                  {/* Step Description Paragraph (Upscaled Font Sizes) */}
                  <p className="text-neutral-500 dark:text-neutral-400 text-base md:text-[17px] leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
// sync push