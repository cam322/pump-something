import { DEFAULT_FEATURED_MISSION, DEFAULT_MISSION_POINTS, MISSION_CATEGORIES, MISSION_DIFFICULTIES, MISSION_STATUSES, type MissionCategory } from "@/config/missions";
import type { Contribution, Mission, MissionInput, SubmitContributionInput } from "@/lib/leaderboard/types";
import { createPendingContribution, findOrCreateMember, isLeaderboardStorageConfigured } from "@/lib/leaderboard/storage";
import { isSocialProofUrl, sanitizeText, validateSubmission } from "@/lib/leaderboard/validation";
import type { ContributionType } from "@/config/leaderboard";

const PREFIX = "something:leaderboard";
const MISSION_INDEX = `${PREFIX}:missions`;

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

async function redisCommand<T = unknown>(command: unknown[]): Promise<T> {
  const config = redisConfig();
  if (!config) throw new Error("Mission storage is not configured");
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

function missionKey(id: string) {
  return `${PREFIX}:mission:${id}`;
}

function contributionKey(id: string) {
  return `${PREFIX}:contribution:${id}`;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "mission";
}

function missionCategoryToContributionType(category: MissionCategory): ContributionType {
  if (["MEME", "ART", "GIF", "VIDEO", "IDEA", "CONTEST", "COMMUNITY", "OTHER"].includes(category)) {
    return category as ContributionType;
  }
  return "OTHER";
}

function assertMissionInput(input: MissionInput | Partial<MissionInput>) {
  if (input.category && !(MISSION_CATEGORIES as readonly string[]).includes(input.category)) throw new Error("Choose a valid mission category.");
  if (input.difficulty && !(MISSION_DIFFICULTIES as readonly string[]).includes(input.difficulty)) throw new Error("Choose a valid mission difficulty.");
  if (input.status && !(MISSION_STATUSES as readonly string[]).includes(input.status)) throw new Error("Choose a valid mission status.");
  if (input.points !== undefined && (!Number.isFinite(Number(input.points)) || Number(input.points) < 0 || Number(input.points) > 10000)) throw new Error("Mission points must be between 0 and 10000.");
  if (input.endAt && input.startAt && Date.parse(input.endAt) <= Date.parse(input.startAt)) throw new Error("End date must be after start date.");
}

async function getJson<T>(key: string): Promise<T | null> {
  const value = await redisCommand<string | null>(["GET", key]);
  if (!value) return null;
  return JSON.parse(value) as T;
}

async function setJson<T>(key: string, value: T): Promise<void> {
  await redisCommand(["SET", key, JSON.stringify(value)]);
}

async function getAllContributionIds() {
  return redisCommand<string[]>(["SMEMBERS", `${PREFIX}:contributions`]);
}

async function getContributionsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const values = await redisCommand<Array<string | null>>(["MGET", ...ids.map(contributionKey)]);
  return values.filter(Boolean).map((value) => JSON.parse(value as string) as Contribution);
}

export async function ensureDefaultMission() {
  if (!isLeaderboardStorageConfigured()) return null;
  const missions = await getMissions();
  if (missions.length > 0) return missions.find((mission) => mission.isFeatured) || missions[0];
  const now = new Date().toISOString();
  return createMission({
    ...DEFAULT_FEATURED_MISSION,
    status: "ACTIVE",
    startAt: now,
    isFeatured: true,
  });
}

