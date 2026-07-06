"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={props.className} 
    width="1em" 
    height="1em" 
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const faqs = [
  {
    question: "What types of signs and boards do you make?",
    answer: "We create custom LED neon signs, illuminated light boards, 3D acrylic and metal letters, edge-lit display boards, and bespoke decorative installations for any space or occasion.",
  },
  {
    question: "How long does a custom order take?",
    answer: "Typical turnaround is 5–10 business days depending on complexity. Simple neon signs can be ready in as little as 3 days, while large-scale 3D installations may take 2–3 weeks.",
  },
  {
    question: "Can I see a mockup before production?",
    answer: "Absolutely. We provide a detailed digital mockup showing your design with exact colors, dimensions and placement context. Production only begins after your approval.",
  },
  {
    question: "Do you handle delivery and installation?",
    answer: "Yes. We offer professional delivery and installation across Kathmandu Valley. For locations outside the valley, we provide secure shipping with detailed installation guides.",
  },
  {
    question: "What materials do you use?",
    answer: "We use premium-grade LED flex neon tubing, laser-cut acrylic, brushed and powder-coated metals, sustainably sourced wood and high-quality electrical components for lasting durability.",
  },
  {
    question: "Do you offer warranties?",
    answer: "Yes. All our neon signs and light boards come with a 1-year warranty covering electrical components and fabrication. Extended warranties are available on request.",
  },
];

export default function CtaFaq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-[1500px] mx-auto w-full px-4 sm:px-6 md:px-8 bg-background dark:bg-transparent text-foreground py-20 max-[900px]:py-[60px] mb-24 lg:mb-32 rounded-[4px] font-sans transition-colors duration-500">
      <div className="grid grid-cols-[1.6fr_1fr] gap-8 md:gap-12 items-start max-[900px]:grid-cols-1">
        {/* Left column — Animated Gradient CTA card */}
        <div 
          className="c5-animated-gradient rounded-[4px] py-20 px-8 sm:px-12 min-h-[72dvh] lg:min-h-[84dvh] text-white flex flex-col justify-center items-center text-center shadow-2xl"
        >
          <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-extrabold leading-[0.9] tracking-tighter mb-6">
            Ready to Transform<br className="hidden sm:block"/> Your Space?
          </h2>
          <p className="text-sm sm:text-lg md:text-xl mb-10 font-medium opacity-90 max-w-lg leading-relaxed">
            Get in touch and let&apos;s bring your vision to life with custom signage.
          </p>
          <a href="https://wa.me/9779706247439" target="_blank" rel="noopener noreferrer" className="no-underline group">
            <button className="bg-[#25D366] hover:bg-[#22c35e] text-white px-8 py-4 sm:px-10 sm:py-5 rounded-[4px] shadow-[0_10px_20px_rgba(37,211,102,0.25)] transition-all duration-300 hover:shadow-[0_14px_30px_rgba(37,211,102,0.4)] hover:-translate-y-1 font-bold tracking-widest uppercase text-xs sm:text-sm flex items-center justify-center gap-3">
              <WhatsAppIcon className="w-5 h-5" />
              <span>Chat on WhatsApp</span>
            </button>
          </a>
        </div>

        {/* Right column — FAQ accordion */}
        <div className="flex flex-col justify-center gap-3 md:gap-4">
          {faqs.map((faq, index) => {
            const isActive = activeIndex === index;
            return (
              <div 
                key={index}
                onClick={() => toggleFaq(index)}
                className={`bg-white dark:bg-card border rounded-[4px] py-5 px-6 cursor-pointer transition-all duration-300 ${
                  isActive 
                    ? 'border-accent/40 shadow-xl dark:bg-black/80' 
                    : 'border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 shadow-sm'
                }`}
              >
                <div className={`flex justify-between items-center font-extrabold text-base md:text-xl tracking-tight transition-colors duration-300 ${isActive ? 'text-accent' : 'text-foreground'}`}>
                  <span>{faq.question}</span>
                  <div className={`w-8 h-8 rounded-md flex-shrink-0 flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-accent text-white' : 'bg-foreground/5 text-foreground/50'}`}>
                    {isActive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
                <div className={`transition-all duration-300 ease-out overflow-hidden ${isActive ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                  <p className="text-sm md:text-base text-muted font-medium leading-relaxed pr-8">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
