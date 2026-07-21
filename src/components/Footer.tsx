"use client";

import { motion } from "motion/react";
import Link from "next/link";

const Facebook = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const Instagram = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const TikTok = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function Footer() {
  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/people/KTM-Decor/61556839814576/#", hoverClass: "footer-social-fb" },
    { icon: Instagram, href: "https://www.instagram.com/ktmdecor/", hoverClass: "footer-social-ig" },
    { icon: TikTok, href: "https://www.tiktok.com/@ktm.decor", hoverClass: "footer-social-tt" },
  ];

  return (
    <div className="bg-[#f8f9fa] dark:bg-black transition-colors duration-500 w-full flex flex-col font-sans relative z-10">
      {/* Main Container */}
      <div 
        className="relative w-full overflow-hidden c5-animated-gradient py-12 md:py-20 px-4 md:px-8"
      >
        {/* CNC Dot Grid Overlay - White Dots */}
        <div 
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }}
        />
        
        {/* Footer Card */}
        <div className="relative w-full z-30">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="w-full max-w-[1500px] mx-auto bg-white/95 dark:bg-black/95 backdrop-blur-sm shadow-xl dark:shadow-2xl border border-gray-200 dark:border-white/10 rounded-[4px] overflow-hidden transition-colors duration-500"
          >
            {/* Top Half */}
            <div className="p-6 md:p-12 flex flex-col gap-10 md:gap-12">
              
              {/* Logo Area (Top Left) */}
              <div className="flex items-start">
                <Link href="/" className="h-14 md:h-[90px] w-fit block relative hover:scale-[1.02] transition-transform duration-300">
                  <img
                    src="/logo/ktm%20decor.svg"
                    alt="KTM DECOR"
                    width={90}
                    height={90}
                    className="h-full w-auto object-contain transform-gpu dark:invert dark:hue-rotate-180 transition-all duration-500"
                  />
                </Link>
              </div>

              {/* Links Area */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 w-full pt-8 border-t border-gray-200 dark:border-white/10">
                <div className="flex flex-col gap-3 md:gap-4">
                  <h4 className="uppercase tracking-widest text-[10px] md:text-sm font-bold text-gray-900 dark:text-white">Navigation</h4>
                  <div className="flex flex-col gap-2 md:gap-3">
                    {["About", "Services", "Shop", "Process", "FAQ"].map(link => (
                      <Link key={link} href={link === "Shop" ? "/shop" : `/#${link.toLowerCase()}`} className="text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium hover:text-orange-600 dark:hover:text-orange-500 transition-colors">
                        {link}
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 md:gap-4">
                  <h4 className="uppercase tracking-widest text-[10px] md:text-sm font-bold text-gray-900 dark:text-white">Shop</h4>
                  <div className="flex flex-col gap-2 md:gap-3">
                    {["Neon Signage", "3D Led Signage", "Branding Signage", "Light Boards", "Custom Designs"].map(cat => (
                      <Link key={cat} href="/shop" className="text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium hover:text-orange-600 dark:hover:text-orange-500 transition-colors">
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:gap-4 col-span-2 md:col-span-1">
                  <h4 className="uppercase tracking-widest text-[10px] md:text-sm font-bold text-gray-900 dark:text-white">Contact</h4>
                  <div className="flex flex-col gap-2 md:gap-3">
                    <span className="text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium">Balkot, Bhaktapur, Nepal</span>
                    <a href="mailto:ktmdecor2024@gmail.com" className="text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium hover:text-orange-600 dark:hover:text-orange-500 transition-colors">ktmdecor2024@gmail.com</a>
                    <a href="tel:+9779706247439" className="text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium hover:text-orange-600 dark:hover:text-orange-500 transition-colors">+977 9706247439</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 sm:px-6 md:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-500">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                © {new Date().getFullYear()} KTM DECOR. All Rights Reserved.
              </span>
              <div className="flex items-center gap-4">
                {socialLinks.map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <a 
                      key={i}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all duration-300 ${social.hoverClass}`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
