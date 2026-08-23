"use client";

import { useState } from "react";
import Image from "next/image";
import { memeGallery, MemeData, memeCategories } from "@/data/memes";

export function MemeGallery() {
  const [selectedMeme, setSelectedMeme] = useState<MemeData | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredMemes = activeCategory === "all"
    ? memeGallery
    : memeGallery.filter(meme => meme.category === activeCategory);

  return (
    <section id="memes-section" className="py-20 px-4">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-green-400">THE SOMETHING</span>{" "}
            <span className="text-white">ARCHIVES</span>
          </h2>
          <p className="text-white/60 text-xl max-w-2xl mx-auto">
            Something happened. We memed it.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-6 py-2 rounded-full transition-all duration-200 ${
              activeCategory === "all"
                ? "bg-green-500 text-black font-bold animate-pulse"
                : "bg-black/50 text-white/60 hover:bg-black/70 hover:text-white"
            }`}
          >
            ALL MEMES
          </button>
          {memeCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-full transition-all duration-200 flex items-center gap-2 ${
                activeCategory === category.id
                  ? "bg-green-500 text-black font-bold animate-pulse"
                  : "bg-black/50 text-white/60 hover:bg-black/70 hover:text-white"
              }`}
            >
              <span className="text-xl">{category.Icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMemes.map((meme) => (
            <div
              key={meme.id}
              onClick={() => setSelectedMeme(meme)}
              className="cursor-pointer group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-green-500/50 transition-all duration-300"
            >
              <div className="aspect-square relative">
                {meme.image ? (
                  <Image
                    src={meme.image}
                    alt={meme.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-purple-500/20 flex items-center justify-center">
                    <span className="text-4xl">{memeCategories.find(c => c.id === meme.category)?.Icon}</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-black/50">
                <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">
                  {meme.title}
                </h3>
                {meme.caption && (
                  <p className="text-white/60 text-sm mt-1">{meme.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedMeme && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedMeme(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] w-full bg-black rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video">
                <Image
                  src={selectedMeme.image || "/memes/placeholder.png"}
                  alt={selectedMeme.title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedMeme.title}
                </h3>
                {selectedMeme.caption && (
                  <p className="text-white/70 mb-4">{selectedMeme.caption}</p>
                )}
                <button
                  onClick={() => setSelectedMeme(null)}
                  className="px-4 py-2 bg-green-500 text-black rounded-full font-bold hover:bg-green-400 transition-colors"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}