import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LeaderboardClient } from "@/components/leaderboard/LeaderboardClient";
import { getLeaderboard } from "@/lib/leaderboard/storage";

export const metadata = {
  title: "$SOMETHING Leaderboard - Pump Something",
  description: "Who's actually doing something? Track verified $SOMETHING community contributions.",
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const data = await getLeaderboard(50);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main>
        <LeaderboardClient initialData={data} />
      </main>
      <Footer />
    </div>
  );
}
