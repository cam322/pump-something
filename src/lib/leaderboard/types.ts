import type { ContributionStatus, ContributionType, Platform } from "@/config/leaderboard";
import type { MissionCategory, MissionDifficulty, MissionStatus } from "@/config/missions";
import type { AchievementBadge, MemberLevel } from "./profileStats";

export interface LeaderboardMember {
  id: string;
  displayName: string;
  platform: Platform;
  telegramUsername?: string;
  xUsername?: string;
  discordUsername?: string;
  otherUsername?: string;
  walletAddress?: string;
  createdAt: string;
}

export interface ProfilePreferences {
  bio?: string;
  avatarUrl?: string;
  publicWallet: boolean;
  claimedAt?: string;
  updatedAt?: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  type: ContributionType;
  description: string;
  proofUrl?: string;
  archiveImageDataUrl?: string;
  archiveImageUrl?: string;
  missionId?: string;
  missionTitle?: string;
  completedAt?: string;
  pointsAwarded: number;
  suggestedPoints: number;
  status: ContributionStatus;
  submittedAt: string;
  verifiedAt?: string;
  verifier?: string;
  notes?: string;
}

export interface LeaderboardEntry {
  member: LeaderboardMember;
  points: number;
  verifiedContributions: number;
  rankTitle: string;
  leaderboardRank?: number;
  profileSlug: string;
  memberLevel: MemberLevel;
  contributionScore: number;
  profilePreferences: ProfilePreferences;
  missionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  achievements: {
    unlocked: AchievementBadge[];
    locked: AchievementBadge[];
  };
  recentContributions: Contribution[];
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  topThree: LeaderboardEntry[];
  recentActivity: Array<{
    member: LeaderboardMember;
    contribution: Contribution;
  }>;
  storageConfigured: boolean;
}

export interface SubmitContributionInput {
  displayName: string;
  username: string;
  platform: Platform;
  type: ContributionType;
  description: string;
  proofUrl?: string;
  archiveImageDataUrl?: string;
  archiveImageUrl?: string;
  missionId?: string;
  missionTitle?: string;
  completedAt?: string;
  suggestedPoints?: number;
  walletAddress?: string;
}

export interface Mission {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: MissionCategory;
  points: number;
  difficulty: MissionDifficulty;
  status: MissionStatus;
  startAt: string;
  endAt?: string;
  proofInstructions: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isFeatured: boolean;
  repeatable: boolean;
  cooldownHours?: number;
}

export interface MissionInput {
  title: string;
  slug?: string;
  description: string;
  category: MissionCategory;
  points: number;
  difficulty: MissionDifficulty;
  status: MissionStatus;
  startAt?: string;
  endAt?: string;
  proofInstructions: string;
  isFeatured: boolean;
  repeatable: boolean;
  cooldownHours?: number;
}

