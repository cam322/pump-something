import { NextResponse } from "next/server";
import { getWalletSession } from "@/lib/leaderboard/accountAuth";
import { getLinkedMemberIdForWallet, updateOwnerProfile } from "@/lib/leaderboard/accountStorage";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    const session = await getWalletSession();
    if (!session) return NextResponse.json({ error: "Connect wallet first." }, { status: 401 });
    const memberId = await getLinkedMemberIdForWallet(session.walletAddress);
    if (!memberId) return NextResponse.json({ error: "No claimed profile linked to this wallet." }, { status: 403 });
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const result = await updateOwnerProfile(memberId, body);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update profile settings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
