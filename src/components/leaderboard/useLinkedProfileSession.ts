"use client";

import { useEffect, useMemo, useState } from "react";
import type { Platform } from "@/config/leaderboard";

export interface LinkedProfileSession {
  authenticated: boolean;
  walletAddress?: string;
  profile: null | {
    memberId: string;
    profileSlug: string;
    displayName: string;
    username: string;
    platform: Platform;
  };
}

export function useLinkedProfileSession() {
  const [session, setSession] = useState<LinkedProfileSession>({ authenticated: false, profile: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setSession({
          authenticated: Boolean(data.authenticated),
          walletAddress: data.walletAddress,
          profile: data.profile || null,
        });
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return useMemo(() => ({ ...session, loading, linkedProfile: session.profile }), [session, loading]);
}
