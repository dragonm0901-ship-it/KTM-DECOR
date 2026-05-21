"use client";

import dynamic from "next/dynamic";

const ChatbotWidget = dynamic(() => import("@/components/ChatbotWidget"), { ssr: false });
const GlobalCart = dynamic(() => import("@/components/GlobalCart"), { ssr: false });

export function ClientProviders() {
  return (
    <>
      <ChatbotWidget />
      <GlobalCart />
    </>
  );
}
