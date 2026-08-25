import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getLeaderboard(50);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Leaderboard load failed", error);
    return NextResponse.json(
      { error: "Something went wrong while loading the leaderboard." },
      { status: 500 }
    );
  }
}
