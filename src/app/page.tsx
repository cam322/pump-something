import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CopyButton } from "@/components/CopyButton";
import { SomethingMascot } from "@/components/Mascot";
import { PROJECT_CONFIG } from "@/config/project";

export const metadata = {
  title: "Pump Something ($SOMETHING) | Solana Meme Community",
  description: "The internet is always doing SOMETHING. $SOMETHING is a community-powered meme project built on Solana. Find something. Meme something. Create something.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-4">
        <div className="container mx-auto text-center">
          {/* $SOMETHING Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full mb-12">
            <span className="text-green-400 font-bold text-lg">$SOMETHING • SOLANA</span>
          </div>

          {/* Main Title */}
          <h1 className="text-7xl md:text-8xl font-black mb-8 leading-none">
            <span className="text-green-400">PUMP</span>
            <span className="text-white neon-glow">SOMETHING</span>
          </h1>

          {/* Subtitles */}
          <div className="mb-12">
            <p className="text-3xl md:text-4xl font-bold mb-4 text-white/90">
              The internet is always doing SOMETHING.
            </p>
            <p className="text-2xl md:text-3xl italic text-white/70">
              Let&apos;s meme it.
            </p>
          </div>

          {/* Supporting Copy */}
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-12">
            $SOMETHING is a community-powered meme project built on Solana. We find what&apos;s happening on the internet and turn it into memes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link
              href={PROJECT_CONFIG.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-green-500 text-black font-bold text-lg rounded-full hover:bg-green-400 transition-all duration-300"
            >
              JOIN THE COMMUNITY
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href={PROJECT_CONFIG.pumpfunUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 border-2 border-green-500 text-green-400 font-bold text-lg rounded-full hover:bg-green-500 hover:text-black transition-all duration-300"
            >
              VIEW $SOMETHING
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Mascot */}
          <div className="inline-block">
            <SomethingMascot size={150} animate={true} />
          </div>
        </div>
      </section>

      {/* Something Is Happening Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-black to-green-900/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="text-green-400">SOMETHING</span>
              <span className="text-white"> IS HAPPENING.</span>
            </h2>
            <p className="text-white/60 text-xl max-w-2xl mx-auto">
              The internet never stops.
            </p>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-white/70 mb-6">
              Every day something happens.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-black/50 p-6 rounded-xl border border-green-500/20">
                <p className="text-white/80 mb-4">A game leaks.</p>
              </div>
              <div className="bg-black/50 p-6 rounded-xl border border-green-500/20">
                <p className="text-white/80 mb-4">A weird animal becomes famous.</p>
              </div>
              <div className="bg-black/50 p-6 rounded-xl border border-green-500/20">
                <p className="text-white/80 mb-4">Crypto loses its mind.</p>
              </div>
            </div>

            <div className="mt-12 p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-2xl text-green-400 font-bold">We turn it into memes.</p>
              <p className="text-white/70 mt-2">That&apos;s $SOMETHING.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="about-section" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="text-green-400">THE $SOMETHING</span>
              <span className="text-white">MISSION</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Find Something */}
            <div className="text-center p-6 bg-black/50 rounded-xl border border-green-500/20 hover:border-green-500/50 transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">FIND SOMETHING</h3>
              <p className="text-white/70 text-sm">Find interesting things happening around the internet.</p>
            </div>

            {/* Meme Something */}
            <div className="text-center p-6 bg-black/50 rounded-xl border border-green-500/20 hover:border-green-500/50 transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">📸</span>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">MEME SOMETHING</h3>
              <p className="text-white/70 text-sm">Turn trends, jokes, stories, and internet moments into memes.</p>
            </div>

            {/* Create Something */}
            <div className="text-center p-6 bg-black/50 rounded-xl border border-green-500/20 hover:border-green-500/50 transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">CREATE SOMETHING</h3>
              <p className="text-white/70 text-sm">Create original community content.</p>
            </div>

            {/* Build Something */}
            <div className="text-center p-6 bg-black/50 rounded-xl border border-green-500/20 hover:border-green-500/50 transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">BUILD SOMETHING</h3>
              <p className="text-white/70 text-sm">Build the community together.</p>
            </div>

            {/* Do Something */}
            <div className="text-center p-6 bg-black/50 rounded-xl border border-green-500/20 hover:border-green-500/50 transition-all">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">DO SOMETHING</h3>
              <p className="text-white/70 text-sm">Have fun on Solana.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What is $SOMETHING? Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-black to-purple-900/20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                <span className="text-green-400">WHAT</span>
                <span className="text-white"> IS $SOMETHING?</span>
              </h2>
            </div>

            <div className="space-y-6">
              <div className="bg-black/50 p-6 rounded-xl border border-green-500/20">
                <p className="text-2xl text-white/90"><span className="text-green-400 font-bold">What is $SOMETHING?</span></p>
                <p className="text-white/70 mt-2">Something.</p>
              </div>
              
              <div className="bg-black/50 p-6 rounded-xl border border-green-500/20">
                <p className="text-2xl text-white/90"><span className="text-green-400 font-bold">What does it do?</span></p>
                <p className="text-white/70 mt-2">Something.</p>
              </div>

              <div className="bg-black/50 p-6 rounded-xl border border-green-500/20">
                <p className="text-2xl text-white/90"><span className="text-green-400 font-bold">What&apos;s the roadmap?</span></p>
                <p className="text-white/70 mt-2">We&apos;ll think of something.</p>
              </div>

              <div className="bg-black/50 p-6 rounded-xl border border-green-500/20">
                <p className="text-2xl text-white/90"><span className="text-green-400 font-bold">Why does it exist?</span></p>
                <p className="text-white/70 mt-2">Because somebody had to do something.</p>
              </div>

              <div className="bg-black/50 p-6 rounded-xl border border-green-500/20">
                <p className="text-2xl text-white/90"><span className="text-green-400 font-bold">What blockchain?</span></p>
                <p className="text-white/70 mt-2">Solana.</p>
              </div>
            </div>

            <div className="mt-12 p-8 bg-gradient-to-br from-green-500/10 to-purple-500/10 rounded-xl border border-green-500/30">
              <h3 className="text-3xl text-green-400 font-bold mb-4">Okay, seriously...</h3>
              <p className="text-white/80">
                $SOMETHING is a community built around internet memes and whatever happens online next. The community finds trends, creates memes, shares them, and helps shape the project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Token Section */}
      <section id="token-section" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="text-green-400">THE ACTUAL</span>
              <span className="text-white">$SOMETHING</span>
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-black/50 p-8 rounded-xl border border-green-500/20">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-white/60 mb-2">Network:</p>
                  <p className="text-green-400 text-lg">Solana</p>
                </div>
                
                <div>
                  <p className="text-white/60 mb-2">Ticker:</p>
                  <p className="text-green-400 text-2xl font-bold" style={{ textShadow: "0 0 10px rgba(34, 197, 94, 0.7)" }}>$SOMETHING</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-green-500/20">
                <p className="text-white/60 mb-2">Contract Address:</p>
                <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg font-mono text-sm break-all">
                  <code className="text-green-400 flex-1 break-all">{PROJECT_CONFIG.contractAddress}</code>
                  <CopyButton text={PROJECT_CONFIG.contractAddress} label="COPY" />
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href={PROJECT_CONFIG.pumpfunUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all"
                >
                  VIEW ON PUMP.FUN
                </Link>
              </div>

              <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 font-bold text-center">
                  ⚠️ ALWAYS VERIFY THE CONTRACT ADDRESS
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-black to-red-900/20">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-black mb-8">
              <span className="text-red-400">NO MYSTERY ABOUT THE IMPORTANT STUFF.</span>
            </h2>
            
            <div className="bg-black/50 p-8 rounded-xl border border-red-500/20">
              <p className="text-white/80 mb-6">
                $SOMETHING is a community meme token built around entertainment, internet culture, and community participation.
              </p>
              
              <p className="text-white/70 mb-6">
                It does not promise:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-red-500/10 p-4 rounded-lg">
                  <p className="text-red-300">❌ Guaranteed profits</p>
                </div>
                <div className="bg-red-500/10 p-4 rounded-lg">
                  <p className="text-red-300">❌ Guaranteed returns</p>
                </div>
                <div className="bg-red-500/10 p-4 rounded-lg">
                  <p className="text-red-300">❌ Specific future prices</p>
                </div>
                <div className="bg-red-500/10 p-4 rounded-lg">
                  <p className="text-red-300">❌ 10x or 100x returns</p>
                </div>
                <div className="bg-red-500/10 p-4 rounded-lg">
                  <p className="text-red-300">❌ Risk-free investing</p>
                </div>
              </div>

              <div className="p-6 bg-black/30 rounded-lg border-t-4 border-green-500">
                <p className="text-white/90 text-lg">
                  <strong>Cryptocurrency is risky.</strong> Never spend more than you can afford to lose. Nothing on this website is financial advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}