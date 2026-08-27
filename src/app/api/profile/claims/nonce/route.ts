import { NextResponse } from "next/server";
import { getWalletSession, createWalletNonce } from "@/lib/leaderboard/accountAuth";
import { getMemberById } from "@/lib/leaderboard/accountStorage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getWalletSession();
    if (!session) return NextResponse.json({ error: "Connect wallet first." }, { status: 401 });
    const body = await request.json().catch(() => ({})) as { memberId?: string };
    if (!body.memberId) return NextResponse.json({ error: "Profile is required." }, { status: 400 });
    const member = await getMemberById(body.memberId);
    if (!member) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    if (member.claimStatus === "CLAIMED") return NextResponse.json({ error: "Profile is already claimed." }, { status: 400 });
    const challenge = await createWalletNonce(session.walletAddress, "CLAIM", member.id);
    return NextResponse.json(challenge);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create claim challenge.";
    return NextResponse.json({ error: message }, { status: message.includes("configured") ? 503 : 400 });
  }
}
