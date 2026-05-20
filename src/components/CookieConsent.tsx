"use client";

import { useState, useEffect } from "react";
import { X } from "@/components/ui/solar-icons";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [personalization, setPersonalization] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Delay appearance for a smoother UX
      const timer = setTimeout(() => setShowBanner(true), 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({
        necessary: true,
        marketing: true,
        personalization: true,
      })
    );
    setShowBanner(false);
    setShowPreferences(false);
  };

  const savePreferences = () => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({
        necessary: true,
        marketing,
        personalization,
      })
    );
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner && !showPreferences) return null;

  return (
    <>
      {/* Banner */}
      {showBanner && !showPreferences && (
        <div
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[380px] z-[9998] p-6 rounded-lg border border-foreground/[0.08] backdrop-blur-lg animate-slide-up"
          style={{ backgroundColor: "var(--background)", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-base font-medium tracking-tight">
              Cookie settings
            </h3>
            <button
              onClick={() => setShowBanner(false)}
              className="p-1 hover:opacity-50 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs leading-relaxed opacity-60 mb-5">
            We use cookies to enhance your experience. By clicking &quot;Accept
            all&quot;, you agree to our{" "}
            <a href="/privacy-policy" className="underline hover:opacity-80">
              privacy policy
            </a>
            .
          </p>
          <div className="flex gap-2.5">
            <button
              onClick={acceptAll}
              className="flex-1 px-4 py-2.5 bg-foreground text-background rounded-lg text-xs font-medium tracking-wide hover:opacity-80 transition-opacity"
            >
              Accept all
            </button>
            <button
              onClick={() => setShowPreferences(true)}
              className="flex-1 px-4 py-2.5 border border-foreground/10 rounded-lg text-xs font-medium tracking-wide hover:border-foreground/30 transition-colors"
            >
              Settings
            </button>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            data-lenis-prevent
            className="w-full max-w-md rounded-lg border border-border p-6 max-h-[85vh] overflow-auto animate-slide-up bg-background shadow-2xl relative"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-base font-medium tracking-tight">
                Cookie settings
              </h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-1 hover:opacity-50 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs leading-relaxed opacity-60 mb-5">
              Manage your cookie preferences below.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-4 rounded-lg border border-border opacity-50">
                <div className="w-4 h-4 rounded-lg border border-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2.5 h-2.5 bg-foreground rounded-lg" />
                </div>
                <div>
                  <span className="text-xs font-medium block">
                    Strictly necessary
                  </span>
                  <span className="text-[11px] opacity-60">Always active</span>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-lg border border-border cursor-pointer hover:border-foreground/20 transition-colors">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-foreground"
                />
                <div>
                  <span className="text-xs font-medium block">Marketing</span>
                  <span className="text-[11px] opacity-60">
                    Advertising relevance
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-lg border border-border cursor-pointer hover:border-foreground/20 transition-colors">
                <input
                  type="checkbox"
                  checked={personalization}
                  onChange={(e) => setPersonalization(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-foreground"
                />
                <div>
                  <span className="text-xs font-medium block">
                    Personalization
                  </span>
                  <span className="text-[11px] opacity-60">
                    Remember your choices
                  </span>
                </div>
              </label>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={acceptAll}
                className="flex-1 px-4 py-2.5 bg-foreground text-background rounded-lg text-xs font-medium tracking-wide hover:opacity-80 transition-opacity"
              >
                Accept all
              </button>
              <button
                onClick={savePreferences}
                className="flex-1 px-4 py-2.5 border border-foreground/10 rounded-lg text-xs font-medium tracking-wide hover:border-foreground/30 transition-colors"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
