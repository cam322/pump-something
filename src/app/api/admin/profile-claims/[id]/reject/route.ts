import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/leaderboard/adminAuth";
import { rejectProfileClaim } from "@/lib/leaderboard/accountStorage";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({})) as { notes?: string };
    const claim = await rejectProfileClaim(id, "admin", typeof body.notes === "string" ? body.notes.slice(0, 300) : undefined);
    return NextResponse.json({ success: true, claim });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reject claim.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
