import { Metadata } from "next";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Buy Custom LED Neon Signs & Light Boards in Nepal | KTM DECOR",
  description:
    "Explore KTM DECOR's catalog of premium custom LED neon signs, 3D acrylic light boards, corporate facade letterings, metal address plaques, and engraved wood signage in Kathmandu, Nepal.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Buy Custom LED Neon Signs & Light Boards in Nepal | KTM DECOR",
    description:
      "Explore KTM DECOR's catalog of premium custom LED neon signs, 3D acrylic light boards, corporate facade letterings, metal address plaques, and engraved wood signage in Kathmandu, Nepal.",
    url: "https://www.decorktm.com/shop",
    images: [
      {
        url: "/images/ktm-decor-og.png",
        width: 1200,
        height: 1200,
        alt: "KTM DECOR Shop - Premium Custom Signage in Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Custom LED Neon Signs & Light Boards in Nepal | KTM DECOR",
    description:
      "Explore KTM DECOR's catalog of premium custom LED neon signs, 3D acrylic light boards, corporate facade letterings, metal address plaques, and engraved wood signage in Kathmandu, Nepal.",
    images: ["/images/ktm-decor-og.png"],
  },
};

export default function ShopPage() {
  return <ShopClient />;
}
