import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, ShoppingBag, Sparkles, Tag } from "lucide-react";
import { GUIDES } from "@/data/guides-data";
import { PRODUCTS } from "@/data/shop-data";
import VideoEmbed from "@/components/VideoEmbed";
import CostCalculatorWidget from "@/components/CostCalculatorWidget";

export async function generateStaticParams() {
  return GUIDES.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const guide = GUIDES.find((g) => g.slug === resolvedParams.slug);

  if (!guide) {
    return {
      title: "Guide Not Found | KTM DECOR",
    };
  }

  const canonicalUrl = `https://www.decorktm.com/decor-guides/${guide.slug}`;

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    keywords: guide.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url: canonicalUrl,
      type: "article",
      siteName: "KTM DECOR",
      images: [
        {
          url: "/images/ktm-decor-og.png",
          width: 1200,
          height: 1200,
          alt: guide.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.metaTitle,
      description: guide.metaDescription,
      images: ["/images/ktm-decor-og.png"],
    },
  };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const guide = GUIDES.find((g) => g.slug === resolvedParams.slug);

  if (!guide) {
    notFound();
  }

  // Related products
  const relatedProducts = PRODUCTS.filter((p) =>
    guide.relatedProductIds.includes(p.id)
  );

  // JSON-LD Schemas (Article + FAQPage)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `https://www.decorktm.com/decor-guides/${guide.slug}#article`,
        "headline": guide.title,
        "description": guide.metaDescription,
        "datePublished": guide.publishDate,
        "dateModified": guide.updatedDate,
        "author": {
          "@type": "Organization",
          "name": "KTM DECOR",
          "url": "https://www.decorktm.com"
        },
        "publisher": {
          "@type": "Organization",
          "name": "KTM DECOR",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.decorktm.com/logo/ktm%20decor.svg"
          }
        },
        "mainEntityOfPage": `https://www.decorktm.com/decor-guides/${guide.slug}`
      },
      ...(guide.faqs && guide.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              "@id": `https://www.decorktm.com/decor-guides/${guide.slug}#faq`,
              "mainEntity": guide.faqs.map((faq) => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-background text-foreground pt-32 pb-24 font-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs md:text-sm text-muted font-medium mb-8">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <span>/</span>
            <Link href="/decor-guides" className="hover:text-accent transition-colors">Decor Guides</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px] sm:max-w-none">{guide.title}</span>
          </nav>

          {/* Article Header */}
          <header className="mb-12 border-b border-border/40 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/30 text-accent rounded-full text-xs font-bold uppercase tracking-wider">
                <Tag className="w-3 h-3" />
                {guide.category}
              </span>
              <span className="text-xs text-muted font-medium">
                {guide.readTime} • Updated July 2026
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] mb-6">
              {guide.title}
            </h1>

            <p className="text-lg sm:text-xl text-muted leading-relaxed font-medium">
              {guide.summary}
            </p>
          </header>

          {/* Main Article Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none space-y-12">
            {guide.sections.map((section, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground border-l-4 border-accent pl-4 py-0.5">
                  {section.title}
                </h2>
                
                <p className="text-muted/90 text-base sm:text-lg leading-relaxed">
                  {section.content}
                </p>

                {/* Table Rendering */}
                {section.tableData && (
                  <div className="overflow-x-auto my-6 border border-border rounded-[4px] bg-card shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/10 border-b border-border text-foreground font-bold uppercase tracking-wider text-xs">
                        <tr>
                          {section.tableData.headers.map((h, i) => (
                            <th key={i} className="p-3.5 sm:p-4">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {section.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-card/70 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className={`p-3.5 sm:p-4 ${cIdx === 0 ? "font-bold text-foreground" : "text-muted"}`}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Bullet Points Rendering */}
                {section.bulletPoints && section.bulletPoints.length > 0 && (
                  <ul className="space-y-3 my-4 pl-1">
                    {section.bulletPoints.map((bp, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-3 text-base text-muted/90">
                        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>

          {/* Video SEO Demonstration */}
          <VideoEmbed
            title={`Workshop Crafting & Quality Guide: ${guide.title}`}
            description={`Watch how KTM DECOR crafts custom LED neon signs and illuminated 3D signboards at our Balkot workshop in Kathmandu, Nepal.`}
            thumbnailUrl="/products/product_5_main.png"
            uploadDate={guide.updatedDate || "2026-07-20"}
            caption="Verified KTM DECOR Balkot Workshop Fabrication"
          />

          {/* Interactive Cost Estimator Widget */}
          <CostCalculatorWidget />

          {/* Keywords Tag Cloud Section (SEO indexing signal) */}
          <div className="mt-12 p-6 bg-card border border-border rounded-[4px]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Popular Search Keywords in Nepal:</h3>
            <div className="flex flex-wrap gap-2">
              {guide.keywords.map((kw, i) => (
                <span key={i} className="text-xs px-2.5 py-1 bg-background border border-border/80 text-muted/90 rounded-sm">
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          {/* Related Products Showcase */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-border/40">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-5 h-5 text-accent" />
                <h3 className="text-2xl font-bold tracking-tight">Explore Related Signage Products</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${product.id}`}
                    className="group border border-border bg-card p-4 rounded-[4px] hover:border-accent transition-all hover:shadow-md flex flex-col"
                  >
                    <div className="aspect-square relative mb-3 bg-muted/10 overflow-hidden rounded-[2px]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs text-accent font-extrabold mt-1">
                      From NPR {product.price.toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Accordion Section */}
          {guide.faqs && guide.faqs.length > 0 && (
            <section className="mt-16 pt-12 border-t border-border/40">
              <div className="flex items-center gap-2 mb-8">
                <HelpCircle className="w-5 h-5 text-accent" />
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h3>
              </div>
              <div className="space-y-4">
                {guide.faqs.map((faq, fIdx) => (
                  <div key={fIdx} className="p-6 border border-border bg-card/60 rounded-[4px]">
                    <h4 className="text-lg font-bold text-foreground mb-2">{faq.question}</h4>
                    <p className="text-muted text-base leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA Banner */}
          <div className="mt-20 p-8 sm:p-12 bg-black text-white rounded-[4px] text-center shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-accent mb-4">
                <Sparkles className="w-4 h-4" /> Custom Order Studio
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
                Ready to Order Custom Signage in Kathmandu?
              </h2>
              <p className="text-white/80 text-base mb-8">
                Get a free digital 3D mockup and direct factory pricing for your custom LED neon sign, 3D signboard, or custom nameplate.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/start-project"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-3.5 rounded-[4px] font-bold uppercase tracking-wider text-sm transition-transform hover:-translate-y-0.5"
                >
                  Start Custom Project
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-[4px] font-bold uppercase tracking-wider text-sm transition-colors"
                >
                  Browse Shop Catalog
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
