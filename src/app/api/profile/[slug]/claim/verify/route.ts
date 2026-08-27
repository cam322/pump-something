import { NextResponse } from "next/server";
import { profileClaimCookieMaxAge, profileClaimCookieName, verifyProfileClaim } from "@/lib/leaderboard/profileClaim";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await request.json().catch(() => ({})) as { nonce?: string; signature?: string };
    if (!body.nonce || !body.signature) return NextResponse.json({ error: "Nonce and signature are required." }, { status: 400 });
    const result = await verifyProfileClaim(slug, body.nonce, body.signature);
    const response = NextResponse.json({ success: true, memberId: result.profile.member.id });
    response.cookies.set(profileClaimCookieName(), result.cookieValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: profileClaimCookieMaxAge(),
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not verify profile claim.";
    const status = message.includes("not configured") ? 503 : message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
