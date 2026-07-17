import { NextResponse } from "next/server";
import { PRODUCTS, Product } from "@/data/shop-data";

// Comprehensive, expanded KTM DECOR Brand Knowledge Base & System Instruction
const SYSTEM_INSTRUCTION = `You are "KTM DECOR AI Assistant", a professional and helpful virtual assistant representing KTM DECOR (Balkot, Bhaktapur, Nepal).
Your primary duty is to help users with queries regarding KTM DECOR's brand, custom signs, neon signs, 3D acrylic and metal letters, illuminated light boards, pricing estimation, materials, delivery, installation in Kathmandu Valley, and warranties.

CRITICAL RULES:
1. LANGUAGE & SCRIPT MATCHING (HIGHEST PRIORITY): You MUST detect the user's language and script and respond ONLY in that exact same style. This is non-negotiable:
   - Devanagari Nepali input (e.g., "नियोन कति पर्छ?") → Respond ONLY in polite, fluent Devanagari Nepali script. Do not output English or Romanized Nepali words.
   - Romanized Nepali input (e.g., "kati time lagxa banauna?", "kaha ho office?") → Respond ONLY in colloquial Romanized Nepali. NEVER output Devanagari characters (like क, ख, ग) under any circumstance. Example style: "KTM DECOR ma custom signs banauna 5-10 days lagxa..."
   - English input → Respond in clear, natural English.
2. ONLY ANSWER queries directly relating to KTM DECOR, their services, products, pricing guidelines, materials, and Kathmandu Valley operations.
3. POLITELY DECLINE to answer any questions unrelated to KTM DECOR or custom signage creation. If a user asks about unrelated topics (e.g., general history, mathematical calculations, programming, coding, unrelated companies, cooking recipes), politely reply: "I'm sorry, I am only trained to assist with queries relating to KTM DECOR's services, products, and custom signage operations. Please let me know how I can help light up your brand or space!"
4. Be enthusiastic, clear, and professional.
5. Keep responses relatively brief (2-3 sentences max) for a friendly chat widget view.
6. CREATOR EASTER EGG (CRITICAL DEV CREDIT RULE): If a user asks who made/created/developed this website or this AI chatbot (e.g., "yo website kasle banayeko ho?", "who made this chat bot?", "developer ko ho?"), you MUST enthusiastically answer: "Sagar Luitel le banaunu vayeko ho, malai KTM DECOR ko website ma jadaan garne byakti waha nai ho. (Created and integrated by Sagar Luitel!)"

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

- Location:
  * Workshop & HQ location is Balkot, Bhaktapur, Nepal.

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
  * Email: ktmdecor2024@gmail.com
  * Users seeking precise custom pricing can chat directly on WhatsApp using the button inside the widget!`;

// Explicit script & pattern matching to detect input language and enforce exact response script
function detectLanguage(text: string): "devanagari" | "romanized_nepali" | "english" {
  // Check for Devanagari script range (U+0900–U+097F)
  if (/[\u0900-\u097F]/.test(text)) {
    return "devanagari";
  }

  // Common Romanized Nepali keywords and markers
  const romanizedMarkers = [
    "xa", "xau", "xaina", "lagxa", "hunxa", "parxa", "garxa", "banauna",
    "kati", "kaha", "bhane", "hami", "hamro", "tapai", "garna", "dina",
    "sakxa", "dinxa", "paisa", "pani", "ra ", "ko ", "ma ", "le ", "lai ",
    "dekhi", "samma", "bhitra", "bahira", "kasle", "banako", "banayeko",
    "chha", "chhan", "ho", "honi", "nepal", "ktm", "balkot", "bhaktapur",
    "ramro", "paisan", "tapailai", "sanga", "thau", "kalo", "seto", "rakhney"
  ];
  const lower = text.toLowerCase();
  const matchCount = romanizedMarkers.filter(m => lower.includes(m)).length;
  if (matchCount >= 2) {
    return "romanized_nepali";
  }

  return "english";
}

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
    return "Hamro workshop Balkot, Bhaktapur, Nepal ma xa. Tapai safe delivery ko lagi online order garna saknuxa, free installation ka sath ma!";
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
    return "We are open Sunday to Friday, 9:00 AM to 6:00 PM. Email: ktmdecor2024@gmail.com. You can also directly reach our custom estimation team by tapping the 'WhatsApp Human Chat' button below!";
  }

  // Default Restrictive Response
  return "Namaste! Welcome to KTM DECOR. We fabricate custom LED Neon Signs (starting NPR 4,500), Backlit Boards, and 3D Metal/Acrylic Letters with free installation inside Kathmandu Valley. How can I light up your space today?";
}

