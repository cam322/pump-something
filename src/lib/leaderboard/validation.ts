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

const SOCIAL_PROOF_HOSTS = [
  "x.com",
  "twitter.com",
  "mobile.twitter.com",
  "t.me",
  "telegram.me",
  "discord.com",
  "discordapp.com",
  "instagram.com",
  "threads.net",
  "tiktok.com",
  "reddit.com",
  "youtube.com",
  "youtu.be",
  "facebook.com",
  "fb.watch",
  "bsky.app",
];

export function isSocialProofUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
    return SOCIAL_PROOF_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function sanitizeArchiveImage(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  if (!/^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(value)) return undefined;
  const maxBytes = 900_000;
  const estimatedBytes = Math.ceil((value.length * 3) / 4);
  if (estimatedBytes > maxBytes) return undefined;
  return value;
}

function sanitizeArchiveImageUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  const trimmed = value.trim().slice(0, 500);
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export function validateSubmission(body: Record<string, unknown>): { ok: true; data: SubmitContributionInput } | { ok: false; error: string } {
  const displayName = sanitizeText(body.displayName, 60);
  const username = sanitizeText(body.username, 60);
  const platform = body.platform;
  const type = body.type;
  const description = sanitizeText(body.description, 500);
  const proofUrl = sanitizeText(body.proofUrl, 300);
  const archiveImageDataUrl = sanitizeArchiveImage(body.archiveImageDataUrl);
  const archiveImageUrl = sanitizeArchiveImageUrl(body.archiveImageUrl);
  const walletAddress = sanitizeText(body.walletAddress, 80);

  if (displayName.length < 2) return { ok: false, error: "Display name is required." };
  if (username.length < 2) return { ok: false, error: "Username is required." };
  if (!isValidPlatform(platform)) return { ok: false, error: "Choose a valid platform." };
  if (!isValidContributionType(type)) return { ok: false, error: "Choose a valid contribution type." };
  if (description.length < 10) return { ok: false, error: "Description must be at least 10 characters." };

  if (!proofUrl) {
    return { ok: false, error: "A social media proof link is required." };
  }

  if (!isSocialProofUrl(proofUrl)) {
    return { ok: false, error: "Proof must be a social media post link to the meme or contribution." };
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
      proofUrl,
      archiveImageDataUrl,
      archiveImageUrl,
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
