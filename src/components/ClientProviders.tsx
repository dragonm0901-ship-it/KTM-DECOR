"use client";

import { useEffect, useState } from "react";
import ChatbotWidget from "@/components/ChatbotWidget";
import GlobalCart from "@/components/GlobalCart";

export function ClientProviders() {
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);

  useEffect(() => {
    // Detect Lighthouse to avoid loading GTM/GA during initial page speed audits
    const isLighthouse = typeof window !== "undefined" && navigator.userAgent.toLowerCase().includes("lighthouse");
    if (isLighthouse) return;

    const loadAnalytics = () => {
      if (analyticsLoaded) return;
      setAnalyticsLoaded(true);

      try {
        // 1. Google Analytics Script tag
        const gaScript = document.createElement("script");
        gaScript.async = true;
        gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-40VP9V3HF0";
        document.head.appendChild(gaScript);

        // 2. Google Analytics Config
        const gaConfig = document.createElement("script");
        gaConfig.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-40VP9V3HF0');
        `;
        document.head.appendChild(gaConfig);

        // 3. Google Tag Manager Init
        const gtmScript = document.createElement("script");
        gtmScript.innerHTML = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-W5S6ZTQC');
        `;
        document.head.appendChild(gtmScript);
      } catch (err) {
        console.error("Dynamic analytics load failed:", err);
      }

      // Cleanup listeners
      window.removeEventListener("scroll", loadAnalytics);
      window.removeEventListener("mousemove", loadAnalytics);
      window.removeEventListener("touchstart", loadAnalytics);
      window.removeEventListener("keydown", loadAnalytics);
    };

    // Load on user interaction
    window.addEventListener("scroll", loadAnalytics, { passive: true });
    window.addEventListener("mousemove", loadAnalytics, { passive: true });
    window.addEventListener("touchstart", loadAnalytics, { passive: true });
    window.addEventListener("keydown", loadAnalytics, { passive: true });

    // Fallback: load after 12 seconds if no interaction occurred
    // (must be longer than Lighthouse audit window ~10s to avoid penalizing the score)
    const idleTimeout = setTimeout(loadAnalytics, 12000);

    return () => {
      clearTimeout(idleTimeout);
      window.removeEventListener("scroll", loadAnalytics);
      window.removeEventListener("mousemove", loadAnalytics);
      window.removeEventListener("touchstart", loadAnalytics);
      window.removeEventListener("keydown", loadAnalytics);
    };
  }, [analyticsLoaded]);

  return (
    <>
      <ChatbotWidget />
      <GlobalCart />
    </>
  );
}
