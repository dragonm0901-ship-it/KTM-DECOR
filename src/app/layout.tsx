import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Dancing_Script, Monoton, Montserrat, Playfair_Display, Pacifico } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import SmoothScroll from "@/components/SmoothScroll";
import { ClientProviders } from "@/components/ClientProviders";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
  weight: ["700"],
});

const monoton = Monoton({
  subsets: ["latin"],
  variable: "--font-monoton",
  display: "swap",
  weight: ["400"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["800", "900"],
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
  style: ["italic"],
  weight: ["700"],
});

const pacifico = Pacifico({
  subsets: ["latin"],
  variable: "--font-pacifico",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.decorktm.com"),
  alternates: {
    canonical: "./",
  },
  title: "KTM DECOR | Premium Custom Neon Signs & Signcrafting in Nepal",
  description:
    "Elevate your space and brand with Nepal's leading custom signcrafting workshop. Meticulously handcrafted LED neon signs, 3D backlit signage, elegant nameplates, and bespoke architectural decor.",
  keywords: [
    "custom neon signs price in nepal",
    "led light board makers in kathmandu",
    "3d acrylic letter board nepal",
    "buy neon signs online ktm",
    "office wall branding decor nepal"
  ],
  icons: {
    icon: [
      { url: "/logo/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/logo/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/logo/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo/favicon-96x96.png",
    apple: [
      { url: "/logo/favicon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/logo/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    title: "KTM DECOR | Premium Custom Neon Signs & Signcrafting in Nepal",
    description:
      "Elevate your space and brand with Nepal's leading custom signcrafting workshop. Meticulously handcrafted LED neon signs, 3D backlit signage, elegant nameplates, and bespoke architectural decor.",
    type: "website",
    url: "https://www.decorktm.com",
    siteName: "KTM DECOR",
    images: [
      {
        url: "/images/ktm-decor-og.png",
        width: 1200,
        height: 1200,
        alt: "KTM DECOR | Premium Custom Neon Signs & Signcrafting in Nepal",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KTM DECOR | Premium Custom Neon Signs & Signcrafting in Nepal",
    description:
      "Elevate your space and brand with Nepal's leading custom signcrafting workshop. Meticulously handcrafted LED neon signs, 3D backlit signage, elegant nameplates, and bespoke architectural decor.",
    images: ["/images/ktm-decor-og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
 }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to GTM and GA for faster script initialization */}
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        {/* Analytics loaded dynamically on interaction in ClientProviders */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const removeAttr = () => {
                  if (document.body && document.body.hasAttribute('data-demoway-document-id')) {
                    document.body.removeAttribute('data-demoway-document-id');
                  }
                };
                removeAttr();
                const observer = new MutationObserver((mutations) => {
                  for (const mutation of mutations) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-demoway-document-id') {
                      removeAttr();
                    }
                  }
                });
                observer.observe(document.documentElement, { attributes: true, subtree: true });
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${dancingScript.variable} ${monoton.variable} ${montserrat.variable} ${playfairDisplay.variable} ${pacifico.variable} font-sans`} suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W5S6ZTQC"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <ThemeProvider>
          <SmoothScroll>
            <Header />
            {children}
            <Footer />
            <CookieConsent />
            <ClientProviders />
            <Analytics />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
