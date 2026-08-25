"use client";

import { useState } from "react";
import Link from "next/link";
import { COMMUNITY_REWARDS_RESERVE, CONTRIBUTION_TYPES, PLATFORMS } from "@/config/leaderboard";
import type { ContributionType, Platform } from "@/config/leaderboard";
import type { LeaderboardEntry, LeaderboardResponse } from "@/lib/leaderboard/types";

type SubmitState = "idle" | "submitting" | "success" | "error";

function usernameFor(entry: LeaderboardEntry) {
  const member = entry.member;
  return member.telegramUsername || member.xUsername || member.discordUsername || member.otherUsername || "community";
}

function podiumLabel(index: number) {
  return index === 0 ? "🥇 #1" : index === 1 ? "🥈 #2" : "🥉 #3";
}

export function LeaderboardClient({ initialData }: { initialData: LeaderboardResponse }) {
  const [data, setData] = useState(initialData);
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedMember, setSelectedMember] = useState<LeaderboardEntry | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    platform: "Telegram" as Platform,
    type: "MEME" as ContributionType,
    description: "",
    proofUrl: "",
    walletAddress: "",
  });

  async function refreshLeaderboard() {
    const response = await fetch("/api/leaderboard", { cache: "no-store" });
    if (response.ok) setData(await response.json());
  }

  async function submitContribution(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");
    setMessage("");

    const response = await fetch("/api/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setSubmitState("error");
      setMessage(result.error || "Something went wrong while submitting something.");
      return;
    }

    setSubmitState("success");
    setMessage("YOUR CONTRIBUTION IS WAITING FOR REVIEW.");
    setForm((current) => ({ ...current, description: "", proofUrl: "", walletAddress: "" }));
    await refreshLeaderboard();
  }

  return (
    <>
      <section className="pt-28 pb-10 px-4 md:pt-32">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 font-bold text-sm">
            START WITH NOTHING. BUILD $SOMETHING.
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-4">
            🏆 <span className="text-green-400">$SOMETHING</span> LEADERBOARD
          </h1>
          <p className="text-2xl sm:text-3xl font-black text-white mb-4">WHO&apos;S ACTUALLY DOING SOMETHING?</p>
          <p className="max-w-2xl mx-auto text-white/70 text-lg mb-8">
            Earn points by contributing to the $SOMETHING community.
          </p>
          <button
            onClick={() => setShowSubmit(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-green-500 text-black font-black text-lg hover:bg-green-400 transition-all"
          >
            SUBMIT SOMETHING
          </button>
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="container mx-auto max-w-6xl">
          {!data.storageConfigured && (
            <div className="mb-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-yellow-100">
              Leaderboard storage is waiting for production database environment variables. No fake production scores are being shown.
            </div>
          )}

          {data.entries.length === 0 ? (
            <div className="rounded-3xl border border-green-500/30 bg-black/60 p-8 text-center shadow-[0_0_30px_rgba(34,197,94,0.12)]">
              <p className="text-3xl sm:text-4xl font-black text-green-400 mb-3">NO ONE HAS DONE SOMETHING YET.</p>
              <p className="text-2xl font-black text-white mb-6">BE THE FIRST.</p>
              <button onClick={() => setShowSubmit(true)} className="w-full sm:w-auto px-8 py-4 rounded-full bg-green-500 text-black font-black">
                SUBMIT SOMETHING
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3 mb-10 items-end">
                {data.topThree.map((entry, index) => (
                  <button
                    key={entry.member.id}
                    onClick={() => setSelectedMember(entry)}
                    className={`text-left rounded-3xl border p-5 bg-black/70 transition-all hover:border-green-400 ${index === 0 ? "md:order-2 border-green-400 shadow-[0_0_35px_rgba(34,197,94,0.22)] md:scale-105" : index === 1 ? "md:order-1 border-cyan-400/40" : "md:order-3 border-purple-400/40"}`}
                  >
                    <div className="text-2xl font-black mb-3">{podiumLabel(index)}</div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 text-black font-black flex items-center justify-center text-xl">
                        {entry.member.displayName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-white text-xl truncate">{entry.member.displayName}</p>
                        <p className="text-green-400 truncate">@{usernameFor(entry)}</p>
                      </div>
                    </div>
                    <p className="text-4xl font-black text-green-400">{entry.points.toLocaleString()}</p>
                    <p className="text-white/60 mb-3">POINTS</p>
                    <p className="text-white font-bold">{entry.rankTitle}</p>
                    <p className="text-white/60">{entry.verifiedContributions} verified contributions</p>
                  </button>
                ))}
              </div>

              <div className="rounded-3xl border border-green-500/20 bg-black/60 overflow-hidden mb-10">
                <div className="p-5 border-b border-green-500/20">
                  <h2 className="text-2xl font-black text-green-400">FULL LEADERBOARD</h2>
                </div>
                <div className="divide-y divide-green-500/10">
                  {data.entries.map((entry, index) => (
                    <button key={entry.member.id} onClick={() => setSelectedMember(entry)} className="w-full grid grid-cols-[auto_1fr] sm:grid-cols-[56px_1fr_120px_130px_190px] gap-3 p-4 text-left hover:bg-green-500/5 transition-all">
                      <div className="text-green-400 font-black">#{index + 1}</div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{entry.member.displayName}</p>
                        <p className="text-sm text-white/50 truncate">@{usernameFor(entry)}</p>
                      </div>
                      <div className="font-black text-green-400 sm:text-right">{entry.points.toLocaleString()}<span className="sm:hidden text-white/50"> pts</span></div>
                      <div className="text-white/70 sm:text-right">{entry.verifiedContributions}<span className="sm:hidden"> contributions</span></div>
                      <div className="text-white/80 font-bold sm:text-right col-span-2 sm:col-span-1">{entry.rankTitle}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="container mx-auto max-w-6xl grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-6">
            <h2 className="text-3xl font-black text-cyan-300 mb-4">SOMETHING IS HAPPENING</h2>
            {data.recentActivity.length === 0 ? (
              <p className="text-white/60">NOTHING HAS HAPPENED YET. GO DO SOMETHING.</p>
            ) : (
              <div className="space-y-3">
                {data.recentActivity.map(({ member, contribution }) => (
                  <div key={contribution.id} className="rounded-xl bg-black/50 border border-white/10 p-4">
                    <p className="font-bold text-white">{member.displayName} created SOMETHING.</p>
                    <p className="text-green-400 font-black">+{contribution.pointsAwarded} {contribution.type}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-purple-400/20 bg-purple-400/5 p-6">
            <h2 className="text-3xl font-black text-purple-300 mb-4">COMMUNITY REWARDS</h2>
            <p className="text-white/80 mb-4">
              {COMMUNITY_REWARDS_RESERVE} has been designated for future community rewards.
            </p>
            <p className="text-white/60">
              Points recognize verified contributions. Points do not represent guaranteed token payments, cash value, investment returns, or a guaranteed conversion rate. No automatic transfers are implemented.
            </p>
          </div>
        </div>
      </section>

      {showSubmit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-3 pt-20 sm:p-6" onClick={() => setShowSubmit(false)}>
          <form onSubmit={submitContribution} onClick={(event) => event.stopPropagation()} className="mx-auto max-w-xl rounded-3xl border border-green-500/30 bg-black p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-3xl font-black text-green-400">SUBMIT SOMETHING</h2>
                <p className="text-white/60">Your contribution goes pending until an admin reviews it.</p>
              </div>
              <button type="button" onClick={() => setShowSubmit(false)} className="h-11 w-11 rounded-full bg-white/10 text-white">✕</button>
            </div>

            {submitState === "success" && <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-300 font-bold">SOMETHING SUBMITTED. 🟢<br />{message}</div>}
            {submitState === "error" && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 font-bold">{message}</div>}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-white/80 font-bold">DISPLAY NAME<input required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="mt-2 w-full rounded-xl bg-white/10 border border-white/10 p-3 text-white" /></label>
              <label className="block text-white/80 font-bold">USERNAME<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="mt-2 w-full rounded-xl bg-white/10 border border-white/10 p-3 text-white" /></label>
              <label className="block text-white/80 font-bold">PLATFORM<select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })} className="mt-2 w-full rounded-xl bg-black border border-white/10 p-3 text-white">{PLATFORMS.map((platform) => <option key={platform}>{platform}</option>)}</select></label>
              <label className="block text-white/80 font-bold">CONTRIBUTION TYPE<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ContributionType })} className="mt-2 w-full rounded-xl bg-black border border-white/10 p-3 text-white">{CONTRIBUTION_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
            </div>
            <label className="block text-white/80 font-bold mt-4">DESCRIPTION<textarea required minLength={10} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 min-h-28 w-full rounded-xl bg-white/10 border border-white/10 p-3 text-white" /></label>
            <label className="block text-white/80 font-bold mt-4">PROOF / URL<input value={form.proofUrl} onChange={(e) => setForm({ ...form, proofUrl: e.target.value })} placeholder="https://..." className="mt-2 w-full rounded-xl bg-white/10 border border-white/10 p-3 text-white" /></label>
            <label className="block text-white/80 font-bold mt-4">WALLET ADDRESS <span className="text-white/40">OPTIONAL</span><input value={form.walletAddress} onChange={(e) => setForm({ ...form, walletAddress: e.target.value })} className="mt-2 w-full rounded-xl bg-white/10 border border-white/10 p-3 text-white" /></label>
            <p className="mt-3 text-yellow-300 font-bold">NEVER SUBMIT YOUR SEED PHRASE OR PRIVATE KEY.</p>
            <button disabled={submitState === "submitting"} className="mt-6 w-full rounded-full bg-green-500 px-6 py-4 text-black font-black hover:bg-green-400 disabled:opacity-60">
              {submitState === "submitting" ? "SUBMITTING SOMETHING..." : "SUBMIT SOMETHING"}
            </button>
          </form>
        </div>
      )}

      {selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-3 pt-20 sm:p-6" onClick={() => setSelectedMember(null)}>
          <div onClick={(event) => event.stopPropagation()} className="mx-auto max-w-lg rounded-3xl border border-green-500/30 bg-black p-5 sm:p-6">
            <button onClick={() => setSelectedMember(null)} className="float-right h-10 w-10 rounded-full bg-white/10 text-white">✕</button>
            <p className="text-green-400 font-black text-sm">@{usernameFor(selectedMember)}</p>
            <h2 className="text-4xl font-black text-white mb-2">{selectedMember.member.displayName.toUpperCase()}</h2>
            <p className="text-2xl text-green-400 font-black mb-4">{selectedMember.rankTitle}</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-xl bg-white/5 p-4"><p className="text-3xl font-black text-green-400">{selectedMember.points.toLocaleString()}</p><p className="text-white/50">POINTS</p></div>
              <div className="rounded-xl bg-white/5 p-4"><p className="text-3xl font-black text-green-400">{selectedMember.verifiedContributions}</p><p className="text-white/50">VERIFIED</p></div>
            </div>
            <p className="text-white/60 mb-4">First contribution/member record: {new Date(selectedMember.member.createdAt).toLocaleDateString()}</p>
            <h3 className="text-xl font-black text-white mb-3">RECENT VERIFIED CONTRIBUTIONS</h3>
            {selectedMember.recentContributions.length === 0 ? <p className="text-white/50">Nothing approved yet.</p> : (
              <div className="space-y-3">
                {selectedMember.recentContributions.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-green-400 font-black">+{item.pointsAwarded} {item.type}</p>
                    <p className="text-white/70">{item.description}</p>
                    {item.proofUrl && <Link href={item.proofUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">View proof</Link>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
