import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MissionsClient } from "@/components/leaderboard/MissionsClient";
import { ensureDefaultMission, getPublicMissions } from "@/lib/leaderboard/missionsStorage";
import { isLeaderboardStorageConfigured } from "@/lib/leaderboard/storage";
import type { Mission } from "@/lib/leaderboard/types";

export const metadata = {
  title: "Do Something Today | $SOMETHING Missions",
  description: "Complete verified community missions, earn points, build streaks, and climb the $SOMETHING leaderboard.",
};

export const dynamic = "force-dynamic";

export default async function MissionsPage() {
  let missions: Mission[] = [];
  let storageConfigured = isLeaderboardStorageConfigured();
  try {
    if (storageConfigured) {
      await ensureDefaultMission();
      missions = await getPublicMissions();
    }
  } catch (error) {
    console.error("Missions page load failed", error);
    storageConfigured = false;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main>
        <MissionsClient missions={missions} storageConfigured={storageConfigured} />
      </main>
      <Footer />
    </div>
  );
}
