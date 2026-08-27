import { NextResponse } from "next/server";
import { getWalletSession } from "@/lib/leaderboard/accountAuth";
import { getClaimsForWallet, getLinkedProfileForWallet } from "@/lib/leaderboard/accountStorage";

export const dynamic = "force-dynamic";

function usernameForProfile(profile: Awaited<ReturnType<typeof getLinkedProfileForWallet>>) {
  const member = profile?.member;
  return member?.xUsername || member?.telegramUsername || member?.discordUsername || member?.otherUsername || member?.displayName || "community";
}

export async function GET() {
  const session = await getWalletSession();
  if (!session) return NextResponse.json({ authenticated: false });
  const profile = await getLinkedProfileForWallet(session.walletAddress);
  const claims = await getClaimsForWallet(session.walletAddress);
  return NextResponse.json({
    authenticated: true,
    walletAddress: session.walletAddress,
    profile: profile ? { memberId: profile.member.id, profileSlug: profile.profileSlug, displayName: profile.member.displayName, username: usernameForProfile(profile), platform: profile.member.platform } : null,
    claims: claims.map(({ claim, profile: claimProfile }) => ({ claim, profile: claimProfile ? { profileSlug: claimProfile.profileSlug, displayName: claimProfile.member.displayName } : null })),
  });
}
