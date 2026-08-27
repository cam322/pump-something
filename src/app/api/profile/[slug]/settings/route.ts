import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getMemberProfileBySlug, getProfilePreferences, updateProfilePreferences } from "@/lib/leaderboard/storage";
import { profileClaimCookieName, verifyProfileClaimCookie } from "@/lib/leaderboard/profileClaim";

export const dynamic = "force-dynamic";

async function requireProfileOwner(slug: string) {
  const profile = await getMemberProfileBySlug(slug);
  if (!profile) return { error: "Profile not found.", status: 404 as const };
  const cookieStore = await cookies();
  const session = verifyProfileClaimCookie(cookieStore.get(profileClaimCookieName())?.value);
  if (!session || session.memberId !== profile.member.id || session.walletAddress !== profile.member.walletAddress) {
    return { error: "Connect and sign with the wallet on this profile first.", status: 401 as const };
  }
  return { profile };
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const owner = await requireProfileOwner(slug);
  if ("error" in owner) return NextResponse.json({ error: owner.error }, { status: owner.status });
  return NextResponse.json({ preferences: await getProfilePreferences(owner.profile.member.id) });
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const owner = await requireProfileOwner(slug);
    if ("error" in owner) return NextResponse.json({ error: owner.error }, { status: owner.status });
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const preferences = await updateProfilePreferences(owner.profile.member.id, body);
    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update profile settings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
