"use client";

import { useState, useEffect } from "react";

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

  // Loading message rotation
  useEffect(() => {
    if (step !== "generating") return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
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
    setStep("input");
  };

  if (step === "input") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        onClick={() => onClose()}
      >
        <div
          className="relative w-full max-w-md bg-black rounded-2xl border border-green-500/30 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 text-center border-b border-green-500/20">
            <h2 className="text-2xl font-bold text-white mb-2">
              WHAT HAPPENED?
            </h2>
            <p className="text-white/60">
              Tell us what the internet is doing. We&apos;ll do SOMETHING with it.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
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
                className="w-full px-4 py-3 bg-black/50 border border-green-500/20 rounded-lg text-white text-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/20"
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
                    className={`p-3 rounded-lg border transition-all ${
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
            <div className="flex gap-3">
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
      <div className="fixed inset-0 z-50 flex flex-col items-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Result Header */}
        <div className="text-center mb-6 mt-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            SOMETHING HAPPENED.
          </h2>
          <p className="text-green-400 text-lg">
            &quot;{generatedMeme.topic}&quot;
          </p>
        </div>

        {/* Meme Image */}
        <div className="w-full max-w-2xl mb-8">
          <div className="relative aspect-video bg-black/30 rounded-xl border border-green-500/20 overflow-hidden">
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
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
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

        {/* Additional Options */}
        <div className="flex flex-col sm:flex-row gap-3 mb-12">
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