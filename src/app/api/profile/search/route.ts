import { NextResponse } from "next/server";
import { getWalletSession } from "@/lib/leaderboard/accountAuth";
import { searchClaimableProfiles } from "@/lib/leaderboard/accountStorage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getWalletSession();
  if (!session) return NextResponse.json({ error: "Connect wallet first." }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const results = await searchClaimableProfiles(searchParams.get("q") || "");
  return NextResponse.json({ results });
}
