"use client";

import { useState } from "react";
import type { LeaderboardEntry, ProfileClaimRequest } from "@/lib/leaderboard/types";

export function AdminProfileClaimsClient({ initialClaims }: { initialClaims: Array<{ claim: ProfileClaimRequest; profile: LeaderboardEntry }> }) {
  const [claims, setClaims] = useState(initialClaims);
  const [message, setMessage] = useState("");

  async function review(id: string, action: "approve" | "reject") {
    const response = await fetch(`/api/admin/profile-claims/${id}/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(result.error || `Could not ${action} claim.`);
    setClaims((current) => current.filter((item) => item.claim.id !== id));
    setMessage(`Claim ${action}d.`);
  }

  return (
    <section className="px-4 pb-16 pt-28 md:pt-32">
      <div className="container mx-auto max-w-6xl">
        <h1 className="mb-4 text-5xl font-black text-green-400">PROFILE CLAIMS</h1>
        <p className="mb-8 max-w-3xl text-white/70">Approve only when the wallet holder matches the existing community identity. Wallet signatures prove wallet ownership, not profile identity.</p>
        {message && <p className="mb-5 rounded-xl border border-white/10 bg-white/5 p-4 text-white">{message}</p>}
        {claims.length === 0 ? <p className="rounded-3xl border border-white/10 bg-black/60 p-6 text-white/60">No pending claims.</p> : <div className="grid gap-4">{claims.map(({ claim, profile }) => (
          <div key={claim.id} className="rounded-3xl border border-green-500/20 bg-black/70 p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-black text-green-300">{profile.member.displayName} @{profile.member.xUsername || profile.member.telegramUsername || profile.member.discordUsername || profile.member.otherUsername || "community"}</p>
                <p className="text-white/60">Rank #{profile.leaderboardRank || "—"} · {profile.points} points · {profile.verifiedContributions} contributions · {profile.missionsCompleted} missions</p>
                <p className="mt-2 break-all text-sm text-cyan-200">Requesting wallet: {claim.walletAddress}</p>
                <p className="text-sm text-white/40">Requested {new Date(claim.requestedAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => review(claim.id, "approve")} className="rounded-full bg-green-500 px-5 py-3 font-black text-black hover:bg-green-400">APPROVE</button>
                <button onClick={() => review(claim.id, "reject")} className="rounded-full border border-red-400/40 px-5 py-3 font-black text-red-200 hover:bg-red-500/10">REJECT</button>
              </div>
            </div>
          </div>
        ))}</div>}
      </div>
    </section>
  );
}
