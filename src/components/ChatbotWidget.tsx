"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, ExternalLink, X, MessageCircle } from "@/components/ui/solar-icons";
import { Product } from "@/data/shop-data";
import Image from "next/image";

interface Message {
  role: "user" | "model";
  text: string;
  timestamp: Date;
  products?: Product[];
}

const LOADING_PHASES = [
  "Thinking...",
  "Consulting KTM DECOR catalog...",
  "Reviewing pricing details...",
  "Matching custom product specs...",
  "Formulating Kathmandu Valley delivery info...",
  "Generating product recommendations...",
  "Almost there..."
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Namaste! Welcome to KTM DECOR. I'm your AI Brand Assistant. Ask me anything about our custom LED Neon signs, illuminated boards, pricing, materials, or delivery areas inside the Kathmandu Valley!",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhaseIndex, setLoadingPhaseIndex] = useState(0);

  const chatLogsRef = useRef<HTMLDivElement>(null);

  // Track component mount and unmount
  useEffect(() => {
    console.log("[ChatBot] Component Mounted");
    return () => {
      console.log("[ChatBot] Component Unmounted");
    };
  }, []);

  // Observe the documentElement class to hide during preloader active state
  useEffect(() => {
    const checkLoading = () => {
      const isPreloading = document.documentElement.classList.contains("is-loading");
      setIsLoaded(!isPreloading);
    };

    // Run initial check
    checkLoading();

    // Listen for attribute mutations on the HTML tag
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          checkLoading();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Cycle loading messages when isLoading is true
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingPhaseIndex(0);
      interval = setInterval(() => {
        setLoadingPhaseIndex((prev) => (prev + 1) % LOADING_PHASES.length);
      }, 2500);
    } else {
      setLoadingPhaseIndex(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatLogsRef.current) {
      chatLogsRef.current.scrollTo({
        top: chatLogsRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading, loadingPhaseIndex]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Map history to simple role/text format, sending only the last 6 messages for token efficiency and performance
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      console.log("[ChatBot] Sending message to API:", text, "with history:", history);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: history,
        }),
      });

      console.log("[ChatBot] API response status:", res.status);

      let localMessages: Message[] = [...messages, userMessage];

      if (!res.ok) {
        throw new Error(`API call failed with status ${res.status}`);
      }

      if (!res.body) {
        throw new Error("No response body received from API");
      }

      // Stream handling setup
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let botMessageAdded = false;

      console.log("[ChatBot] Starting stream read loop");

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("[ChatBot] Stream reader done");
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log("[ChatBot] Raw chunk length:", chunk.length);
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          console.log("[ChatBot] Processing line:", trimmed);
          if (trimmed.startsWith("data: ")) {
            const dataStr = trimmed.slice(6);
            try {
              const parsed = JSON.parse(dataStr);
              console.log("[ChatBot] Parsed JSON chunk:", parsed);
              if (parsed.text) {
                const chunkText = parsed.text;
                // Double check to clear loading indicator as tokens stream in
                setIsLoading(false);

                if (!botMessageAdded) {
                  botMessageAdded = true;
                  localMessages = [...localMessages, {
                    role: "model",
                    text: chunkText,
                    timestamp: new Date(),
                    products: []
                  }];
                } else {
                  const lastIndex = localMessages.length - 1;
                  if (lastIndex >= 0 && localMessages[lastIndex].role === "model") {
                    localMessages[lastIndex] = {
                      ...localMessages[lastIndex],
                      text: localMessages[lastIndex].text + chunkText
                    };
                  }
                }
                console.log("[ChatBot] Setting messages to:", localMessages);
                setMessages([...localMessages]);
              } else if (parsed.done) {
                console.log("[ChatBot] Parsed done flag. Products:", parsed.products);
                if (parsed.products) {
                  const lastIndex = localMessages.length - 1;
                  if (lastIndex >= 0 && localMessages[lastIndex].role === "model") {
                    localMessages[lastIndex] = {
                      ...localMessages[lastIndex],
                      products: parsed.products
                    };
                  }
                  console.log("[ChatBot] Setting messages with products to:", localMessages);
                  setMessages([...localMessages]);
                }
              }
            } catch (err) {
              console.warn("[ChatBot] Failed to parse line:", trimmed, err);
            }
          }
        }
      }

    } catch (err) {
      setIsLoading(false);
      console.error("Chatbot transmission error:", err);
      
      const fallbackMessages: Message[] = [
        ...messages,
        userMessage,
        {
          role: "model",
          text: "I'm sorry, I am currently experiencing connection difficulties. Please feel free to email our team directly at ktmdecor2024@gmail.com or chat with us on WhatsApp!",
          timestamp: new Date(),
        }
      ];
      setMessages(fallbackMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend(inputValue);
    }
  };

  const SUGGESTIONS = [
    { label: "Custom Neon Price?", query: "How much does a custom neon sign cost?" },
    { label: "Delivery Timeline?", query: "How long does it take to make and deliver custom signs?" },
    { label: "Kathmandu Delivery?", query: "Do you deliver and install for free in Kathmandu Valley?" },
    { label: "Warranty info?", query: "Do you provide a warranty on LED neon signs?" },
  ];

  // Completely hidden while site is loading/preloader is active
  if (!isLoaded) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] font-sans selection:bg-accent/20 flex flex-col items-end gap-4 sm:gap-5">
      {/* WhatsApp Button */}
      {!isOpen && (
        <div className="flex items-center gap-3 animate-in fade-in duration-500">
          <span className="hidden sm:flex items-center justify-center bg-[#25D366] text-white border border-[#25D366]/50 text-[9px] font-extrabold tracking-widest uppercase px-3.5 h-[32px] rounded-[4px] opacity-100 animate-badge-blink pointer-events-none whitespace-nowrap shadow-md">
            Chat on WhatsApp
          </span>
          <a
            href="https://wa.me/9779706247439"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group w-12 h-12 sm:w-14 sm:h-14 aspect-square flex-shrink-0 bg-[#25D366] rounded-full flex items-center justify-center hover:scale-[1.1] active:scale-[0.95] transition-all duration-300 cursor-pointer overflow-visible shadow-lg shadow-[#25D366]/30 border border-[#25D366]/20"
            aria-label="Chat on WhatsApp"
          >
            {/* Pulsing Green Glow Ring */}
            <span className="absolute inset-[-4px] rounded-full bg-[#25D366]/30 border border-[#25D366]/50 animate-ping-small pointer-events-none" />

            {/* WhatsApp Logo */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 sm:w-7 sm:h-7 text-white"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
          </a>
        </div>
      )}

      {/* 1. Floating Robot Button */}
      {!isOpen && (
        <div className="flex items-center gap-3 animate-in fade-in duration-500">
          <span className="hidden sm:flex items-center justify-center bg-card border border-border text-[9px] font-extrabold tracking-widest uppercase px-3.5 h-[32px] rounded-[4px] opacity-100 animate-badge-blink pointer-events-none whitespace-nowrap shadow-md">
            AI Powered Chat
          </span>
          <button
            onClick={() => setIsOpen(true)}
            className="relative group w-12 h-12 sm:w-14 sm:h-14 aspect-square flex-shrink-0 bg-transparent rounded-full flex items-center justify-center hover:scale-[1.1] active:scale-[0.95] transition-all duration-300 cursor-pointer overflow-visible"
            aria-label="Open AI Assistant"
          >
            {/* Pulsing Neon Glow Ring */}
            <span className="absolute inset-[-4px] rounded-full bg-[#FE914C]/30 border border-[#FE914C]/50 animate-ping-small pointer-events-none" />

            {/* Sleek Modern Chat Bubble Badge */}
            <div className="w-full h-full rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/25 transition-transform duration-300 group-hover:scale-105 border border-accent/20">
              <MessageCircle className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 animate-pulse" />
            </div>
          </button>
        </div>
      )}

      {/* 2. Premium Professional Glassmorphic Chat Box */}
      {isOpen && (
        <div className="w-[300px] sm:w-[360px] h-[420px] sm:h-[480px] max-h-[75vh] sm:max-h-[82vh] max-w-[92vw] bg-black/80 dark:bg-zinc-950/80 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-[4px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 text-white transition-all">
          {/* Header */}
          <div className="border-b border-white/10 px-3.5 py-3 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-sm shadow-accent/20">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div>
                <h3 className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-white leading-tight">KTM DECOR AI</h3>
                <span className="text-[8px] sm:text-[9px] font-bold text-white/50 flex items-center gap-1 mt-0.5 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50 animate-pulse" />
                  Active Support
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded-[4px] transition-all cursor-pointer"
              aria-label="Close Assistant"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chat Logs (Separately Scrollable & overscroll-contained to prevent parent scrolling) */}
          <div
            ref={chatLogsRef}
            data-lenis-prevent
            className="flex-1 p-3 sm:p-4 overflow-y-auto overscroll-contain space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-border bg-gradient-to-b from-black/20 to-zinc-900/20 dark:from-zinc-950/20 dark:to-black/20 relative"
            style={{
              backgroundImage: "radial-gradient(rgba(254,145,76,0.02) 1px, transparent 1px)",
              backgroundSize: "14px 14px"
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-3 py-2 sm:px-3.5 sm:py-2.5 text-[10px] sm:text-xs leading-relaxed max-w-[85%] rounded-[4px] border ${msg.role === "user"
                      ? "bg-accent border-accent/25 text-white"
                      : "bg-white/10 border-white/10 text-white"
                    }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Context-aware Product Recommendations */}
                {msg.role === "model" && msg.products && msg.products.length > 0 && (
                  <div className="flex flex-col gap-2 w-full max-w-[85%] mt-1.5">
                    {msg.products.map((prod) => (
                      <a
                        key={prod.id}
                        href={`/shop/${prod.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/40 rounded-[4px] w-full transition-all duration-300 hover:scale-[1.01] group"
                      >
                        <div className="relative w-10 h-10 rounded-[2px] overflow-hidden bg-white/5 flex-shrink-0">
                          <Image
                            src={prod.image}
                            alt={prod.name}
                            fill
                            sizes="40px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-[9px] font-bold text-white truncate group-hover:text-accent transition-colors duration-300 leading-tight">
                            {prod.name}
                          </h5>
                          <p className="text-[8px] text-accent font-black mt-0.5">
                            Rs. {prod.price.toLocaleString()}
                          </p>
                        </div>
                        <span className="text-[10px] text-white/40 group-hover:text-accent transition-colors font-bold pr-1">
                          &rarr;
                        </span>
                      </a>
                    ))}
                  </div>
                )}

                <span className="text-[7px] sm:text-[8px] font-extrabold text-white/45 uppercase tracking-widest mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Multi-Phase Loading Status */}
            {isLoading && (
              <div className="flex flex-col items-start animate-in fade-in duration-300">
                <div className="bg-white/10 border border-white/10 px-3.5 py-2.5 rounded-[4px] flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-accent animate-bounce" />
                    <span className="text-[9px] sm:text-[10px] font-bold text-white/75 ml-1 select-none animate-pulse">
                      {LOADING_PHASES[loadingPhaseIndex]}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Branded Suggestions (Lenis prevented scroll container) */}
          {messages.length === 1 && (
            <div className="px-3 py-2 border-t border-white/10 bg-white/5">
              <span className="text-[7px] sm:text-[8px] font-black text-white/50 uppercase tracking-widest block mb-1.5">
                Suggested questions
              </span>
              <div
                data-lenis-prevent
                className="flex flex-col gap-1 max-h-[85px] sm:max-h-[110px] overflow-y-auto overscroll-contain pr-1 relative"
              >
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s.query)}
                    className="text-[8px] sm:text-[9px] font-bold text-left tracking-wide px-2.5 py-1.5 rounded-[4px] bg-white/5 hover:bg-accent/15 border border-white/10 hover:border-accent/40 text-white transition-all duration-200 cursor-pointer flex items-center justify-between"
                  >
                    <span>{s.label}</span>
                    <span className="text-accent text-[7px] sm:text-[8px] font-extrabold uppercase tracking-widest">Ask →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Footer Panel */}
          <div className="p-2 sm:p-3 border-t border-white/10 bg-white/5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your query..."
                disabled={isLoading}
                className="flex-1 bg-white/5 border border-white/10 focus:border-accent/40 rounded-[4px] px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 text-[11px] sm:text-xs text-white placeholder-white/40 focus:outline-none transition-colors duration-200 font-medium"
              />
              <button
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="px-3 py-1.5 sm:px-4 sm:py-2.5 bg-accent hover:bg-accent/90 disabled:bg-white/10 disabled:text-white/40 text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase rounded-[4px] shadow-sm hover:scale-[1.03] active:scale-[0.97] disabled:scale-100 transition-all duration-200 cursor-pointer flex items-center justify-center"
                aria-label="Send query"
              >
                Send
              </button>
            </div>

            <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-black tracking-widest uppercase text-white/40 px-1">
              <span>Secure Brand AI Assistant</span>
              <a
                href="https://wa.me/9779706247439"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline flex items-center gap-0.5 transition-colors"
              >
                WhatsApp Human Chat
                <ExternalLink className="w-2 h-2" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
