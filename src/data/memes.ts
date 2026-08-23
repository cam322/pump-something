export const memeCategories = [
  { id: "internet", name: "Internet", Icon: "🌐" },
  { id: "gaming", name: "Gaming", Icon: "🎮" },
  { id: "crypto", name: "Crypto", Icon: "₿" },
  { id: "breaking", name: "Breaking", Icon: "🚨" },
  { id: "community", name: "Community", Icon: "👥" },
] as const;

export type MemeCategory = typeof memeCategories[number]["id"];

export interface MemeData {
  id: string;
  title: string;
  image: string;
  category: MemeCategory;
  caption?: string;
  date?: string;
}

// Sample meme data - replace with actual images in public/memes/
export const memeGallery: MemeData[] = [
  {
    id: "1",
    title: "When the Game Leaks",
    image: "/memes/placeholder-1.png",
    category: "gaming",
    caption: "Something is always happening in gaming",
    date: "2024-08-20"
  },
  {
    id: "2",
    title: "Crypto Goes Wild",
    image: "/memes/placeholder-2.png",
    category: "crypto",
    caption: "The internet never loses its mind",
    date: "2024-08-18"
  },
  {
    id: "3",
    title: "Viral Video Moment",
    image: "/memes/placeholder-3.png",
    category: "internet",
    caption: "Something always goes viral",
    date: "2024-08-15"
  },
  {
    id: "4",
    title: "Community Submission",
    image: "/memes/placeholder-4.png",
    category: "community",
    caption: "Made by the community",
    date: "2024-08-10"
  },
  {
    id: "5",
    title: "Breaking News",
    image: "/memes/placeholder-5.png",
    category: "breaking",
    caption: "Something is always breaking",
    date: "2024-08-05"
  },
  {
    id: "6",
    title: "Meme Remix",
    image: "/memes/placeholder-6.png",
    category: "internet",
    caption: "Community remixes are the best",
    date: "2024-08-01"
  }
];

// Helper to filter memes by category
export function getMemesByCategory(category: MemeCategory): MemeData[] {
  return memeGallery.filter(meme => meme.category === category);
}

// Helper to get unique categories
export function getUniqueCategories(): MemeCategory[] {
  return Array.from(new Set(memeGallery.map(m => m.category)));
}