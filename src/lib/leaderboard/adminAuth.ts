import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "something_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function adminSecret() {
  return process.env.LEADERBOARD_ADMIN_SECRET || process.env.ADMIN_SECRET || "";
}

function sign(payload: string) {
  const secret = adminSecret();
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function isAdminAuthConfigured() {
  return Boolean(adminSecret() && process.env.LEADERBOARD_ADMIN_PASSWORD);
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.LEADERBOARD_ADMIN_PASSWORD || "";
  if (!expected || !password) return false;
  return safeEqual(password, expected);
}

export function createAdminCookieValue() {
  const payload = Buffer.from(JSON.stringify({ role: "admin", iat: Date.now() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminCookie(value?: string) {
  const secret = adminSecret();
  if (!secret || !value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { role?: string; iat?: number };
    if (parsed.role !== "admin" || typeof parsed.iat !== "number") return false;
    return Date.now() - parsed.iat <= SESSION_MAX_AGE_SECONDS * 1000;
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  return verifyAdminCookie(cookieStore.get(COOKIE_NAME)?.value);
}

export function adminCookieName() {
  return COOKIE_NAME;
}

export function adminCookieMaxAge() {
  return SESSION_MAX_AGE_SECONDS;
}
