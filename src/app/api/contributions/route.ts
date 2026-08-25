import { NextResponse } from "next/server";
import { createPendingContribution, isLeaderboardStorageConfigured } from "@/lib/leaderboard/storage";
import { getRequestIp, checkRateLimit } from "@/lib/leaderboard/rateLimit";
import { validateSubmission } from "@/lib/leaderboard/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const limit = checkRateLimit(`contribution:${ip}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "That's a lot of something. Give us a second. 😂", retryAfterSeconds: limit.retryAfterSeconds },
      { status: 429 }
    );
  }

  if (!isLeaderboardStorageConfigured()) {
    return NextResponse.json(
      { error: "Contribution storage is not configured yet." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const validated = validateSubmission(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const contribution = await createPendingContribution(validated.data);
    return NextResponse.json({ success: true, contributionId: contribution.id, status: contribution.status });
  } catch (error) {
    console.error("Contribution submission failed", error);
    return NextResponse.json(
      { error: "Something went wrong while submitting something." },
      { status: 500 }
    );
  }
}
