import { createHmac, createPublicKey, randomUUID, timingSafeEqual, verify } from "crypto";
import { getMemberProfileBySlug, markProfileClaimed } from "./storage";

const PREFIX = "something:leaderboard";
const CLAIM_COOKIE = "something_profile_claim";
const CLAIM_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const NONCE_MAX_AGE_SECONDS = 60 * 5;

interface ClaimNonceRecord {
  memberId: string;
  walletAddress: string;
  message: string;
  expiresAt: number;
}

export interface ProfileClaimSession {
  memberId: string;
  walletAddress: string;
  iat: number;
}

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

async function redisCommand<T = unknown>(command: unknown[]): Promise<T> {
  const config = redisConfig();
  if (!config) throw new Error("Profile claim storage is not configured.");
  const response = await fetch(config.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Redis command failed: ${response.status}`);
  const data = await response.json() as { result?: T; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result as T;
}

function nonceKey(nonce: string) {
  return `${PREFIX}:profile-claim-nonce:${nonce}`;
}

function claimSecret() {
  return process.env.PROFILE_CLAIM_SECRET || process.env.LEADERBOARD_ADMIN_SECRET || process.env.ADMIN_SECRET || "";
}

function sign(payload: string) {
  const secret = claimSecret();
  if (!secret) throw new Error("Profile claim signing secret is not configured.");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function profileClaimCookieName() {
  return CLAIM_COOKIE;
}

export function profileClaimCookieMaxAge() {
  return CLAIM_MAX_AGE_SECONDS;
}

export function createProfileClaimCookieValue(memberId: string, walletAddress: string) {
  const payload = Buffer.from(JSON.stringify({ memberId, walletAddress, iat: Date.now() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyProfileClaimCookie(value?: string): ProfileClaimSession | null {
  if (!claimSecret() || !value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ProfileClaimSession;
    if (!parsed.memberId || !parsed.walletAddress || typeof parsed.iat !== "number") return null;
    if (Date.now() - parsed.iat > CLAIM_MAX_AGE_SECONDS * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_INDEX = new Map(BASE58_ALPHABET.split("").map((char, index) => [char, index]));

function base58Decode(value: string): Buffer {
  const bytes = [0];
  for (const char of value) {
    const digit = BASE58_INDEX.get(char);
    if (digit === undefined) throw new Error("Invalid base58 wallet address.");
    let carry = digit;
    for (let index = 0; index < bytes.length; index += 1) {
      const next = bytes[index] * 58 + carry;
      bytes[index] = next & 0xff;
      carry = next >> 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (const char of value) {
    if (char !== "1") break;
    bytes.push(0);
  }
  return Buffer.from(bytes.reverse());
}

function verifySolanaSignature(walletAddress: string, message: string, signatureBase64: string) {
  const publicKey = base58Decode(walletAddress);
  if (publicKey.length !== 32) throw new Error("Invalid Solana wallet address.");
  const signature = Buffer.from(signatureBase64, "base64");
  if (signature.length !== 64) throw new Error("Invalid signature length.");
  const spkiPrefix = Buffer.from("302a300506032b6570032100", "hex");
  const key = createPublicKey({ key: Buffer.concat([spkiPrefix, publicKey]), format: "der", type: "spki" });
  return verify(null, Buffer.from(message), key, signature);
}

export async function createProfileClaimChallenge(slug: string) {
  const profile = await getMemberProfileBySlug(slug);
  if (!profile) throw new Error("Profile not found.");
  if (!profile.member.walletAddress) throw new Error("This profile has no public wallet on record yet. Submit a verified contribution with your public Solana wallet first.");
  if (!claimSecret()) throw new Error("Profile claim signing secret is not configured.");

  const nonce = randomUUID();
  const expiresAt = Date.now() + NONCE_MAX_AGE_SECONDS * 1000;
  const message = [
    "Pump Something profile claim",
    `Profile: ${profile.profileSlug}`,
    `Member: ${profile.member.id}`,
    `Wallet: ${profile.member.walletAddress}`,
    `Nonce: ${nonce}`,
    "Signing this message only proves wallet ownership. It does not authorize transactions.",
  ].join("\n");

  const record: ClaimNonceRecord = { memberId: profile.member.id, walletAddress: profile.member.walletAddress, message, expiresAt };
  await redisCommand(["SETEX", nonceKey(nonce), NONCE_MAX_AGE_SECONDS, JSON.stringify(record)]);
  return { nonce, message, walletAddress: profile.member.walletAddress, expiresAt };
}

export async function verifyProfileClaim(slug: string, nonce: string, signatureBase64: string) {
  const profile = await getMemberProfileBySlug(slug);
  if (!profile) throw new Error("Profile not found.");
  const raw = await redisCommand<string | null>(["GET", nonceKey(nonce)]);
  if (!raw) throw new Error("Claim challenge expired. Try again.");
  const record = JSON.parse(raw) as ClaimNonceRecord;
  if (record.expiresAt < Date.now()) throw new Error("Claim challenge expired. Try again.");
  if (record.memberId !== profile.member.id || record.walletAddress !== profile.member.walletAddress) throw new Error("Claim challenge does not match this profile.");
  if (!verifySolanaSignature(record.walletAddress, record.message, signatureBase64)) throw new Error("Wallet signature could not be verified.");
  await redisCommand(["DEL", nonceKey(nonce)]);
  await markProfileClaimed(profile.member.id);
  return { profile, cookieValue: createProfileClaimCookieValue(profile.member.id, record.walletAddress) };
}
