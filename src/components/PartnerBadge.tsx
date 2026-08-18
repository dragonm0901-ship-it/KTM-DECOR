"use client";

import { useState } from "react";
import { Check, Copy, Sparkles, ShieldCheck } from "lucide-react";

export default function PartnerBadge() {
  const [copied, setCopied] = useState(false);
  const [badgeTheme, setBadgeTheme] = useState<"dark" | "light">("dark");

  const badgeHtml = `<a href="https://www.decorktm.com" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;background:${
    badgeTheme === "dark" ? "#000000" : "#ffffff"
  };color:${
    badgeTheme === "dark" ? "#ffffff" : "#111827"
  };border:1px solid ${
    badgeTheme === "dark" ? "#333333" : "#e5e7eb"
  };border-radius:4px;font-family:sans-serif;font-size:11px;font-weight:600;text-decoration:none;box-shadow:0 2px 6px rgba(0,0,0,0.06);">
  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#fe914c;"></span>
  <span>Signage Crafted by <strong style="color:#fe914c;">KTM DECOR</strong></span>
</a>`;

  const copyBadge = () => {
    navigator.clipboard.writeText(badgeHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-card border border-border rounded-[4px] p-6 sm:p-8 mt-12 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Client Verification Badge
          </div>
          <h3 className="text-xl font-bold text-foreground">Partner & Client Embed Badge</h3>
        </div>
        <div className="flex items-center gap-2 bg-muted/10 p-1 rounded-[4px] border border-border self-start sm:self-auto">
          <button
            onClick={() => setBadgeTheme("dark")}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-colors ${
              badgeTheme === "dark"
                ? "bg-black text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            Dark Badge
          </button>
          <button
            onClick={() => setBadgeTheme("light")}
            className={`px-3 py-1.5 rounded-[2px] text-xs font-bold transition-colors ${
              badgeTheme === "light"
                ? "bg-white text-black border border-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            Light Badge
          </button>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-muted mb-6">
        Cafes, restaurants, boutiques, and corporate offices outfitted by KTM DECOR can feature this authentic craft verification badge on their footer:
      </p>

      {/* Live Badge Preview */}
      <div className="p-8 bg-background border border-border rounded-[4px] flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
            Live Preview on Your Website:
          </span>
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-[4px] border shadow-sm ${
              badgeTheme === "dark"
                ? "bg-black text-white border-neutral-800"
                : "bg-white text-gray-900 border-gray-200"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium">
              Signage Crafted by <strong className="text-accent font-black">KTM DECOR</strong>
            </span>
          </div>
        </div>

        <button
          onClick={copyBadge}
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-colors shadow-md w-full sm:w-auto justify-center"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" /> Code Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" /> Copy Badge Embed HTML
            </>
          )}
        </button>
      </div>

      <div className="relative bg-background border border-border p-3.5 rounded-[4px]">
        <pre className="text-[11px] font-mono text-muted/80 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {badgeHtml}
        </pre>
      </div>
    </div>
  );
}
