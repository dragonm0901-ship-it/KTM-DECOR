"use client";

import { useState } from "react";
import { Calculator, ArrowRight, Sparkles, Check, PhoneCall } from "lucide-react";

export default function CostCalculatorWidget() {
  const [signType, setSignType] = useState<"neon" | "3d_acrylic" | "light_board" | "nameplate">("neon");
  const [widthFt, setWidthFt] = useState<number>(2);
  const [heightFt, setHeightFt] = useState<number>(1.5);
  const [isWaterproof, setIsWaterproof] = useState<boolean>(false);
  const [hasDimmer, setHasDimmer] = useState<boolean>(false);

  const calculatePrice = () => {
    const sqFt = Math.max(1, widthFt * heightFt);
    let baseRate = 1800; // NPR per sq ft for neon base

    if (signType === "neon") {
      baseRate = 1900;
    } else if (signType === "3d_acrylic") {
      baseRate = 2800;
    } else if (signType === "light_board") {
      baseRate = 1500;
    } else if (signType === "nameplate") {
      baseRate = 1200;
    }

    let total = sqFt * baseRate;

    // Minimum baseline costs
    if (signType === "neon" && total < 2800) total = 2800;
    if (signType === "3d_acrylic" && total < 4500) total = 4500;
    if (signType === "light_board" && total < 3500) total = 3500;
    if (signType === "nameplate" && total < 1500) total = 1500;

    if (isWaterproof) total += 800;
    if (hasDimmer) total += 600;

    return Math.round(total);
  };

  const estimatedTotal = calculatePrice();

  const getSignTypeName = () => {
    switch (signType) {
      case "neon": return "Custom LED Neon Sign";
      case "3d_acrylic": return "3D Acrylic Backlit Signboard";
      case "light_board": return "2D Commercial Light Board";
      case "nameplate": return "Executive Desk / Villa Nameplate";
    }
  };

  const whatsappMessage = `Hello KTM DECOR, I used your online Cost Estimator for a ${getSignTypeName()} (${widthFt}ft x ${heightFt}ft${isWaterproof ? ", Waterproof" : ""}${hasDimmer ? ", with Dimmer" : ""}). Estimated Price: NPR ${estimatedTotal.toLocaleString()}. I would like to request a 3D digital mockup.`;

  return (
    <div className="my-12 p-6 sm:p-8 bg-card border border-border rounded-[4px] shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-1">
            <Calculator className="w-3.5 h-3.5" /> Instant Cost Estimator
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-foreground">
            Signage & Neon Price Calculator (Nepal 2026)
          </h3>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
          Direct Factory Rates
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sign Type Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Select Product Category:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "neon", label: "LED Neon Sign" },
                { id: "3d_acrylic", label: "3D Acrylic Board" },
                { id: "light_board", label: "2D Light Box" },
                { id: "nameplate", label: "Entrance Nameplate" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSignType(item.id as any)}
                  className={`p-3 text-left rounded-[4px] border text-xs font-bold transition-all ${
                    signType === item.id
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-background text-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-background border border-border rounded-[4px]">
              <div className="flex justify-between items-center text-xs font-bold mb-2">
                <span className="text-muted uppercase">Width (Feet):</span>
                <span className="text-accent font-black text-sm">{widthFt} ft</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={widthFt}
                onChange={(e) => setWidthFt(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>

            <div className="p-4 bg-background border border-border rounded-[4px]">
              <div className="flex justify-between items-center text-xs font-bold mb-2">
                <span className="text-muted uppercase">Height (Feet):</span>
                <span className="text-accent font-black text-sm">{heightFt} ft</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6"
                step="0.5"
                value={heightFt}
                onChange={(e) => setHeightFt(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
            </div>
          </div>

          {/* Add-on Options */}
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-muted hover:text-foreground">
              <input
                type="checkbox"
                checked={isWaterproof}
                onChange={(e) => setIsWaterproof(e.target.checked)}
                className="accent-accent w-4 h-4 rounded"
              />
              <span>Outdoor IP67 Waterproofing (+NPR 800)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-muted hover:text-foreground">
              <input
                type="checkbox"
                checked={hasDimmer}
                onChange={(e) => setHasDimmer(e.target.checked)}
                className="accent-accent w-4 h-4 rounded"
              />
              <span>Dimmer & Remote Controller (+NPR 600)</span>
            </label>
          </div>
        </div>

        {/* Output & Quick Order Box */}
        <div className="lg:col-span-5 bg-background border border-border p-6 rounded-[4px] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted block mb-1">
              Estimated Total Cost:
            </span>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                NPR {estimatedTotal.toLocaleString()}
              </span>
              <span className="text-xs text-muted font-bold">*Approx. factory rate</span>
            </div>

            <ul className="space-y-2 text-xs text-muted mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Includes 12V Power Adapter & Hanging Kit</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>1-Year Full Warranty in Nepal</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Free Digital 3D Mockup Before Crafting</span>
              </li>
            </ul>
          </div>

          <a
            href={`https://wa.me/9779706247439?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-colors w-full"
          >
            <PhoneCall className="w-4 h-4" />
            Claim This Price on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
