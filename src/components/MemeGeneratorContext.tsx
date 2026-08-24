"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { MemeGenerator } from "./MemeGenerator";

interface MemeGeneratorContextType {
  openMemeGenerator: () => void;
  closeMemeGenerator: () => void;
  showMemeGenerator: boolean;
}

const MemeGeneratorContext = createContext<MemeGeneratorContextType | null>(null);

export function MemeGeneratorProvider({ children }: { children: ReactNode }) {
  const [showMemeGenerator, setShowMemeGenerator] = useState(false);

  const openMemeGenerator = () => setShowMemeGenerator(true);
  const closeMemeGenerator = () => setShowMemeGenerator(false);

  return (
    <MemeGeneratorContext.Provider value={{ 
      openMemeGenerator, 
      closeMemeGenerator, 
      showMemeGenerator 
    }}>
      {children}
      {showMemeGenerator && (
        <MemeGenerator
          onClose={closeMemeGenerator}
        />
      )}
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