import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PROJECT_CONFIG } from "@/config/project";

export const metadata = {
  title: "About - Pump Something ($SOMETHING) | Solana Meme Community",
  description: "Learn about Pump Something - a community-powered meme project on Solana.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Header */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
            <span className="text-green-400">ABOUT</span>
          </h1>
          <p className="text-white/60 text-xl">Understanding the movement</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-14 px-4 md:py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-6 sm:text-4xl">
              <span className="text-green-400">OUR MISSION</span>
            </h2>
            <p className="text-white/70 text-lg">
              We create a community around internet culture by finding trending moments and turning them into memes.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            <div className="text-center p-6 bg-black/50 rounded-xl border border-green-500/20">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">FIND SOMETHING</h3>
              <p className="text-white/70 text-sm">Find interesting things happening around the internet.</p>
            </div>

            <div className="text-center p-6 bg-black/50 rounded-xl border border-green-500/20">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">📸</span>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">MEME SOMETHING</h3>
              <p className="text-white/70 text-sm">Turn trends into memes.</p>
            </div>

            <div className="text-center p-6 bg-black/50 rounded-xl border border-green-500/20">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">CREATE SOMETHING</h3>
              <p className="text-white/70 text-sm">Create original community content.</p>
            </div>

            <div className="text-center p-6 bg-black/50 rounded-xl border border-green-500/20">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">BUILD SOMETHING</h3>
              <p className="text-white/70 text-sm">Build the community together.</p>
            </div>

            <div className="text-center p-6 bg-black/50 rounded-xl border border-green-500/20">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">DO SOMETHING</h3>
              <p className="text-white/70 text-sm">Have fun on Solana.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-14 px-4 bg-gradient-to-r from-black to-purple-900/20 md:py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-6 sm:text-4xl">
              <span className="text-green-400">COMMUNITY</span>
            </h2>
            <p className="text-white/70 text-lg">
              This is not a project with developers or a roadmap. It&apos;s a community that memes whatever&apos;s happening.
            </p>
          </div>

          <div className="bg-black/50 p-5 rounded-xl border border-green-500/20 mb-12 sm:p-8">
            <p className="text-white/80 mb-6">
              Join a community of meme creators, internet culture enthusiasts, and Solana believers who are all doing something together.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-green-400 font-bold text-xl mb-4">Community Members Can:</h3>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Find trending stories and moments from the internet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Submit meme ideas and concepts to the community</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Create memes using our templates or your own style</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Share memes and help others discover them</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-green-400 font-bold text-xl mb-4">Community Members Can:</h3>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Vote on community submissions</span>
                  </li>
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
                    <span>Be part of internet culture</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href={PROJECT_CONFIG.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-3 px-6 py-4 bg-green-500 text-black font-bold text-base rounded-full hover:bg-green-400 transition-all sm:w-auto sm:px-8 sm:text-lg"
            >
              JOIN THE COMMUNITY ON TELEGRAM
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}