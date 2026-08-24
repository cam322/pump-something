"use client";

import Link from "next/link";

export function Navigation() {
  return (
    <nav className="fixed top-2 left-2 right-2 z-50 bg-black/90 backdrop-blur-md border border-green-500/20 rounded-lg md:top-4 md:left-4 md:right-4">
      <div className="container mx-auto px-3 py-3 flex justify-between items-center gap-3 md:px-4">
        {/* Brand */}
        <Link href="/" className="min-w-0 text-base font-black text-green-400 hover:text-green-300 transition-colors sm:text-xl md:text-2xl">
          <span className="neon-glow">PUMP SOMETHING</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          <Link
            href="/about"
            className="text-white hover:text-green-400 transition-colors font-medium"
          >
            ABOUT
          </Link>
          <Link
            href="/token"
            className="text-white hover:text-green-400 transition-colors font-medium"
          >
            TOKEN
          </Link>
          <Link
            href="/memes"
            className="text-white hover:text-green-400 transition-colors font-medium"
          >
            MEMES
          </Link>
          <a
            href="#community-section"
            className="text-white hover:text-green-400 transition-colors font-medium"
          >
            COMMUNITY
          </a>
        </div>

        {/* Existing CTA - DO SOMETHING */}
        <Link
          href="/do-something"
          className="shrink-0 bg-green-500 text-black font-bold px-3 py-2 rounded-full hover:bg-green-400 transition-colors text-xs sm:text-sm md:text-base md:px-4"
        >
          DO SOMETHING
        </Link>
      </div>
    </nav>
  );
}
