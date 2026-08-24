import Link from "next/link";
import { openMemeGenerator } from "./MemeGeneratorContext";

export function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border border-green-500/20 rounded-lg mx-4 mt-4">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand */}
        <Link href="/" className="text-2xl font-black text-green-400 hover:text-green-300 transition-colors">
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

        {/* Desktop CTA - DO SOMETHING */}
        <button
          onClick={openMemeGenerator}
          className="hidden md:flex bg-green-500 text-black font-bold px-4 py-2 rounded-full hover:bg-green-400 transition-colors"
        >
          DO SOMETHING
        </button>
      </div>
    </nav>
  );
}