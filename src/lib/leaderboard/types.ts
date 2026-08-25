import type { ContributionStatus, ContributionType, Platform } from "@/config/leaderboard";

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

export interface Contribution {
  id: string;
  memberId: string;
  type: ContributionType;
  description: string;
  proofUrl?: string;
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
  walletAddress?: string;
}
