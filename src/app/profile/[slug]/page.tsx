import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { ProfileClaimPanel } from "@/components/leaderboard/ProfileClaimPanel";
import { PROJECT_CONFIG } from "@/config/project";
import { getMemberProfileBySlug } from "@/lib/leaderboard/storage";
import { buildRecentActivity, getContributionScoreExplanation, maskWallet } from "@/lib/leaderboard/profileStats";

export const dynamic = "force-dynamic";

function usernameFor(profile: Awaited<ReturnType<typeof getMemberProfileBySlug>> extends infer T ? NonNullable<T> : never) {
  const member = profile.member;
  return member.xUsername || member.telegramUsername || member.discordUsername || member.otherUsername || "community";
}

function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "";
}

function statLabel(value: number, label: string) {
  return (
    <div className="rounded-2xl border border-green-500/15 bg-white/[0.04] p-4">
      <p className="text-3xl font-black text-green-400 sm:text-4xl">{value.toLocaleString()}</p>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">{label}</p>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getMemberProfileBySlug(slug);
  if (!profile) return { title: "Community Profile Not Found - Pump Something" };
  return {
    title: `${profile.member.displayName} is doing $SOMETHING`,
    description: `${profile.member.displayName}'s verified $SOMETHING community profile: ${profile.points} points, ${profile.verifiedContributions} contributions, ${profile.missionsCompleted} missions.`,
  };
}

export default async function CommunityProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getMemberProfileBySlug(slug);
  if (!profile) notFound();

  const username = usernameFor(profile);
  const activities = buildRecentActivity(profile);
  const publicUrl = siteUrl();
  const profilePath = `/profile/${profile.profileSlug}`;
  const profileUrl = publicUrl ? `${publicUrl}${profilePath}` : profilePath;
  const cardUrl = `/api/profile/${profile.profileSlug}/card`;
  const xShareText = [
    "I've been DOING $SOMETHING.",
    "",
    `🏆 Rank #${profile.leaderboardRank || "—"}`,
    `⚡ ${profile.points.toLocaleString()} Points`,
    `🔥 ${profile.currentStreak} Day Streak`,
    `✅ ${profile.verifiedContributions} Contributions`,
    "",
    "Are you doing NOTHING or $SOMETHING?",
  ].join("\n");
  const xShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(xShareText)}&url=${encodeURIComponent(profileUrl)}`;
  const maskedWallet = profile.profilePreferences.publicWallet ? maskWallet(profile.member.walletAddress) : undefined;
  const avatarUrl = profile.profilePreferences.avatarUrl;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="px-4 pb-16 pt-28 md:pt-32">
        <div className="container mx-auto max-w-6xl">
          <section className="relative overflow-hidden rounded-[2rem] border border-green-400/30 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.28),transparent_35%),linear-gradient(135deg,rgba(0,0,0,0.95),rgba(8,20,12,0.92))] p-5 shadow-[0_0_45px_rgba(34,197,94,0.16)] sm:p-8">
            <div className="absolute right-4 top-4 hidden text-8xl font-black text-green-400/10 sm:block">$SOMETHING</div>
            <div className="relative grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <Link href="/leaderboard" className="rounded-full border border-green-500/30 bg-black/60 px-4 py-2 text-sm font-black text-green-300 hover:bg-green-500/10">← LEADERBOARD</Link>
                  <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-white/70">PUBLIC COMMUNITY PROFILE</span>
                </div>
                <div className="mb-6 flex items-center gap-4">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="h-20 w-20 shrink-0 rounded-3xl border border-green-400/40 object-cover shadow-[0_0_30px_rgba(34,197,94,0.35)]" />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-green-300 to-cyan-300 text-4xl font-black text-black shadow-[0_0_30px_rgba(34,197,94,0.35)]">
                      {profile.member.displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-green-300">@{username}</p>
                    <h1 className="break-words text-4xl font-black leading-none text-white sm:text-6xl">{profile.member.displayName.toUpperCase()}</h1>
                  </div>
                </div>
                <div className="mb-5 flex flex-wrap gap-3">
                  <span className="rounded-full bg-green-400 px-4 py-2 text-sm font-black text-black">LEVEL {profile.memberLevel.level} — {profile.memberLevel.title}</span>
                  <span className="rounded-full border border-green-400/30 bg-green-400/10 px-4 py-2 text-sm font-black text-green-200">{profile.rankTitle}</span>
                  {profile.leaderboardRank && <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-black text-yellow-200">RANK #{profile.leaderboardRank}</span>}
                </div>
                <p className="max-w-3xl text-lg text-white/70">{profile.profilePreferences.bio || profile.memberLevel.description}</p>
              </div>
              <div className="rounded-3xl border border-green-400/30 bg-black/70 p-5 text-center">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/50">Contribution Score</p>
                <p className="text-6xl font-black text-green-400">{profile.contributionScore.toLocaleString()}</p>
                <details className="mt-3 text-left">
                  <summary className="cursor-pointer text-center text-sm font-black text-cyan-200 underline underline-offset-4">How is this calculated?</summary>
                  <p className="mt-3 text-sm text-white/60">{getContributionScoreExplanation()}</p>
                </details>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {statLabel(profile.points, "Points")}
            {statLabel(profile.currentStreak, "Current streak")}
            {statLabel(profile.longestStreak, "Longest streak")}
            {statLabel(profile.verifiedContributions, "Verified contributions")}
            {statLabel(profile.missionsCompleted, "Missions completed")}
            {statLabel(profile.achievements.unlocked.length, "Achievements unlocked")}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Joined</p>
              <p className="text-2xl font-black text-white">{new Date(profile.member.createdAt).toLocaleDateString()}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
                {profile.member.xUsername && <Link href={`https://x.com/${profile.member.xUsername}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-cyan-400/30 px-3 py-1 text-cyan-200">X @{profile.member.xUsername}</Link>}
                {profile.member.telegramUsername && <span className="rounded-full border border-green-400/30 px-3 py-1 text-green-200">Telegram @{profile.member.telegramUsername}</span>}
                {maskedWallet && <span className="rounded-full border border-purple-400/30 px-3 py-1 text-purple-200">Wallet {maskedWallet}</span>}
              </div>
            </div>
          </section>

          {profile.verifiedContributions === 0 && (
            <section className="mt-6 rounded-3xl border border-green-500/20 bg-black/70 p-8 text-center">
              <p className="text-4xl font-black text-green-400">0 POINTS. 0 CONTRIBUTIONS.</p>
              <p className="mt-2 text-2xl font-black text-white">Everybody starts with NOTHING.</p>
              <p className="mt-2 text-white/60">Go do $SOMETHING.</p>
              <Link href="/missions" className="mt-5 inline-flex rounded-full bg-green-500 px-7 py-4 font-black text-black hover:bg-green-400">VIEW MISSIONS</Link>
            </section>
          )}

          <ProfileClaimPanel slug={profile.profileSlug} walletAddress={profile.member.walletAddress} initialPreferences={profile.profilePreferences} />

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-green-500/20 bg-black/70 p-5 sm:p-6">
              <h2 className="mb-4 text-3xl font-black text-green-400">ACHIEVEMENTS</h2>
              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                {profile.achievements.unlocked.length ? profile.achievements.unlocked.map((achievement) => (
                  <div key={achievement.id} className="rounded-2xl border border-green-400/30 bg-green-400/10 p-4">
                    <p className="font-black text-green-300">✅ {achievement.title}</p>
                    <p className="text-sm text-white/60">{achievement.description}</p>
                  </div>
                )) : <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60 sm:col-span-2">No unlocked achievements yet.</p>}
              </div>
              <h3 className="mb-3 text-xl font-black text-white/70">LOCKED</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.achievements.locked.map((achievement) => (
                  <div key={achievement.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 opacity-70">
                    <p className="font-black text-white/60">🔒 {achievement.title}</p>
                    <p className="text-sm text-white/40">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-5 sm:p-6">
              <h2 className="mb-4 text-3xl font-black text-cyan-300">RECENT VERIFIED ACTIVITY</h2>
              {activities.length ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="rounded-2xl border border-white/10 bg-black/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-white">{activity.label}</p>
                          {activity.detail && <p className="mt-1 text-sm text-white/60">{activity.detail}</p>}
                        </div>
                        {typeof activity.points === "number" && <span className="shrink-0 rounded-full bg-green-400 px-3 py-1 text-xs font-black text-black">+{activity.points}</span>}
                      </div>
                      <p className="mt-2 text-xs text-white/40">{new Date(activity.date).toLocaleString()}</p>
                      {activity.proofUrl && <Link href={activity.proofUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-black text-cyan-200 underline underline-offset-4">View proof</Link>}
                    </div>
                  ))}
                </div>
              ) : <p className="rounded-2xl border border-white/10 bg-black/40 p-5 text-white/60">No verified activity yet. Approved contributions will appear here automatically.</p>}
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-green-400/30 bg-gradient-to-br from-green-400/10 to-black p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-3xl font-black text-green-400">SHARE MY $SOMETHING CARD</h2>
                <p className="mt-2 max-w-2xl text-white/60">Generate a branded share image using only verified server-side profile data. No private information is included.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={cardUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-500 px-6 py-4 text-center font-black text-black hover:bg-green-400">OPEN / DOWNLOAD CARD</Link>
                <Link href={xShareUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-cyan-400/40 px-6 py-4 text-center font-black text-cyan-200 hover:bg-cyan-400/10">SHARE ON X</Link>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-purple-400/20 bg-purple-400/5 p-5 text-sm text-white/60 sm:p-6">
            Contribution Score measures verified participation in the {PROJECT_CONFIG.ticker} community and may be considered for future community rewards. It does not guarantee an airdrop, tokens, financial rewards, or future value.
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
