import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Sparkles, Tag } from "lucide-react";
import { GUIDES } from "@/data/guides-data";

export const metadata: Metadata = {
  title: "Nepal Signage & LED Neon Buying Guides (2026 Price Lists) | KTM DECOR",
  description:
    "In-depth pricing guides, design advice, and material comparisons for custom LED neon lights, 3D acrylic signage boards, and nameplates in Kathmandu, Nepal.",
  keywords: [
    "led neon light price in nepal",
    "neon light price in nepal daraz",
    "light board price in nepal",
    "3d acrylic board price in nepal",
    "name plate design in nepal with price",
    "home decor kathmandu online"
  ],
  alternates: {
    canonical: "/decor-guides",
  },
  openGraph: {
    title: "Nepal Signage & LED Neon Buying Guides (2026 Price Lists) | KTM DECOR",
    description:
      "In-depth pricing guides, design advice, and material comparisons for custom LED neon lights, 3D acrylic signage boards, and nameplates in Kathmandu, Nepal.",
    url: "https://www.decorktm.com/decor-guides",
    type: "website",
    siteName: "KTM DECOR",
    images: [
      {
        url: "/images/ktm-decor-og.png",
        width: 1200,
        height: 1200,
        alt: "Nepal Signage & LED Neon Buying Guides | KTM DECOR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nepal Signage & LED Neon Buying Guides (2026 Price Lists) | KTM DECOR",
    description:
      "In-depth pricing guides, design advice, and material comparisons for custom LED neon lights, 3D acrylic signage boards, and nameplates in Kathmandu, Nepal.",
    images: ["/images/ktm-decor-og.png"],
  },
};

export default function GuidesIndexPage() {
  const guidesSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://www.decorktm.com/decor-guides#webpage",
        "url": "https://www.decorktm.com/decor-guides",
        "name": "Nepal Signage & Decor Resource Hub",
        "description": "Comprehensive buying guides, pricing breakdowns, and material specifications for custom signage in Nepal.",
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://www.decorktm.com/#website",
          "name": "KTM DECOR",
          "url": "https://www.decorktm.com"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://www.decorktm.com/decor-guides#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.decorktm.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Decor Guides",
            "item": "https://www.decorktm.com/decor-guides"
          }
        ]
      },
      {
        "@type": "ItemList",
        "@id": "https://www.decorktm.com/decor-guides#itemlist",
        "name": "Signage & Decor Buying Guides",
        "itemListElement": GUIDES.map((guide, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `https://www.decorktm.com/decor-guides/${guide.slug}`,
          "name": guide.title
        }))
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guidesSchema) }}
      />
      <main className="min-h-screen bg-background text-foreground pt-32 pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted font-medium mb-8">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground">Decor & Signage Guides</span>
        </div>

        {/* Header Hero Section */}
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-accent mb-4">
            <BookOpen className="w-4 h-4" /> Comprehensive Buying Guides
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6">
            Nepal Signage & Decor Resource Hub
          </h1>
          <p className="text-xl text-muted font-medium max-w-2xl leading-relaxed">
            Everything you need to know about pricing, materials, outdoor durability, and custom design options for LED neon signs, 3D display boards, nameplates, and home decor items in Kathmandu.
          </p>
        </header>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {GUIDES.map((guide) => (
            <article
              key={guide.slug}
              className="bg-card border border-border rounded-[4px] p-6 sm:p-8 flex flex-col justify-between hover:border-accent transition-all hover:shadow-lg group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded-full text-[11px] font-bold uppercase tracking-wider">
                    <Tag className="w-3 h-3" />
                    {guide.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {guide.readTime}
                  </span>
                </div>

                <h2 className="text-xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors mb-3 leading-snug">
                  <Link href={`/decor-guides/${guide.slug}`}>
                    {guide.title}
                  </Link>
                </h2>

                <p className="text-muted text-sm leading-relaxed mb-6 line-clamp-3">
                  {guide.summary}
                </p>
              </div>

              <div>
                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-xs text-muted font-semibold">
                    {guide.keywords.length} Target Keywords
                  </span>
                  <Link
                    href={`/decor-guides/${guide.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent group-hover:translate-x-1 transition-transform"
                  >
                    Read Guide
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Custom Order Callout */}
        <div className="mt-20 p-8 sm:p-12 bg-black text-white rounded-[4px] text-center shadow-xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-accent mb-4">
            <Sparkles className="w-4 h-4" /> Need Immediate Custom Quotes?
          </span>
          <h2 className="text-3xl font-black tracking-tight mb-4">
            Can't find the exact size or specification you need?
          </h2>
          <p className="text-white/80 text-base max-w-xl mx-auto mb-8">
            Send us your logo or artwork file for a fast, free estimate and 3D mockup within 24 hours.
          </p>
          <Link
            href="/start-project"
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-3.5 rounded-[4px] font-bold uppercase tracking-widest text-sm transition-transform hover:-translate-y-0.5"
          >
            Get Free Custom Mockup
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </main>
    </>
  );
}