// Match query keywords to specific categories and return up to 3 products
function getMatchingProducts(query: string, reply: string): Product[] {
  const text = (query + " " + reply).toLowerCase();
  const matched: Product[] = [];
  
  const mapping = [
    { keywords: ["neon", "glowing", "glow", "नियोन"], category: "Neon Sign" },
    { keywords: ["backlit", "lightbox", "light box", "ब्याकलिट"], category: "Acrylic Backlit Signage" },
    { keywords: ["3d signage", "3d letter", "lettering", "halo", "metal letter", "acrylic letter", "३डी"], category: "3D Signage" },
    { keywords: ["2d board", "menu board", "directory", "directional", "बोर्ड"], category: "2D Board" },
    { keywords: ["nameplate", "name plate", "desk sign", "residential plate", "नेमप्लेट"], category: "House/Office Nameplate" },
    { keywords: ["wooden", "wood", "timber", "cnc wood", "काठ"], category: "Wooden Signage" },
    { keywords: ["2.5d", "relief", "textured cnc"], category: "2.5D Signage" },
    { keywords: ["lamp", "table lamp", "bedside", "ल्याम्प"], category: "Acrylic Table Lamp" },
    { keywords: ["number plate", "bike plate", "car plate", "license plate", "नम्बर"], category: "3D Number Plate" },
    { keywords: ["double sided", "round light board", "rotating box", "projecting"], category: "Double Sided Round Light Board" },
  ];

  const matchedCategories = new Set<string>();
  for (const item of mapping) {
    if (item.keywords.some(keyword => text.includes(keyword))) {
      matchedCategories.add(item.category);
    }
  }

  // Fallback for general product search keywords
  if (matchedCategories.size === 0 && (
    text.includes("product") || text.includes("shop") || text.includes("catalog") || 
    text.includes("collection") || text.includes("items") || text.includes("bestseller") || 
    text.includes("best seller") || text.includes("sell") || text.includes("kinne") || text.includes("buy")
  )) {
    matchedCategories.add("Neon Sign");
    matchedCategories.add("3D Signage");
  }

  for (const cat of matchedCategories) {
    const catProds = PRODUCTS.filter(p => p.category === cat);
    matched.push(...catProds.slice(0, 2));
    if (matched.length >= 3) break;
  }

  return matched.slice(0, 3);
}

export async function POST(request: Request) {
  let message = "";
  try {
    const json = await request.json();
    message = json?.message;
    const history = json?.history;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string." },
        { status: 400 }
      );
    }

    const rawApiKey = process.env.GEMINI_API_KEY;
    const apiKey = rawApiKey ? rawApiKey.trim().replace(/^["']|["']$/g, "") : undefined;

    // Detect user's language and select instruction override prefix
    const userLanguage = detectLanguage(message);
    const scriptDirective = {
      devanagari: "[SYSTEM INSTRUCTION: The user is writing in Devanagari script. You MUST respond ONLY in pure Devanagari Nepali. Do not use English or Romanized words.]\n",
      romanized_nepali: "[SYSTEM INSTRUCTION: The user is writing in Romanized Nepali. You MUST respond ONLY in casual Romanized Nepali. Do not use Devanagari characters or letters under any circumstances.]\n",
      english: "[SYSTEM INSTRUCTION: Respond in clear English.]\n"
    }[userLanguage];

    // Combine script directive instruction with the actual user message
    const formattedUserMsgText = `${scriptDirective}${message}`;

    // If no API key is configured or is empty, fallback to the local responder via streaming SSE
    if (!apiKey) {
      const fallbackReply = getLocalFallbackResponse(message);
      const matchedProducts = getMatchingProducts(message, fallbackReply);
      return new Response(
        `data: ${JSON.stringify({ text: fallbackReply })}\n\ndata: ${JSON.stringify({ done: true, products: matchedProducts })}\n\n`,
        {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
          }
        }
      );
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

    // Trim conversation history to the last 6 messages (3 turns) to keep context size low and response fast
    const trimmedHistory = formattedContents.slice(-6);

    // Append current user message (with script directive pre-pended)
    trimmedHistory.push({
      role: "user",
      parts: [{ text: formattedUserMsgText }]
    });

    // Make the REST API call to Google Gemini Flash with SSE streaming (alt=sse)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
          },
          contents: trimmedHistory,
          generationConfig: {
            maxOutputTokens: 250, // optimised token count for speed
            temperature: 0.4,    // lowered temperature for faster generation compliance
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error status:", response.status, errorText);
      const fallbackReply = getLocalFallbackResponse(message);
      const matchedProducts = getMatchingProducts(message, fallbackReply);
      return new Response(
        `data: ${JSON.stringify({ text: fallbackReply })}\n\ndata: ${JSON.stringify({ done: true, products: matchedProducts })}\n\n`,
        {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
          }
        }
      );
    }

    // Forward the streaming response parsing SSE line-by-line
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";
    let buffer = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              if (trimmed.startsWith("data: ")) {
                const dataStr = trimmed.slice(6);
                if (dataStr === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(dataStr);
                  const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    accumulatedText += text;
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
                  }
                } catch (err) {
                  // Ignore JSON parse errors on incomplete frames
                }
              }
            }
          }

          // Flush remaining buffer content
          const trimmedBuffer = buffer.trim();
          if (trimmedBuffer.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(trimmedBuffer.slice(6));
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                accumulatedText += text;
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } catch (e) {}
          }

          // Stream completed, calculate and inject matched products
          const matchedProducts = getMatchingProducts(message, accumulatedText);
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true, products: matchedProducts })}\n\n`));
          controller.close();
        } catch (streamErr) {
          console.error("Gemini stream forwarding exception:", streamErr);
          // Fallback finalizer if error happens during streaming
          try {
            const fallbackProducts = getMatchingProducts(message, accumulatedText);
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true, products: fallbackProducts })}\n\n`));
            controller.close();
          } catch (e) {
            controller.error(streamErr);
          }
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error) {
    console.error("Chat API route error:", error);
    const fallbackReply = "I'm sorry, I experienced an unexpected technical glitch. Let's try that again, or you can contact our human support directly at ktmdecor2024@gmail.com!";
    const fallbackProducts = getMatchingProducts(message, fallbackReply);
    return new Response(
      `data: ${JSON.stringify({ text: fallbackReply })}\n\ndata: ${JSON.stringify({ done: true, products: fallbackProducts })}\n\n`,
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        }
      }
    );
  }
}
