import { Navigation } from "@/components/Navigation";
import { AdminContributionsClient } from "@/components/leaderboard/AdminContributionsClient";

export const metadata = {
  title: "Admin Contributions - Pump Something",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminContributionsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="px-4 pb-16 pt-28 md:pt-32">
        <AdminContributionsClient />
      </main>
    </div>
  );
}
