import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/leaderboard/adminAuth";
import { updateMission } from "@/lib/leaderboard/missionsStorage";
import type { MissionInput } from "@/lib/leaderboard/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json() as Partial<MissionInput>;
    const mission = await updateMission(id, body);
    return NextResponse.json({ success: true, mission });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update mission.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
