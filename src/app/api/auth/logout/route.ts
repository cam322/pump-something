import { NextResponse } from "next/server";
import { walletSessionCookieName } from "@/lib/leaderboard/accountAuth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(walletSessionCookieName(), "", { path: "/", maxAge: 0 });
  return response;
}
