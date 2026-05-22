"use client";

import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function LocationMap() {
  return (
    <section className="relative w-full bg-background pb-24 md:pb-32 px-6 md:px-12 z-20">
      <div className="max-w-[1320px] mx-auto">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/25 rounded-[4px] text-accent text-[9px] font-black tracking-[0.25em] uppercase mb-4">
            Find Us
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-6">
            The Workshop
          </h2>
          <p className="text-muted text-base md:text-lg leading-relaxed max-w-2xl">
            Drop by our Kathmandu factory to see our precision CNC machines and master craftspeople bringing neon designs to life in real-time.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative w-full rounded-[4px] shadow-2xl bg-card group flex flex-col md:block no-mobile-animate"
        >
          {/* Map Container */}
          <div className="relative w-full aspect-[4/3] sm:aspect-video md:aspect-[21/9] rounded-t-[4px] md:rounded-[4px] overflow-hidden border border-border">
            {/* 
              The CSS Filter Hack: 
              This forces the standard Google Maps iframe into a premium, dark monochrome aesthetic 
              without needing an API key. 
            */}
            <div className="absolute inset-0 bg-black" /> {/* Dark backdrop to prevent white flashes while loading */}
            
            <iframe 
              src="https://maps.google.com/maps?q=KTM+Decor+Pvt+Ltd.,+Kathmandu,+Nepal&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ 
                border: 0, 
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                filter: "grayscale(100%) invert(92%) contrast(83%)",
                /* mixBlendMode removed to prevent severe WebKit renderer crashes on iOS */
              }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="z-10 transition-opacity duration-1000"
            ></iframe>

            {/* Interactive Overlay to prevent accidental scrolling while navigating the page, 
                clicks through when users actually want to interact. */}
            <div className="absolute inset-0 z-20 pointer-events-none" />
          </div>

          {/* Location details card - Flows below map on mobile, absolute overlay on desktop */}
          <div className="relative md:absolute md:bottom-10 md:left-10 w-full md:w-auto bg-black/95 md:bg-black/90 backdrop-blur-md border-x border-b md:border-t border-white/10 p-6 md:p-6 rounded-b-[4px] md:rounded-[4px] z-30">
            <div className="flex flex-row gap-6 md:gap-8 items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <MapPin className="w-5 h-5 animate-bounce" />
                  </div>
                  <h3 className="text-white font-bold tracking-widest uppercase text-xs">KTM Decor HQ</h3>
                </div>
                <p className="text-white/70 text-sm font-medium leading-relaxed">
                  Kathmandu, Nepal <br/>
                  Open: Sun - Fri, 9am - 6pm
                </p>
                <a 
                  href="https://maps.app.goo.gl/MnbeQy7Y6tPmV4DB9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-[10px] text-accent font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  Get Directions &rarr;
                </a>
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center border-l border-white/10 pl-6 md:pl-8 ml-2 flex-shrink-0">
                <div className="w-20 h-20 bg-white p-1 rounded-[4px] mb-3 relative overflow-hidden">
                  <Image 
                    src="/qr-code.png" 
                    alt="Scan for Google Maps Location" 
                    fill
                    sizes="80px"
                    className="object-cover" 
                  />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-[10px] tracking-widest uppercase mb-1">Scan & Go</p>
                  <p className="text-white/60 text-[9px] max-w-[100px] leading-snug">
                    Navigate easily & leave us a review!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
