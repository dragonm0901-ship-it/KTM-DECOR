import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | KTM DECOR",
  description: "Read the cookie policy for KTM DECOR to understand how we use cookies and improve user experience.",
  alternates: {
    canonical: "/cookie-policy",
  },
};

export default function CookiePolicy() {
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
            Cookie Policy
          </h1>

          <div className="space-y-8 text-lg opacity-80">
            <p>
              This Cookie Policy explains how KTM DECOR uses cookies and
              similar technologies to recognize you when you visit our website.
            </p>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                What Are Cookies
              </h2>
              <p>
                Cookies are small data files that are placed on your computer or
                mobile device when you visit a website. They are widely used to
                make websites work more efficiently and provide information to
                the website owners.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                How We Use Cookies
              </h2>
              <p>
                We use cookies for several purposes, including to enable basic
                website functionality, analyze site usage, deliver personalized
                content, and serve relevant advertisements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                Types of Cookies We Use
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Strictly Necessary:</strong> Required for the website
                  to function properly.
                </li>
                <li>
                  <strong>Performance:</strong> Help us understand how visitors
                  interact with our website.
                </li>
                <li>
                  <strong>Functional:</strong> Enable enhanced functionality and
                  personalization.
                </li>
                <li>
                  <strong>Marketing:</strong> Used to deliver relevant
                  advertisements.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                Managing Cookies
              </h2>
              <p>
                You can manage your cookie preferences through our cookie
                settings banner or your browser settings. Please note that
                disabling certain cookies may affect the functionality of our
                website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-medium tracking-tight mb-4 opacity-100">
                Contact Us
              </h2>
              <p>
                If you have any questions about our Cookie Policy, please
                contact us at ktmdecor2024@gmail.com.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
