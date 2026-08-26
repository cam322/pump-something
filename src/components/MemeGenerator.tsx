"use client";

import { useState, useEffect } from "react";
import type { Mission } from "@/lib/leaderboard/types";

interface MemeGeneratorProps {
  onClose: () => void;
  onMemeGenerated?: (imageUrl: string, topic: string) => void;
}

type MemeCategory = "breaking" | "crypto" | "gaming" | "weirdness" | "community" | "dumb";

interface GeneratedMeme {
  imageUrl: string;
  prompt: string;
  topic: string;
}

const categories: { id: MemeCategory; name: string; icon: string }[] = [
  { id: "breaking", name: "Breaking Something", icon: "🚨" },
  { id: "crypto", name: "Crypto Chaos", icon: "₿" },
  { id: "gaming", name: "Gaming", icon: "🎮" },
  { id: "weirdness", name: "Internet Weirdness", icon: "🌐" },
  { id: "community", name: "Community", icon: "👥" },
  { id: "dumb", name: "Make It Dumb", icon: "🤡" },
];

const loadingMessages = [
  "Doing something...",
  "Meming something...",
  "Something is happening...",
  "Turning nothing into something...",
  "Cooking up a meme...",
];

export function MemeGenerator({ onClose, onMemeGenerated }: MemeGeneratorProps) {
  const [step, setStep] = useState<"input" | "generating" | "result">("input");
  const [topic, setTopic] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MemeCategory>("breaking");
  const [generatedMeme, setGeneratedMeme] = useState<GeneratedMeme | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showCommunitySubmit, setShowCommunitySubmit] = useState(false);
  const [activeMemeMissions, setActiveMemeMissions] = useState<Mission[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState("");
  const [communityStatus, setCommunityStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [communityMessage, setCommunityMessage] = useState("");
  const [communityForm, setCommunityForm] = useState({
    displayName: "",
    username: "",
    platform: "X",
    proofUrl: "",
    archiveImageDataUrl: "",
  });
  const [communityArchiveImageName, setCommunityArchiveImageName] = useState("");

  // Loading message rotation
  useEffect(() => {
    if (step !== "generating") return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (step !== "result") return;
    fetch("/api/missions", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { missions?: Mission[] }) => {
        const missions = (data.missions || []).filter((mission) => mission.status === "ACTIVE" && mission.category === "MEME");
        setActiveMemeMissions(missions);
        setSelectedMissionId(missions.length === 1 ? missions[0].id : "");
      })
      .catch(() => setActiveMemeMissions([]));
  }, [step]);

  // Escape key closes modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step === "result") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [step, onClose]);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (step !== "input" && step !== "result") return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!topic.trim() || topic.trim().length < 3) {
      setError("Please enter a topic (at least 3 characters)");
      return;
    }

    if (topic.trim().length > 200) {
      setError("Topic must be less than 200 characters");
      return;
    }

    setError(null);
    setStep("generating");

    try {
      const response = await fetch("/api/generate-meme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
          category: selectedCategory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          setError("That is a lot of something. Give us a second. 😂");
        } else {
          setError(errorData.error || "Something went wrong while doing something.");
        }
        setStep("input");
        return;
      }

      const data = await response.json();

      if (!data.imageUrl) {
        throw new Error("No image URL returned");
      }

      setGeneratedMeme(data);
      onMemeGenerated?.(data.imageUrl, topic.trim());
      setStep("result");
    } catch (err) {
      console.error("Generation error:", err);
      setError("Something went wrong while doing something.");
      setStep("input");
    }
  };

  const downloadMeme = () => {
    if (!generatedMeme) return;

    const link = document.createElement("a");
    link.href = generatedMeme.imageUrl;
    const timestamp =
      new Date().getFullYear() +
      String(new Date().getMonth() + 1).padStart(2, "0") +
      String(new Date().getDate()).padStart(2, "0") +
      "-" + Date.now();
    link.download = `something-meme-${timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareOnX = () => {
    if (!generatedMeme) return;

    const projectConfig = {
      xUrl: "https://x.com/PumpSomething",
      websiteUrl: window.location.origin,
    };

    const text = encodeURIComponent("I just did $SOMETHING 😂");
    const url = encodeURIComponent(
      `${projectConfig.websiteUrl}?meme=${encodeURIComponent(generatedMeme.topic)}`
    );
    const via = "PumpSomething";

    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}&via=${via}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const trySomethingElse = () => {
    setTopic("");
    setSelectedCategory("breaking");
    setError(null);
    setShowCommunitySubmit(false);
    setCommunityStatus("idle");
    setCommunityMessage("");
    setStep("input");
  };

  const submitMemeToCommunity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!generatedMeme) return;

    setCommunityStatus("submitting");
    setCommunityMessage("");

    const selectedMission = activeMemeMissions.find((mission) => mission.id === selectedMissionId);
    const response = await fetch(selectedMission ? `/api/missions/${selectedMission.id}/submit` : "/api/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: communityForm.displayName,
        username: communityForm.username,
        platform: communityForm.platform,
        type: "MEME",
        description: `Generated a $SOMETHING meme about: ${generatedMeme.topic}`,
        proofUrl: communityForm.proofUrl,
        archiveImageDataUrl: communityForm.archiveImageDataUrl,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setCommunityStatus("error");
      setCommunityMessage(result.error || "Something went wrong while submitting something.");
      return;
    }

    setCommunityStatus("success");
    setCommunityMessage(selectedMission ? "YOUR MISSION COMPLETION IS WAITING FOR REVIEW." : "YOUR MEME IS WAITING FOR REVIEW.");
  };

  const handleCommunityArchiveUpload = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setCommunityStatus("error");
      setCommunityMessage("Upload must be an image file.");
      return;
    }
    if (file.size > 700_000) {
      setCommunityStatus("error");
      setCommunityMessage("Archive upload must be under 700 KB for now.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCommunityForm((current) => ({ ...current, archiveImageDataUrl: String(reader.result || "") }));
      setCommunityArchiveImageName(file.name);
      setCommunityStatus("idle");
      setCommunityMessage("");
    };
    reader.readAsDataURL(file);
  };

  if (step === "input") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 pt-24 bg-black/90 backdrop-blur-md sm:items-center sm:p-4 sm:pt-4"
        onClick={() => onClose()}
      >
        <div
          className="relative w-full max-w-md bg-black rounded-2xl border border-green-500/30 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 text-center border-b border-green-500/20 sm:p-6">
            <h2 className="text-xl font-bold text-white mb-2 sm:text-2xl">
              WHAT HAPPENED?
            </h2>
            <p className="text-white/60">
              Tell us what the internet is doing. We&apos;ll do SOMETHING with it.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-white/80 text-sm mb-2" htmlFor="topic">
                What&apos;s happening?
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., GTA 6 leaked again"
                className="w-full px-4 py-3 bg-black/50 border border-green-500/20 rounded-lg text-white text-base focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/20 sm:text-lg"
                maxLength={200}
                autoFocus
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-white/40 text-xs">
                  {topic.length < 3 && "Minimum 3 characters"}
                  {topic.length >= 3 && topic.length < 10 && "Great!"}
                  {topic.length >= 10 && (
                    <span className="text-green-400">Getting warm...</span>
                  )}
                </span>
                <span className="text-white/40 text-xs">
                  {200 - topic.length}/200
                </span>
              </div>
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-white/80 text-sm mb-3">Style</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`min-h-20 p-3 rounded-lg border transition-all ${
                      selectedCategory === cat.id
                        ? "bg-green-500 text-black border-green-500"
                        : "bg-black/30 text-white/70 border-green-500/20 hover:bg-black/50 hover:text-white"
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="text-xs font-medium">{cat.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
              >
                CLOSE
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition-all"
              >
                DO SOMETHING
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === "generating") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="bg-black/50 p-8 rounded-2xl border border-green-500/30 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-500/20 border-t-green-400 rounded-full mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {loadingMessages[loadingMessageIndex]}
          </h3>
          <p className="text-white/60">
            Category: {categories.find((c) => c.id === selectedCategory)?.name}
          </p>
        </div>
      </div>
    );
  }

  if (step === "result" && generatedMeme) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center p-3 pt-20 bg-black/90 backdrop-blur-md overflow-y-auto sm:p-4 sm:pt-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 w-11 h-11 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Result Header */}
        <div className="text-center mb-6 mt-2 sm:mt-8">
          <h2 className="text-2xl font-bold text-white mb-2 sm:text-3xl">
            SOMETHING HAPPENED.
          </h2>
          <p className="text-green-400 text-lg">
            &quot;{generatedMeme.topic}&quot;
          </p>
        </div>

        {/* Meme Image */}
        <div className="w-full max-w-2xl mb-8">
          <div className="relative aspect-square bg-black/30 rounded-xl border border-green-500/20 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedMeme.imageUrl}
              alt={`Meme about ${generatedMeme.topic}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "/memes/placeholder.png";
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full max-w-2xl flex-col sm:flex-row gap-3 mb-8">
          <button
            onClick={downloadMeme}
            className="flex-1 px-6 py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition-all flex items-center justify-center gap-2"
          >
            📥 DOWNLOAD MEME
          </button>
          <button
            onClick={shareOnX}
            className="flex-1 px-6 py-3 bg-black/50 text-white border border-green-500/30 rounded-lg hover:bg-black/70 transition-all flex items-center justify-center gap-2"
          >
            🐦 SHARE ON X
          </button>
        </div>

        <div className="w-full max-w-2xl mb-8 rounded-2xl border border-green-500/20 bg-black/50 p-4">
          {!showCommunitySubmit ? (
            <button
              onClick={() => setShowCommunitySubmit(true)}
              className="w-full px-6 py-3 bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 rounded-lg hover:bg-cyan-400/30 transition-all font-bold"
            >
              {activeMemeMissions.length ? "SUBMIT FOR MISSION" : "SUBMIT TO COMMUNITY"}
            </button>
          ) : (
            <form onSubmit={submitMemeToCommunity} className="space-y-3">
              <div>
                <h3 className="text-green-400 font-black text-lg">{activeMemeMissions.length ? "SUBMIT FOR MISSION" : "SUBMIT TO COMMUNITY"}</h3>
                <p className="text-white/60 text-sm">Post this meme on social media first, then paste the public post link. Admin approval is required before points, streaks, or leaderboard movement count.</p>
              </div>
              {communityStatus === "success" && <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-green-300 font-bold">SOMETHING SUBMITTED. 🟢<br />{communityMessage}</div>}
              {communityStatus === "error" && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-300 font-bold">{communityMessage}</div>}
              <div className="grid gap-3 sm:grid-cols-3">
                <input required value={communityForm.displayName} onChange={(e) => setCommunityForm({ ...communityForm, displayName: e.target.value })} placeholder="Display name" className="rounded-lg border border-white/10 bg-white/10 p-3 text-white" />
                <input required value={communityForm.username} onChange={(e) => setCommunityForm({ ...communityForm, username: e.target.value })} placeholder="Username" className="rounded-lg border border-white/10 bg-white/10 p-3 text-white" />
                <select value={communityForm.platform} onChange={(e) => setCommunityForm({ ...communityForm, platform: e.target.value })} className="rounded-lg border border-white/10 bg-black p-3 text-white">
                  <option>X</option>
                  <option>Telegram</option>
                  <option>Discord</option>
                  <option>Other</option>
                </select>
              </div>
              {activeMemeMissions.length > 0 && (
                <label className="block text-white/80 text-sm font-bold">
                  MISSION
                  <select value={selectedMissionId} onChange={(e) => setSelectedMissionId(e.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black p-3 text-white" required>
                    {activeMemeMissions.length !== 1 && <option value="">Choose a meme mission</option>}
                    {activeMemeMissions.map((mission) => <option key={mission.id} value={mission.id}>{mission.title} (+{mission.points})</option>)}
                  </select>
                </label>
              )}
              <input required value={communityForm.proofUrl} onChange={(e) => setCommunityForm({ ...communityForm, proofUrl: e.target.value })} placeholder="Social post link: https://x.com/yourname/status/..." className="w-full rounded-lg border border-white/10 bg-white/10 p-3 text-white" />
              <p className="text-cyan-200 text-xs font-bold">To qualify, submit a public social media post link to the meme you posted. A raw generated image URL is not enough.</p>
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => handleCommunityArchiveUpload(e.target.files?.[0])} className="w-full rounded-lg border border-white/10 bg-white/10 p-3 text-white file:mr-3 file:rounded-full file:border-0 file:bg-green-500 file:px-4 file:py-2 file:font-bold file:text-black" />
              <p className="text-white/50 text-xs">Optional: upload the meme image for the Something Archives. If approved, it will appear in the Memes tab. Max 700 KB.</p>
              {communityArchiveImageName && <p className="text-green-400 text-xs font-bold">Archive upload ready: {communityArchiveImageName}</p>}
              <p className="text-yellow-300 text-xs font-bold">NEVER SUBMIT YOUR SEED PHRASE OR PRIVATE KEY.</p>
              <button disabled={communityStatus === "submitting" || communityStatus === "success"} className="w-full rounded-lg bg-green-500 px-6 py-3 font-black text-black disabled:opacity-60">
                {communityStatus === "submitting" ? "SUBMITTING..." : "SUBMIT SOMETHING"}
              </button>
            </form>
          )}
        </div>

        {/* Additional Options */}
        <div className="flex w-full max-w-2xl flex-col sm:flex-row gap-3 mb-12">
          <button
            onClick={() => {
              setSelectedCategory(selectedCategory);
              setTopic(generatedMeme.topic);
              setStep("input");
            }}
            className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
          >
            GENERATE ANOTHER
          </button>
          <button
            onClick={trySomethingElse}
            className="flex-1 px-6 py-3 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all"
          >
            TRY SOMETHING ELSE
          </button>
        </div>
      </div>
    );
  }
}

export default MemeGenerator;
