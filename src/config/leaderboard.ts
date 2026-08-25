export const CONTRIBUTION_TYPES = [
  "MEME",
  "ART",
  "GIF",
  "VIDEO",
  "IDEA",
  "CONTEST",
  "COMMUNITY",
  "OTHER",
] as const;

export const CONTRIBUTION_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export const PLATFORMS = ["Telegram", "X", "Discord", "Other"] as const;

export type ContributionType = typeof CONTRIBUTION_TYPES[number];
export type ContributionStatus = typeof CONTRIBUTION_STATUSES[number];
export type Platform = typeof PLATFORMS[number];

export const RANK_THRESHOLDS = [
  { min: 5000, title: "SOMETHING LEGEND" },
  { min: 2500, title: "SOMETHING CHAMPION" },
  { min: 1000, title: "SOMETHING BUILDER" },
  { min: 500, title: "SOMETHING CONTRIBUTOR" },
  { min: 100, title: "DID SOMETHING" },
  { min: 0, title: "DOING NOTHING" },
] as const;

export const DEFAULT_POINT_VALUES: Record<ContributionType, number> = {
  MEME: 25,
  ART: 40,
  GIF: 40,
  VIDEO: 75,
  IDEA: 25,
  CONTEST: 100,
  COMMUNITY: 50,
  OTHER: 25,
};

export const COMMUNITY_REWARDS_RESERVE = "500,000 $SOMETHING";

export function getRankTitle(points: number): string {
  return RANK_THRESHOLDS.find((rank) => points >= rank.min)?.title || "DOING NOTHING";
}
