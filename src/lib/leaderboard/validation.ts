import { CONTRIBUTION_TYPES, DEFAULT_POINT_VALUES, PLATFORMS, type ContributionType, type Platform } from "@/config/leaderboard";
import type { SubmitContributionInput } from "./types";

export function normalizeUsername(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

export function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .slice(0, maxLength);
}

export function isValidPlatform(value: unknown): value is Platform {
  return typeof value === "string" && (PLATFORMS as readonly string[]).includes(value);
}

export function isValidContributionType(value: unknown): value is ContributionType {
  return typeof value === "string" && (CONTRIBUTION_TYPES as readonly string[]).includes(value);
}

export function suggestedPointsFor(type: ContributionType): number {
  return DEFAULT_POINT_VALUES[type];
}

export function validateSubmission(body: Record<string, unknown>): { ok: true; data: SubmitContributionInput } | { ok: false; error: string } {
  const displayName = sanitizeText(body.displayName, 60);
  const username = sanitizeText(body.username, 60);
  const platform = body.platform;
  const type = body.type;
  const description = sanitizeText(body.description, 500);
  const proofUrl = sanitizeText(body.proofUrl, 300);
  const walletAddress = sanitizeText(body.walletAddress, 80);

  if (displayName.length < 2) return { ok: false, error: "Display name is required." };
  if (username.length < 2) return { ok: false, error: "Username is required." };
  if (!isValidPlatform(platform)) return { ok: false, error: "Choose a valid platform." };
  if (!isValidContributionType(type)) return { ok: false, error: "Choose a valid contribution type." };
  if (description.length < 10) return { ok: false, error: "Description must be at least 10 characters." };

  if (proofUrl && !/^https?:\/\//i.test(proofUrl)) {
    return { ok: false, error: "Proof URL must start with http:// or https://." };
  }

  if (walletAddress && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
    return { ok: false, error: "Wallet address must be a public Solana address." };
  }

  return {
    ok: true,
    data: {
      displayName,
      username: normalizeUsername(username),
      platform,
      type,
      description,
      proofUrl: proofUrl || undefined,
      walletAddress: walletAddress || undefined,
    },
  };
}

export function identityFieldForPlatform(platform: Platform): "telegramUsername" | "xUsername" | "discordUsername" | "otherUsername" {
  if (platform === "Telegram") return "telegramUsername";
  if (platform === "X") return "xUsername";
  if (platform === "Discord") return "discordUsername";
  return "otherUsername";
}
