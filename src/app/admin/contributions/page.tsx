import { Navigation } from "@/components/Navigation";
import { AdminContributionsClient } from "@/components/leaderboard/AdminContributionsClient";
import Link from "next/link";

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
        <div className="container mx-auto mb-6 flex max-w-6xl flex-wrap gap-3">
          <Link href="/admin/profile-claims" className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-200 hover:bg-cyan-400/20">PROFILE CLAIMS</Link>
          <Link href="/admin/missions" className="rounded-full border border-green-400/30 bg-green-400/10 px-4 py-2 text-sm font-black text-green-200 hover:bg-green-400/20">MISSIONS</Link>
        </div>
        <AdminContributionsClient />
      </main>
    </div>
  );
}
