import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import Expertise from "@/components/Expertise";
import About from "@/components/About";
import Services from "@/components/Services";
import Shop from "@/components/Shop";
import HowItWorks from "@/components/HowItWorks";
import BeforeAfter from "@/components/BeforeAfter";
import Testimonials from "@/components/Testimonials";
import CtaFaq from "@/components/CtaFaq";
import LocationMap from "@/components/LocationMap";

export default function Home() {
  return (
    <>
      <Preloader />
      <main>
        <Hero />
        <Expertise />
        <Services />
        <Shop />
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
