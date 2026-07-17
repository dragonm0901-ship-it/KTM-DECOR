import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — KTM DECOR",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      <header className="px-6 py-4 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
            Privacy Policy
          </h1>

          <div className="space-y-8 text-lg opacity-80">
            <p>
              This Privacy Policy describes how KTM DECOR collects, uses, and
              shares your personal information when you use our website and
              services.
            </p>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                Information We Collect
              </h2>
              <p>
                We collect information you provide directly to us, such as when
                you customize a design, make a purchase, or contact us. This may
                include your name, email address, phone number, delivery address, and
                any reference images you upload.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                How We Use Your Information
              </h2>
              <p>
                We use the information we collect to design, manufacture, and deliver
                your custom neon signs, dimensional lettering, and name plates. We also
                use it to process payments, coordinate installations, and communicate
                with you about your projects.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                Sharing of Information
              </h2>
              <p>
                We do not sell your personal information. We only share information with
                necessary third parties, such as payment processors, delivery partners,
                and installation teams to fulfill your order.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized access,
                loss, or disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                Your Rights
              </h2>
              <p>
                You have the right to access, correct, or request deletion of the personal
                information we hold about you. You can do so at any time by contacting us directly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at ktmdecor2024@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
