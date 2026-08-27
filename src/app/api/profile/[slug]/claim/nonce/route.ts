import { NextResponse } from "next/server";
import { createProfileClaimChallenge } from "@/lib/leaderboard/profileClaim";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const challenge = await createProfileClaimChallenge(slug);
    return NextResponse.json(challenge);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create profile claim challenge.";
    const status = message.includes("not configured") ? 503 : message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
