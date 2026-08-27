import { getRankTitle } from "@/config/leaderboard";
import type { Contribution, LeaderboardEntry, LeaderboardMember, ProfilePreferences } from "./types";

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  isUnlocked: (stats: ProfileStatsInput) => boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
}

export interface MemberLevel {
  level: number;
  title: string;
  minPoints: number;
  description: string;
}

export interface ActivityEvent {
  id: string;
  label: string;
  detail?: string;
  date: string;
  points?: number;
  proofUrl?: string;
}

interface ProfileStatsInput {
  points: number;
  verifiedContributions: number;
  missionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  contributions: Contribution[];
  rank?: number;
}

export const MEMBER_LEVELS: MemberLevel[] = [
  { level: 4, title: "SOMETHING LEGEND", minPoints: 2500, description: "Substantial verified participation across the community." },
  { level: 3, title: "SOMETHING BUILDER", minPoints: 1000, description: "A proven builder doing $SOMETHING repeatedly." },
  { level: 2, title: "DOING SOMETHING", minPoints: 500, description: "Consistent verified contribution." },
  { level: 1, title: "DID SOMETHING", minPoints: 100, description: "First meaningful verified activity on the board." },
  { level: 0, title: "DOING NOTHING", minPoints: 0, description: "Everybody starts with NOTHING. Go do $SOMETHING." },
];

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "early-something",
    title: "EARLY SOMETHING",
    description: "Joined during the earliest recorded community-member cohort.",
    isUnlocked: ({ rank, verifiedContributions }) => verifiedContributions > 0 && typeof rank === "number" && rank <= 25,
  },
  {
    id: "did-something",
    title: "DID SOMETHING",
    description: "Completed the first verified contribution.",
    isUnlocked: ({ verifiedContributions }) => verifiedContributions >= 1,
  },
  {
    id: "meme-machine",
    title: "MEME MACHINE",
    description: "Earned through at least five verified meme/GIF/video/art contributions.",
    isUnlocked: ({ contributions }) => contributions.filter((item) => ["MEME", "GIF", "VIDEO", "ART"].includes(item.type)).length >= 5,
  },
  {
    id: "mission-grinder",
    title: "MISSION GRINDER",
    description: "Completed at least five verified missions.",
    isUnlocked: ({ missionsCompleted }) => missionsCompleted >= 5,
  },
  {
    id: "seven-day-streak",
    title: "7 DAY STREAK",
    description: "Maintained a seven-day verified mission activity streak.",
    isUnlocked: ({ currentStreak, longestStreak }) => Math.max(currentStreak, longestStreak) >= 7,
  },
  {
    id: "hundred-club",
    title: "100 CLUB",
    description: "Reached 100 verified points.",
    isUnlocked: ({ points }) => points >= 100,
  },
  {
    id: "five-hundred-club",
    title: "500 CLUB",
    description: "Reached 500 verified points.",
    isUnlocked: ({ points }) => points >= 500,
  },
  {
    id: "top-ten",
    title: "TOP 10",
    description: "Reached the leaderboard Top 10.",
    isUnlocked: ({ rank }) => typeof rank === "number" && rank <= 10,
  },
  {
    id: "something-legend",
    title: "SOMETHING LEGEND",
    description: "High-level achievement for major verified community participation.",
    isUnlocked: ({ points, verifiedContributions, missionsCompleted }) => points >= 2500 && verifiedContributions >= 20 && missionsCompleted >= 10,
  },
];

export function profileSlugForMember(member: LeaderboardMember) {
  return slugify(member.xUsername || member.telegramUsername || member.discordUsername || member.otherUsername || member.displayName || member.id);
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/^@+/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "community";
}

export function isValidProfileSlug(slug: string) {
  return /^[a-z0-9][a-z0-9-]{0,79}$/.test(slug);
}

export function memberMatchesSlug(member: LeaderboardMember, slug: string) {
  const normalized = slugify(slug);
  return [
    member.id,
    member.xUsername,
    member.telegramUsername,
    member.discordUsername,
    member.otherUsername,
    member.displayName,
    profileSlugForMember(member),
  ].filter(Boolean).some((value) => slugify(String(value)) === normalized);
}

export function getMemberLevel(points: number) {
  return MEMBER_LEVELS.find((level) => points >= level.minPoints) || MEMBER_LEVELS[MEMBER_LEVELS.length - 1];
}

export function calculateContributionScore(input: ProfileStatsInput) {
  const pointsComponent = Math.min(500, Math.floor(input.points * 0.4));
  const contributionComponent = Math.min(300, input.verifiedContributions * 15);
  const missionComponent = Math.min(200, input.missionsCompleted * 20);
  const streakComponent = Math.min(100, Math.max(input.currentStreak, input.longestStreak) * 10);
  const achievementComponent = getAchievements(input).unlocked.length * 25;
  return pointsComponent + contributionComponent + missionComponent + streakComponent + achievementComponent;
}

