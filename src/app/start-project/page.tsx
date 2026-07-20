import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
// import StartProjectClient from "./StartProjectClient";

export const metadata: Metadata = {
  title: "Custom LED Neon Sign Design Studio | KTM DECOR Nepal",
  description:
    "Design your own custom LED neon signs, 3D acrylic backlit signboards, nameplates, or wooden plaques online in Nepal. View dynamic day/night mockup previews and get an instant pricing quote.",
  alternates: {
    canonical: "/start-project",
  },
};

export default function StartProjectPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center pt-24 pb-16 relative overflow-hidden">
      {/* Ambient Grid Backdrop */}
      <div className="absolute inset-0 bg-cnc-grid opacity-[0.2] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none z-0" />

      {/* Accent volumetric glow */}
      <div className="absolute w-[40vw] h-[40vw] bg-[radial-gradient(circle_at_center,rgba(254,145,76,0.12)_0%,transparent_60%)] rounded-full blur-[80px] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-xl mx-auto px-4 text-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[4px] bg-accent/10 border border-accent/20 mb-6 shadow-sm">
          <span className="text-[10px] font-black tracking-widest uppercase text-accent">
            Under Development
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter leading-tight mb-4">
          Custom Studio <br />
          <span className="text-accent relative inline-block">
            is coming soon.
            <div className="absolute -bottom-1 left-0 w-full h-[4px] bg-accent/60 blur-[4px] rounded-full" />
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-muted text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-8 font-medium">
          Our high-fidelity 3D customization sandbox is currently getting some final touch-ups. Stay tuned to design and preview your custom signboards online.
        </p>

        {/* Actions */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-foreground text-background hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-[4px] text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Showroom</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
