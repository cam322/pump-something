import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PROJECT_CONFIG } from "@/config/project";

export const metadata = {
  title: "Community - Pump Something ($SOMETHING)",
  description: "Join the Pump Something community - meme creators and internet culture fans",
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
            <span className="text-green-400">DON&apos;T JUST WATCH SOMETHING HAPPEN.</span>
          </h1>
          <p className="text-white/60 text-xl">Be part of the movement</p>
        </div>
      </section>

      {/* Community CTA */}
      <section className="py-14 px-4 md:py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6 sm:text-4xl">
              <span className="text-green-400">BE PART OF $SOMETHING.</span>
            </h2>
          </div>

          <div className="bg-black/50 p-5 rounded-xl border border-green-500/20 mb-12 sm:p-8">
            <p className="text-white/80 mb-6 text-lg">
              Join a community of meme creators, internet culture enthusiasts, and Solana believers who are all doing something together.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-green-400 font-bold text-xl mb-4">Community Members Can:</h3>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Find trending stories from the internet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Submit meme ideas and concepts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Create and share original memes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Vote on community submissions</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-green-400 font-bold text-xl mb-4">Community Members Can:</h3>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Help shape the community direction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Meet other people doing something</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Share memes across platforms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Be part of internet culture</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              href={PROJECT_CONFIG.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-3 px-6 py-4 bg-green-500 text-black font-bold text-base rounded-full hover:bg-green-400 transition-all transform hover:scale-105 sm:w-auto sm:px-8 sm:text-xl"
            >
              JOIN TELEGRAM
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            {PROJECT_CONFIG.xUrl && (
              <Link
                href={PROJECT_CONFIG.xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-3 px-6 py-4 border-2 border-green-500 text-green-400 font-bold text-base rounded-full hover:bg-green-500 hover:text-black transition-all sm:w-auto sm:px-8 sm:text-xl"
              >
                CONTINUE ON X
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}