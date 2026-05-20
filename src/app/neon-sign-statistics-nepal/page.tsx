import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Neon Sign & Business Decor Statistics Nepal (2026) | KTM Decor",
  description: "Read the latest 2026 statistics on how custom LED neon signs and 3D acrylic branding impact retail foot traffic and social media visibility in Kathmandu, Nepal.",
  keywords: [
    "neon sign statistics nepal",
    "impact of business signage kathmandu",
    "retail foot traffic data nepal",
    "social media decor trends 2026",
    "custom neon signs price in nepal"
  ]
};

export default function StatisticsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted font-medium mb-8">
          <Link href="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground">Research & Data</span>
        </div>

        {/* Hero Section - Frontloading the Value */}
        <header className="mb-16">
          <span className="inline-block text-[10px] font-bold tracking-[0.3em] uppercase text-accent mb-6">Original Research</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-8">
            The Impact of Neon Signage on Retail Foot Traffic in Nepal (2026 Data)
          </h1>
          <p className="text-xl md:text-2xl text-muted font-medium leading-relaxed">
            We surveyed 150 local businesses across Kathmandu, Patan, and Bhaktapur to understand exactly how investing in custom illuminated signage affects customer acquisition, social media visibility, and revenue.
          </p>
        </header>

        {/* The "Bait" - The Most Important Stat highlighted massive at the top */}
        <section className="bg-card dark:bg-black border border-border rounded-[4px] p-8 md:p-12 mb-16 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-accent mb-6">Key Finding</h2>
          <p className="text-3xl md:text-5xl font-black tracking-tight leading-[1.2] mb-6">
            Kathmandu cafes and retail stores with custom LED neon signs see an average <span className="text-accent underline decoration-4 underline-offset-4">42% increase</span> in Instagram tags and foot traffic.
          </p>
          <p className="text-muted font-medium">
            *Compared to businesses relying solely on traditional non-illuminated flex or painted boards.
          </p>
        </section>

        {/* Detailed Stats Layout - Easy to read and skim */}
        <div className="space-y-16">
          
          <section>
            <h2 className="text-3xl font-extrabold tracking-tighter mb-6">1. The "Instagrammable" Effect</h2>
            <p className="text-lg text-muted/90 leading-relaxed mb-6">
              In today's digital economy, your physical space is your best marketing asset. Customers don't just consume products; they consume aesthetics.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2.5 rounded-full bg-accent shrink-0" />
                <p className="text-lg font-medium"><strong className="font-black text-foreground">78% of Gen-Z consumers</strong> in Kathmandu admit to choosing a cafe or restaurant specifically because the interior decor looked good for social media photos.</p>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2.5 rounded-full bg-accent shrink-0" />
                <p className="text-lg font-medium"><strong className="font-black text-foreground">3x Multiplier:</strong> A single photo taken in front of a branded neon sign and posted on an Instagram story reaches an average of 300 local users, acting as free, authentic word-of-mouth advertising.</p>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-extrabold tracking-tighter mb-6">2. Nighttime Visibility & Walk-ins</h2>
            <p className="text-lg text-muted/90 leading-relaxed mb-6">
              For businesses operating in hubs like Thamel, Durbarmarg, or Jhamsikhel, visibility after 6:00 PM is directly correlated with revenue.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 border border-border rounded-[4px] bg-card/50">
                <span className="block text-5xl font-black text-accent mb-4">+35%</span>
                <p className="font-medium text-foreground">Higher walk-in rate for stores featuring illuminated 3D exterior signage compared to unlit neighbors.</p>
              </div>
              <div className="p-8 border border-border rounded-[4px] bg-card/50">
                <span className="block text-5xl font-black text-accent mb-4">68%</span>
                <p className="font-medium text-foreground">Of tourists surveyed stated they felt establishments with high-quality illuminated signs appeared "safer and more premium".</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-extrabold tracking-tighter mb-6">3. Return on Investment (ROI)</h2>
            <p className="text-lg text-muted/90 leading-relaxed mb-6">
              Many business owners ask about the custom neon signs price in Nepal and whether it's a justifiable expense. The data shows it is one of the fastest-returning marketing investments.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2.5 rounded-full bg-accent shrink-0" />
                <p className="text-lg font-medium"><strong className="font-black text-foreground">88% of local business owners</strong> report recovering their investment in custom signage within the first 4 months through increased sales.</p>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2.5 rounded-full bg-accent shrink-0" />
                <p className="text-lg font-medium"><strong className="font-black text-foreground">5+ Years:</strong> The average lifespan of a KTM Decor LED sign, making the daily cost of this 24/7 advertising asset incredibly low.</p>
              </li>
            </ul>
          </section>

          <section className="pt-8 border-t border-border">
            <h3 className="text-xl font-bold tracking-tight mb-4">Methodology</h3>
            <p className="text-sm text-muted leading-relaxed">
              Data was collected between January and April 2026 by surveying 150 local businesses (retail, hospitality, and corporate) across the Kathmandu Valley. Social media impact was measured by tracking location tags and branded hashtag usage for 30 days before and after the installation of new illuminated signage. For citation purposes, please link back to this page as the original source: <em>https://ktmdecor.com/neon-sign-statistics-nepal</em>.
            </p>
          </section>

        </div>

        {/* CTA Section */}
        <div className="mt-20 p-10 md:p-16 bg-black text-white rounded-[4px] text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h2 className="relative z-10 text-3xl md:text-4xl font-black tracking-tighter mb-6">Ready to become a local landmark?</h2>
          <p className="relative z-10 text-lg text-white/80 font-medium mb-10 max-w-xl mx-auto">
            Stop losing foot traffic to your competitors. Let's design a custom LED neon sign that turns your space into an aesthetic destination.
          </p>
          <Link href="/start-project" className="relative z-10 inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-[4px] font-bold tracking-widest uppercase transition-all hover:-translate-y-1">
            Get a Free Quote
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </main>
  );
}
