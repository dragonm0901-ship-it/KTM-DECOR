import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import SmoothScroll from "@/components/SmoothScroll";
import ChatbotWidget from "@/components/ChatbotWidget";
import GlobalCart from "@/components/GlobalCart";

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

export const metadata: Metadata = {
  title: "KTM DECOR | Custom LED Neon Signs & 3D Light Boards in Nepal",
  description:
    "Looking for the best custom LED neon signs, 3D acrylic letters, and premium light boards in Nepal? KTM Decor crafts high-quality, affordable business signage and home decor.",
  keywords: [
    "custom neon signs price in nepal",
    "led light board makers in kathmandu",
    "3d acrylic letter board nepal",
    "buy neon signs online ktm",
    "office wall branding decor nepal"
  ],
  openGraph: {
    title: "KTM DECOR | Custom LED Neon Signs & 3D Light Boards in Kathmandu",
    description:
      "Looking for the best custom LED neon signs, 3D acrylic letters, and premium light boards in Kathmandu, Nepal? KTM Decor crafts high-quality, affordable business signage and home decor.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
 }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <ThemeProvider>
          <SmoothScroll>
            <Header />
            {children}
            <Footer />
            <CookieConsent />
            <ChatbotWidget />
            <GlobalCart />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
