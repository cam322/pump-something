import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { MemeGallery } from "@/components/MemeGallery";
import { getApprovedArchiveMemes } from "@/lib/leaderboard/storage";

export const metadata = {
  title: "Memes - Pump Something ($SOMETHING)",
  description: "Browse the Something Archives - community memes from Pump Something",
};

export const dynamic = "force-dynamic";

export default async function MemesPage() {
  const archiveMemes = await getApprovedArchiveMemes();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Header */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            <span className="text-green-400">THE SOMETHING</span>{" "}
            <span className="text-white">ARCHIVES</span>
          </h1>
          <p className="text-white/60 text-xl">Something happened. We memed it.</p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-gradient-to-r from-black to-purple-900/20 text-center">
        <div className="container mx-auto">
          <p className="text-white/70 mb-4 max-w-2xl mx-auto">
            Want your meme in the Something Archives? Submit it to the leaderboard with a social post link and optional meme upload. Approved contributions are added here automatically.
          </p>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-3 px-6 py-3 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-all"
          >
            SUBMIT SOMETHING
          </Link>
        </div>
      </section>

      {/* Gallery */}
      <MemeGallery archiveMemes={archiveMemes} />

      <Footer />
    </div>
  );
}