export async function getMissions() {
  if (!isLeaderboardStorageConfigured()) return [] as Mission[];
  const ids = await redisCommand<string[]>(["SMEMBERS", MISSION_INDEX]);
  if (ids.length === 0) return [] as Mission[];
  const values = await redisCommand<Array<string | null>>(["MGET", ...ids.map(missionKey)]);
  return values
    .filter(Boolean)
    .map((value) => JSON.parse(value as string) as Mission)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getPublicMissions() {
  const missions = await getMissions();
  const now = Date.now();
  return missions.map((mission) => {
    if (mission.status === "ACTIVE" && mission.endAt && Date.parse(mission.endAt) < now) {
      return { ...mission, status: "EXPIRED" as const };
    }
    return mission;
  });
}

export async function getMission(id: string) {
  return getJson<Mission>(missionKey(id));
}

export async function createMission(input: MissionInput) {
  assertMissionInput(input);
  const now = new Date().toISOString();
  const mission: Mission = {
    id: `mission_${crypto.randomUUID()}`,
    title: sanitizeText(input.title, 90),
    slug: slugify(input.slug || input.title),
    description: sanitizeText(input.description, 600),
    category: input.category,
    points: Math.max(0, Math.min(10000, Math.floor(Number(input.points) || DEFAULT_MISSION_POINTS[input.category]))),
    difficulty: input.difficulty,
    status: input.status,
    startAt: input.startAt || now,
    endAt: input.endAt || undefined,
    proofInstructions: sanitizeText(input.proofInstructions, 700),
    createdAt: now,
    updatedAt: now,
    createdBy: "admin",
    isFeatured: Boolean(input.isFeatured),
    repeatable: Boolean(input.repeatable),
    cooldownHours: input.repeatable ? Math.max(1, Math.floor(Number(input.cooldownHours) || 24)) : undefined,
  };
  if (mission.isFeatured) await clearFeaturedMissions();
  await setJson(missionKey(mission.id), mission);
  await redisCommand(["SADD", MISSION_INDEX, mission.id]);
  return mission;
}

export async function updateMission(id: string, input: Partial<MissionInput>) {
  assertMissionInput(input);
  const existing = await getMission(id);
  if (!existing) throw new Error("Mission not found");
  const next: Mission = {
    ...existing,
    title: input.title !== undefined ? sanitizeText(input.title, 90) : existing.title,
    slug: input.slug !== undefined ? slugify(input.slug || existing.title) : existing.slug,
    description: input.description !== undefined ? sanitizeText(input.description, 600) : existing.description,
    category: input.category || existing.category,
    points: input.points !== undefined ? Math.max(0, Math.min(10000, Math.floor(Number(input.points)))) : existing.points,
    difficulty: input.difficulty || existing.difficulty,
    status: input.status || existing.status,
    startAt: input.startAt || existing.startAt,
    endAt: input.endAt !== undefined ? input.endAt || undefined : existing.endAt,
    proofInstructions: input.proofInstructions !== undefined ? sanitizeText(input.proofInstructions, 700) : existing.proofInstructions,
    isFeatured: input.isFeatured !== undefined ? Boolean(input.isFeatured) : existing.isFeatured,
    repeatable: input.repeatable !== undefined ? Boolean(input.repeatable) : existing.repeatable,
    cooldownHours: input.cooldownHours !== undefined ? Math.max(1, Math.floor(Number(input.cooldownHours) || 24)) : existing.cooldownHours,
    updatedAt: new Date().toISOString(),
  };
  if (next.isFeatured) await clearFeaturedMissions(id);
  await setJson(missionKey(id), next);
  return next;
}

async function clearFeaturedMissions(exceptId?: string) {
  const missions = await getMissions();
  await Promise.all(missions.filter((mission) => mission.id !== exceptId && mission.isFeatured).map((mission) => setJson(missionKey(mission.id), { ...mission, isFeatured: false, updatedAt: new Date().toISOString() })));
}

export async function submitMissionCompletion(missionId: string, body: Record<string, unknown>) {
  const mission = await getMission(missionId);
  if (!mission || mission.status !== "ACTIVE") throw new Error("This mission is not active.");
  if (mission.endAt && Date.parse(mission.endAt) < Date.now()) throw new Error("This mission has expired.");

  const validated = validateSubmission({
    ...body,
    type: missionCategoryToContributionType(mission.category),
    description: sanitizeText(body.description, 500),
  });
  if (!validated.ok) throw new Error(validated.error);
  if (!isSocialProofUrl(validated.data.proofUrl || "")) throw new Error("Proof must be a social media post link.");

  const member = await findOrCreateMember(validated.data);
  const all = await getContributionsByIds(await getAllContributionIds());
  const proofUrl = (validated.data.proofUrl || "").trim().toLowerCase();
  if (all.some((item) => (item.proofUrl || "").trim().toLowerCase() === proofUrl)) {
    throw new Error("That proof link has already been submitted.");
  }

  if (mission.repeatable && mission.cooldownHours) {
    const latest = all
      .filter((item) => item.memberId === member.id && item.missionId === mission.id && item.status !== "REJECTED")
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
    if (latest && Date.now() - Date.parse(latest.submittedAt) < mission.cooldownHours * 3_600_000) {
      throw new Error(`You can do this repeatable mission every ${mission.cooldownHours} hours.`);
    }
  } else if (all.some((item) => item.memberId === member.id && item.missionId === mission.id && item.status !== "REJECTED")) {
    throw new Error("You have already submitted this one-time mission.");
  }

  const input: SubmitContributionInput = {
    ...validated.data,
    type: missionCategoryToContributionType(mission.category),
    description: `${mission.title}: ${validated.data.description}`,
    missionId: mission.id,
    missionTitle: mission.title,
    completedAt: new Date().toISOString(),
    suggestedPoints: mission.points,
  };

  const contribution = await createPendingContribution(input);
  return { contribution, member, mission };
}

export async function getMissionSubmissions() {
  const all = await getContributionsByIds(await getAllContributionIds());
  const missions = await getMissions();
  const missionMap = new Map(missions.map((mission) => [mission.id, mission]));
  return all
    .filter((contribution) => contribution.missionId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .map((contribution) => ({ contribution, mission: missionMap.get(contribution.missionId || "") || null }));
}

export const missionOptions = { MISSION_CATEGORIES, MISSION_DIFFICULTIES, MISSION_STATUSES };
