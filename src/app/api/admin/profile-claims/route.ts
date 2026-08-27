import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/leaderboard/adminAuth";
import { getPendingClaimRequests } from "@/lib/leaderboard/accountStorage";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const claims = await getPendingClaimRequests();
  return NextResponse.json({ claims });
}
