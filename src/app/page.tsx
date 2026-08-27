import { Metadata } from "next";
import dynamic from "next/dynamic";
import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";

// Below-the-fold components: code-split to reduce initial JS bundle
const Expertise = dynamic(() => import("@/components/Expertise"));
const About = dynamic(() => import("@/components/About"));
const Services = dynamic(() => import("@/components/Services"));
const HowItWorks = dynamic(() => import("@/components/HowItWorks"));
const BeforeAfter = dynamic(() => import("@/components/BeforeAfter"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const CtaFaq = dynamic(() => import("@/components/CtaFaq"));
const LocationMap = dynamic(() => import("@/components/LocationMap"));

export const metadata: Metadata = {
  title: "KTM DECOR | Custom LED Neon Signs & 3D Signboards in Nepal",
  description:
    "Nepal's premium custom signcrafting studio. Meticulously handcrafted LED neon signs, 3D backlit storefront boards, residential nameplates, and bespoke business signage. Valley-wide delivery & professional installation.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://www.decorktm.com/#localbusiness",
        "name": "KTM DECOR",
        "image": "https://www.decorktm.com/images/ktm-decor-og.png",
        "url": "https://www.decorktm.com",
        "telephone": "+9779706247439",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Balkot Factory & Workshop",
          "addressLocality": "Bhaktapur",
          "postalCode": "44800",
          "addressCountry": "NP"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 27.6715,
          "longitude": 85.3702
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday"
            ],
            "opens": "09:00",
            "closes": "18:00"
          }
        ],
        "sameAs": [
          "https://www.facebook.com/people/KTM-Decor/61556839814576/#",
          "https://www.instagram.com/ktmdecor/",
          "https://www.tiktok.com/@ktm.decor"
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.decorktm.com/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What types of signs and boards do you make?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We create custom LED neon signs, illuminated light boards, 3D acrylic and metal letters, edge-lit display boards, and bespoke decorative installations for any space or occasion."
            }
          },
          {
            "@type": "Question",
            "name": "How long does a custom order take?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Typical turnaround is 5–10 business days depending on complexity. Simple neon signs can be ready in as little as 3 days, while large-scale 3D installations may take 2–3 weeks."
            }
          },
          {
            "@type": "Question",
            "name": "Can I see a mockup before production?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely. We provide a detailed digital mockup showing your design with exact colors, dimensions and placement context. Production only begins after your approval."
            }
          },
          {
            "@type": "Question",
            "name": "Do you handle delivery and installation?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. We offer professional delivery and installation across Kathmandu Valley. For locations outside the valley, we provide secure shipping with detailed installation guides."
            }
          },
          {
            "@type": "Question",
            "name": "What materials do you use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We use premium-grade LED flex neon tubing, laser-cut acrylic, brushed and powder-coated metals, sustainably sourced wood and high-quality electrical components for lasting durability."
            }
          },
          {
            "@type": "Question",
            "name": "Do you offer warranties?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. All our neon signs and light boards come with a 1-year warranty covering electrical components and fabrication. Extended warranties are available on request."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Preloader />
      <main>
        <Hero />
        <div className="defer-render"><Expertise /></div>
        <div className="defer-render"><Services /></div>
        <div className="defer-render"><HowItWorks /></div>
        <div className="defer-render"><BeforeAfter /></div>
        <div className="defer-render"><About /></div>
        <div className="defer-render"><Testimonials /></div>
        <div className="defer-render"><CtaFaq /></div>
        <div className="defer-render"><LocationMap /></div>
      </main>
    </>
  );
}
