import { NextResponse } from "next/server";
import { ensureDefaultMission, getPublicMissions } from "@/lib/leaderboard/missionsStorage";
import { isLeaderboardStorageConfigured } from "@/lib/leaderboard/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isLeaderboardStorageConfigured()) return NextResponse.json({ missions: [], storageConfigured: false });
    await ensureDefaultMission();
    const missions = await getPublicMissions();
    return NextResponse.json({ missions, storageConfigured: true });
  } catch (error) {
    console.error("Missions load failed", error);
    return NextResponse.json({ missions: [], storageConfigured: false });
  }
}
