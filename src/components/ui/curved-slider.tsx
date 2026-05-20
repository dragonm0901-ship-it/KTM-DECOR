"use client";

import { useState, startTransition, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "@/components/ui/solar-icons";

export interface CurvedSliderCard {
  image: string;
  title: string;
  description: string;
}

interface CurvedSliderProps {
  cards: CurvedSliderCard[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  enableKeyboardNavigation?: boolean;
  onActiveIndexChange?: (index: number) => void;
}

export default function CurvedSlider({
  cards,
  autoPlay = true,
  autoPlayInterval = 5000,
  enableKeyboardNavigation = true,
  onActiveIndexChange,
}: CurvedSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect viewport size
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkMobile = () => {
      startTransition(() => {
        setIsMobile(window.innerWidth < 768);
      });
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Notify parent component about active index changes
  useEffect(() => {
    onActiveIndexChange?.(currentIndex);
  }, [currentIndex, onActiveIndexChange]);

  const handlePrevious = () => {
    startTransition(() => {
      setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
    });
  };

  const handleNext = () => {
    startTransition(() => {
      setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
    });
  };

  // Auto-play
  useEffect(() => {
    if (typeof window === "undefined" || !autoPlay || isMobile) return;
    const timer = setTimeout(() => {
      handleNext();
    }, autoPlayInterval);
    return () => clearTimeout(timer);
  }, [autoPlay, autoPlayInterval, currentIndex, isMobile]);

  // Keyboard navigation
  useEffect(() => {
    if (typeof window === "undefined" || !enableKeyboardNavigation || isMobile) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboardNavigation, currentIndex, isMobile]);

  const getCardStyle = (index: number) => {
    const diff = index - currentIndex;
    const isCenter = diff === 0;
    
    // Support wrap-around logic
    const isLeft =
      diff === -1 || (currentIndex === 0 && index === cards.length - 1);
    const isRight =
      diff === 1 || (currentIndex === cards.length - 1 && index === 0);

    if (isCenter) {
      return {
        transform: "translateX(0%) scale(1) rotateZ(0deg)",
        zIndex: 10,
        opacity: 1,
      };
    } else if (isLeft) {
      return {
        transform: "translateX(-70%) scale(0.8) rotateZ(-8deg)",
        zIndex: 5,
        opacity: 0.4,
      };
    } else if (isRight) {
      return {
        transform: "translateX(70%) scale(0.8) rotateZ(8deg)",
        zIndex: 5,
        opacity: 0.4,
      };
    } else {
      // Hidden cards
      return {
        transform: "translateX(0%) scale(0.6) rotateZ(0deg)",
        zIndex: 1,
        opacity: 0,
      };
    }
  };

  // Extended array for seamless mobile infinite marquee looping
  const extendedCards = [...cards, ...cards, ...cards];

  if (isMobile) {
    return (
      <div className="w-full relative overflow-hidden py-10">
        <div className="w-full flex items-center overflow-hidden relative">
          <motion.div
            animate={{
              x: [0, -(cards.length * 300)],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: cards.length * (autoPlayInterval / 1000),
                ease: "linear",
              },
            }}
            className="flex gap-6 px-4"
            style={{ width: "max-content" }}
          >
            {extendedCards.map((card, index) => (
              <div
                key={index}
                className="w-[280px] shrink-0 flex flex-col gap-4 bg-card border border-border p-5 rounded-[4px] shadow-sm relative overflow-hidden"
              >
                <div className="relative aspect-square w-full rounded-[4px] overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black tracking-tight text-foreground">
                    {card.title}
                  </h4>
                  <p className="text-xs text-muted leading-relaxed line-clamp-2">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[500px] lg:min-h-[620px] flex items-center justify-center relative overflow-hidden select-none py-12 transition-all duration-300"
    >
      {/* Navigation Left Button */}
      <button
        onClick={handlePrevious}
        className="absolute left-2 lg:left-2 xl:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-border bg-card hover:bg-accent/10 hover:text-accent hover:border-accent flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
      </button>

      {/* Cards Container (20% larger on desktop: max-w-[690px] from max-w-xl) */}
      <div className="relative w-full max-w-xl lg:max-w-[690px] aspect-[4/3] flex items-center justify-center transition-all duration-300">
        <AnimatePresence initial={false}>
          {cards.map((card, index) => {
            const cardStyle = getCardStyle(index);
            const isVisible =
              Math.abs(index - currentIndex) <= 1 ||
              (currentIndex === 0 && index === cards.length - 1) ||
              (currentIndex === cards.length - 1 && index === 0);

            if (!isVisible) return null;

            const isCenter = index === currentIndex;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={cardStyle}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="absolute w-[80%] h-full flex flex-col gap-5 bg-card border border-border p-6 lg:p-8 rounded-[4px] shadow-xl overflow-hidden cursor-pointer transition-colors duration-300"
                onClick={() => {
                  if (!isCenter) {
                    setCurrentIndex(index);
                  }
                }}
              >
                {/* Image Section */}
                <div className="relative flex-1 w-full rounded-[4px] overflow-hidden bg-foreground/5">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 600px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
                </div>

                {/* Info Section (Padded up for larger desktop view) */}
                <div className="text-center space-y-2 mt-2 px-4 lg:px-6">
                  <h4 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground transition-all">
                    {card.title}
                  </h4>
                  <p className="text-sm lg:text-base text-muted leading-relaxed transition-all">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Right Button */}
      <button
        onClick={handleNext}
        className="absolute right-2 lg:right-2 xl:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-border bg-card hover:bg-accent/10 hover:text-accent hover:border-accent flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
