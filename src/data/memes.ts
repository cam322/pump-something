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
  proofUrl?: string;
  creatorName?: string;
}

// Meme gallery data - all images stored in public/memes/
export const memeGallery: MemeData[] = [
  {
    id: "1",
    title: "Girlfriend Predicts Something",
    image: "/memes/meme-1.png",
    category: "internet",
    caption: "When your girlfriend knows something before you do",
    date: "2024-08-23"
  },
  {
    id: "2",
    title: "Something Composed",
    image: "/memes/meme-2.png",
    category: "crypto",
    caption: "The art of doing something well",
    date: "2024-08-23"
  },
  {
    id: "3",
    title: "Wrong Blockchain",
    image: "/memes/meme-3.png",
    category: "crypto",
    caption: "When you discover the wrong blockchain",
    date: "2024-08-23"
  },
  {
    id: "4",
    title: "Something Crypto Vibes",
    image: "/memes/meme-4.png",
    category: "crypto",
    caption: "The crypto energy we all feel",
    date: "2024-08-23"
  },
  {
    id: "5",
    title: "Girlfriend vs Something Crypto Meme",
    image: "/memes/meme-5.png",
    category: "crypto",
    caption: "The ultimate crypto dilemma",
    date: "2024-08-23"
  },
  {
    id: "6",
    title: "Something Telegram Launch",
    image: "/memes/meme-6.png",
    category: "community",
    caption: "When the Telegram launch drops",
    date: "2024-08-23"
  },
  {
    id: "7",
    title: "Something Meme Collection",
    image: "/memes/meme-7.png",
    category: "gaming",
    caption: "The something meme collection",
    date: "2024-08-23"
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