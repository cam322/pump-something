import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CopyButton } from "@/components/CopyButton";
import { PROJECT_CONFIG } from "@/config/project";

export const metadata = {
  title: "Token - Pump Something ($SOMETHING)",
  description: "Token information for Pump Something - $SOMETHING on Solana",
};

export default function TokenPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Header */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            <span className="text-green-400">THE ACTUAL</span>{" "}
            <span className="text-white">$SOMETHING</span>
          </h1>
          <p className="text-white/60 text-xl">Token details on Solana</p>
        </div>
      </section>

      {/* Token Info */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-gradient-to-br from-green-500/20 to-purple-500/20 p-8 rounded-xl border border-green-500/30 mb-12">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-white/60 mb-2">Network:</p>
                <p className="text-green-400 text-lg">Solana</p>
              </div>
              
              <div>
                <p className="text-white/60 mb-2">Ticker:</p>
                <p className="text-green-400 text-3xl font-black" style={{ textShadow: "0 0 10px rgba(34, 197, 94, 0.7)" }}>$SOMETHING</p>
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

          {/* Transparency Notice */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-12">
            <h3 className="text-red-400 font-bold text-xl mb-4">Important Information</h3>
            <p className="text-white/80 mb-4">
              $SOMETHING is a community meme token created for entertainment and community purposes.
            </p>
            <p className="text-white/70 mb-4">
              <strong>What we do NOT have:</strong>
            </p>
            <ul className="space-y-2 text-white/70">
              <li>• Guaranteed profits or returns</li>
              <li>• Specific future prices or roadmap</li>
              <li>• Audit certificates or verification badges</li>
              <li>• Team members or founders (this is decentralized)</li>
              <li>• Exchange listings</li>
            </ul>
            <div className="mt-6 p-4 bg-black/30 rounded-lg">
              <p className="text-white/90">
                <strong>Cryptocurrency is risky.</strong> Never spend more than you can afford to lose. Nothing on this website is financial advice.
              </p>
            </div>
          </div>

          {/* How to Buy */}
          <div className="bg-black/50 p-8 rounded-xl border border-green-500/20">
            <h3 className="text-2xl font-bold text-green-400 mb-4">How to View/Trade $SOMETHING</h3>
            <ol className="space-y-4 text-white/80">
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">1.</span>
                <span>Click &quot;VIEW ON PUMP.FUN&quot; above to see the token page</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">2.</span>
                <span>Use a Solana wallet like Phantom, Solflare, or Backpack</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">3.</span>
                <span>Connect your wallet to pump.fun to trade or create a bonding curve</span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}