export function getAchievements(input: ProfileStatsInput) {
  const toBadge = ({ id, title, description }: AchievementDefinition): AchievementBadge => ({ id, title, description });
  const unlocked = ACHIEVEMENTS.filter((achievement) => achievement.isUnlocked(input)).map(toBadge);
  const locked = ACHIEVEMENTS.filter((achievement) => !achievement.isUnlocked(input)).map(toBadge);
  return { unlocked, locked };
}

export function getContributionScoreExplanation() {
  return "Contribution Score measures verified participation in the $SOMETHING community and may be considered for future community rewards. It combines approved points, verified contributions, verified mission completions, activity streaks, and earned achievements. It is not a token price, financial score, airdrop guarantee, or promise of future value.";
}

export function maskWallet(walletAddress?: string) {
  if (!walletAddress) return undefined;
  if (walletAddress.length <= 12) return walletAddress;
  return `${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)}`;
}

function milestoneDate(contributions: Contribution[], targetPoints: number) {
  let total = 0;
  for (const contribution of [...contributions].reverse()) {
    total += contribution.pointsAwarded;
    if (total >= targetPoints) return contribution.verifiedAt || contribution.submittedAt;
  }
  return undefined;
}

function nthContributionDate(contributions: Contribution[], count: number, predicate?: (item: Contribution) => boolean) {
  const filtered = [...contributions].reverse().filter((item) => predicate ? predicate(item) : true);
  return filtered[count - 1]?.verifiedAt || filtered[count - 1]?.submittedAt;
}

export function buildRecentActivity(entry: LeaderboardEntry): ActivityEvent[] {
  const events: ActivityEvent[] = entry.recentContributions.map((contribution) => ({
    id: `contribution-${contribution.id}`,
    label: contribution.missionId ? `Completed ${contribution.missionTitle || "a mission"}` : "Submitted a verified contribution",
    detail: contribution.description,
    date: contribution.verifiedAt || contribution.submittedAt,
    points: contribution.pointsAwarded,
    proofUrl: contribution.proofUrl,
  }));

  const hundredDate = milestoneDate(entry.recentContributions, 100);
  if (hundredDate) events.push({ id: "milestone-100", label: "Reached 100 points", date: hundredDate });

  const fiveHundredDate = milestoneDate(entry.recentContributions, 500);
  if (fiveHundredDate) events.push({ id: "milestone-500", label: "Reached 500 points", date: fiveHundredDate });

  const firstDate = nthContributionDate(entry.recentContributions, 1);
  if (firstDate) events.push({ id: "achievement-did-something", label: "Unlocked DID SOMETHING", date: firstDate });

  const memeDate = nthContributionDate(entry.recentContributions, 5, (item) => ["MEME", "GIF", "VIDEO", "ART"].includes(item.type));
  if (memeDate) events.push({ id: "achievement-meme-machine", label: "Unlocked MEME MACHINE", date: memeDate });

  if (Math.max(entry.currentStreak, entry.longestStreak) >= 7) {
    const latestMission = entry.recentContributions.find((item) => item.missionId);
    if (latestMission) events.push({ id: "streak-7", label: "Reached a 7-day streak", date: latestMission.verifiedAt || latestMission.submittedAt });
  }

  return events
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((event, index, all) => all.findIndex((item) => item.id === event.id) === index)
    .slice(0, 12);
}

export function enrichEntry(entry: Omit<LeaderboardEntry, "profileSlug" | "memberLevel" | "contributionScore" | "profilePreferences" | "achievements" | "leaderboardRank"> & { profilePreferences?: ProfilePreferences }, rank?: number): LeaderboardEntry {
  const input = {
    points: entry.points,
    verifiedContributions: entry.verifiedContributions,
    missionsCompleted: entry.missionsCompleted,
    currentStreak: entry.currentStreak,
    longestStreak: entry.longestStreak,
    contributions: entry.recentContributions,
    rank,
  };
  const achievements = getAchievements(input);
  return {
    ...entry,
    leaderboardRank: rank,
    profileSlug: profileSlugForMember(entry.member),
    memberLevel: getMemberLevel(entry.points),
    contributionScore: calculateContributionScore(input),
    profilePreferences: entry.profilePreferences || defaultProfilePreferences(),
    achievements,
    badges: achievements.unlocked.map((achievement) => achievement.title),
    rankTitle: getRankTitle(entry.points),
  };
}

export function defaultProfilePreferences(): ProfilePreferences {
  return { publicWallet: false };
}
