import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, AlertCircle, RefreshCw, Truck, Clock, CheckCircle2, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Return & Refund Policy — KTM DECOR Signage & Decor Nepal",
  description:
    "Official Return, Refund, Damage Replacement, and 1-Year Warranty Policy for custom LED neon signs, 3D acrylic signboards, and architectural decor by KTM DECOR in Kathmandu, Nepal.",
  alternates: {
    canonical: "https://decorktm.com/return-policy",
  },
  openGraph: {
    title: "Return & Refund Policy — KTM DECOR Nepal",
    description:
      "Official Return, Refund, Transit Damage Guarantee, and 1-Year Warranty Policy for custom LED neon signs and illuminated business signboards.",
    url: "https://decorktm.com/return-policy",
    type: "website",
    siteName: "KTM DECOR",
  },
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-28 pb-24 font-sans">
      {/* Top Bar Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-base font-black tracking-tighter uppercase text-accent hover:opacity-80 transition-opacity"
          >
            KTM DECOR
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/terms-of-service"
              className="text-xs font-semibold text-muted hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy-policy"
              className="text-xs font-semibold text-muted hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/shop"
              className="px-3.5 py-1.5 bg-accent text-white text-xs font-bold rounded-[4px] hover:bg-accent/90 transition-colors uppercase tracking-wider"
            >
              Shop Catalog
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted font-medium mb-8">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground">Return & Refund Policy</span>
        </nav>

        {/* Page Title Header */}
        <div className="mb-12 border-b border-border/60 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/30 text-accent rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Industry Standard Signage Policy
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
            Return & Refund Policy
          </h1>
          <p className="text-muted text-base sm:text-lg leading-relaxed font-medium">
            At KTM DECOR, we take immense pride in crafting premium LED neon signs, 3D acrylic light boards, address nameplates, and architectural signage at our Balkot workshop in Bhaktapur, Nepal. Our policies strictly adhere to international custom signcrafting standards.
          </p>
        </div>

        {/* Quick Highlights Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          <div className="p-5 border border-border bg-card rounded-[4px]">
            <div className="flex items-center gap-3 mb-2 text-red-500 font-bold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Custom Signage Policy</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Custom LED neon signs, 3D logo signboards, and personalized nameplates are non-refundable once production/laser cutting has commenced.
            </p>
          </div>

          <div className="p-5 border border-border bg-card rounded-[4px]">
            <div className="flex items-center gap-3 mb-2 text-accent font-bold text-sm">
              <Clock className="w-5 h-5 shrink-0" />
              <span>24-Hour Cancellation</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Orders can be cancelled for a full refund within 24 hours of placement if physical fabrication has not started.
            </p>
          </div>

          <div className="p-5 border border-border bg-card rounded-[4px]">
            <div className="flex items-center gap-3 mb-2 text-emerald-500 font-bold text-sm">
              <Truck className="w-5 h-5 shrink-0" />
              <span>Transit Damage Guarantee</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Report courier transit damage within 48 hours with photos/videos for 100% free component or sign replacement.
            </p>
          </div>

          <div className="p-5 border border-border bg-card rounded-[4px]">
            <div className="flex items-center gap-3 mb-2 text-blue-500 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>12-Month Electrical Warranty</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              All power supply adapters, LED neon flex strips, and dimmers are covered by a 1-Year repair/replacement warranty.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12 text-muted text-base leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground border-l-4 border-accent pl-4 py-0.5 flex items-center gap-2">
              1. Custom & Bespoke Products (Strict Rule)
            </h2>
            <p>
              Due to the custom nature of our signcrafting operations, all products manufactured to client specifications (including custom text neon signs, company logo 3D signboards, custom dimension acrylic displays, and engraved nameplates) are <strong>strictly non-refundable and non-returnable</strong> once design proof approval has been granted and production has commenced.
            </p>
            <div className="p-4 bg-muted/20 border-l-2 border-accent text-xs sm:text-sm text-foreground rounded-r-[4px]">
              <strong>Why?</strong> Custom signage is handcrafted specifically with your brand name, chosen fonts, exact acrylic cutouts, and custom color choices, making them impossible to restock or resell to another buyer.
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground border-l-4 border-accent pl-4 py-0.5">
              2. Order Cancellations & Modifications
            </h2>
            <ul className="space-y-3 pl-1">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span><strong>Pre-Production Cancellations:</strong> You may cancel your order for a full 100% refund within 24 hours of order placement, provided vector design work or laser cutting has not begun.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span><strong>Design Phase Cancellations:</strong> If you cancel after custom 3D digital mockups have been generated but before physical production starts, a 10% design fee will be deducted from your refund.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span><strong>Post-Production Release:</strong> Once materials are laser-cut or assembled at our Balkot factory, no cancellations or modifications can be accepted.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground border-l-4 border-accent pl-4 py-0.5">
              3. Transit Damage Guarantee (48-Hour Claim Window)
            </h2>
            <p>
              LED neon signs and acrylic signboards are delicate electrical items shipped across Kathmandu Valley and nationwide Nepal. We package every order using reinforced protective padding and rigid shipping crates.
            </p>
            <p>
              In the rare event that your sign arrives damaged due to courier handling, <strong>KTM DECOR will replace or repair the damaged item at 100% zero additional cost to you</strong>, under the following strict conditions:
            </p>
            <div className="bg-card border border-border p-6 rounded-[4px] space-y-3 text-sm">
              <h4 className="font-bold text-foreground uppercase tracking-wider text-xs">Required Transit Claim Steps:</h4>
              <ol className="list-decimal pl-5 space-y-2 text-muted">
                <li>Inspect your package immediately upon delivery.</li>
                <li>Submit a claim within <strong>48 hours of delivery</strong> via email (<a href="mailto:ktmdecor2024@gmail.com" className="text-accent underline">ktmdecor2024@gmail.com</a>) or WhatsApp (<a href="https://wa.me/9779706247439" className="text-accent underline">+977 9706247439</a>).</li>
                <li>Provide clear photos/videos of:
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                    <li>The unboxing process & original outer shipping box condition.</li>
                    <li>The courier shipping label.</li>
                    <li>The specific damage on the acrylic backing, neon tube, or electrical connector.</li>
                  </ul>
                </li>
              </ol>
              <p className="text-xs text-muted italic pt-2">
                *Note: Claims submitted after 48 hours of courier delivery cannot be honored under courier damage liability rules.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground border-l-4 border-accent pl-4 py-0.5">
              4. 12-Month Electrical Warranty
            </h2>
            <p>
              All KTM DECOR indoor & outdoor LED neon signs and illuminated signboards carry a <strong>12-Month (1 Year) Limited Manufacturer Warranty</strong> covering electrical components starting from the date of purchase.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-[4px]">
                <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">What is Covered (100% Free Repair/Replacement):</h4>
                <ul className="space-y-1.5 text-muted">
                  <li>• Faulty 12V power supply adapters / transformers</li>
                  <li>• Defective inline dimmers and remote controllers</li>
                  <li>• Internal LED neon flex light strip failure</li>
                  <li>• Electrical wiring solder point defects</li>
                </ul>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-[4px]">
                <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">What is Excluded from Warranty:</h4>
                <ul className="space-y-1.5 text-muted">
                  <li>• Physical damage caused by drops, mis-handling, or improper DIY wall mounting</li>
                  <li>• Water/rain exposure on signs designated as Indoor-Only</li>
                  <li>• Electrical burnouts caused by high voltage power grid surges (use surge protectors)</li>
                  <li>• Unauthorized third-party repair attempts</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground border-l-4 border-accent pl-4 py-0.5">
              5. Standard (Non-Custom) Product Returns
            </h2>
            <p>
              For standard, ready-to-ship non-custom stock decor items purchased directly from our shop catalog:
            </p>
            <ul className="space-y-2.5 pl-1">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span>You may request a return within <strong>7 calendar days</strong> of receiving your item.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span>Items must be completely unused, undamaged, and returned in original factory packaging with all power cords, mounting screws, and dimmers included.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span>The customer is responsible for return shipping fees to our Balkot workshop. A 10% restocking fee applies to all approved standard returns.</span>
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground border-l-4 border-accent pl-4 py-0.5">
              6. Refund Method & Processing Timelines
            </h2>
            <p>
              Once your returned non-custom item or cancelled pre-production order is inspected and approved:
            </p>
            <ul className="space-y-2 pl-1">
              <li className="flex items-start gap-2">
                <RefreshCw className="w-4 h-4 text-accent shrink-0 mt-1" />
                <span>Refunds will be processed back to your original payment method (eSewa, Khalti, Bank Transfer, or Card).</span>
              </li>
              <li className="flex items-start gap-2">
                <RefreshCw className="w-4 h-4 text-accent shrink-0 mt-1" />
                <span>Please allow <strong>5 to 7 business days</strong> for the funds to reflect in your digital wallet or bank account.</span>
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="p-6 bg-card border border-border rounded-[4px] space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" /> Need Assistance or Have Questions?
            </h3>
            <p className="text-sm text-muted">
              For return inquiries, warranty claims, or transit damage reports, contact our dedicated support team:
            </p>
            <div className="text-sm font-medium text-foreground space-y-1">
              <p>📍 <strong>Workshop:</strong> KTM DECOR Pvt Ltd, Balkot, Bhaktapur, Nepal</p>
              <p>📧 <strong>Email:</strong> <a href="mailto:ktmdecor2024@gmail.com" className="text-accent underline">ktmdecor2024@gmail.com</a></p>
              <p>📞 <strong>Phone / WhatsApp:</strong> <a href="tel:+9779706247439" className="text-accent underline">+977 9706247439</a></p>
              <p>🕒 <strong>Support Hours:</strong> Sunday – Friday, 9:00 AM – 6:00 PM NPT</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
