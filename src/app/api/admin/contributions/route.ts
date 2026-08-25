import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/leaderboard/adminAuth";
import { getPendingSubmissions } from "@/lib/leaderboard/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pending = await getPendingSubmissions();
    return NextResponse.json({ pending });
  } catch (error) {
    console.error("Pending contributions load failed", error);
    return NextResponse.json({ error: "Could not load pending submissions." }, { status: 500 });
  }
}
