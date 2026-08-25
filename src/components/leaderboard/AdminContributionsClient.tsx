"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Contribution, LeaderboardMember } from "@/lib/leaderboard/types";

type PendingItem = { member: LeaderboardMember; contribution: Contribution };

export function AdminContributionsClient() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pointsById, setPointsById] = useState<Record<string, number>>({});
  const [notesById, setNotesById] = useState<Record<string, string>>({});

  async function loadPending() {
    const response = await fetch("/api/admin/contributions", { cache: "no-store" });
    if (response.status === 401) {
      setAuthenticated(false);
      return;
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.error || "Could not load pending submissions.");
      return;
    }
    setAuthenticated(true);
    setPending(result.pending || []);
    const pointValues: Record<string, number> = {};
    for (const item of result.pending || []) {
      pointValues[item.contribution.id] = item.contribution.suggestedPoints;
    }
    setPointsById(pointValues);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadPending();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setMessage(result.error || "Admin login failed.");
      return;
    }
    setPassword("");
    setAuthenticated(true);
    await loadPending();
  }

  async function review(id: string, action: "approve" | "reject") {
    setMessage("");
    const response = await fetch(`/api/admin/contributions/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pointsAwarded: pointsById[id], notes: notesById[id] || "" }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.error || `Could not ${action} contribution.`);
      return;
    }
    setMessage(action === "approve" ? "APPROVED + POINTS AWARDED" : "REJECTED");
    await loadPending();
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-green-500/30 bg-black/70 p-6">
        <h1 className="text-3xl font-black text-green-400 mb-3">ADMIN REVIEW</h1>
        <p className="text-white/60 mb-5">Secure admin login is required. This page is not protected by hiding the URL.</p>
        {message && <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">{message}</div>}
        <form onSubmit={login}>
          <label className="block text-white/80 font-bold mb-4">
            ADMIN PASSWORD
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white"
              autoComplete="current-password"
            />
          </label>
          <button disabled={loading} className="w-full rounded-full bg-green-500 px-6 py-4 font-black text-black disabled:opacity-60">
            {loading ? "CHECKING..." : "OPEN REVIEW QUEUE"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-green-400">PENDING SUBMISSIONS</h1>
          <p className="text-white/60">Approve quality contributions. Reject spam. No automatic payouts.</p>
        </div>
        <Link href="/leaderboard" className="rounded-full border border-green-500 px-5 py-3 text-center font-bold text-green-400">VIEW LEADERBOARD</Link>
      </div>

      {message && <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-green-300 font-bold">{message}</div>}

      {pending.length === 0 ? (
        <div className="rounded-3xl border border-green-500/20 bg-black/60 p-8 text-center">
          <p className="text-3xl font-black text-white">NOTHING IS WAITING.</p>
          <p className="text-white/60">No pending submissions right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map(({ member, contribution }) => (
            <div key={contribution.id} className="rounded-3xl border border-green-500/20 bg-black/70 p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                <div className="min-w-0">
                  <p className="text-sm font-black text-green-400">{contribution.type} · {new Date(contribution.submittedAt).toLocaleString()}</p>
                  <h2 className="text-2xl font-black text-white">{member.displayName}</h2>
                  <p className="text-white/60">{member.platform} · @{member.telegramUsername || member.xUsername || member.discordUsername || member.otherUsername}</p>
                  <p className="mt-4 text-white/80 whitespace-pre-wrap">{contribution.description}</p>
                  {contribution.proofUrl && <Link href={contribution.proofUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-cyan-300 underline break-all">{contribution.proofUrl}</Link>}
                </div>
                <div className="space-y-3">
                  <label className="block text-white/80 font-bold">
                    POINTS AWARDED
                    <input
                      type="number"
                      min={0}
                      max={10000}
                      value={pointsById[contribution.id] ?? contribution.suggestedPoints}
                      onChange={(event) => setPointsById({ ...pointsById, [contribution.id]: Number(event.target.value) })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white"
                    />
                  </label>
                  <label className="block text-white/80 font-bold">
                    NOTES
                    <textarea
                      value={notesById[contribution.id] || ""}
                      onChange={(event) => setNotesById({ ...notesById, [contribution.id]: event.target.value })}
                      className="mt-2 min-h-20 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-white"
                    />
                  </label>
                  <button onClick={() => review(contribution.id, "approve")} className="w-full rounded-full bg-green-500 px-4 py-3 font-black text-black">APPROVE + AWARD POINTS</button>
                  <button onClick={() => review(contribution.id, "reject")} className="w-full rounded-full border border-red-500 px-4 py-3 font-black text-red-300">REJECT</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
