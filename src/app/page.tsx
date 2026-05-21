import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import dynamic from "next/dynamic";

const About = dynamic(() => import("@/components/About"));
const Services = dynamic(() => import("@/components/Services"));
const Shop = dynamic(() => import("@/components/Shop"));
const HowItWorks = dynamic(() => import("@/components/HowItWorks"));
const BeforeAfter = dynamic(() => import("@/components/BeforeAfter"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const CtaFaq = dynamic(() => import("@/components/CtaFaq"));
const LocationMap = dynamic(() => import("@/components/LocationMap"));

export default function Home() {
  return (
    <>
      <Preloader />
      <main>
        <Hero />
        <About />
        <Services />
        <Shop />
        <HowItWorks />
        <BeforeAfter />
        <Testimonials />
        <CtaFaq />
        <LocationMap />
      </main>
    </>
  );
}
