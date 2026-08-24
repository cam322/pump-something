"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { MemeGenerator } from "./MemeGenerator";

// Global event emitter for modal control
interface EventDetail {
  type: "open" | "close";
}

const MemeGeneratorContext = createContext<{
  isOpen: boolean;
  open: () => void;
  close: () => void;
} | null>(null);

const EVENT_NAME = "pumpsomething-meme-generator";

export function MemeGeneratorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: CustomEvent<EventDetail>) => {
      if (e.detail.type === "open") {
        setIsOpen(true);
      } else if (e.detail.type === "close") {
        setIsOpen(false);
      }
    };

    window.addEventListener(EVENT_NAME, handler as EventListener);
    return () => window.removeEventListener(EVENT_NAME, handler as EventListener);
  }, []);

  const open = () => {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { type: "open" } }));
  };

  const close = () => {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { type: "close" } }));
  };

  return (
    <MemeGeneratorContext.Provider value={{ isOpen, open, close }}>
      {children}
      {isOpen && <MemeGenerator onClose={close} />}
    </MemeGeneratorContext.Provider>
  );
}

export function useMemeGenerator() {
  const context = useContext(MemeGeneratorContext);
  if (!context) {
    throw new Error("useMemeGenerator must be used within MemeGeneratorProvider");
  }
  return context;
}

// Helper function to open the meme generator from anywhere
export function openMemeGenerator() {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { type: "open" } }));
}