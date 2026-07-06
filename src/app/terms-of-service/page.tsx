import Link from "next/link";

export const metadata = {
  title: "Terms of Service — KTM DECOR",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen">
      <header className="px-6 py-4 border-b border-border">
        <div className="w-full flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-bold tracking-tight hover:opacity-60 transition-opacity uppercase text-accent"
          >
            KTM DECOR
          </Link>
          <Link
            href="/shop"
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-[4px] hover:opacity-80 transition-opacity"
          >
            Shop Now
          </Link>
        </div>
      </header>

      <main className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-medium tracking-tight mb-12">
            Terms of Service
          </h1>

          <div className="space-y-8 text-lg opacity-80">
            <p>
              These Terms of Service govern your use of the KTM DECOR website,
              custom design services, and custom physical products. By accessing or using our services,
              you agree to be bound by these terms.
            </p>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                Custom Orders & Fabrication
              </h2>
              <p>
                Each neon sign, dimensional lettering, and name plate is hand-crafted and custom-made
                to order. Production begins only after design mockup approval and deposit payment.
                Once fabrication has commenced, custom orders cannot be cancelled or refunded.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                Installation & Site Conditions
              </h2>
              <p>
                For orders that include professional installation, the client must ensure that the
                installation site is clear and has active power outlets. Any structural limitations
                or specific requirements must be disclosed during the design phase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                Intellectual Property
              </h2>
              <p>
                All final physical assets delivered to you are yours to own and display. KTM DECOR
                retains the right to use photos of the final products and design mockups for promotional
                purposes (such as our online portfolio) unless otherwise agreed upon in writing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, KTM DECOR shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages arising out of or relating to your use of our
                products or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                Changes to Terms
              </h2>
              <p>
                We may revise these terms from time to time to reflect changes in our fabrication
                techniques, material costs, or business operations. The most current version will
                always be posted on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                Contact Us
              </h2>
              <p>
                If you have any questions about these Terms, please contact us
                at hello@ktmdecor.com.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
