import { NextResponse } from "next/server";
import { getMemberProfile } from "@/lib/leaderboard/storage";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = await getMemberProfile(id);
    if (!profile) return NextResponse.json({ error: "Member not found" }, { status: 404 });
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Member profile load failed", error);
    return NextResponse.json({ error: "Something went wrong while loading this member." }, { status: 500 });
  }
}
