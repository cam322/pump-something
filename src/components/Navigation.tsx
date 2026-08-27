"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/about", label: "ABOUT" },
  { href: "/token", label: "TOKEN" },
  { href: "/memes", label: "MEMES" },
  { href: "/missions", label: "⚡ MISSIONS" },
  { href: "/leaderboard", label: "🏆 LEADERBOARD" },
  { href: "/community", label: "COMMUNITY" },
];

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-2 left-2 right-2 z-50 bg-black/90 backdrop-blur-md border border-green-500/20 rounded-lg md:top-4 md:left-4 md:right-4">
      <div className="container mx-auto px-3 py-3 flex justify-between items-center gap-3 md:px-4">
        {/* Brand */}
        <Link href="/" className="min-w-0 text-base font-black text-green-400 hover:text-green-300 transition-colors sm:text-xl md:text-2xl">
          <span className="neon-glow">PUMP SOMETHING</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white hover:text-green-400 transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className="hidden shrink-0 rounded-full border border-green-500/40 px-3 py-2 text-xs font-black text-green-300 transition-colors hover:bg-green-500/10 hover:text-green-200 sm:inline-flex md:text-sm"
          >
            LOGIN / SIGN UP
          </Link>

          {/* Existing CTA - DO SOMETHING */}
          <Link
            href="/do-something"
            className="shrink-0 bg-green-500 text-black font-bold px-3 py-2 rounded-full hover:bg-green-400 transition-colors text-xs sm:text-sm md:text-base md:px-4"
          >
            DO SOMETHING
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-green-500/30 bg-black/60 text-green-400 transition-colors hover:bg-green-500/10 md:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation-menu"
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            <span className="flex flex-col gap-1.5" aria-hidden="true">
              <span className={`block h-0.5 w-5 rounded-full bg-current transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 rounded-full bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 rounded-full bg-current transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-navigation-menu" className="border-t border-green-500/20 px-3 pb-3 md:hidden">
          <div className="grid gap-2 rounded-xl bg-black/70 p-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-black text-white transition-colors hover:bg-green-500/10 hover:text-green-400"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-black text-green-300 transition-colors hover:bg-green-500/20"
            >
              LOGIN / SIGN UP
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
