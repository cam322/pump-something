import { NextResponse } from "next/server";
import { checkRateLimit, getRequestIp } from "@/lib/leaderboard/rateLimit";
import { submitMissionCompletion } from "@/lib/leaderboard/missionsStorage";
import { applyLinkedProfileToSubmission } from "@/lib/leaderboard/submissionIdentity";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = getRequestIp(request);
  const limit = checkRateLimit(`mission-submit:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "That's a lot of something. Give us a second. 😂" }, { status: 429 });
  }

  try {
    const { id } = await params;
    const body = await applyLinkedProfileToSubmission(await request.json() as Record<string, unknown>);
    const result = await submitMissionCompletion(id, body);
    return NextResponse.json({ success: true, contributionId: result.contribution.id, status: result.contribution.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong while submitting the mission.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
