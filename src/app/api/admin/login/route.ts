import { NextResponse } from "next/server";
import { adminCookieMaxAge, adminCookieName, createAdminCookieValue, isAdminAuthConfigured, verifyAdminPassword } from "@/lib/leaderboard/adminAuth";
import { checkRateLimit, getRequestIp } from "@/lib/leaderboard/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const limit = checkRateLimit(`admin-login:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many login attempts." }, { status: 429 });
  }

  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ error: "Admin authentication is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({})) as { password?: string };
  if (!verifyAdminPassword(body.password || "")) {
    return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(adminCookieName(), createAdminCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: adminCookieMaxAge(),
  });
  return response;
}
