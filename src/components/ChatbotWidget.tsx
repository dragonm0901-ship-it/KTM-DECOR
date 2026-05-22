"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, ExternalLink, X, MessageCircle } from "@/components/ui/solar-icons";

interface Message {
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

// ── Custom SVG Robot Logo (Precision vector conversion of your provided image) ──
function RobotLogo({ className = "w-6 h-6", showCircle = true }: { className?: string; showCircle?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Brand Orange Circle (only when requested) */}
      {showCircle && (
        <circle cx="50" cy="50" r="44" fill="#FE914C" />
      )}

      {/* 2. Robot Side Headphones/Ears */}
      <rect
        x="22"
        y="38"
        width="5"
        height="24"
        rx="2.5"
        fill={showCircle ? "white" : "#FE914C"}
      />
      <rect
        x="73"
        y="38"
        width="5"
        height="24"
        rx="2.5"
        fill={showCircle ? "white" : "#FE914C"}
      />

      {/* 3. Antenna */}
      <rect
        x="48.5"
        y="17"
        width="3"
        height="13"
        rx="1.5"
        fill={showCircle ? "white" : "#FE914C"}
      />
      <circle
        cx="50"
        cy="15"
        r="5.5"
        fill={showCircle ? "white" : "#FE914C"}
      />

      {/* 4. Head + Speech Bubble Tail combined path */}
      <path
        d="M50 26 C63.25 26 74 36.75 74 50 C74 63.25 63.25 74 50 74 C46.5 74 43 73 40 71 L30 78 L34 67 C29.5 62.5 26 56.5 26 50 C26 36.75 36.75 26 50 26 Z"
        fill={showCircle ? "white" : "#FE914C"}
      />

      {/* 5. Visor (Orange Block) */}
      <rect
        x="36"
        y="42"
        width="28"
        height="13"
        rx="3.5"
        fill={showCircle ? "#FE914C" : "white"}
      />

      {/* 6. Eyes (White Circles inside Visor) */}
      <circle
        cx="43"
        cy="48.5"
        r="3"
        fill={showCircle ? "white" : "#FE914C"}
      />
      <circle
        cx="57"
        cy="48.5"
        r="3"
        fill={showCircle ? "white" : "#FE914C"}
      />

      {/* 7. Smiling Mouth (Orange Curve) */}
      <path
        d="M43 60 C43 65 57 65 57 60 Z"
        fill={showCircle ? "#FE914C" : "white"}
      />
    </svg>
  );
}

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

  const chatLogsRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatLogsRef.current) {
      chatLogsRef.current.scrollTo({
        top: chatLogsRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

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
      const history = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

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

      if (!res.ok) {
        throw new Error("API call failed");
      }

      const data = await res.json();

      const botMessage: Message = {
        role: "model",
        text: data.reply || "I'm sorry, I encountered a communication issue. Please try again!",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chatbot transmission error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "I'm sorry, I am currently experiencing connection difficulties. Please feel free to email our team directly at hello@ktmdecor.com or chat with us on WhatsApp!",
          timestamp: new Date(),
        },
      ]);
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] font-sans selection:bg-accent/20">
      {/* 1. Floating Robot Button - Exact Same Logo as used in the chatbox header */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group w-12 h-12 sm:w-14 sm:h-14 aspect-square flex-shrink-0 bg-transparent rounded-full flex items-center justify-center hover:scale-[1.1] active:scale-[0.95] transition-all duration-300 cursor-pointer overflow-visible animate-in fade-in duration-500"
          aria-label="Open AI Assistant"
        >
          {/* Pulsing Neon Glow Ring */}
          <span className="absolute inset-[-4px] rounded-full bg-[#FE914C]/30 border border-[#FE914C]/50 animate-ping pointer-events-none" />

          {/* Sleek Modern Chat Bubble Badge */}
          <div className="w-full h-full rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/25 transition-transform duration-300 group-hover:scale-105 border border-accent/20">
            <MessageCircle className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 animate-pulse" />
          </div>

          <span className="hidden sm:inline-block absolute right-16 top-1/2 -translate-y-1/2 bg-card border border-border text-[9px] font-extrabold tracking-widest uppercase px-3.5 py-2 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
            Light up your questions!
          </span>
        </button>
      )}

      {/* 2. Premium Professional Glassmorphic Chat Box */}
      {isOpen && (
        <div className="w-[300px] sm:w-[360px] h-[420px] sm:h-[480px] max-h-[75vh] sm:max-h-[82vh] max-w-[92vw] bg-black/80 dark:bg-zinc-950/80 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-[4px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 text-white transition-all duration-500">
          {/* Header */}
          <div className="border-b border-white/10 px-3.5 py-3 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-sm shadow-accent/20">
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

                <span className="text-[7px] sm:text-[8px] font-extrabold text-white/45 uppercase tracking-widest mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Typing Loader */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="bg-white/10 border border-white/10 px-3.5 py-2.5 rounded-[4px] flex items-center gap-1">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-bounce" />
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
