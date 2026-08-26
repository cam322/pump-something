"use client";

import { useState } from "react";
import { COMMUNITY_REWARDS_RESERVE, PLATFORMS } from "@/config/leaderboard";
import type { Platform } from "@/config/leaderboard";
import type { Mission } from "@/lib/leaderboard/types";

function statusStyle(status: string) {
  if (status === "ACTIVE") return "bg-green-500 text-black";
  if (status === "EXPIRED") return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
  return "bg-white/10 text-white/60 border border-white/10";
}


function MissionCard({ mission, featuredCard = false, onSelect }: { mission: Mission; featuredCard?: boolean; onSelect: (mission: Mission) => void }) {
  return (
    <div className={`rounded-3xl border bg-black/70 p-5 ${featuredCard ? "border-green-400 shadow-[0_0_40px_rgba(34,197,94,0.2)] sm:p-8" : "border-green-500/20"}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle(mission.status)}`}>{mission.status}</span>
        <span className="rounded-full border border-cyan-400/30 px-3 py-1 text-xs font-black text-cyan-200">{mission.category}</span>
        <span className="rounded-full border border-purple-400/30 px-3 py-1 text-xs font-black text-purple-200">{mission.difficulty}</span>
      </div>
      {featuredCard && <p className="mb-2 text-lg font-black text-green-400">⚡ TODAY&apos;S MISSION</p>}
      <h2 className={`${featuredCard ? "text-4xl sm:text-5xl" : "text-2xl"} mb-3 font-black text-white`}>{mission.title}</h2>
      <p className="mb-5 text-white/70">{mission.description}</p>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-green-500/10 p-4"><p className="text-3xl font-black text-green-400">+{mission.points}</p><p className="text-white/60">VERIFIED POINTS</p></div>
        <div className="rounded-xl bg-white/5 p-4"><p className="font-black text-white">{mission.repeatable ? `Every ${mission.cooldownHours || 24}h` : "One-time"}</p><p className="text-white/60">Repeat rule</p></div>
      </div>
      <p className="mb-4 text-sm text-cyan-200"><strong>Proof:</strong> {mission.proofInstructions}</p>
      <p className="mb-5 text-xs text-white/50">Starts {new Date(mission.startAt).toLocaleString()}{mission.endAt ? ` · Ends ${new Date(mission.endAt).toLocaleString()}` : ""}</p>
      <button disabled={mission.status !== "ACTIVE"} onClick={() => onSelect(mission)} className="w-full rounded-full bg-green-500 px-6 py-4 font-black text-black hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40">
        DO THIS MISSION
      </button>
    </div>
  );
}

