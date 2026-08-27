import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { AdminProfileClaimsClient } from "@/components/leaderboard/AdminProfileClaimsClient";
import { requireAdmin } from "@/lib/leaderboard/adminAuth";
import { getPendingClaimRequests } from "@/lib/leaderboard/accountStorage";

export const dynamic = "force-dynamic";

export default async function AdminProfileClaimsPage() {
  if (!(await requireAdmin())) redirect("/admin/contributions");
  const claims = await getPendingClaimRequests();
  return <div className="min-h-screen bg-black text-white"><Navigation /><AdminProfileClaimsClient initialClaims={claims} /><Footer /></div>;
}
