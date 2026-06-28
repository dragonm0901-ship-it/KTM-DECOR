import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import Expertise from "@/components/Expertise";
import About from "@/components/About";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import BeforeAfter from "@/components/BeforeAfter";
import Testimonials from "@/components/Testimonials";
import CtaFaq from "@/components/CtaFaq";
import LocationMap from "@/components/LocationMap";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://ktmdecor.com/#localbusiness",
        "name": "KTM DECOR",
        "image": "https://ktmdecor.com/images/ktm-decor-og.png",
        "url": "https://ktmdecor.com",
        "telephone": "+9779706247439",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Kathmandu Factory & Workshop",
          "addressLocality": "Kathmandu",
          "postalCode": "44600",
          "addressCountry": "NP"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 27.7172,
          "longitude": 85.324
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
        "@id": "https://ktmdecor.com/#faq",
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
        <Expertise />
        <Services />
        <HowItWorks />
        <BeforeAfter />
        <About />
        <Testimonials />
        <CtaFaq />
        <LocationMap />
      </main>
    </>
  );
}
