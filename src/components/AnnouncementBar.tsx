"use client";

export default function AnnouncementBar() {
  return (
    <div className="w-full bg-accent py-2.5 overflow-hidden whitespace-nowrap border-b border-black/5">
      <div className="inline-block animate-marquee-x">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white px-8">
          GET 20% DISCOUNT ON YOUR FIRST NEON SIGN — LIMITED TIME ONLY
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white px-8">
          FREE INSTALLATION IN KATHMANDU VALLEY
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white px-8">
          GET 20% DISCOUNT ON YOUR FIRST NEON SIGN — LIMITED TIME ONLY
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white px-8">
          FREE INSTALLATION IN KATHMANDU VALLEY
        </span>
      </div>
      {/* Second set for seamless loop */}
      <div className="inline-block animate-marquee-x">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white px-8">
          GET 20% DISCOUNT ON YOUR FIRST NEON SIGN — LIMITED TIME ONLY
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white px-8">
          FREE INSTALLATION IN KATHMANDU VALLEY
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white px-8">
          GET 20% DISCOUNT ON YOUR FIRST NEON SIGN — LIMITED TIME ONLY
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white px-8">
          FREE INSTALLATION IN KATHMANDU VALLEY
        </span>
      </div>
    </div>
  );
}
