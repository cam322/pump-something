import { Navigation } from "@/components/Navigation";
import { AdminMissionsClient } from "@/components/leaderboard/AdminMissionsClient";

export const metadata = {
  title: "Admin Missions - Pump Something",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminMissionsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="px-4 pb-16 pt-28 md:pt-32">
        <AdminMissionsClient />
      </main>
    </div>
  );
}
