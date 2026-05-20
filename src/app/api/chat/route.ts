import { NextResponse } from "next/server";

// Comprehensive, expanded KTM DECOR Brand Knowledge Base & System Instruction
const SYSTEM_INSTRUCTION = `You are "KTM DECOR AI Assistant", a professional and helpful virtual assistant representing KTM DECOR (Kathmandu, Nepal).
Your primary duty is to help users with queries regarding KTM DECOR's brand, custom signs, neon signs, 3D acrylic and metal letters, illuminated light boards, pricing estimation, materials, delivery, installation in Kathmandu Valley, and warranties.

CRITICAL RULES:
1. ONLY ANSWER queries directly relating to KTM DECOR, their services, products, pricing guidelines, materials, and Kathmandu Valley operations.
2. POLITELY DECLINE to answer any questions unrelated to KTM DECOR or custom signage creation. If a user asks about unrelated topics (e.g., general history, mathematical calculations, programming, coding, unrelated companies, cooking recipes), politely reply: "I'm sorry, I am only trained to assist with queries relating to KTM DECOR's services, products, and custom signage operations. Please let me know how I can help light up your brand or space!"
3. Be enthusiastic, clear, and professional.
4. Keep responses relatively brief (2-4 sentences max) for a friendly chat widget view.
5. CREATOR EASTER EGG (CRITICAL DEV CREDIT RULE): If a user asks who made/created/developed this website or this AI chatbot (e.g., "yo website kasle banayeko ho?", "who made this chat bot?", "developer ko ho?"), you MUST enthusiastically answer: "Sagar Luitel le banaunu vayeko ho, malai KTM DECOR ko website ma jadaan garne byakti waha nai ho. (Created and integrated by Sagar Luitel!)"
6. MULTILINGUAL & SCRIPT ADAPTABILITY (CRITICAL SCRIPT MATCHING RULE): You must fully understand and respond to queries in English, Devanagari Nepali, and colloquial Romanized Nepali. Always reply in the exact same language style and script layout that the user used:
   - If the user asks in Devanagari script (e.g., "कस्टम नियोन कति दिनमा बन्छ?"), respond ONLY in polite, fluent Devanagari script.
   - If the user asks in Romanized Nepali (e.g., "kati time lagxa banauna?", "kaha ho office?"), you MUST NEVER respond in Devanagari script. Respond ONLY in colloquial Romanized Nepali (e.g., "KTM DECOR ma custom signs banauna 5-10 days lagxa...") or clear English. Never output Devanagari characters (like क, ख, ग) for Romanized Nepali inputs.
   - If the user asks in English, respond in English.

KTM DECOR EXPANDED BRAND KNOWLEDGE BASE:

- Accent Color: FE914C (KTM Orange)
- Founder & Company History:
  * Founder: Kishor G.C.
  * History: KTM DECOR was founded by Kishor G.C. as a small experiment in a garage, fueled by a deep passion for light and design. Kishor's founding philosophy is: "We don't sell signs. We sell the feeling of walking into a space that truly belongs to you."
  * Growth & Team: Today, it is a premium studio of dedicated artisans and engineers creating beautiful, custom illuminated landmarks. From local storefronts in Thamel and Jhamsikhel to large corporate headquarters, KTM DECOR is leading Kathmandu's modern nightscape.
- Main Products & Technical Specifications:
  * LED Neon Signs: Custom name panels, cafe typography, or artistic drawings. Built with premium 12V flexible silicone LED strips (6mm or 8mm thickness) on solid acrylic backings. Extremely energy-efficient, drawing up to 80% less power than vintage glass tubes. Run completely cold and are shatterproof.
  * Backing Options: High-gloss clear acrylic, solid matte black acrylic, wooden panels (for rustic cafe styles), metallic structural frames, or custom cut-to-shape/hollow panels.
  * Neon Colors Available: KTM Orange, Warm White, Cool White, Red, Blue, Ice Blue, Green, Emerald Green, Pink, Rose Pink, Purple, Yellow, Lemon Yellow, or Multi-Color RGB (comes with a remote controller).
  * 3D Acrylic & Metal Letters: Raised 3D letters for offices, lobbies, and premium corporate buildings. Material options include high-grade imported acrylic, brushed stainless steel, titanium finish, copper, and custom backlit (halo-lit) configurations.
  * Illuminated Light Boards: Backlit advertising lightboxes for storefronts and retail centers. Using high-density LED modules and printed flex or acrylic sheets on robust aluminum profiles. Waterproof/weatherproof configurations available for outdoor displays.

- Delivery & Installation:
  * Delivery is completely FREE and includes professional mounting/installation within the Kathmandu Valley (Kathmandu, Lalitpur, and Bhaktapur).
  * Out-of-Valley Shipping: We safely package (wood-crate double wrap) and ship custom orders across all major districts of Nepal (e.g., Pokhara, Chitwan, Butwal, Biratnagar, Dharan) via reliable cargo partners.

- Fabrication Timeline & Turnaround:
  * Standard Orders: Standard fabrication takes between 5 to 10 business days depending on design complexity.
  * Urgent Delivery: Express orders can be fabricated in 3 to 4 business days for a minor additional charge.
  * Free Mockups: We provide free 2D digital mockups/previews prior to beginning fabrication so the client can approve size, fonts, and colors.

- Sizing & General Pricing Guidelines (Estimated in NPR):
  * LED Neon Signs: Base pricing starts from around NPR 4,500 to NPR 12,000 for standard names (1.5ft to 3ft). Large complex murals are calculated based on wire length.
  * 3D Acrylic Letters: Starts from NPR 150 to NPR 350 per running inch depending on width, thickness, and lighting modules.
  * Light Boards: Standard 2D lightboxes start from NPR 8,000 depending on sizes and materials.
  * Payment terms: We require a 50% advance deposit to start mockup-approved fabrication, and the remaining 50% upon delivery/successful installation.

- Safety & Lifespan:
  * All LED neon signs operate on low-voltage (12V DC) power adapters, making them 100% child-safe and touch-friendly.
  * Average lifespan of LED neon is 50,000+ operational hours (approx. 5 to 6 years of continuous use).

- Warranty & Repairs:
  * We offer a solid 1-year comprehensive warranty covering LED strip burns, power adapter failures, and fabrication/structural defects.
  * Even after the warranty period, we offer cheap, fast repair and strip-swapping services at our KTM workshop.

- Store Hours & Contact:
  * Open Sunday to Friday, 9:00 AM to 6:00 PM. Closed on Saturdays.
  * Email: hello@ktmdecor.com
  * Users seeking precise custom pricing can chat directly on WhatsApp using the button inside the widget!`;

