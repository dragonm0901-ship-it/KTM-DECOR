"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "@/components/ui/solar-icons";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

interface ServiceData {
  title: string;
  description: string;
  tag: string;
}

const servicesData: ServiceData[] = [
  {
    title: "Neon Signs",
    description: "Custom LED neon signs that bring your brand or space to life with vibrant, energy-efficient illumination. Perfect for storefronts, high-traffic commercial venues, and bespoke modern home interiors.",
    tag: "Illuminated",
  },
  {
    title: "Light Boards",
    description: "Precision-crafted illuminated display boards with cutting-edge edge-lit LED tech. Ideal for sleek directories, luxury restaurant menu boards, and sophisticated architectural light features.",
    tag: "Precision",
  },
  {
    title: "3D Letters & Signs",
    description: "Multi-dimensional structural lettering and brand logos fabricated from premium-grade acrylic, metal, and hand-finished hardwoods, featuring custom halo LED backlighting.",
    tag: "Dimensional",
  },
  {
    title: "Custom Decorations",
    description: "Bespoke artistic installations for corporate events, luxury venues, and commercial showrooms. From wedding photobooth backdrops to signature corporate feature walls.",
    tag: "Bespoke Decor",
  }
];

export default function Services() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Initial configuration
    gsap.set(".card-0", { y: "0%", scale: 1, rotation: 0, opacity: 1 });
    gsap.set([".card-1", ".card-2", ".card-3"], { y: "150%", scale: 1, rotation: 0, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      }
    });

    // STEP 1: Card 0 scales down/rotates slightly, Card 1 slides up to 0%
    tl.to(".card-0", { scale: 0.92, rotation: -3, ease: "power1.inOut", duration: 1 }, 0)
      .to(".card-1", { y: "0%", opacity: 1, ease: "power1.out", duration: 1 }, 0)
      .to(".highlight-step-1", { color: "#FE914C", ease: "power2.out", duration: 0.5 }, 0.3);

    // STEP 2: Card 1 scales down/rotates slightly, Card 2 slides up to 0%
    tl.to(".card-1", { scale: 0.92, rotation: 3, ease: "power1.inOut", duration: 1 }, 1)
      .to(".card-2", { y: "0%", opacity: 1, ease: "power1.out", duration: 1 }, 1)
      .to(".highlight-step-2", { color: "#FE914C", ease: "power2.out", duration: 0.5 }, 1.3);

    // STEP 3: Card 2 scales down/rotates slightly, Card 3 slides up to 0%
    tl.to(".card-2", { scale: 0.92, rotation: -3, ease: "power1.inOut", duration: 1 }, 2)
      .to(".card-3", { y: "0%", opacity: 1, ease: "power1.out", duration: 1 }, 2)
      .to(".highlight-step-3", { color: "#FE914C", ease: "power2.out", duration: 0.5 }, 2.3);

    // STEP 4: Pause/hold the final stacked state so the user can read it before unpinning
    tl.to({}, { duration: 1 });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full h-[500vh]">
      <section 
        id="services" 
        className="sticky top-0 h-[100dvh] lg:h-[125vh] w-full flex flex-col items-center justify-end pb-12 md:justify-center md:pb-0 py-4 md:py-6 px-6 md:px-12 overflow-hidden bg-background text-foreground"
      >
        {/* Premium Workshop Background Image */}
        <div className="absolute -inset-[5%] z-0 opacity-65 pointer-events-none select-none overflow-hidden">
          <Image
            src="/images/workshop.webp"
            alt="KTM DECOR Workshop"
            fill
            className="object-cover object-center grayscale contrast-[1.1] transition-all duration-500 scale-[0.92]"
          />
        </div>
        {/* Subtle uniform overlay for contrast - bound to section limits */}
        <div className="absolute inset-0 z-0 bg-background/55 dark:bg-background/75 transition-colors duration-500 pointer-events-none" />
        {/* Soft vertical fade transitions at the edges - bound to section limits for seamless blending */}
        <div 
          className="absolute inset-0 z-0 bg-[linear-gradient(to_bottom,_var(--background)_0%,_transparent_15%,_transparent_85%,_var(--card)_100%)] transition-colors duration-500 pointer-events-none" 
        />

        {/* Top Center Header (Absolute to prevent pushing cards out of viewport) */}
        <div className="absolute top-20 md:top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center text-center w-full max-w-3xl px-6 select-text">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-black tracking-[0.25em] uppercase border border-accent/20 rounded-[4px] mb-3 text-white bg-accent">
            The Craft
          </span>
          <h2 className="text-[clamp(1.75rem,4.5vw,3rem)] font-black leading-[1.1] tracking-tighter text-foreground">
            From <span className="highlight-step-1 transition-colors duration-300">idea</span> to <span className="highlight-step-2 transition-colors duration-300">glowing</span> <span className="highlight-step-3 transition-colors duration-300">landmarks.</span>
          </h2>
        </div>

        {/* Stacking Cards Track (Larger, wider, and 15% taller cards offset from absolute header) */}
        <div 
          ref={cardsRef}
          className="relative w-full max-w-[1120px] h-[51vh] md:h-[70vh] lg:h-[75vh] max-h-[900px] flex items-center justify-center shrink-0 mt-0 md:mt-24 lg:mt-28"
        >
          {servicesData.map((service, i) => (
            <div
              key={i}
              className={`service-card card-${i} absolute top-0 left-0 w-full h-full rounded-[4px] p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] select-none pointer-events-auto`}
              style={{
                zIndex: 10 + i,
                transformStyle: "preserve-3d",
                willChange: "transform, opacity",
              }}
            >
              {/* Background Cover */}
              <>
                <Image
                  src={[
                    "/images/neon-momo.webp",
                    "/images/light-boards-nivati.webp",
                    "/images/3d-letters-salt.webp",
                    "/images/custom-decor-collage.webp"
                  ][i]}
                  alt={service.title}
                  fill
                  className={`object-cover rounded-[4px] z-0 ${i === 1 ? "object-[center_15%]" : "object-center"}`}
                />
                <div className="absolute inset-0 rounded-[4px] bg-black/55 z-0" />
              </>

              {/* Card Info Header */}
              <div className="relative z-10 flex justify-end w-full">
                <span className="text-[10px] font-black tracking-widest uppercase bg-white/15 text-white px-3.5 py-1.5 rounded-[4px] border border-white/10">
                  {service.tag}
                </span>
              </div>

              {/* Bottom Group: Main Content & Footer Details */}
              <div className="relative z-10 mt-auto flex flex-col w-full">
                {/* Main Card Content */}
                <div className="mb-6 lg:mb-8">
                  <h3 className="text-3xl sm:text-5xl lg:text-[56px] font-black tracking-tighter text-white leading-[0.95] mb-4 lg:mb-6">
                    {service.title}
                  </h3>
                  <p className="text-white/90 text-sm sm:text-lg lg:text-lg font-medium leading-relaxed max-w-[95%]">
                    {service.description}
                  </p>
                </div>

                {/* Premium Design Footer Details */}
                <div className="flex justify-between items-end w-full">
                  <div className="w-12 h-[2px] bg-white/30 rounded-full" />
                  <div className="w-10 h-10 rounded-full bg-white/15 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 cursor-pointer">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
