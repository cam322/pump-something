"use client";

import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { MemeGenerator } from "@/components/MemeGenerator";

export default function DoSomethingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <MemeGenerator onClose={() => router.push("/")} />
    </div>
  );
}
