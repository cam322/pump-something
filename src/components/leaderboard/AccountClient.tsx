"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ProfileResult = { memberId: string; profileSlug: string; displayName: string; username: string; points: number; rankTitle: string; leaderboardRank?: number; verifiedContributions: number; missionsCompleted: number; claimStatus: string };
type SessionData = { authenticated?: boolean; walletAddress?: string; profile?: { memberId: string; profileSlug: string; displayName: string } | null; claims?: Array<{ claim: { id: string; status: string; requestedAt: string }; profile: { profileSlug: string; displayName: string } | null }> };

declare global {
  interface Window {
    solana?: { isPhantom?: boolean; publicKey?: { toString(): string }; connect(): Promise<{ publicKey: { toString(): string } }>; disconnect?(): Promise<void>; signMessage(message: Uint8Array, encoding?: string): Promise<{ signature: Uint8Array }> };
    solflare?: Window["solana"];
  }
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function shortWallet(wallet: string) {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

export function AccountClient() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData>({});
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [createForm, setCreateForm] = useState({ displayName: "", username: "", platform: "X", bio: "", avatarUrl: "", publicWallet: false });
  const [settings, setSettings] = useState({ displayName: "", xUsername: "", telegramUsername: "", bio: "", avatarUrl: "", publicWallet: false });

  async function loadSession() {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    setSession(data);
    if (data.profile) setStatus("PROFILE VERIFIED ✓ Everything you do now counts toward your $SOMETHING profile.");
  }

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        setSession(data);
        if (data.profile) setStatus("PROFILE VERIFIED ✓ Everything you do now counts toward your $SOMETHING profile.");
      })
      .catch(() => undefined);
  }, []);

  async function connectWallet() {
    try {
      setStatus("Connecting wallet...");
      const provider = window.solana || window.solflare;
      if (!provider?.connect || !provider.signMessage) throw new Error("Open in Phantom/Solflare or install a Solana wallet.");
      const connected = await provider.connect();
      const walletAddress = connected.publicKey.toString();
      const nonceResponse = await fetch("/api/auth/nonce", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ walletAddress }) });
      const challenge = await nonceResponse.json();
      if (!nonceResponse.ok) throw new Error(challenge.error || "Could not create wallet challenge.");
      const signed = await provider.signMessage(new TextEncoder().encode(challenge.message), "utf8");
      const verifyResponse = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ walletAddress, nonce: challenge.nonce, signature: bytesToBase64(signed.signature) }) });
      const result = await verifyResponse.json();
      if (!verifyResponse.ok) throw new Error(result.error || "Wallet verification failed.");
      setStatus("Wallet connected.");
      await loadSession();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not connect wallet.");
    }
  }

  async function disconnect() {
    await fetch("/api/auth/logout", { method: "POST" });
    await (window.solana || window.solflare)?.disconnect?.();
    setSession({});
    setStatus("Wallet disconnected. Profile ownership remains unchanged.");
  }

  async function searchProfiles(event?: React.FormEvent) {
    event?.preventDefault();
    const response = await fetch(`/api/profile/search?q=${encodeURIComponent(search)}`, { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setStatus(data.error || "Could not search profiles.");
    setResults(data.results || []);
  }

  async function claimProfile(memberId: string) {
    try {
      const provider = window.solana || window.solflare;
      if (!provider?.signMessage || !session.walletAddress) throw new Error("Connect wallet first.");
      const nonceResponse = await fetch("/api/profile/claims/nonce", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId }) });
      const challenge = await nonceResponse.json();
      if (!nonceResponse.ok) throw new Error(challenge.error || "Could not create claim challenge.");
      const signed = await provider.signMessage(new TextEncoder().encode(challenge.message), "utf8");
      const claimResponse = await fetch("/api/profile/claims", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId, nonce: challenge.nonce, signature: bytesToBase64(signed.signature) }) });
      const result = await claimResponse.json();
      if (!claimResponse.ok) throw new Error(result.error || "Could not submit claim.");
      setStatus("CLAIM PENDING — We're verifying that this profile belongs to you.");
      await loadSession();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not claim profile.");
    }
  }

  async function createProfile(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/profile/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(createForm) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return setStatus(result.error || "Could not create profile.");
    setStatus("PROFILE VERIFIED ✓ Your profile was created and linked to this wallet.");
    await loadSession();
  }

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/profile/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return setStatus(result.error || "Could not save settings.");
    setStatus("Profile settings saved. Server-controlled stats were not changed.");
    if (result.profileSlug) router.push(`/profile/${result.profileSlug}`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-green-400/30 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.24),transparent_36%),linear-gradient(135deg,rgba(0,0,0,0.96),rgba(8,20,12,0.92))] p-6 text-center sm:p-10">
        <p className="mb-4 text-sm font-black text-green-300">CLAIM YOUR $SOMETHING IDENTITY</p>
        <h1 className="mb-4 text-5xl font-black text-white sm:text-6xl">YOUR CONTRIBUTIONS SHOULD BELONG TO YOU.</h1>
        {session.authenticated ? <p className="text-green-300 font-black">CONNECTED: {shortWallet(session.walletAddress || "")}</p> : <button onClick={connectWallet} className="rounded-full bg-green-500 px-8 py-4 font-black text-black hover:bg-green-400">CONNECT WALLET</button>}
        {status && <p className="mx-auto mt-5 max-w-2xl rounded-2xl border border-white/10 bg-black/50 p-4 text-white/80">{status}</p>}
      </section>

      {session.authenticated && <div className="text-right"><button onClick={disconnect} className="rounded-full border border-white/20 px-4 py-2 text-sm font-black text-white/60 hover:bg-white/10">DISCONNECT</button></div>}

      {session.profile ? (
        <section className="rounded-3xl border border-green-400/25 bg-green-400/5 p-6">
          <h2 className="mb-3 text-3xl font-black text-green-400">PROFILE VERIFIED ✓</h2>
          <p className="mb-5 text-white/70">Everything you do now counts toward your $SOMETHING profile.</p>
          <Link href={`/profile/${session.profile.profileSlug}`} className="rounded-full bg-green-500 px-6 py-4 font-black text-black hover:bg-green-400">OPEN MY PROFILE</Link>
          <form onSubmit={saveSettings} className="mt-6 grid gap-3 md:grid-cols-2">
            <input placeholder="Display name" value={settings.displayName} onChange={(e) => setSettings({ ...settings, displayName: e.target.value })} className="rounded-xl border border-white/10 bg-black p-3 text-white" />
            <input placeholder="Avatar URL" value={settings.avatarUrl} onChange={(e) => setSettings({ ...settings, avatarUrl: e.target.value })} className="rounded-xl border border-white/10 bg-black p-3 text-white" />
            <input placeholder="X username" value={settings.xUsername} onChange={(e) => setSettings({ ...settings, xUsername: e.target.value })} className="rounded-xl border border-white/10 bg-black p-3 text-white" />
            <input placeholder="Telegram username" value={settings.telegramUsername} onChange={(e) => setSettings({ ...settings, telegramUsername: e.target.value })} className="rounded-xl border border-white/10 bg-black p-3 text-white" />
            <textarea placeholder="Bio" value={settings.bio} onChange={(e) => setSettings({ ...settings, bio: e.target.value })} className="rounded-xl border border-white/10 bg-black p-3 text-white md:col-span-2" />
            <label className="flex items-center gap-3 text-white/70"><input type="checkbox" checked={settings.publicWallet} onChange={(e) => setSettings({ ...settings, publicWallet: e.target.checked })} /> SHOW WALLET PUBLICLY</label>
            <button className="rounded-full bg-green-500 px-6 py-3 font-black text-black">SAVE SETTINGS</button>
          </form>
        </section>
      ) : session.authenticated ? (
        <>
          {(session.claims || []).map(({ claim, profile }) => <div key={claim.id} className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-yellow-100"><strong>{claim.status === "PENDING" ? "CLAIM PENDING" : claim.status}</strong> {profile?.displayName}</div>)}
          <section className="rounded-3xl border border-cyan-400/25 bg-cyan-400/5 p-6">
            <h2 className="mb-3 text-3xl font-black text-cyan-300">CLAIM EXISTING PROFILE</h2>
            <form onSubmit={searchProfiles} className="mb-4 flex flex-col gap-3 sm:flex-row"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search username or display name" className="flex-1 rounded-xl border border-white/10 bg-black p-3 text-white" /><button className="rounded-full bg-cyan-300 px-6 py-3 font-black text-black">SEARCH</button></form>
            <div className="grid gap-3">{results.map((profile) => <div key={profile.memberId} className="rounded-2xl border border-white/10 bg-black/50 p-4"><p className="font-black text-white">{profile.displayName} @{profile.username}</p><p className="text-white/60">{profile.points} points · {profile.verifiedContributions} contributions · {profile.missionsCompleted} missions · {profile.rankTitle}</p><button onClick={() => claimProfile(profile.memberId)} className="mt-3 rounded-full bg-green-500 px-4 py-2 font-black text-black">SIGN MESSAGE & SUBMIT CLAIM</button></div>)}</div>
          </section>
          <section className="rounded-3xl border border-green-400/25 bg-green-400/5 p-6">
            <h2 className="mb-3 text-3xl font-black text-green-400">CREATE PROFILE</h2>
            <form onSubmit={createProfile} className="grid gap-3 md:grid-cols-2"><input required placeholder="Display name" value={createForm.displayName} onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })} className="rounded-xl border border-white/10 bg-black p-3 text-white" /><input required placeholder="Username" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} className="rounded-xl border border-white/10 bg-black p-3 text-white" /><select value={createForm.platform} onChange={(e) => setCreateForm({ ...createForm, platform: e.target.value })} className="rounded-xl border border-white/10 bg-black p-3 text-white"><option>X</option><option>Telegram</option></select><input placeholder="Avatar URL" value={createForm.avatarUrl} onChange={(e) => setCreateForm({ ...createForm, avatarUrl: e.target.value })} className="rounded-xl border border-white/10 bg-black p-3 text-white" /><textarea placeholder="Bio" value={createForm.bio} onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })} className="rounded-xl border border-white/10 bg-black p-3 text-white md:col-span-2" /><label className="flex items-center gap-3 text-white/70"><input type="checkbox" checked={createForm.publicWallet} onChange={(e) => setCreateForm({ ...createForm, publicWallet: e.target.checked })} /> SHOW WALLET PUBLICLY</label><button className="rounded-full bg-green-500 px-6 py-3 font-black text-black">CREATE VERIFIED PROFILE</button></form>
          </section>
        </>
      ) : null}
    </div>
  );
}
