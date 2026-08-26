import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/leaderboard/adminAuth";
import { createMission, ensureDefaultMission, getMissionSubmissions, getMissions, missionOptions } from "@/lib/leaderboard/missionsStorage";
import type { MissionInput } from "@/lib/leaderboard/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureDefaultMission();
  const missions = await getMissions();
  const submissions = await getMissionSubmissions();
  return NextResponse.json({ missions, submissions, options: missionOptions });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json() as MissionInput;
    const mission = await createMission(body);
    return NextResponse.json({ success: true, mission });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create mission.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
