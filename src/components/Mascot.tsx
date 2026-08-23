"use client";

import { useState, useEffect } from "react";

export function SomethingMascot({ 
  size = 100, 
  animate = true,
  className = "" 
}: { 
  size?: number;
  animate?: boolean;
  className?: string;
}) {
  const [position, setPosition] = useState(0);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!animate) return;
    
    const interval = setInterval(() => {
      setPosition(Math.sin(Date.now() / 1000) * 10);
      setRotation(Math.sin(Date.now() / 1500) * 5);
    }, 100);

    return () => clearInterval(interval);
  }, [animate]);

  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size,
        transform: `translateY(${position}px) rotate(${rotation}deg)`
      }}
    >
      {/* Coin body */}
      <div className="relative rounded-full bg-gradient-to-br from-green-400 to-green-600 border-4 border-black shadow-[0_0_20px_rgba(34,197,94,0.5)]">
        {/* Comic outline */}
        <div className="absolute inset-[-4px] rounded-full border-2 border-black -z-10" />
        
        {/* Dollar sign */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-black text-black">S</span>
        </div>
        
        {/* Rocket trails */}
        <div className="absolute top-[-10px] left-[-10px] w-2 h-4 bg-green-300 rounded-t-full opacity-50" 
             style={{ animation: animate ? 'trail 2s infinite' : 'none' }} />
        <div className="absolute top-[-8px] right-[-8px] w-2 h-3 bg-green-300 rounded-r-full opacity-50"
             style={{ animation: animate ? 'trail 2s infinite 0.3s' : 'none' }} />
      </div>
      
      {/* Sparkles */}
      {animate && (
        <>
          <div className="absolute top-[-8px] left-[-8px] w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
          <div className="absolute bottom-[-8px] right-[-8px] w-2 h-2 bg-yellow-300 rounded-full animate-pulse" 
               style={{ animationDelay: '0.5s' }} />
        </>
      )}
    </div>
  );
}

export function FloatingMemeIcon({ 
  children, 
  delay = 0 
}: { 
  children: React.ReactNode;
  delay?: number;
}) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => prev + 0.5);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      style={{ 
        animationDelay: `${delay}s`,
        animation: 'float 4s ease-in-out infinite'
      }}
    >
      <div style={{ transform: `rotate(${rotation}deg)` }}>
        {children}
      </div>
    </div>
  );
}