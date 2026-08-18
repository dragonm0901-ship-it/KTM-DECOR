import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  Zap, 
  Building2,
  Share2
} from "lucide-react";
import { PSEO_SERVICES, PSEO_LOCATIONS } from "@/data/pseo-locations-data";
import { PRODUCTS } from "@/data/shop-data";

export async function generateStaticParams() {
  const params: { service: string; location: string }[] = [];
  for (const s of PSEO_SERVICES) {
    for (const l of PSEO_LOCATIONS) {
      params.push({
        service: s.slug,
        location: l.slug,
      });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string; location: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const service = PSEO_SERVICES.find((s) => s.slug === resolved.service);
  const location = PSEO_LOCATIONS.find((l) => l.slug === resolved.location);

  if (!service || !location) {
    return {
      title: "Service Not Found | KTM DECOR",
    };
  }

  const title = service.metaTitleTemplate.replace("{location}", location.name);
  const description = service.metaDescriptionTemplate.replace("{location}", location.name);
  const canonicalUrl = `https://www.decorktm.com/services/${service.slug}/${location.slug}`;

  return {
    title,
    description,
    keywords: [
      `${service.shortName.toLowerCase()} in ${location.name.toLowerCase()}`,
      `${service.name.toLowerCase()} price in ${location.district.toLowerCase()}`,
      `custom signboards in ${location.name.toLowerCase()}`,
      `neon light makers near ${location.name.toLowerCase()}`,
      `best signage workshop in nepal`
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "KTM DECOR",
      images: [
        {
          url: "/images/ktm-decor-og.png",
          width: 1200,
          height: 1200,
          alt: `${service.name} in ${location.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/ktm-decor-og.png"],
    },
  };
}

export default async function PseoServiceLocationPage({
  params,
}: {
  params: Promise<{ service: string; location: string }>;
}) {
  const resolved = await params;
  const service = PSEO_SERVICES.find((s) => s.slug === resolved.service);
  const location = PSEO_LOCATIONS.find((l) => l.slug === resolved.location);

  if (!service || !location) {
    notFound();
  }

  // Related products from shop
  const sampleProducts = PRODUCTS.slice(0, 3);

  // Other locations for mesh linking
  const otherLocations = PSEO_LOCATIONS.filter((l) => l.slug !== location.slug).slice(0, 6);
  const otherServices = PSEO_SERVICES.filter((s) => s.slug !== service.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
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
            "name": service.name,
            "item": `https://www.decorktm.com/services/${service.slug}/${location.slug}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": location.name,
            "item": `https://www.decorktm.com/services/${service.slug}/${location.slug}`
          }
        ]
      },
      {
        "@type": "Service",
        "@id": `https://www.decorktm.com/services/${service.slug}/${location.slug}#service`,
        "name": `${service.name} in ${location.name}`,
        "serviceType": service.name,
        "description": service.description,
        "provider": {
          "@type": "LocalBusiness",
          "name": "KTM DECOR",
          "telephone": "+9779706247439",
          "url": "https://www.decorktm.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Balkot Workshop",
            "addressLocality": "Bhaktapur",
            "postalCode": "44800",
            "addressCountry": "NP"
          }
        },
        "areaServed": {
          "@type": "AdministrativeArea",
          "name": location.name,
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": location.latitude,
            "longitude": location.longitude
          }
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "NPR",
          "price": service.priceStartingNpr,
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": service.priceStartingNpr,
            "priceCurrency": "NPR",
            "unitText": service.priceUnit
          }
        }
      },
      {
        "@type": "FAQPage",
        "@id": `https://www.decorktm.com/services/${service.slug}/${location.slug}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": `How long does delivery of ${service.name} take to ${location.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Production takes ${service.turnaroundTime}, followed by ${location.deliveryTime} delivery directly to your doorstep in ${location.name}.`
            }
          },
          {
            "@type": "Question",
            "name": `What is the starting price for ${service.name} in ${location.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Prices start at NPR ${service.priceStartingNpr.toLocaleString()} ${service.priceUnit}. Final costs depend on custom dimensions, font complexity, and outdoor weatherproofing specifications.`
            }
          },
          {
            "@type": "Question",
            "name": `Can I receive a 3D design mockup before placing an order in ${location.name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Yes! KTM DECOR provides a free 3D digital design preview with scaled dimensions and color illumination options before any fabrication begins.`
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
      <main className="min-h-screen bg-background text-foreground pt-32 pb-24 font-sans">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
          
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs md:text-sm text-muted font-medium mb-8">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <span>/</span>
            <span className="text-muted">{service.shortName}</span>
            <span>/</span>
            <span className="text-foreground font-semibold truncate">{location.name}</span>
          </nav>

          {/* Hero Header */}
          <header className="mb-12 border-b border-border/40 pb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/30 text-accent rounded-full text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3 h-3" />
                {location.name}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted/10 border border-border text-foreground rounded-full text-xs font-semibold">
                <Truck className="w-3 h-3 text-accent" />
                {location.deliveryTime}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] mb-6">
              {service.heroHeadline} <span className="text-accent underline decoration-4 underline-offset-4">{location.name}</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted font-medium leading-relaxed max-w-3xl">
              {location.localIntro}
            </p>
          </header>

          {/* Value Highlights Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16">
            <div className="p-6 bg-card border border-border rounded-[4px] shadow-sm">
              <div className="w-10 h-10 rounded-[4px] bg-accent/10 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-bold text-base mb-1">Direct Factory Pricing</h3>
              <p className="text-xs text-muted leading-relaxed">
                Starting from <strong className="text-foreground font-black">NPR {service.priceStartingNpr.toLocaleString()}</strong> {service.priceUnit}. No middleman markups.
              </p>
            </div>

            <div className="p-6 bg-card border border-border rounded-[4px] shadow-sm">
              <div className="w-10 h-10 rounded-[4px] bg-accent/10 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-bold text-base mb-1">Fast Turnaround</h3>
              <p className="text-xs text-muted leading-relaxed">
                Fabricated in {service.turnaroundTime} with priority shipping to {location.name}.
              </p>
            </div>

            <div className="p-6 bg-card border border-border rounded-[4px] shadow-sm sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 rounded-[4px] bg-accent/10 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-bold text-base mb-1">1-Year Warranty</h3>
              <p className="text-xs text-muted leading-relaxed">
                Full coverage on LED modules, transformers, and acrylic fabrication integrity.
              </p>
            </div>
          </section>

          {/* Service Detailed Specs & Use Cases */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 bg-card border border-border rounded-[4px]">
              <h3 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" /> Why Businesses in {location.name} Choose Us
              </h3>
              <ul className="space-y-3">
                {service.keyBenefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-muted">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 bg-card border border-border rounded-[4px]">
              <h3 className="text-xl font-black tracking-tight mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-accent" /> Popular Applications in {location.name}
              </h3>
              <ul className="space-y-3">
                {service.popularUseCases.map((useCase, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-muted">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground">{useCase}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-border/60 text-xs text-muted">
                <span className="font-bold text-foreground">Local Landmarks & Service Hubs:</span> {location.landmarkReference}.
              </div>
            </div>
          </section>

          {/* Local Featured Samples */}
          <section className="mb-16">
            <h3 className="text-2xl font-black tracking-tight mb-6">
              Popular Custom Works Ready for {location.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {sampleProducts.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/shop/${prod.id}`}
                  className="group border border-border bg-card p-4 rounded-[4px] hover:border-accent transition-all hover:shadow-md flex flex-col"
                >
                  <div className="aspect-square relative mb-3 bg-muted/10 overflow-hidden rounded-[2px]">
                    <img
                      src={prod.image}
                      alt={`${prod.name} for ${location.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                    {prod.name}
                  </h4>
                  <p className="text-xs text-accent font-extrabold mt-1">
                    From NPR {prod.price.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16 pt-12 border-t border-border/40">
            <div className="flex items-center gap-2 mb-8">
              <HelpCircle className="w-5 h-5 text-accent" />
              <h3 className="text-2xl font-black tracking-tight">
                Frequently Asked Questions ({location.name})
              </h3>
            </div>
            <div className="space-y-4">
              <div className="p-6 border border-border bg-card/60 rounded-[4px]">
                <h4 className="text-base font-bold text-foreground mb-2">
                  How does delivery and installation work in {location.name}?
                </h4>
                <p className="text-sm text-muted leading-relaxed">
                  For {location.name}, we provide {location.deliveryTime}. Across Kathmandu Valley hubs, our technicians can also handle on-site electrical wiring and wall mounting. For outer cities, we ship via secure express courier with a complete mounting kit and guide.
                </p>
              </div>

              <div className="p-6 border border-border bg-card/60 rounded-[4px]">
                <h4 className="text-base font-bold text-foreground mb-2">
                  What is the estimated cost of {service.name} in {location.name}?
                </h4>
                <p className="text-sm text-muted leading-relaxed">
                  Our baseline price for {service.name} starts at NPR {service.priceStartingNpr.toLocaleString()} {service.priceUnit}. Send us your design or size requirements on WhatsApp (+977 9706247439) for an immediate exact quote.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action Bar */}
          <div className="p-8 sm:p-12 bg-black text-white rounded-[4px] text-center shadow-2xl relative overflow-hidden mb-16">
            <div className="relative z-10 max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-accent mb-4">
                <Sparkles className="w-4 h-4" /> Ready for {location.name}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">
                Order Your {service.shortName} in {location.name}
              </h2>
              <p className="text-white/80 text-sm sm:text-base mb-8">
                Get a free 3D digital mockup, exact size pricing, and professional installation details today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/start-project"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-3.5 rounded-[4px] font-bold uppercase tracking-wider text-xs transition-transform hover:-translate-y-0.5"
                >
                  Start Custom Project
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={`https://wa.me/9779706247439?text=${encodeURIComponent(
                    `Hello KTM DECOR, I would like to inquire about ${service.name} for my space in ${location.name}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-[4px] font-bold uppercase tracking-wider text-xs transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  WhatsApp Direct
                </a>
              </div>
            </div>
          </div>

          {/* Cross-linking Mesh for SEO Crawlers */}
          <div className="pt-12 border-t border-border/40 space-y-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
                {service.name} in Other Nepal Hubs:
              </h4>
              <div className="flex flex-wrap gap-2">
                {otherLocations.map((otherLoc) => (
                  <Link
                    key={otherLoc.slug}
                    href={`/services/${service.slug}/${otherLoc.slug}`}
                    className="text-xs px-3 py-1.5 bg-card hover:bg-card/80 border border-border text-muted hover:text-accent rounded-[2px] transition-colors"
                  >
                    {service.shortName} in {otherLoc.name}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
                Other Signage Services in {location.name}:
              </h4>
              <div className="flex flex-wrap gap-2">
                {otherServices.map((otherServ) => (
                  <Link
                    key={otherServ.slug}
                    href={`/services/${otherServ.slug}/${location.slug}`}
                    className="text-xs px-3 py-1.5 bg-card hover:bg-card/80 border border-border text-muted hover:text-accent rounded-[2px] transition-colors"
                  >
                    {otherServ.name} in {location.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
