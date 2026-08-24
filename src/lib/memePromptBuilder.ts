/**
 * Meme Prompt Builder for $SOMETHING Meme Generator
 * Combines user input with branded $SOMETHING identity
 */

export type MemeCategory = "breaking" | "crypto" | "gaming" | "weirdness" | "community" | "dumb";

/**
 * Build a branded meme prompt for MemeLord API
 */
export function buildMemePrompt(topic: string, category: MemeCategory): string {
  const cleanTopic = topic.trim();

  const templates: Record<MemeCategory, string> = {
    breaking: `BREAKING NEWS style meme: "$SOMETHING" meming "${cleanTopic}".
Use newspaper headline style, dramatic red breaking banner.
Include $SOMETHING coin mascot.
Colors: black, white, neon green, Solana purple.
Style: Comic book with thick borders, easy to read while scrolling.`,

    crypto: `Crypto chaos meme: "$SOMETHING" token reacting to "${cleanTopic}".
Create a humorous crypto meme - NOT price prediction, NOT guaranteed returns.
Use meme formats: "When you see it", reaction faces, stick figures.
No fake statistics, no "10x" claims, no volume numbers.
Include $SOMETHING mascot characters.
Colors: black, white, neon green, Solana purple/cyan.
Tone: funny, absurd, internet-native.`,

    gaming: `Gaming meme: "$SOMETHING" gaming reaction to "${cleanTopic}".
Turn this into a gaming-inspired meme.
Use gaming meme formats: victory screen, confused gamer, reaction faces.
Do NOT imply official affiliation with game publishers.
Include $SOMETHING mascot as gamer character.
Colors: black, white, neon green, Solana purple.
Style: pixel art elements, comic/cartoon.`,

    weirdness: `Internet weirdness meme: "$SOMETHING" captures "${cleanTopic}".
Create a highly shareable meme about this viral/abstruse topic.
Use meme formats: "That could be us...", "When you...", "Me vs ${cleanTopic}".
Include $SOMETHING mascot interacting with the absurd trend.
Colors: black, white, neon green, Solana purple.
Style: easy to understand, meme-first.`,

    community: `Community meme: "$SOMETHING" community building around "${cleanTopic}".
Meme about creating, building, sharing, making SOMETHING out of nothing.
Format: group activity, collaboration meme, "We did SOMETHING".
Include multiple $SOMETHING characters/mascots.
Colors: black, white, neon green, Solana purple.
Tone: community, collaborative, fun.`,

    dumb: `Make it dumb meme: "$SOMETHING" doing SOMETHING about "${cleanTopic}".
Keep it deliberately stupid and simple.
Punchline should include the word "something".
Classic meme format: image + short text, easily understood instantly.
Example: "${cleanTopic} = SOMETHING"
Include $SOMETHING mascot.
Colors: black background, white text, neon green highlights.`,
  };

  return templates[category];
}

/**
 * Filter invalid or harmful content
 */
export function containsInvalidContent(topic: string): boolean {
  const lower = topic.toLowerCase();
  const blocked = [
    "kill",
    "murder",
    "suicide",
    "hate",
    "racist",
    "sexy",
    "nsfw",
    "explicit",
    "illegal",
    "child",
    "attack",
    "terror",
  ];

  return blocked.some((word) => lower.includes(word));
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+/gi, ""); // Remove event handlers
}