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
        
        <div className="content-visibility-auto" style={{ containIntrinsicSize: "auto 1200px" }}>
          <About />
        </div>
        
        <div className="content-visibility-auto" style={{ containIntrinsicSize: "auto 800px" }}>
          <Services />
        </div>
        
        <div className="content-visibility-auto" style={{ containIntrinsicSize: "auto 800px" }}>
          <Shop />
        </div>
        
        <div className="content-visibility-auto" style={{ containIntrinsicSize: "auto 600px" }}>
          <HowItWorks />
        </div>
        
        <div className="content-visibility-auto" style={{ containIntrinsicSize: "auto 800px" }}>
          <BeforeAfter />
        </div>
        
        <div className="content-visibility-auto" style={{ containIntrinsicSize: "auto 600px" }}>
          <Testimonials />
        </div>
        
        <div className="content-visibility-auto" style={{ containIntrinsicSize: "auto 800px" }}>
          <CtaFaq />
        </div>
        
        <div className="content-visibility-auto" style={{ containIntrinsicSize: "auto 500px" }}>
          <LocationMap />
        </div>
      </main>
    </>
  );
}
