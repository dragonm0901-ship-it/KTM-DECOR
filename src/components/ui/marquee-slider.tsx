"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface MarqueeSliderCard {
  image: string;
  title: string;
  description: string;
}

interface MarqueeSliderProps {
  cards: MarqueeSliderCard[];
}

export default function MarqueeSlider({ cards }: MarqueeSliderProps) {
  const [viewportWidth, setViewportWidth] = useState(1200);

  // Track viewport size dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = viewportWidth < 768;
  const cardWidth = isMobile ? 250 : 546;
  const cardHeight = isMobile ? 290 : 525;
  const gap = isMobile ? 16 : 32;

  // Clone cards once to create a seamless looping track
  const extendedCards = [...cards, ...cards];

  return (
    <div className="relative w-full overflow-hidden py-4 select-none">
      
      {/* Slider viewport wrapper */}
      <div className="w-full overflow-hidden">
        
        {/* Continuous marquee track with hover pauses and interactive highlights */}
        <div
          className="flex animate-marquee-x lg:hover:[animation-play-state:paused] lg:hover:[&>div]:opacity-45 lg:hover:[&>div]:scale-[0.96]"
          style={{
            gap: `${gap}px`,
            width: "max-content",
            animationDuration: isMobile ? "25s" : "40s",
          }}
        >
          {extendedCards.map((card, index) => (
            <div
              key={index}
              className="group relative shrink-0 select-none overflow-hidden rounded-[4px] border border-border bg-card shadow-lg transition-all duration-500 ease-out lg:hover:!opacity-100 lg:hover:!scale-[1.04]"
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
              }}
            >
              {/* Image background with gradient overlay */}
              <div className="relative w-full h-full">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes={`${cardWidth}px`}
                  className="object-cover transition-transform duration-700 ease-out lg:group-hover:scale-105 pointer-events-none"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
              </div>

              {/* Info Text Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white space-y-1.5 md:space-y-2 pointer-events-none">
                <h4 className="text-lg md:text-2xl font-black tracking-tight drop-shadow-md">
                  {card.title}
                </h4>
                <p className="text-xs md:text-sm text-neutral-300 font-medium leading-relaxed line-clamp-2 drop-shadow-sm">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
