"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      publicKey?: { toString(): string };
      connect(): Promise<{ publicKey: { toString(): string } }>;
      disconnect?(): Promise<void>;
      signMessage(message: Uint8Array, encoding?: string): Promise<{ signature: Uint8Array }>;
    };
    solflare?: Window["solana"];
  }
}

function shortWallet(wallet: string) {
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

export function WalletNavButton() {
  const [wallet, setWallet] = useState("");
  const [profileSlug, setProfileSlug] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadSession() {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (data.authenticated) {
      setWallet(data.walletAddress || "");
      setProfileSlug(data.profile?.profileSlug || "");
    }
  }

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (data.authenticated) {
          setWallet(data.walletAddress || "");
          setProfileSlug(data.profile?.profileSlug || "");
        }
      })
      .catch(() => undefined);
  }, []);

  async function connectWallet() {
    setBusy(true);
    try {
      const provider = window.solana || window.solflare;
      if (!provider?.connect || !provider.signMessage) throw new Error("Open this page in Phantom/Solflare or install a Solana wallet.");
      const connected = await provider.connect();
      const walletAddress = connected.publicKey.toString();
      const nonceResponse = await fetch("/api/auth/nonce", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ walletAddress }) });
      const challenge = await nonceResponse.json();
      if (!nonceResponse.ok) throw new Error(challenge.error || "Could not create login challenge.");
      const signed = await provider.signMessage(new TextEncoder().encode(challenge.message), "utf8");
      const verifyResponse = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ walletAddress, nonce: challenge.nonce, signature: bytesToBase64(signed.signature) }) });
      const result = await verifyResponse.json();
      if (!verifyResponse.ok) throw new Error(result.error || "Could not verify wallet.");
      setWallet(walletAddress);
      await loadSession();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not connect wallet.");
    } finally {
      setBusy(false);
    }
  }

  if (wallet) {
    return <Link href={profileSlug ? `/profile/${profileSlug}` : "/account"} className="hidden shrink-0 rounded-full border border-green-500/40 px-3 py-2 text-xs font-black text-green-300 transition-colors hover:bg-green-500/10 hover:text-green-200 sm:inline-flex md:text-sm">{profileSlug ? "MY PROFILE" : shortWallet(wallet)}</Link>;
  }

  return <button type="button" disabled={busy} onClick={connectWallet} className="hidden shrink-0 rounded-full border border-green-500/40 px-3 py-2 text-xs font-black text-green-300 transition-colors hover:bg-green-500/10 hover:text-green-200 disabled:opacity-50 sm:inline-flex md:text-sm">{busy ? "CONNECTING" : "CONNECT WALLET"}</button>;
}
