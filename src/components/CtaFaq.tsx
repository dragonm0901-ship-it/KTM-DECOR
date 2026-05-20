"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    <div className="max-w-[1320px] w-full mx-auto px-5 bg-background dark:bg-transparent text-foreground py-20 max-[900px]:py-[60px] mb-24 lg:mb-32 rounded-[4px] font-sans transition-colors duration-500">
      <div className="grid grid-cols-[1.6fr_1fr] gap-8 md:gap-12 items-start max-[900px]:grid-cols-1">
        {/* Left column — Animated Gradient CTA card */}
        <div 
          className="c5-animated-gradient rounded-[4px] py-20 px-8 sm:px-12 min-h-[60vh] lg:min-h-[70vh] text-white flex flex-col justify-center items-center text-center shadow-2xl"
        >
          <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-extrabold leading-[0.9] tracking-tighter mb-6">
            Ready to Transform<br className="hidden sm:block"/> Your Space?
          </h2>
          <p className="text-sm sm:text-lg md:text-xl mb-10 font-medium opacity-90 max-w-lg leading-relaxed">
            Get in touch and let&apos;s bring your vision to life with custom signage.
          </p>
          <a href="https://wa.me/9779706247439" target="_blank" rel="noopener noreferrer" className="no-underline group">
            <button className="bg-black text-white px-8 py-4 sm:px-10 sm:py-5 rounded-[4px] shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_14px_30px_rgba(0,0,0,0.4)] hover:-translate-y-1 font-bold tracking-widest uppercase text-xs sm:text-sm flex items-center gap-2">
              Chat on WhatsApp
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
