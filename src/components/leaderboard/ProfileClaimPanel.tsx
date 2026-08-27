"use client";

import { useState } from "react";
import type { ProfilePreferences } from "@/lib/leaderboard/types";

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      publicKey?: { toString(): string };
      connect(): Promise<{ publicKey: { toString(): string } }>;
      signMessage(message: Uint8Array, encoding?: string): Promise<{ signature: Uint8Array }>;
    };
  }
}

interface Props {
  slug: string;
  walletAddress?: string;
  initialPreferences: ProfilePreferences;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

export function ProfileClaimPanel({ slug, walletAddress, initialPreferences }: Props) {
  const [status, setStatus] = useState<"idle" | "claiming" | "claimed" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState(initialPreferences);
  const [editorOpen, setEditorOpen] = useState(Boolean(initialPreferences.claimedAt));

  async function claimProfile() {
    setStatus("claiming");
    setMessage("");
    try {
      if (!walletAddress) throw new Error("This profile does not have a wallet on record yet.");
      if (!window.solana?.connect || !window.solana?.signMessage) throw new Error("Install or open a Solana wallet that supports message signing, like Phantom.");
      const connected = await window.solana.connect();
      const connectedWallet = connected.publicKey.toString();
      if (connectedWallet !== walletAddress) throw new Error("Connected wallet does not match the wallet on this profile.");

      const challengeResponse = await fetch(`/api/profile/${slug}/claim/nonce`, { method: "POST" });
      const challenge = await challengeResponse.json();
      if (!challengeResponse.ok) throw new Error(challenge.error || "Could not create claim challenge.");

      const encoded = new TextEncoder().encode(challenge.message as string);
      const signed = await window.solana.signMessage(encoded, "utf8");
      const verifyResponse = await fetch(`/api/profile/${slug}/claim/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nonce: challenge.nonce, signature: bytesToBase64(signed.signature) }),
      });
      const result = await verifyResponse.json();
      if (!verifyResponse.ok) throw new Error(result.error || "Could not verify wallet signature.");

      setStatus("claimed");
      setEditorOpen(true);
      setPreferences((current) => ({ ...current, claimedAt: current.claimedAt || new Date().toISOString() }));
      setMessage("Profile claimed. You can now edit safe public profile details.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not claim profile.");
    }
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch(`/api/profile/${slug}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save profile settings.");
      setPreferences(result.preferences);
      setStatus("claimed");
      setMessage("Profile settings saved. Refresh to see the public page update everywhere.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not save profile settings.");
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-5 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h2 className="text-3xl font-black text-cyan-300">CLAIM / EDIT PROFILE</h2>
          <p className="mt-2 text-white/60">Claiming requires a message signature from the public Solana wallet already attached to this profile. It cannot move funds or approve transactions.</p>
          {!walletAddress && <p className="mt-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm font-bold text-yellow-200">No wallet is on record for this profile yet. Submit a verified contribution with your public wallet first.</p>}
        </div>
        <button disabled={!walletAddress || status === "claiming"} onClick={claimProfile} className="rounded-full bg-cyan-300 px-6 py-4 font-black text-black hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50">
          {status === "claiming" ? "SIGNING..." : preferences.claimedAt ? "VERIFY WALLET AGAIN" : "CLAIM WITH WALLET"}
        </button>
      </div>

      {message && <p className={`mt-4 rounded-xl border p-3 text-sm font-bold ${status === "error" ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-green-500/30 bg-green-500/10 text-green-200"}`}>{message}</p>}

      {editorOpen && (
        <form onSubmit={saveSettings} className="mt-5 grid gap-4">
          <label className="font-bold text-white/80">BIO
            <textarea value={preferences.bio || ""} maxLength={180} onChange={(event) => setPreferences((current) => ({ ...current, bio: event.target.value }))} className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-black/60 p-3 text-white" placeholder="What are you doing for $SOMETHING?" />
          </label>
          <label className="font-bold text-white/80">AVATAR URL
            <input value={preferences.avatarUrl || ""} onChange={(event) => setPreferences((current) => ({ ...current, avatarUrl: event.target.value }))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/60 p-3 text-white" placeholder="https://..." />
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-4 font-bold text-white/80">
            <input type="checkbox" checked={preferences.publicWallet} onChange={(event) => setPreferences((current) => ({ ...current, publicWallet: event.target.checked }))} className="h-5 w-5 accent-green-500" />
            Show masked public wallet on profile
          </label>
          <button disabled={status === "saving"} className="rounded-full bg-green-500 px-6 py-4 font-black text-black hover:bg-green-400 disabled:opacity-60">{status === "saving" ? "SAVING..." : "SAVE PROFILE SETTINGS"}</button>
        </form>
      )}
    </section>
  );
}
