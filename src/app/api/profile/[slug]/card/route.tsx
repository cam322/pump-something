import { NextResponse } from "next/server";
import { getMemberProfileBySlug } from "@/lib/leaderboard/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function statBox(x: number, value: string, label: string) {
  return `
    <rect x="${x}" y="390" width="250" height="130" rx="24" fill="rgba(0,0,0,0.72)" stroke="rgba(57,255,20,0.55)" stroke-width="3"/>
    <text x="${x + 22}" y="455" fill="#39ff14" font-size="54" font-weight="900" font-family="Arial Black, Arial, sans-serif">${escapeXml(value)}</text>
    <text x="${x + 22}" y="492" fill="rgba(255,255,255,0.74)" font-size="22" font-weight="900" font-family="Arial Black, Arial, sans-serif">${escapeXml(label)}</text>
  `;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getMemberProfileBySlug(slug);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const username = profile.member.xUsername || profile.member.telegramUsername || profile.member.discordUsername || profile.member.otherUsername || "community";
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <radialGradient id="g" cx="15%" cy="10%" r="45%">
        <stop offset="0%" stop-color="#39ff14" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="#39ff14" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#020402"/>
        <stop offset="56%" stop-color="#000000"/>
        <stop offset="100%" stop-color="#071407"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect width="1200" height="630" fill="url(#g)"/>
    <rect x="5" y="5" width="1190" height="620" fill="none" stroke="#39ff14" stroke-width="10"/>

    <text x="54" y="94" fill="#39ff14" font-size="42" font-weight="900" letter-spacing="-1" font-family="Arial Black, Arial, sans-serif">$SOMETHING</text>
    <text x="54" y="178" fill="#ffffff" font-size="78" font-weight="900" font-family="Arial Black, Arial, sans-serif">${escapeXml(username.toUpperCase()).slice(0, 24)}</text>
    <text x="54" y="235" fill="#39ff14" font-size="40" font-weight="900" font-family="Arial Black, Arial, sans-serif">${escapeXml(profile.memberLevel.title)}</text>

    <text x="1146" y="92" text-anchor="end" fill="#39ff14" font-size="34" font-weight="900" font-family="Arial Black, Arial, sans-serif">RANK #${escapeXml(String(profile.leaderboardRank || "—"))}</text>
    <text x="1146" y="130" text-anchor="end" fill="#ffffff" font-size="24" font-family="Arial Black, Arial, sans-serif">CONTRIBUTION SCORE</text>
    <text x="1146" y="202" text-anchor="end" fill="#39ff14" font-size="68" font-weight="900" font-family="Arial Black, Arial, sans-serif">${escapeXml(profile.contributionScore.toLocaleString())}</text>

    ${statBox(54, profile.points.toLocaleString(), "POINTS")}
    ${statBox(322, String(profile.currentStreak), "DAY STREAK")}
    ${statBox(590, String(profile.verifiedContributions), "CONTRIBUTIONS")}
    ${statBox(858, String(profile.missionsCompleted), "MISSIONS")}

    <text x="54" y="585" fill="#ffffff" font-size="36" font-weight="900" font-family="Arial Black, Arial, sans-serif">I'M DOING $SOMETHING. ARE YOU?</text>
    <text x="1146" y="585" text-anchor="end" fill="#39ff14" font-size="30" font-weight="900" font-family="Arial Black, Arial, sans-serif">PUMP SOMETHING</text>
  </svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
      "Content-Disposition": `inline; filename="something-${profile.profileSlug}.svg"`,
    },
  });
}
