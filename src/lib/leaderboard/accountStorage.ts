import { CONTRIBUTION_TYPES, PLATFORMS } from "@/config/leaderboard";
import { defaultProfilePreferences, memberMatchesSlug, profileSlugForMember, slugify } from "./profileStats";
import { getLeaderboard, getMemberProfile } from "./storage";
import { sanitizeText } from "./validation";
import type { LeaderboardEntry, LeaderboardMember, ProfileClaimRequest, ProfilePreferences } from "./types";

const PREFIX = "something:leaderboard";
const MEMBER_INDEX = `${PREFIX}:members`;
const CLAIM_INDEX = `${PREFIX}:profile_claims`;
const PENDING_CLAIM_INDEX = `${PREFIX}:profile_claims:pending`;

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

async function redisCommand<T = unknown>(command: unknown[]): Promise<T> {
  const config = redisConfig();
  if (!config) throw new Error("Account storage is not configured.");
  const response = await fetch(config.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Redis command failed: ${response.status}`);
  const data = await response.json() as { result?: T; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result as T;
}

function memberKey(id: string) {
  return `${PREFIX}:member:${id}`;
}

function claimKey(id: string) {
  return `${PREFIX}:profile_claim:${id}`;
}

function walletClaimKey(walletAddress: string) {
  return `${PREFIX}:wallet:${walletAddress}:member`;
}

function profilePreferencesKey(memberId: string) {
  return `${PREFIX}:profile:${memberId}:preferences`;
}

async function getJson<T>(key: string): Promise<T | null> {
  const value = await redisCommand<string | null>(["GET", key]);
  if (!value) return null;
  return JSON.parse(value) as T;
}

async function setJson<T>(key: string, value: T): Promise<void> {
  await redisCommand(["SET", key, JSON.stringify(value)]);
}

export async function getAllMembers(): Promise<LeaderboardMember[]> {
  const ids = await redisCommand<string[]>(["SMEMBERS", MEMBER_INDEX]);
  if (ids.length === 0) return [];
  const values = await redisCommand<Array<string | null>>(["MGET", ...ids.map(memberKey)]);
  return values.filter(Boolean).map((value) => JSON.parse(value as string) as LeaderboardMember);
}

export async function getMemberById(memberId: string) {
  return getJson<LeaderboardMember>(memberKey(memberId));
}

export async function getMemberBySlugOrId(value: string) {
  const members = await getAllMembers();
  return members.find((member) => member.id === value || memberMatchesSlug(member, value)) || null;
}

export async function getLinkedMemberIdForWallet(walletAddress: string) {
  return redisCommand<string | null>(["GET", walletClaimKey(walletAddress)]);
}

export async function getLinkedProfileForWallet(walletAddress: string): Promise<LeaderboardEntry | null> {
  const memberId = await getLinkedMemberIdForWallet(walletAddress);
  if (!memberId) return null;
  return getMemberProfile(memberId);
}

export async function searchClaimableProfiles(query: string) {
  const normalized = slugify(query || "");
  const leaderboard = await getLeaderboard(200);
  const entries = leaderboard.entries;
  return entries
    .filter((entry) => (entry.member.claimStatus || "UNCLAIMED") !== "CLAIMED")
    .filter((entry) => {
      if (!normalized) return true;
      const haystack = [entry.member.displayName, entry.member.xUsername, entry.member.telegramUsername, entry.member.discordUsername, entry.member.otherUsername, entry.profileSlug]
        .filter(Boolean)
        .map((item) => slugify(String(item)));
      return haystack.some((item) => item.includes(normalized));
    })
    .slice(0, 20)
    .map((entry) => ({
      memberId: entry.member.id,
      profileSlug: entry.profileSlug,
      displayName: entry.member.displayName,
      username: entry.member.xUsername || entry.member.telegramUsername || entry.member.discordUsername || entry.member.otherUsername || "community",
      points: entry.points,
      rankTitle: entry.rankTitle,
      leaderboardRank: entry.leaderboardRank,
      verifiedContributions: entry.verifiedContributions,
      missionsCompleted: entry.missionsCompleted,
      claimStatus: entry.member.claimStatus || "UNCLAIMED",
    }));
}

export async function createProfileClaim(memberId: string, walletAddress: string): Promise<ProfileClaimRequest> {
  const member = await getMemberById(memberId);
  if (!member) throw new Error("Profile not found.");
  if (member.claimStatus === "CLAIMED" || member.claimedWalletAddress) throw new Error("This profile is already claimed.");
  const linkedMemberId = await getLinkedMemberIdForWallet(walletAddress);
  if (linkedMemberId && linkedMemberId !== memberId) throw new Error("This wallet is already linked to another profile.");
  const existingPendingIds = await redisCommand<string[]>(["SMEMBERS", PENDING_CLAIM_INDEX]);
  if (existingPendingIds.length) {
    const values = await redisCommand<Array<string | null>>(["MGET", ...existingPendingIds.map(claimKey)]);
    const duplicate = values.filter(Boolean).map((value) => JSON.parse(value as string) as ProfileClaimRequest)
      .find((claim) => claim.memberId === memberId || claim.walletAddress === walletAddress);
    if (duplicate) throw new Error("A pending claim already exists for this profile or wallet.");
  }

  const now = new Date().toISOString();
  const claim: ProfileClaimRequest = {
    id: `claim_${crypto.randomUUID()}`,
    memberId,
    walletAddress,
    status: "PENDING",
    requestedAt: now,
    walletVerifiedAt: now,
  };
  const updatedMember: LeaderboardMember = { ...member, claimStatus: "PENDING_CLAIM", claimRequestedAt: now, walletVerifiedAt: now };
  await setJson(claimKey(claim.id), claim);
  await redisCommand(["SADD", CLAIM_INDEX, claim.id]);
  await redisCommand(["SADD", PENDING_CLAIM_INDEX, claim.id]);
  await setJson(memberKey(memberId), updatedMember);
  return claim;
}

export async function getClaimRequest(id: string) {
  return getJson<ProfileClaimRequest>(claimKey(id));
}

async function getClaimRequestsByIds(ids: string[]) {
  if (ids.length === 0) return [] as ProfileClaimRequest[];
  const values = await redisCommand<Array<string | null>>(["MGET", ...ids.map(claimKey)]);
  return values.filter(Boolean).map((value) => JSON.parse(value as string) as ProfileClaimRequest);
}

export async function getPendingClaimRequests() {
  const ids = await redisCommand<string[]>(["SMEMBERS", PENDING_CLAIM_INDEX]);
  const claims = (await getClaimRequestsByIds(ids)).filter((claim) => claim.status === "PENDING").sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  const rows = await Promise.all(claims.map(async (claim) => ({ claim, profile: await getMemberProfile(claim.memberId) })));
  return rows.filter((row): row is { claim: ProfileClaimRequest; profile: LeaderboardEntry } => Boolean(row.profile));
}

export async function getClaimsForWallet(walletAddress: string) {
  const ids = await redisCommand<string[]>(["SMEMBERS", CLAIM_INDEX]);
  const claims = (await getClaimRequestsByIds(ids)).filter((claim) => claim.walletAddress === walletAddress).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  return Promise.all(claims.map(async (claim) => ({ claim, profile: await getMemberProfile(claim.memberId) })));
}

export async function approveProfileClaim(id: string, admin: string, notes?: string) {
  const claim = await getClaimRequest(id);
  if (!claim) throw new Error("Claim not found.");
  if (claim.status !== "PENDING") throw new Error("Claim already reviewed.");
  const member = await getMemberById(claim.memberId);
  if (!member) throw new Error("Profile not found.");
  if (member.claimStatus === "CLAIMED" || member.claimedWalletAddress) throw new Error("Profile already claimed.");
  const linkedMemberId = await getLinkedMemberIdForWallet(claim.walletAddress);
  if (linkedMemberId && linkedMemberId !== member.id) throw new Error("Wallet already linked to another profile.");
  const now = new Date().toISOString();
  const updatedClaim: ProfileClaimRequest = { ...claim, status: "APPROVED", reviewedAt: now, reviewedBy: admin, notes };
  const updatedMember: LeaderboardMember = {
    ...member,
    walletAddress: member.walletAddress || claim.walletAddress,
    claimStatus: "CLAIMED",
    claimedWalletAddress: claim.walletAddress,
    claimedAt: now,
    claimApprovedAt: now,
    claimApprovedBy: admin,
    walletVerifiedAt: claim.walletVerifiedAt,
  };
  await setJson(claimKey(id), updatedClaim);
  await setJson(memberKey(member.id), updatedMember);
  await redisCommand(["SET", walletClaimKey(claim.walletAddress), member.id]);
  await redisCommand(["SREM", PENDING_CLAIM_INDEX, id]);
  return updatedClaim;
}

export async function rejectProfileClaim(id: string, admin: string, notes?: string) {
  const claim = await getClaimRequest(id);
  if (!claim) throw new Error("Claim not found.");
  if (claim.status !== "PENDING") throw new Error("Claim already reviewed.");
  const member = await getMemberById(claim.memberId);
  const now = new Date().toISOString();
  const updatedClaim: ProfileClaimRequest = { ...claim, status: "REJECTED", reviewedAt: now, reviewedBy: admin, notes };
  await setJson(claimKey(id), updatedClaim);
  if (member && member.claimStatus === "PENDING_CLAIM") {
    await setJson(memberKey(member.id), { ...member, claimStatus: "REJECTED" });
  }
  await redisCommand(["SREM", PENDING_CLAIM_INDEX, id]);
  return updatedClaim;
}

function assertUniqueUsername(members: LeaderboardMember[], username: string, platform: "X" | "Telegram") {
  const normalized = slugify(username);
  const exists = members.some((member) => slugify(platform === "X" ? member.xUsername || "" : member.telegramUsername || "") === normalized);
  if (exists) throw new Error("That username is already used by another profile.");
}

export async function createClaimedProfile(input: { walletAddress: string; displayName: string; username: string; platform: "X" | "Telegram"; bio?: string; avatarUrl?: string; publicWallet?: boolean }) {
  const linkedMemberId = await getLinkedMemberIdForWallet(input.walletAddress);
  if (linkedMemberId) throw new Error("This wallet is already linked to a profile.");
  if (!PLATFORMS.includes(input.platform)) throw new Error("Choose X or Telegram.");
  const members = await getAllMembers();
  assertUniqueUsername(members, input.username, input.platform);
  const now = new Date().toISOString();
  const member: LeaderboardMember = {
    id: `member_${crypto.randomUUID()}`,
    displayName: sanitizeText(input.displayName, 60),
    platform: input.platform,
    xUsername: input.platform === "X" ? slugify(input.username) : undefined,
    telegramUsername: input.platform === "Telegram" ? slugify(input.username) : undefined,
    walletAddress: input.walletAddress,
    claimStatus: "CLAIMED",
    claimedWalletAddress: input.walletAddress,
    claimedAt: now,
    claimApprovedAt: now,
    claimApprovedBy: "wallet-self-created",
    walletVerifiedAt: now,
    createdAt: now,
  };
  if (!member.displayName || member.displayName.length < 2) throw new Error("Display name is required.");
  await setJson(memberKey(member.id), member);
  await redisCommand(["SADD", MEMBER_INDEX, member.id]);
  await redisCommand(["SET", walletClaimKey(input.walletAddress), member.id]);
  const preferences: ProfilePreferences = { ...defaultProfilePreferences(), bio: sanitizeText(input.bio, 180) || undefined, avatarUrl: sanitizeText(input.avatarUrl, 500) || undefined, publicWallet: Boolean(input.publicWallet), updatedAt: now };
  await setJson(profilePreferencesKey(member.id), preferences);
  return member;
}

export async function updateOwnerProfile(memberId: string, input: Record<string, unknown>) {
  const member = await getMemberById(memberId);
  if (!member || member.claimStatus !== "CLAIMED") throw new Error("Claimed profile not found.");
  const nextMember: LeaderboardMember = { ...member };
  if (typeof input.displayName === "string") nextMember.displayName = sanitizeText(input.displayName, 60);
  if (typeof input.xUsername === "string") nextMember.xUsername = slugify(input.xUsername);
  if (typeof input.telegramUsername === "string") nextMember.telegramUsername = slugify(input.telegramUsername);
  if (!nextMember.displayName || nextMember.displayName.length < 2) throw new Error("Display name is required.");
  const preferences: ProfilePreferences = {
    ...defaultProfilePreferences(),
    ...(await getJson<ProfilePreferences>(profilePreferencesKey(memberId)) || {}),
    bio: typeof input.bio === "string" ? sanitizeText(input.bio, 180) || undefined : undefined,
    avatarUrl: typeof input.avatarUrl === "string" ? sanitizeText(input.avatarUrl, 500) || undefined : undefined,
    publicWallet: Boolean(input.publicWallet),
    updatedAt: new Date().toISOString(),
  };
  if (preferences.avatarUrl) {
    const url = new URL(preferences.avatarUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Avatar must be an http(s) URL.");
  }
  await setJson(memberKey(memberId), nextMember);
  await setJson(profilePreferencesKey(memberId), preferences);
  return { member: nextMember, preferences, profileSlug: profileSlugForMember(nextMember) };
}

export function isEditableContributionType(value: unknown) {
  return typeof value === "string" && CONTRIBUTION_TYPES.includes(value as never);
}
