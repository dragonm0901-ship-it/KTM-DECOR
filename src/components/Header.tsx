"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Moon, Sun, ShoppingBag } from "@/components/ui/solar-icons";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import gsap from "gsap";
import AnnouncementBar from "./AnnouncementBar";

const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Shop", href: "/shop" },
  { label: "Process", href: "/#process" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Cookie Policy", href: "/cookie-policy" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const openCart = () => {
    window.dispatchEvent(new CustomEvent("ktm-decor-open-cart"));
  };

  useEffect(() => {
    const updateCount = () => {
      const saved = localStorage.getItem("ktm_decor_cart");
      if (saved) {
        try {
          const items = JSON.parse(saved);
          const count = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
          setCartCount(count);
        } catch (e) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    updateCount();
    window.addEventListener("ktm-decor-cart-updated", updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener("ktm-decor-cart-updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const overlayRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Determine if header is white or dark based on scroll + page
  const useWhite = false;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!overlayRef.current || !navItemsRef.current) return;

    if (menuOpen) {
      document.body.style.overflow = "hidden";
      const items = navItemsRef.current.querySelectorAll(".nav-reveal-item");
      const tl = gsap.timeline();

      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        onStart: () => {
          if (overlayRef.current) {
            overlayRef.current.style.pointerEvents = "auto";
          }
        },
      });

      tl.fromTo(
        items,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.08,
          ease: "expo.out",
          force3D: true,
        },
        "-=0.2"
      );
    } else {
      document.body.style.overflow = "";
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          if (overlayRef.current) {
            overlayRef.current.style.pointerEvents = "none";
          }
        },
      });
    }
  }, [menuOpen]);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] md:w-[calc(100%-4rem)] max-w-6xl transition-all duration-500 ease-out-expo ${
          menuOpen
            ? "bg-transparent border-transparent shadow-none top-6 py-2.5 md:py-[21px] px-4 md:px-10"
            : "border border-border bg-card/85 backdrop-blur-md rounded-[8px] shadow-lg shadow-black/5 top-6 py-2.5 md:py-[21px] px-4 md:px-10"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          {/* Left: Logo */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className={`relative z-50 flex items-center h-10 sm:h-12 md:h-22 transition-all duration-300 ${
              menuOpen ? "opacity-0 pointer-events-none" : "opacity-100 hover:scale-[1.02]"
            }`}
          >
            <img
              id="header-logo"
              src="/logo/ktm%20decor.svg"
              alt="KTM DECOR"
              width={88}
              height={88}
              className="h-full w-auto object-contain dark:invert dark:hue-rotate-180 scale-[1.2] md:scale-[1.35] origin-left transition-transform duration-300"
            />
          </Link>

          {/* Right: Actions inside the header (no nested borders/backgrounds) */}
          <div
            id="header-pill-nav"
            className="flex items-center gap-1.5 md:gap-2.5 transition-all duration-500"
          >
            <Link
              href="/shop"
              prefetch={false}
              className={`flex items-center px-4 py-2 sm:px-6 md:py-3.5 bg-accent text-white text-[10px] sm:text-xs font-black tracking-widest uppercase rounded-[4px] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shrink-0 font-display ${menuOpen ? "hidden pointer-events-none" : ""}`}
            >
              Shop
            </Link>

            {/* Cart Icon Button */}
            <button
              onClick={openCart}
              className={`relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-[4px] bg-foreground/5 hover:bg-foreground/10 text-foreground transition-all duration-500 shrink-0 group ${menuOpen ? "hidden pointer-events-none" : ""}`}
              aria-label="Open Cart"
              title="Open Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 transition-transform group-hover:rotate-12" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-600 border border-white dark:border-zinc-950 text-[8px] font-black flex items-center justify-center text-white shadow shadow-black/35">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 px-3 sm:px-4 md:px-5 h-9 sm:h-11 md:h-12 rounded-[4px] bg-foreground/5 hover:bg-foreground/10 transition-all duration-500 relative z-50 shrink-0 text-foreground"
              aria-label="Toggle menu"
            >
              <div className="relative w-3.5 h-3 sm:w-4 sm:h-3.5">
                <span
                  className={`absolute left-0 w-full h-[1.2px] transition-all duration-500 ease-out-expo bg-foreground ${
                    menuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 w-full h-[1.2px] transition-all duration-500 ease-out-expo bg-foreground ${
                    menuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
                  }`}
                />
              </div>
              <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase hidden sm:block transition-colors duration-500 font-display text-foreground">
                {menuOpen ? "Close" : "Menu"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Menu Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 opacity-0 pointer-events-none overflow-hidden"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Background Image: Grayscale & 30% Opacity — only loaded when menu is activated */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          {menuOpen && (
            <Image
              src="/images/nav-bg.webp"
              alt="Menu Background"
              fill
              sizes="100vw"
              className="object-cover object-center grayscale opacity-30 transition-transform duration-[2000ms] ease-out scale-100"
              quality={50}
              loading="lazy"
            />
          )}
        </div>

        <div
          ref={navItemsRef}
          data-lenis-prevent
          className="relative z-10 flex flex-col md:flex-row h-full pt-28 pb-12 px-8 md:px-16 gap-12 overflow-auto"
        >
          {/* Main Nav */}
          <div className="flex flex-col gap-4">
            <span className="nav-reveal-item text-[10px] uppercase tracking-[0.25em] opacity-40 mb-2">
              Navigation
            </span>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="nav-reveal-item font-display text-[clamp(2rem,5vw,4rem)] font-medium tracking-tight leading-[1.1] text-foreground block overflow-hidden h-[1.1em] group cursor-pointer"
                >
                  <span className="relative block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1/2">
                    <span className="block h-[1.1em] leading-[1.1] transition-colors duration-300">{link.label}</span>
                    <span className="block h-[1.1em] leading-[1.1] text-accent">{link.label}</span>
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal + Social + Appearance (2-column layout on mobile, column layout on desktop) */}
          <div className="grid grid-cols-2 md:flex md:flex-col gap-6 sm:gap-8 md:gap-8 md:ml-auto md:justify-center mt-8 md:mt-0 pt-6 md:pt-0 border-t border-border/30 md:border-t-0">
            {/* Column 1: Legal */}
            <div className="flex flex-col gap-3">
              <span className="nav-reveal-item text-[10px] uppercase tracking-[0.25em] opacity-40 mb-1">
                Legal
              </span>
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="nav-reveal-item font-display text-sm sm:text-base md:text-lg font-medium tracking-tight text-foreground hover:text-accent transition-all duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Column 2 on mobile: Social + Appearance */}
            <div className="flex flex-col gap-6 md:gap-8">
              <div className="flex flex-col gap-3">
                <span className="nav-reveal-item text-[10px] uppercase tracking-[0.25em] opacity-40 mb-1">
                  Social
                </span>
                <a
                  href="https://www.instagram.com/ktmdecor/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-reveal-item font-display text-sm sm:text-base md:text-lg font-medium tracking-tight text-foreground hover-instagram w-fit"
                >
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com/people/KTM-Decor/61556839814576/#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-reveal-item font-display text-sm sm:text-base md:text-lg font-medium tracking-tight text-foreground hover-facebook w-fit"
                >
                  Facebook
                </a>
                <a
                  href="https://www.tiktok.com/@ktm.decor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-reveal-item font-display text-sm sm:text-base md:text-lg font-medium tracking-tight text-foreground hover-tiktok w-fit"
                >
                  TikTok
                </a>
              </div>

              {/* Theme Toggle in Menu */}
              <div className="nav-reveal-item flex flex-col gap-2 pt-4 md:pt-6 border-t border-border/40 md:border-border mt-0 md:mt-6">
                <span className="text-[10px] uppercase tracking-[0.25em] opacity-40 mb-1">
                  Appearance
                </span>
                <div className="flex items-center gap-3 sm:gap-4 group/theme">
                  <span
                    onClick={() => {
                      const button = document.getElementById("nav-theme-toggle-btn");
                      if (button) button.click();
                    }}
                    className="text-xs sm:text-sm font-medium cursor-pointer select-none group-hover/theme:text-accent transition-colors duration-300"
                  >
                    Switch Theme
                  </span>
                  {mounted && (
                    <AnimatedThemeToggler
                      id="nav-theme-toggle-btn"
                      duration={450}
                      className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-[4px] bg-foreground/5 hover:bg-foreground/10 group-hover/theme:bg-foreground/10 transition-colors duration-300"
                      aria-label="Toggle theme"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
