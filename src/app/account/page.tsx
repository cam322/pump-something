import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { AccountClient } from "@/components/leaderboard/AccountClient";

export const metadata = {
  title: "Account - Pump Something",
  description: "Connect wallet, claim your $SOMETHING profile, and manage verified profile settings.",
};

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="px-4 pb-16 pt-28 md:pt-32">
        <div className="container mx-auto max-w-6xl">
          <AccountClient />
        </div>
      </main>
      <Footer />
    </div>
  );
}
