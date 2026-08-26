import { getRankTitle } from "@/config/leaderboard";
import { identityFieldForPlatform, normalizeUsername, suggestedPointsFor } from "./validation";
import type { Contribution, LeaderboardEntry, LeaderboardMember, LeaderboardResponse, SubmitContributionInput } from "./types";

const PREFIX = "something:leaderboard";
const MEMBER_INDEX = `${PREFIX}:members`;
const CONTRIBUTION_INDEX = `${PREFIX}:contributions`;
const PENDING_INDEX = `${PREFIX}:contributions:pending`;
const APPROVED_INDEX = `${PREFIX}:contributions:approved`;

class StorageNotConfiguredError extends Error {
  constructor() {
    super("Leaderboard storage is not configured");
  }
}

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

export function isLeaderboardStorageConfigured(): boolean {
  return Boolean(redisConfig());
}

async function redisCommand<T = unknown>(command: unknown[]): Promise<T> {
  const config = redisConfig();
  if (!config) throw new StorageNotConfiguredError();

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Redis command failed: ${response.status}`);
  }

  const data = await response.json() as { result?: T; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result as T;
}

async function getJson<T>(key: string): Promise<T | null> {
  const value = await redisCommand<string | null>(["GET", key]);
  if (!value) return null;
  return JSON.parse(value) as T;
}

async function setJson<T>(key: string, value: T): Promise<void> {
  await redisCommand(["SET", key, JSON.stringify(value)]);
}

function memberKey(id: string) {
  return `${PREFIX}:member:${id}`;
}

function contributionKey(id: string) {
  return `${PREFIX}:contribution:${id}`;
}

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function utcDay(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function calculateStreaks(contributions: Contribution[]) {
  const missionDays = Array.from(new Set(
    contributions
      .filter((item) => item.status === "APPROVED" && item.missionId)
      .map((item) => utcDay(item.completedAt || item.submittedAt))
  )).sort();

  if (missionDays.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let longestStreak = 1;
  let run = 1;
  for (let index = 1; index < missionDays.length; index += 1) {
    const previous = Date.parse(`${missionDays[index - 1]}T00:00:00.000Z`);
    const current = Date.parse(`${missionDays[index]}T00:00:00.000Z`);
    if (current - previous === 86_400_000) {
      run += 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
  }

  const today = utcDay(new Date().toISOString());
  const yesterday = utcDay(new Date(Date.now() - 86_400_000).toISOString());
  const lastDay = missionDays[missionDays.length - 1];
  let currentStreak = 0;
  if (lastDay === today || lastDay === yesterday) {
    currentStreak = 1;
    for (let index = missionDays.length - 1; index > 0; index -= 1) {
      const previous = Date.parse(`${missionDays[index - 1]}T00:00:00.000Z`);
      const current = Date.parse(`${missionDays[index]}T00:00:00.000Z`);
      if (current - previous !== 86_400_000) break;
      currentStreak += 1;
    }
  }

  return { currentStreak, longestStreak };
}

function badgesFor(contributions: Contribution[], currentStreak: number, longestStreak: number) {
  const missionsCompleted = contributions.filter((item) => item.status === "APPROVED" && item.missionId).length;
  const memeMissions = contributions.filter((item) => item.status === "APPROVED" && item.missionId && item.type === "MEME").length;
  const badges: string[] = [];
  if (missionsCompleted >= 1) badges.push("FIRST SOMETHING");
  if (memeMissions >= 5) badges.push("MEME MACHINE");
  if (Math.max(currentStreak, longestStreak) >= 3) badges.push("ON A ROLL");
  if (Math.max(currentStreak, longestStreak) >= 7) badges.push("CAN'T STOP DOING SOMETHING");
  if (Math.max(currentStreak, longestStreak) >= 30) badges.push("SOMETHING SERIOUS");
  return badges;
}

async function getMembersByIds(ids: string[]): Promise<LeaderboardMember[]> {
  if (ids.length === 0) return [];
  const values = await redisCommand<Array<string | null>>(["MGET", ...ids.map(memberKey)]);
  return values.filter(Boolean).map((value) => JSON.parse(value as string) as LeaderboardMember);
}

async function getContributionsByIds(ids: string[]): Promise<Contribution[]> {
  if (ids.length === 0) return [];
  const values = await redisCommand<Array<string | null>>(["MGET", ...ids.map(contributionKey)]);
  return values.filter(Boolean).map((value) => JSON.parse(value as string) as Contribution);
}

export async function findOrCreateMember(input: SubmitContributionInput): Promise<LeaderboardMember> {
  const username = normalizeUsername(input.username);
  const memberIds = await redisCommand<string[]>(["SMEMBERS", MEMBER_INDEX]);
  const members = await getMembersByIds(memberIds);
  const identityField = identityFieldForPlatform(input.platform);

  const existing = members.find((member) => {
    const samePlatformUser = member[identityField] && normalizeUsername(member[identityField] || "") === username;
    const sameWallet = input.walletAddress && member.walletAddress === input.walletAddress;
    return samePlatformUser || sameWallet;
  });

  if (existing) {
    const updated: LeaderboardMember = {
      ...existing,
      displayName: input.displayName,
      [identityField]: username,
      walletAddress: input.walletAddress || existing.walletAddress,
    };
    await setJson(memberKey(updated.id), updated);
    return updated;
  }

  const member: LeaderboardMember = {
    id: newId("member"),
    displayName: input.displayName,
    platform: input.platform,
    [identityField]: username,
    walletAddress: input.walletAddress,
    createdAt: new Date().toISOString(),
  };

  await setJson(memberKey(member.id), member);
  await redisCommand(["SADD", MEMBER_INDEX, member.id]);
  return member;
}

export async function createPendingContribution(input: SubmitContributionInput): Promise<Contribution> {
  const member = await findOrCreateMember(input);
  const contributionIds = await redisCommand<string[]>(["SMEMBERS", CONTRIBUTION_INDEX]);
  const contributions = await getContributionsByIds(contributionIds);
  const normalizedProof = input.proofUrl?.trim().toLowerCase();

  const duplicate = contributions.find((item) =>
    item.memberId === member.id &&
    item.status === "PENDING" &&
    item.type === input.type &&
    item.description.trim().toLowerCase() === input.description.trim().toLowerCase() &&
    (item.proofUrl || "").trim().toLowerCase() === (normalizedProof || "")
  );

  if (duplicate) return duplicate;

  const contribution: Contribution = {
    id: newId("contribution"),
    memberId: member.id,
    type: input.type,
    description: input.description,
    proofUrl: input.proofUrl,
    archiveImageDataUrl: input.archiveImageDataUrl,
    archiveImageUrl: input.archiveImageUrl,
    missionId: input.missionId,
    missionTitle: input.missionTitle,
    completedAt: input.completedAt,
    pointsAwarded: 0,
    suggestedPoints: input.suggestedPoints ?? suggestedPointsFor(input.type),
    status: "PENDING",
    submittedAt: new Date().toISOString(),
  };

  await setJson(contributionKey(contribution.id), contribution);
  await redisCommand(["SADD", CONTRIBUTION_INDEX, contribution.id]);
  await redisCommand(["SADD", PENDING_INDEX, contribution.id]);
  return contribution;
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardResponse> {
  if (!isLeaderboardStorageConfigured()) {
    return { entries: [], topThree: [], recentActivity: [], storageConfigured: false };
  }

  const approvedIds = await redisCommand<string[]>(["SMEMBERS", APPROVED_INDEX]);
  const approvedContributions = await getContributionsByIds(approvedIds);
  const memberIds = Array.from(new Set(approvedContributions.map((item) => item.memberId)));
  const members = await getMembersByIds(memberIds);
  const memberMap = new Map(members.map((member) => [member.id, member]));

  const entries = Array.from(memberMap.values()).map((member) => {
    const recentContributions = approvedContributions
      .filter((item) => item.memberId === member.id && item.status === "APPROVED")
      .sort((a, b) => (b.verifiedAt || "").localeCompare(a.verifiedAt || ""));
    const points = recentContributions.reduce((total, item) => total + item.pointsAwarded, 0);
    const { currentStreak, longestStreak } = calculateStreaks(recentContributions);
    const missionsCompleted = recentContributions.filter((item) => item.missionId).length;
    return {
      member,
      points,
      verifiedContributions: recentContributions.length,
      rankTitle: getRankTitle(points),
      missionsCompleted,
      currentStreak,
      longestStreak,
      badges: badgesFor(recentContributions, currentStreak, longestStreak),
      recentContributions: recentContributions.slice(0, 5),
    } satisfies LeaderboardEntry;
  }).sort((a, b) => b.points - a.points || b.verifiedContributions - a.verifiedContributions)
    .slice(0, limit);

  const recentActivity = approvedContributions
    .filter((item) => item.status === "APPROVED")
    .sort((a, b) => (b.verifiedAt || "").localeCompare(a.verifiedAt || ""))
    .slice(0, 10)
    .map((contribution) => {
      const member = memberMap.get(contribution.memberId);
      return member ? { member, contribution } : null;
    })
    .filter(Boolean) as LeaderboardResponse["recentActivity"];

  return {
    entries,
    topThree: entries.slice(0, 3),
    recentActivity,
    storageConfigured: true,
  };
}

export async function getMemberProfile(id: string): Promise<LeaderboardEntry | null> {
  const member = await getJson<LeaderboardMember>(memberKey(id));
  if (!member) return null;

  const approvedIds = await redisCommand<string[]>(["SMEMBERS", APPROVED_INDEX]);
  const approvedContributions = (await getContributionsByIds(approvedIds))
    .filter((item) => item.memberId === id && item.status === "APPROVED")
    .sort((a, b) => (b.verifiedAt || "").localeCompare(a.verifiedAt || ""));
  const points = approvedContributions.reduce((total, item) => total + item.pointsAwarded, 0);
  const { currentStreak, longestStreak } = calculateStreaks(approvedContributions);
  const missionsCompleted = approvedContributions.filter((item) => item.missionId).length;

  return {
    member,
    points,
    verifiedContributions: approvedContributions.length,
    rankTitle: getRankTitle(points),
    missionsCompleted,
    currentStreak,
    longestStreak,
    badges: badgesFor(approvedContributions, currentStreak, longestStreak),
    recentContributions: approvedContributions.slice(0, 20),
  };
}

export async function getApprovedArchiveMemes(): Promise<Array<{
  id: string;
  title: string;
  image: string;
  category: "internet" | "gaming" | "crypto" | "breaking" | "community";
  caption: string;
  date?: string;
  proofUrl?: string;
  creatorName: string;
}>> {
  if (!isLeaderboardStorageConfigured()) return [];

  const approvedIds = await redisCommand<string[]>(["SMEMBERS", APPROVED_INDEX]);
  const approvedContributions = (await getContributionsByIds(approvedIds))
    .filter((item) => item.status === "APPROVED")
    .sort((a, b) => (b.verifiedAt || "").localeCompare(a.verifiedAt || ""));
  const members = await getMembersByIds(Array.from(new Set(approvedContributions.map((item) => item.memberId))));
  const memberMap = new Map(members.map((member) => [member.id, member]));

  return approvedContributions.map((contribution) => {
    const member = memberMap.get(contribution.memberId);
    const category = contribution.type === "COMMUNITY" || contribution.type === "CONTEST" ? "community"
      : contribution.type === "MEME" || contribution.type === "GIF" || contribution.type === "VIDEO" || contribution.type === "ART" ? "internet"
        : "crypto";

    return {
      id: `approved-${contribution.id}`,
      title: `${member?.displayName || "Community"} did SOMETHING`,
      image: contribution.archiveImageDataUrl || contribution.archiveImageUrl || "/memes/community-placeholder.svg",
      category,
      caption: contribution.description,
      date: contribution.verifiedAt || contribution.submittedAt,
      proofUrl: contribution.proofUrl,
      creatorName: member?.displayName || "Community",
    };
  });
}

export async function getPendingSubmissions(): Promise<Array<{ member: LeaderboardMember; contribution: Contribution }>> {
  const pendingIds = await redisCommand<string[]>(["SMEMBERS", PENDING_INDEX]);
  const contributions = (await getContributionsByIds(pendingIds))
    .filter((item) => item.status === "PENDING")
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const members = await getMembersByIds(Array.from(new Set(contributions.map((item) => item.memberId))));
  const memberMap = new Map(members.map((member) => [member.id, member]));

  return contributions.map((contribution) => ({ member: memberMap.get(contribution.memberId), contribution }))
    .filter((item): item is { member: LeaderboardMember; contribution: Contribution } => Boolean(item.member));
}

export async function approveContribution(id: string, points: number, verifier: string, notes?: string): Promise<Contribution> {
  const contribution = await getJson<Contribution>(contributionKey(id));
  if (!contribution) throw new Error("Contribution not found");
  if (contribution.status !== "PENDING") throw new Error("Contribution has already been reviewed");
  if (!Number.isInteger(points) || points < 0 || points > 10000) throw new Error("Invalid points value");

  const updated: Contribution = {
    ...contribution,
    status: "APPROVED",
    pointsAwarded: points,
    verifiedAt: new Date().toISOString(),
    verifier,
    notes,
  };

  await setJson(contributionKey(id), updated);
  await redisCommand(["SREM", PENDING_INDEX, id]);
  await redisCommand(["SADD", APPROVED_INDEX, id]);
  return updated;
}

export async function rejectContribution(id: string, verifier: string, notes?: string): Promise<Contribution> {
  const contribution = await getJson<Contribution>(contributionKey(id));
  if (!contribution) throw new Error("Contribution not found");
  if (contribution.status !== "PENDING") throw new Error("Contribution has already been reviewed");

  const updated: Contribution = {
    ...contribution,
    status: "REJECTED",
    pointsAwarded: 0,
    verifiedAt: new Date().toISOString(),
    verifier,
    notes,
  };

  await setJson(contributionKey(id), updated);
  await redisCommand(["SREM", PENDING_INDEX, id]);
  return updated;
}

export { StorageNotConfiguredError };
