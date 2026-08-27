import { NextResponse } from "next/server";
import { createWalletNonce, isSolanaAddress } from "@/lib/leaderboard/accountAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as { walletAddress?: string };
    if (!body.walletAddress || !isSolanaAddress(body.walletAddress)) return NextResponse.json({ error: "Valid Solana wallet address required." }, { status: 400 });
    const challenge = await createWalletNonce(body.walletAddress, "AUTH");
    return NextResponse.json(challenge);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create login challenge.";
    return NextResponse.json({ error: message }, { status: message.includes("configured") ? 503 : 400 });
  }
}
