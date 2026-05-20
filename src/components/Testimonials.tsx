"use client";

import { useEffect, useRef } from "react";
import { Star } from "@/components/ui/solar-icons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const testimonials = [
  {
    name: "Aashish Gurung",
    role: "Cafe Owner",
    content: "KTM Decor transformed our cafe's ambiance. The custom neon sign is an absolute masterpiece and has become the main photo spot for all our customers.",
    theme: "default",
  },
  {
    name: "Priyanka Shrestha",
    role: "Creative Director",
    content: "The level of precision and quality is unmatched. Their team understood our brand perfectly and delivered a glowing logo that exceeded all expectations.",
    theme: "black",
  },
  {
    name: "Sanjay Maharjan",
    role: "Tech Startup Founder",
    content: "We ordered a massive 3D LED board for our headquarters. It looks incredibly premium, and the installation was completely hassle-free.",
    theme: "orange",
  },
  {
    name: "Nita Thapa",
    role: "Interior Designer",
    content: "I always recommend KTM Decor to my clients. Their neon work adds that perfect modern, luxurious touch to any interior space.",
    theme: "black",
  },
  {
    name: "Ravi Sharma",
    role: "Restaurant Manager",
    content: "The durability and brightness of the lights are fantastic. Even after a year, our storefront sign looks brand new. Amazing craftsmanship.",
    theme: "default",
  },
  {
    name: "Maya Lama",
    role: "Boutique Owner",
    content: "The custom aesthetic they created for my boutique is stunning. It draws people in from the street instantly. Highly recommended!",
    theme: "orange",
  }
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const renderCard = (t: typeof testimonials[0], i: number) => {
    let bgClass = "bg-card border-border hover:border-accent/50";
    let textClass = "text-foreground/80";
    let nameClass = "text-foreground";
    let roleClass = "text-muted";
    let starClass = "fill-accent text-accent";
    let avatarBgClass = "bg-accent/20 text-accent";

    if (t.theme === "black") {
      bgClass = "bg-[#111] border-[#222] hover:border-accent/50";
      textClass = "text-white/80";
      nameClass = "text-white";
      roleClass = "text-white/50";
      starClass = "fill-accent text-accent";
      avatarBgClass = "bg-accent/20 text-accent";
    } else if (t.theme === "orange") {
      bgClass = "bg-accent border-accent hover:border-black/20";
      textClass = "text-black/80";
      nameClass = "text-black";
      roleClass = "text-black/60";
      starClass = "fill-black text-black";
      avatarBgClass = "bg-black/10 text-black";
    }

    return (
      <div key={i} className={`flex-shrink-0 w-[260px] md:w-[420px] ${bgClass} border p-5 md:p-8 rounded-[4px] transition-colors group/card`}>
        <div className="flex gap-1 mb-4 md:mb-6">
          {[...Array(5)].map((_, idx) => (
            <Star 
              key={idx} 
              className={`w-3.5 h-3.5 md:w-4 md:h-4 ${starClass} transition-transform group-hover/card:scale-110 duration-300`} 
              style={{ transitionDelay: `${idx * 100}ms` }}
            />
          ))}
        </div>
        <p className={`${textClass} text-sm md:text-lg leading-relaxed mb-5 md:mb-8`}>
          "{t.content}"
        </p>
        <div className="flex items-center gap-3 md:gap-4">
          <div className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-lg shrink-0 ${avatarBgClass}`}>
            {t.name.charAt(0)}
          </div>
          <div>
            <p className={`font-bold text-xs md:text-sm uppercase tracking-widest ${nameClass}`}>{t.name}</p>
            <p className={`text-[10px] md:text-xs font-medium ${roleClass}`}>{t.role}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section ref={sectionRef} className="py-32 overflow-hidden bg-background">
      <div ref={headerRef} className="max-w-7xl mx-auto px-6 mb-20 text-center md:text-left">
        <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-foreground mb-6">
          Client <span className="text-accent">Stories</span>.
        </h2>
        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto md:mx-0">
          Don't just take our word for it. Here's what our clients have to say about the luminous transformations we've created for their spaces.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:gap-6 marquee-container relative">
        {/* Fade gradients for smooth entering/exiting effect */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Top Row: Left to Right */}
        <div className="flex w-fit animate-marquee-x-reverse hover:[animation-play-state:paused]">
          <div className="flex gap-4 md:gap-6 px-2 md:px-3">
            {testimonials.map((t, i) => renderCard(t, i))}
          </div>
          <div className="flex gap-4 md:gap-6 px-2 md:px-3">
            {testimonials.map((t, i) => renderCard(t, i + 10))}
          </div>
        </div>

        {/* Bottom Row: Right to Left */}
        <div className="flex w-fit animate-marquee-x hover:[animation-play-state:paused]">
          <div className="flex gap-4 md:gap-6 px-2 md:px-3">
            {[...testimonials].reverse().map((t, i) => renderCard(t, i + 20))}
          </div>
          <div className="flex gap-4 md:gap-6 px-2 md:px-3">
            {[...testimonials].reverse().map((t, i) => renderCard(t, i + 30))}
          </div>
        </div>
      </div>
    </section>
  );
}
