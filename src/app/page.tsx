import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
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
