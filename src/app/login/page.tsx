import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { PROJECT_CONFIG } from "@/config/project";

export const metadata = {
  title: "Login / Sign Up - Pump Something",
  description: "Claim your $SOMETHING community profile or start earning verified contribution points.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="px-4 pb-16 pt-28 md:pt-32">
        <div className="container mx-auto max-w-6xl">
          <section className="rounded-[2rem] border border-green-400/30 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.24),transparent_36%),linear-gradient(135deg,rgba(0,0,0,0.96),rgba(8,20,12,0.92))] p-6 text-center shadow-[0_0_45px_rgba(34,197,94,0.14)] sm:p-10">
            <p className="mb-4 inline-flex rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-black text-green-300">
              $SOMETHING COMMUNITY ACCESS
            </p>
            <h1 className="mb-5 text-5xl font-black leading-none text-white sm:text-6xl md:text-7xl">
              LOGIN / <span className="text-green-400">SIGN UP</span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-white/70">
              $SOMETHING does not use passwords yet. Existing contributors log in by claiming their public profile with the Solana wallet already attached to their verified contribution record. New members sign up by doing a mission or submitting something for review.
            </p>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-cyan-400/25 bg-cyan-400/5 p-6 sm:p-8">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-cyan-300">Existing contributor</p>
              <h2 className="mb-4 text-4xl font-black text-white">CLAIM YOUR PROFILE</h2>
              <p className="mb-5 text-white/70">
                Find your leaderboard profile, open it, then use “CLAIM WITH WALLET.” The signature proves wallet ownership only. It cannot move funds or approve a transaction.
              </p>
              <div className="mb-6 space-y-3 rounded-2xl border border-white/10 bg-black/45 p-4 text-left text-sm text-white/65">
                <p><span className="font-black text-cyan-200">1.</span> Go to the leaderboard.</p>
                <p><span className="font-black text-cyan-200">2.</span> Open your public profile.</p>
                <p><span className="font-black text-cyan-200">3.</span> Sign the profile-claim message with the wallet already on your member record.</p>
                <p><span className="font-black text-cyan-200">4.</span> Edit your bio, avatar, and wallet visibility.</p>
              </div>
              <Link href="/leaderboard" className="inline-flex w-full justify-center rounded-full bg-cyan-300 px-6 py-4 font-black text-black hover:bg-cyan-200 sm:w-auto">
                FIND MY PROFILE
              </Link>
            </div>

            <div className="rounded-3xl border border-green-400/25 bg-green-400/5 p-6 sm:p-8">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-green-300">New member</p>
              <h2 className="mb-4 text-4xl font-black text-white">SIGN UP BY DOING SOMETHING</h2>
              <p className="mb-5 text-white/70">
                Complete a mission or submit a contribution. After admin review, approved activity creates your member profile, points, streaks, achievements, and Contribution Score.
              </p>
              <div className="mb-6 space-y-3 rounded-2xl border border-white/10 bg-black/45 p-4 text-left text-sm text-white/65">
                <p><span className="font-black text-green-300">1.</span> Pick a mission or contribution type.</p>
                <p><span className="font-black text-green-300">2.</span> Post public proof on X, Telegram, or another supported social platform.</p>
                <p><span className="font-black text-green-300">3.</span> Submit proof for admin review.</p>
                <p><span className="font-black text-green-300">4.</span> Once approved, your public profile and leaderboard stats update automatically.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/missions" className="inline-flex w-full justify-center rounded-full bg-green-500 px-6 py-4 font-black text-black hover:bg-green-400 sm:w-auto">
                  START A MISSION
                </Link>
                <Link href="/leaderboard" className="inline-flex w-full justify-center rounded-full border border-green-400/40 px-6 py-4 font-black text-green-200 hover:bg-green-400/10 sm:w-auto">
                  SUBMIT CONTRIBUTION
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-5 text-sm text-yellow-100/80 sm:p-6">
            <p className="font-black text-yellow-200">SECURITY NOTE</p>
            <p className="mt-2">
              Never enter a seed phrase or private key. $SOMETHING profile login only uses public-wallet message signing. Points, achievements, and Contribution Score still come from verified server-side activity, not from anything submitted by the browser.
            </p>
          </section>

          <section className="mt-6 rounded-3xl border border-purple-400/20 bg-purple-400/5 p-5 text-sm text-white/60 sm:p-6">
            Community links: <Link href={PROJECT_CONFIG.telegramUrl} target="_blank" rel="noopener noreferrer" className="font-black text-green-300 underline underline-offset-4">Telegram</Link> · <Link href={PROJECT_CONFIG.xUrl} target="_blank" rel="noopener noreferrer" className="font-black text-cyan-300 underline underline-offset-4">X</Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
