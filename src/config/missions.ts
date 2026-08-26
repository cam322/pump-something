export const MISSION_CATEGORIES = [
  "MEME",
  "ART",
  "GIF",
  "VIDEO",
  "IDEA",
  "X_POST",
  "COMMUNITY",
  "CONTEST",
  "SPECIAL",
  "OTHER",
] as const;

export const MISSION_STATUSES = ["DRAFT", "ACTIVE", "EXPIRED", "ARCHIVED"] as const;
export const MISSION_DIFFICULTIES = ["EASY", "MEDIUM", "HARD", "SPECIAL"] as const;

export type MissionCategory = typeof MISSION_CATEGORIES[number];
export type MissionStatus = typeof MISSION_STATUSES[number];
export type MissionDifficulty = typeof MISSION_DIFFICULTIES[number];

export const DEFAULT_MISSION_POINTS: Record<MissionCategory, number> = {
  MEME: 25,
  ART: 40,
  GIF: 40,
  VIDEO: 75,
  IDEA: 25,
  X_POST: 25,
  COMMUNITY: 50,
  CONTEST: 100,
  SPECIAL: 100,
  OTHER: 25,
};

export const DEFAULT_FEATURED_MISSION = {
  title: "MEME SOMETHING",
  slug: "meme-something",
  description: "Create an original $SOMETHING meme based on something happening online.",
  category: "MEME" as MissionCategory,
  points: 25,
  difficulty: "EASY" as MissionDifficulty,
  proofInstructions: "Post your original $SOMETHING meme on social media, then submit the public post link as proof.",
  repeatable: true,
  cooldownHours: 24,
};

export function missionCategoryLabel(category: MissionCategory) {
  return category.replace("_", " ");
}
