import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/leaderboard/adminAuth";
import { approveContribution } from "@/lib/leaderboard/storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({})) as { pointsAwarded?: number; notes?: string };
    const points = Number(body.pointsAwarded);
    const contribution = await approveContribution(id, points, "admin", typeof body.notes === "string" ? body.notes.slice(0, 300) : undefined);
    return NextResponse.json({ success: true, contribution });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not approve contribution.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