export function MissionsClient({ missions, storageConfigured }: { missions: Mission[]; storageConfigured: boolean }) {
  const featured = missions.find((mission) => mission.isFeatured && mission.status === "ACTIVE") || missions.find((mission) => mission.status === "ACTIVE");
  const active = missions.filter((mission) => mission.status === "ACTIVE" && mission.id !== featured?.id);
  const endingSoon = missions.filter((mission) => mission.status === "ACTIVE" && mission.endAt).sort((a, b) => Date.parse(a.endAt || "") - Date.parse(b.endAt || "")).slice(0, 4);
  const inactive = missions.filter((mission) => mission.status === "EXPIRED" || mission.status === "ARCHIVED").slice(0, 6);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ displayName: "", username: "", platform: "X" as Platform, description: "", proofUrl: "", walletAddress: "" });

  async function submitMission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMission) return;
    setSubmitStatus("submitting");
    setMessage("");
    const response = await fetch(`/api/missions/${selectedMission.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setSubmitStatus("error");
      setMessage(result.error || "Something went wrong while submitting the mission.");
      return;
    }
    setSubmitStatus("success");
    setMessage("YOUR MISSION COMPLETION IS WAITING FOR REVIEW.");
    setForm((current) => ({ ...current, description: "", proofUrl: "", walletAddress: "" }));
  }

  return (
    <>
      <section className="px-4 pb-10 pt-28 md:pt-32">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-4 text-5xl font-black leading-tight text-green-400 sm:text-6xl md:text-7xl">⚡ DO SOMETHING TODAY</h1>
          <p className="mb-4 text-2xl font-black text-white sm:text-3xl">THE INTERNET IS ALWAYS DOING SOMETHING. SO ARE WE.</p>
          <p className="mx-auto max-w-3xl text-lg text-white/70">Complete community missions, submit proof, earn verified points, build your streak, and climb the $SOMETHING leaderboard.</p>
          {!storageConfigured && <p className="mx-auto mt-6 max-w-2xl rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-200">Mission storage is not configured yet. No fake missions are being shown.</p>}
        </div>
      </section>

      <section className="px-4 pb-12"><div className="container mx-auto max-w-5xl">{featured ? <MissionCard mission={featured} featuredCard onSelect={(mission) => { setSelectedMission(mission); setSubmitStatus("idle"); setMessage(""); }} /> : <div className="rounded-3xl border border-green-500/20 bg-black/70 p-8 text-center"><p className="text-4xl font-black text-green-400">NOTHING TO DO?</p><p className="text-2xl font-black text-white">THAT DOESN&apos;T SOUND LIKE $SOMETHING.</p><p className="mt-3 text-white/60">CHECK BACK SOON.</p></div>}</div></section>

      <section className="px-4 pb-12"><div className="container mx-auto max-w-6xl"><h2 className="mb-5 text-3xl font-black text-green-400">🔥 ACTIVE MISSIONS</h2>{active.length ? <div className="grid gap-4 md:grid-cols-2">{active.map((mission) => <MissionCard key={mission.id} mission={mission} onSelect={(item) => { setSelectedMission(item); setSubmitStatus("idle"); setMessage(""); }} />)}</div> : <p className="rounded-2xl border border-white/10 bg-black/50 p-5 text-white/60">No other active missions right now.</p>}</div></section>

      <section className="px-4 pb-12"><div className="container mx-auto grid max-w-6xl gap-6 lg:grid-cols-2"><div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 p-6"><h2 className="mb-4 text-3xl font-black text-yellow-300">🕒 ENDING SOON</h2>{endingSoon.length ? <div className="space-y-3">{endingSoon.map((mission) => <p key={mission.id} className="rounded-xl bg-black/40 p-3 text-white">{mission.title} · {mission.endAt && new Date(mission.endAt).toLocaleString()}</p>)}</div> : <p className="text-white/60">Nothing is about to disappear yet.</p>}</div><div className="rounded-3xl border border-white/10 bg-white/5 p-6"><h2 className="mb-4 text-3xl font-black text-white">✅ RECENTLY COMPLETED / EXPIRED</h2>{inactive.length ? <div className="space-y-3">{inactive.map((mission) => <p key={mission.id} className="rounded-xl bg-black/40 p-3 text-white/70">{mission.title} · {mission.status}</p>)}</div> : <p className="text-white/60">YOU HAVEN&apos;T DONE SOMETHING YET. FIX THAT.</p>}</div></div></section>

      <section className="px-4 pb-16"><div className="container mx-auto max-w-6xl rounded-3xl border border-purple-400/20 bg-purple-400/5 p-6"><h2 className="mb-3 text-3xl font-black text-purple-300">WHY DO MISSIONS?</h2><p className="text-white/70">Points recognize verified contribution. The leaderboard and mission system help identify people who are actually helping build $SOMETHING. {COMMUNITY_REWARDS_RESERVE} has been designated for future community rewards. Points do not guarantee token payments, cash value, or any fixed conversion rate. No automatic token distribution is implemented.</p></div></section>

      {selectedMission && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-3 pt-20 backdrop-blur-md sm:p-6" onClick={() => setSelectedMission(null)}>
          <form onSubmit={submitMission} onClick={(event) => event.stopPropagation()} className="mx-auto max-w-xl rounded-3xl border border-green-500/30 bg-black p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-green-400 font-black">DO THIS MISSION</p><h2 className="text-3xl font-black text-white">{selectedMission.title}</h2><p className="text-white/60">+{selectedMission.points} points if approved</p></div><button type="button" onClick={() => setSelectedMission(null)} className="h-11 w-11 rounded-full bg-white/10 text-white">✕</button></div>
            {submitStatus === "success" && <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4 font-bold text-green-300">SOMETHING SUBMITTED. 🟢<br />{message}</div>}
            {submitStatus === "error" && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 font-bold text-red-300">{message}</div>}
            <div className="grid gap-4 sm:grid-cols-2"><label className="font-bold text-white/80">DISPLAY NAME<input required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white" /></label><label className="font-bold text-white/80">USERNAME<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white" /></label><label className="font-bold text-white/80">PLATFORM<select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })} className="mt-2 w-full rounded-xl border border-white/10 bg-black p-3 text-white">{PLATFORMS.map((platform) => <option key={platform}>{platform}</option>)}</select></label></div>
            <label className="mt-4 block font-bold text-white/80">DESCRIPTION / WHAT YOU DID<textarea required minLength={10} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 min-h-28 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white" /></label>
            <label className="mt-4 block font-bold text-white/80">PROOF URL<input required value={form.proofUrl} onChange={(e) => setForm({ ...form, proofUrl: e.target.value })} placeholder="https://x.com/yourname/status/..." className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white" /></label>
            <p className="mt-2 text-sm text-cyan-200">Proof must be a public social media post link. Admin approval is required before points or streaks count.</p>
            <label className="mt-4 block font-bold text-white/80">PUBLIC SOLANA WALLET ADDRESS <span className="text-white/40">OPTIONAL</span><input value={form.walletAddress} onChange={(e) => setForm({ ...form, walletAddress: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white" /></label>
            <p className="mt-3 font-bold text-yellow-300">NEVER SUBMIT YOUR SEED PHRASE OR PRIVATE KEY.</p>
            <button disabled={submitStatus === "submitting" || submitStatus === "success"} className="mt-6 w-full rounded-full bg-green-500 px-6 py-4 font-black text-black disabled:opacity-60">{submitStatus === "submitting" ? "SUBMITTING SOMETHING..." : "SUBMIT SOMETHING"}</button>
          </form>
        </div>
      )}
    </>
  );
}

