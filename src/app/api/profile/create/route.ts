import { NextResponse } from "next/server";
import { createWalletSessionCookie, getWalletSession, walletSessionCookieName, walletSessionMaxAge } from "@/lib/leaderboard/accountAuth";
import { createClaimedProfile } from "@/lib/leaderboard/accountStorage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getWalletSession();
    if (!session) return NextResponse.json({ error: "Connect wallet first." }, { status: 401 });
    const body = await request.json().catch(() => ({})) as { displayName?: string; username?: string; platform?: "X" | "Telegram"; bio?: string; avatarUrl?: string; publicWallet?: boolean };
    if (!body.displayName || !body.username || !body.platform) return NextResponse.json({ error: "Display name, username, and platform are required." }, { status: 400 });
    const member = await createClaimedProfile({ ...body, displayName: body.displayName, username: body.username, platform: body.platform, walletAddress: session.walletAddress });
    const response = NextResponse.json({ success: true, memberId: member.id });
    response.cookies.set(walletSessionCookieName(), createWalletSessionCookie(session.walletAddress, member.id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: walletSessionMaxAge() });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
