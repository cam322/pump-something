import { cookies } from "next/headers";
import { createHmac, createPublicKey, randomUUID, timingSafeEqual, verify } from "crypto";

const PREFIX = "something:leaderboard";
const NONCE_TTL_SECONDS = 5 * 60;
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
const SESSION_COOKIE = "something_wallet_session";

export interface WalletSession {
  walletAddress: string;
  memberId?: string;
  iat: number;
}

interface NonceRecord {
  walletAddress: string;
  message: string;
  purpose: "AUTH" | "CLAIM" | "NEW_WALLET";
  memberId?: string;
  expiresAt: number;
}

function authSecret() {
  return process.env.WALLET_AUTH_SECRET || process.env.PROFILE_CLAIM_SECRET || process.env.LEADERBOARD_ADMIN_SECRET || process.env.ADMIN_SECRET || "";
}

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

async function redisCommand<T = unknown>(command: unknown[]): Promise<T> {
  const config = redisConfig();
  if (!config) throw new Error("Wallet auth storage is not configured.");
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
  return `${PREFIX}:wallet_nonce:${nonce}`;
}

function sign(payload: string) {
  const secret = authSecret();
  if (!secret) throw new Error("Wallet auth signing secret is not configured.");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_INDEX = new Map(BASE58_ALPHABET.split("").map((char, index) => [char, index]));

export function isSolanaAddress(value: string) {
  try {
    return base58Decode(value).length === 32;
  } catch {
    return false;
  }
}

function base58Decode(value: string): Buffer {
  const bytes = [0];
  for (const char of value) {
    const digit = BASE58_INDEX.get(char);
    if (digit === undefined) throw new Error("Invalid base58 value.");
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

export function verifySolanaSignature(walletAddress: string, message: string, signatureBase64: string) {
  const publicKey = base58Decode(walletAddress);
  if (publicKey.length !== 32) return false;
  const signature = Buffer.from(signatureBase64, "base64");
  if (signature.length !== 64) return false;
  const spkiPrefix = Buffer.from("302a300506032b6570032100", "hex");
  const key = createPublicKey({ key: Buffer.concat([spkiPrefix, publicKey]), format: "der", type: "spki" });
  return verify(null, Buffer.from(message), key, signature);
}

export async function createWalletNonce(walletAddress: string, purpose: NonceRecord["purpose"], memberId?: string) {
  if (!isSolanaAddress(walletAddress)) throw new Error("Invalid Solana wallet address.");
  if (!authSecret()) throw new Error("Wallet auth signing secret is not configured.");
  const nonce = randomUUID();
  const expiresAt = Date.now() + NONCE_TTL_SECONDS * 1000;
  const message = [
    purpose === "CLAIM" ? "Sign this message to claim your $SOMETHING profile." : "Sign this message to log in to Pump Something.",
    memberId ? `Profile: ${memberId}` : undefined,
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
    "This request does not authorize any transaction.",
  ].filter(Boolean).join("\n");
  const record: NonceRecord = { walletAddress, message, purpose, memberId, expiresAt };
  await redisCommand(["SETEX", nonceKey(nonce), NONCE_TTL_SECONDS, JSON.stringify(record)]);
  return { nonce, message, expiresAt };
}

export async function verifyWalletNonce(nonce: string, walletAddress: string, signatureBase64: string, purpose: NonceRecord["purpose"], memberId?: string) {
  const raw = await redisCommand<string | null>(["GET", nonceKey(nonce)]);
  if (!raw) throw new Error("Nonce expired or already used.");
  const record = JSON.parse(raw) as NonceRecord;
  if (record.expiresAt < Date.now()) throw new Error("Nonce expired.");
  if (record.purpose !== purpose) throw new Error("Nonce purpose mismatch.");
  if (record.walletAddress !== walletAddress) throw new Error("Wallet does not match nonce.");
  if ((record.memberId || "") !== (memberId || "")) throw new Error("Profile does not match nonce.");
  if (!verifySolanaSignature(walletAddress, record.message, signatureBase64)) throw new Error("Invalid wallet signature.");
  await redisCommand(["DEL", nonceKey(nonce)]);
  return record;
}

export function walletSessionCookieName() {
  return SESSION_COOKIE;
}

export function walletSessionMaxAge() {
  return SESSION_MAX_AGE_SECONDS;
}

export function createWalletSessionCookie(walletAddress: string, memberId?: string) {
  const payload = Buffer.from(JSON.stringify({ walletAddress, memberId, iat: Date.now() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyWalletSessionCookie(value?: string): WalletSession | null {
  if (!authSecret() || !value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as WalletSession;
    if (!parsed.walletAddress || typeof parsed.iat !== "number") return null;
    if (Date.now() - parsed.iat > SESSION_MAX_AGE_SECONDS * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getWalletSession() {
  const cookieStore = await cookies();
  return verifyWalletSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
}
