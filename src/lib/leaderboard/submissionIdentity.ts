import { getWalletSession } from "./accountAuth";
import { getLinkedProfileForWallet } from "./accountStorage";
import type { LeaderboardMember } from "./types";

function usernameForMember(member: LeaderboardMember) {
  return member.xUsername || member.telegramUsername || member.discordUsername || member.otherUsername || member.displayName;
}

export async function applyLinkedProfileToSubmission(body: Record<string, unknown>) {
  const session = await getWalletSession();
  if (!session) return body;
  const profile = await getLinkedProfileForWallet(session.walletAddress);
  if (!profile) return body;
  return {
    ...body,
    displayName: profile.member.displayName,
    username: usernameForMember(profile.member),
    platform: profile.member.platform,
    walletAddress: profile.member.claimedWalletAddress || session.walletAddress,
  };
}
