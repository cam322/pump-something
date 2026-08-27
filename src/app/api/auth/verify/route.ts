import { NextResponse } from "next/server";
import { createWalletSessionCookie, verifyWalletNonce, walletSessionCookieName, walletSessionMaxAge } from "@/lib/leaderboard/accountAuth";
import { getLinkedMemberIdForWallet } from "@/lib/leaderboard/accountStorage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as { walletAddress?: string; nonce?: string; signature?: string };
    if (!body.walletAddress || !body.nonce || !body.signature) return NextResponse.json({ error: "Wallet, nonce, and signature are required." }, { status: 400 });
    await verifyWalletNonce(body.nonce, body.walletAddress, body.signature, "AUTH");
    const memberId = await getLinkedMemberIdForWallet(body.walletAddress) || undefined;
    const response = NextResponse.json({ success: true, walletAddress: body.walletAddress, memberId });
    response.cookies.set(walletSessionCookieName(), createWalletSessionCookie(body.walletAddress, memberId), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: walletSessionMaxAge(),
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not verify wallet signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