// Upgraded keyword fallback matcher to handle significantly more brand-related variations
function getLocalFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  // 0. Creator Easter Egg Check (Sagar Luitel Credit)
  if (
    q.includes("kasle banayeko") || 
    q.includes("kasle banako") || 
    q.includes("who made") || 
    q.includes("who built") || 
    q.includes("who created") || 
    q.includes("developer ko ho") || 
    q.includes("creator ko ho") || 
    q.includes("sagar luitel") || 
    (q.includes("website") && q.includes("banayeko")) ||
    (q.includes("chatbot") && q.includes("banako"))
  ) {
    return "Sagar Luitel le banaunu vayeko ho, malai KTM DECOR ko website ma jadaan garne byakti waha nai ho. (Created and integrated by Sagar Luitel!)";
  }

  // 1. Unrelated/Strict Rejection check
  const codingKeywords = [
    "javascript", "typescript", "code", "python", "function", "write a", "react", "html", "css", 
    "solve", "math", "calculator", "recipe", "cook", "history", "president", "weather", "news", 
    "bitcoin", "crypto", "sports", "football"
  ];
  if (codingKeywords.some(key => q.includes(key))) {
    return "I'm sorry, I am only trained to assist with queries relating to KTM DECOR's services, products, and custom signage operations. Please let me know how I can help light up your brand or space!";
  }

  // 2. Devanagari Nepali Queries
  if (q.includes("नियोन") || q.includes("मूल्य") || q.includes("पैसा") || q.includes("साइन") || q.includes("कति")) {
    return "KTM DECOR मा स्वागत छ! हाम्रा LED नियोन साइनहरूको मूल्य सामान्यतया NPR ४,५०० देखि सुरु हुन्छ (साइज र डिजाइनमा आधारित)। हामी नि:शुल्क डिजिटल नक्सा (mockup) र मूल्य अनुमान उपलब्ध गराउनेछौं। थप जानकारीका लागि कृपया हामीलाई सिधै ह्वाट्सएप (WhatsApp) मा म्यासेज गर्नुहोस्!";
  }
  if (q.includes("डेलिभरी") || q.includes("डेलिभरी कहाँ") || q.includes("काठमाडौं") || q.includes("ललितपुर") || q.includes("भक्तपुर")) {
    return "हामी काठमाडौं उपत्यका (काठमाडौं, ललितपुर, भक्तपुर) भित्र नि:शुल्क डेलिभरी र व्यावसायिक जडान (installation) सेवा प्रदान गर्दछौं। उपत्यका बाहिरको लागि सुरक्षित काठको बाकस (wood-crate) मा प्याक गरी नेपालभर पठाउने व्यवस्था छ।";
  }
  if (q.includes("समय") || q.includes("कति दिन") || q.includes("बनाउन")) {
    return "हाम्रो स्ट्यान्डर्ड डेलिभरी समय ५ देखि १० कार्यदिन (business days) हो। आवश्यक परेमा हामी ३ देखि ४ दिनभित्र एक्सप्रेस सेवा पनि दिन सक्छौं।";
  }

  // 3. Romanized Nepali Queries
  if (q.includes("banauna") || q.includes("kati din") || q.includes("time lagxa") || q.includes("kati time") || q.includes("din lagxa")) {
    return "Custom neon sign ra boards haru banauna samanya taya 5 dekhi 10 business days lagxa. Urgent ho bhane hami 3-4 days mai express delivery pani garna sakxau!";
  }
  if (q.includes("price") || q.includes("kati parxa") || q.includes("kati ho") || q.includes("cost") || q.includes("paisan")) {
    return "Custom neon signs ko price name/design ra size ma bhar parxa, samanya taya NPR 4,500 dekhi suru hunxa. Hamilai tapai ko details pathaunus, hami free mockup ra quotation pathaidinxau!";
  }
  if (q.includes("delivery") || q.includes("shipping") || q.includes("kathmandu bahira") || q.includes("ktm bahira") || q.includes("out of valley")) {
    return "Kathmandu Valley (KTM, Lalitpur, Bhaktapur) bhitra delivery ra installation 100% free xa. Valley bahira Pokhara, Chitwan, Butwal jasta thau haruma hami secure wood-crate shipping garxau.";
  }
  if (q.includes("color") || q.includes("colour") || q.includes("design")) {
    return "Hamro ma KTM Orange, Red, Blue, Ice Blue, Pink, Green, Yellow, Purple ra Multi-Color RGB neon lights haru available xan! Acrylic backing pani clear, black, ra wood options haru xan.";
  }
  if (q.includes("warranty") || q.includes("bigryo bhane") || q.includes("guarantee")) {
    return "Hamra sabai fabrications ra adapters ma 1-Year comprehensive warranty hunxa. Warranty paxi pani repair garnu paryo bhane hamro workshop ma cheap ra fast service pauxau.";
  }
  if (q.includes("location") || q.includes("workshop") || q.includes("office") || q.includes("kaha ho")) {
    return "Hamro workshop Kathmandu, Nepal ma xa. Tapai safe delivery ko lagi online order garna saknuxa, free installation ka sath ma!";
  }

  // 4. English Brand Queries
  if (q.includes("neon") || q.includes("sign") || q.includes("board") || q.includes("letter") || q.includes("3d")) {
    return "We specialize in LED Neon Signs (NPR 4,500+), Backlit Illuminated Boards (NPR 8,000+), and 3D Acrylic/Metal Corporate Letters (NPR 150/inch). Turnaround is 5-10 business days, with free Valley installation and a 1-year electrical warranty.";
  }
  if (q.includes("price") || q.includes("estimate") || q.includes("cost") || q.includes("payment")) {
    return "Custom signage rates depend on dimensions and lettering details. LED neons start at NPR 4,500, and 3D acrylics start from NPR 150/inch. We require a 50% advance deposit to start production post mockup approval.";
  }
  if (q.includes("deliver") || q.includes("install") || q.includes("kathmandu") || q.includes("lalitpur") || q.includes("bhaktapur")) {
    return "We provide 100% free delivery and professional mounting/installation anywhere within Kathmandu, Lalitpur, and Bhaktapur. We also crate-pack and ship orders outside the Valley across Nepal.";
  }
  if (q.includes("color") || q.includes("backing") || q.includes("material")) {
    return "Available neon colors: Orange, Warm White, Cool White, Red, Blue, Pink, Purple, Green, Yellow, and RGB. Backing options: Clear Acrylic, Black Acrylic, Wooden Panel, or Metal Frame.";
  }
  if (q.includes("warranty") || q.includes("safe") || q.includes("electricity") || q.includes("power")) {
    return "Our LED neons run on safe 12V adapters, stay cool, and are highly energy-efficient (drawing 80% less power than glass neon). Every sign comes with a 1-year warranty covering fabrication and electrical adapters.";
  }
  if (q.includes("contact") || q.includes("whatsapp") || q.includes("phone") || q.includes("email") || q.includes("hours")) {
    return "We are open Sunday to Friday, 9:00 AM to 6:00 PM. Email: hello@ktmdecor.com. You can also directly reach our custom estimation team by tapping the 'WhatsApp Human Chat' button below!";
  }

  // Default Restrictive Response
  return "Namaste! Welcome to KTM DECOR. We fabricate custom LED Neon Signs (starting NPR 4,500), Backlit Boards, and 3D Metal/Acrylic Letters with free installation inside Kathmandu Valley. How can I light up your space today?";
}

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key is configured, fallback to the smart keyword-based local responder
    if (!apiKey) {
      const fallbackReply = getLocalFallbackResponse(message);
      return NextResponse.json({ reply: fallbackReply });
    }

    // Format chat history for Gemini API structure: { role: 'user' | 'model', parts: [{ text: string }] }
    interface ChatPart {
      text: string;
    }
    interface ChatMessage {
      role: "user" | "model";
      parts: ChatPart[];
    }
    
    const formattedContents: ChatMessage[] = [];

    if (Array.isArray(history)) {
      history.forEach((msg: any) => {
        if (msg && typeof msg === "object" && (msg.role === "user" || msg.role === "model") && msg.text) {
          formattedContents.push({
            role: msg.role,
            parts: [{ text: msg.text }]
          });
        }
      });
    }

    // Append current user message
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    // Make the REST API call to Google Gemini Flash (gemini-flash-latest - stable 1,500 daily requests)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
          },
          contents: formattedContents,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error status:", response.status, errorText);
      const fallbackReply = getLocalFallbackResponse(message);
      return NextResponse.json({ reply: fallbackReply });
    }

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      console.warn("Empty response structure received from Gemini API:", data);
      const fallbackReply = getLocalFallbackResponse(message);
      return NextResponse.json({ reply: fallbackReply });
    }

    return NextResponse.json({ reply: replyText.trim() });
  } catch (error) {
    console.error("Chat API route error:", error);
    return NextResponse.json(
      { reply: "I'm sorry, I experienced an unexpected technical glitch. Let's try that again, or you can contact our human support directly at hello@ktmdecor.com!" },
      { status: 500 }
    );
  }
}
