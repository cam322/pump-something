import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { PROJECT_CONFIG } from "@/config/project";

export const metadata = {
  title: "Login / Sign Up - Pump Something",
  description: "Connect a wallet to claim or create a verified $SOMETHING community profile.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="px-4 pb-16 pt-28 md:pt-32">
        <div className="container mx-auto max-w-6xl">
          <section className="rounded-[2rem] border border-green-400/30 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.24),transparent_36%),linear-gradient(135deg,rgba(0,0,0,0.96),rgba(8,20,12,0.92))] p-6 text-center shadow-[0_0_45px_rgba(34,197,94,0.14)] sm:p-10">
            <p className="mb-4 inline-flex rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-black text-green-300">$SOMETHING COMMUNITY ACCESS</p>
            <h1 className="mb-5 text-5xl font-black leading-none text-white sm:text-6xl md:text-7xl">LOGIN / <span className="text-green-400">SIGN UP</span></h1>
            <p className="mx-auto max-w-3xl text-lg text-white/70">Connect a Solana wallet to access your account. Existing public profiles require signed wallet verification plus admin approval before they become wallet-linked.</p>
            <Link href="/account" className="mt-6 inline-flex rounded-full bg-green-500 px-8 py-4 font-black text-black hover:bg-green-400">CONNECT WALLET</Link>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/5 p-6 sm:p-8">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-cyan-300">Existing contributor</p>
              <h2 className="mb-4 text-4xl font-black text-white">CLAIM YOUR PROFILE</h2>
              <p className="mb-5 text-white/70">Connect your wallet, search for your existing public profile, sign a one-time claim message, then wait for admin approval. Selecting a profile does not automatically grant ownership.</p>
              <Link href="/account" className="inline-flex w-full justify-center rounded-full bg-cyan-300 px-6 py-4 font-black text-black hover:bg-cyan-200 sm:w-auto">START CLAIM</Link>
            </div>
            <div className="rounded-3xl border border-green-400/25 bg-green-400/5 p-6 sm:p-8">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-green-300">New member</p>
              <h2 className="mb-4 text-4xl font-black text-white">CREATE VERIFIED PROFILE</h2>
              <p className="mb-5 text-white/70">If you do not already have a profile, connect your wallet and create one. Future verified mission and contribution activity can then resolve to that profile.</p>
              <Link href="/account" className="inline-flex w-full justify-center rounded-full bg-green-500 px-6 py-4 font-black text-black hover:bg-green-400 sm:w-auto">CREATE PROFILE</Link>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-5 text-sm text-yellow-100/80 sm:p-6"><p className="font-black text-yellow-200">SECURITY NOTE</p><p className="mt-2">Never enter a seed phrase or private key. Wallet login only asks for a message signature. Points, achievements, rank, streaks, missions, and Contribution Score remain server-controlled and admin-verified.</p></section>
          <section className="mt-6 rounded-3xl border border-purple-400/20 bg-purple-400/5 p-5 text-sm text-white/60 sm:p-6">Community links: <Link href={PROJECT_CONFIG.telegramUrl} target="_blank" rel="noopener noreferrer" className="font-black text-green-300 underline underline-offset-4">Telegram</Link> · <Link href={PROJECT_CONFIG.xUrl} target="_blank" rel="noopener noreferrer" className="font-black text-cyan-300 underline underline-offset-4">X</Link></section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
