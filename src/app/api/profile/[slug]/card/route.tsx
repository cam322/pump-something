import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { getMemberProfileBySlug } from "@/lib/leaderboard/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getMemberProfileBySlug(slug);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const username = profile.member.xUsername || profile.member.telegramUsername || profile.member.discordUsername || profile.member.otherUsername || "community";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "54px",
          background: "radial-gradient(circle at 15% 10%, rgba(57,255,20,0.32), transparent 30%), linear-gradient(135deg, #020402 0%, #000 56%, #071407 100%)",
          color: "white",
          fontFamily: "Arial Black, Arial, sans-serif",
          border: "10px solid #39ff14",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#39ff14", fontSize: 42, fontWeight: 900, letterSpacing: "-1px" }}>$SOMETHING</div>
            <div style={{ color: "#ffffff", fontSize: 78, fontWeight: 900, lineHeight: 0.95, maxWidth: 760 }}>{username.toUpperCase()}</div>
            <div style={{ color: "#39ff14", fontSize: 40, fontWeight: 900, marginTop: 18 }}>{profile.memberLevel.title}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ color: "#39ff14", fontSize: 34, fontWeight: 900 }}>RANK #{profile.leaderboardRank || "—"}</div>
            <div style={{ color: "#ffffff", fontSize: 24, marginTop: 8 }}>CONTRIBUTION SCORE</div>
            <div style={{ color: "#39ff14", fontSize: 68, fontWeight: 900 }}>{profile.contributionScore.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {[
            [`${profile.points.toLocaleString()}`, "POINTS"],
            [`${profile.currentStreak}`, "DAY STREAK"],
            [`${profile.verifiedContributions}`, "CONTRIBUTIONS"],
            [`${profile.missionsCompleted}`, "MISSIONS"],
          ].map(([value, label]) => (
            <div key={label} style={{ width: 250, border: "3px solid rgba(57,255,20,0.55)", background: "rgba(0,0,0,0.72)", borderRadius: 24, padding: "24px 22px" }}>
              <div style={{ color: "#39ff14", fontSize: 54, fontWeight: 900 }}>{value}</div>
              <div style={{ color: "rgba(255,255,255,0.74)", fontSize: 22, fontWeight: 900 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "white", fontSize: 36, fontWeight: 900 }}>I&apos;M DOING $SOMETHING. ARE YOU?</div>
          <div style={{ color: "#39ff14", fontSize: 30, fontWeight: 900 }}>PUMP SOMETHING</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300",
        "Content-Disposition": `inline; filename="something-${profile.profileSlug}.png"`,
      },
    }
  );
}
