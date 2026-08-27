import { NextResponse } from "next/server";
import { getWalletSession, verifyWalletNonce } from "@/lib/leaderboard/accountAuth";
import { createProfileClaim } from "@/lib/leaderboard/accountStorage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getWalletSession();
    if (!session) return NextResponse.json({ error: "Connect wallet first." }, { status: 401 });
    const body = await request.json().catch(() => ({})) as { memberId?: string; nonce?: string; signature?: string };
    if (!body.memberId || !body.nonce || !body.signature) return NextResponse.json({ error: "Profile, nonce, and signature are required." }, { status: 400 });
    await verifyWalletNonce(body.nonce, session.walletAddress, body.signature, "CLAIM", body.memberId);
    const claim = await createProfileClaim(body.memberId, session.walletAddress);
    return NextResponse.json({ success: true, claim });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not submit profile claim.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
