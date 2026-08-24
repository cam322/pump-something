"use server";

import { NextRequest, NextResponse } from "next/server";

// Rate limiting storage (in-memory for simplicity)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface MemeRequest {
  topic: string;
  category: string;
}

interface MemeResponse {
  imageUrl: string;
  prompt: string;
  topic: string;
  templateName?: string;
  expiresIn?: number;
}

interface MemeLordResult {
  success?: boolean;
  url?: string;
  expires_in?: number;
  template_name?: string;
}

interface MemeLordResponse {
  success?: boolean;
  prompt?: string;
  total_generated?: number;
  results?: MemeLordResult[];
}

// Validate input
function validateInput(data: MemeRequest): { valid: boolean; error?: string } {
  if (!data.topic || typeof data.topic !== "string") {
    return { valid: false, error: "Topic is required" };
  }

  const trimmed = data.topic.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: "Topic must be at least 3 characters" };
  }

  if (trimmed.length > 200) {
    return { valid: false, error: "Topic must be less than 200 characters" };
  }

  // Content safety check - reject obvious harmful content
  const lowerTopic = trimmed.toLowerCase();
  const blockedPatterns = [
    /kill/i,
    /murder/i,
    /suicide/i,
    /self.harm/i,
    /child/i,
    /illegal/i,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(lowerTopic)) {
      return { valid: false, error: "Content not allowed" };
    }
  }

  // Validate category
  const validCategories = [
    "breaking",
    "crypto",
    "gaming",
    "weirdness",
    "community",
    "dumb",
  ];

  if (!data.category || !validCategories.includes(data.category)) {
    return { valid: false, error: "Invalid category" };
  }

  return { valid: true };
}

// Check rate limiting
function checkRateLimit(clientIp: string): { allowed: boolean; retryAfter?: number } {
  const rateLimit = process.env.MEMELORD_RATE_LIMIT_REQUESTS || "10";
  const windowMs = parseInt(process.env.MEMELORD_RATE_LIMIT_WINDOW_MS || "60000", 10);

  const now = Date.now();
  const record = rateLimitStore.get(clientIp);

  if (!record) {
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (now > record.resetTime) {
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  const maxRequests = parseInt(rateLimit, 10);
  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

// Build the MemeLord prompt based on category
function buildPrompt(topic: string, category: string): string {
  const cleanTopic = topic.trim();

  const categoryPrompts: Record<string, string> = {
    breaking: `BREAKING NEWS style meme: "$SOMETHING" meming "${cleanTopic}". Use newspaper headline style, dramatic red breaking banner. Include $SOMETHING coin mascot. Colors: black, white, neon green, Solana purple. Comic book style.`,
    crypto: `Crypto chaos meme: "$SOMETHING" token reacts to "${cleanTopic}". Stick figure characters, chaotic energy, no price predictions. Colors: black, white, neon green, Solana purple/cyan. Funny, absurd, internet-native.`,
    gaming: `Gaming meme: "$SOMETHING" gaming reaction to "${cleanTopic}". Gaming-inspired environment, pixel art style elements, no official game logos. Colors: black, white, neon green, Solana purple.`,
    weirdness: `Internet weirdness meme: "$SOMETHING" captures "${cleanTopic}". Viral/viral-style meme format, stick figures, exaggerated internet characters. Colors: black, white, neon green, Solana purple.`,
    community: `Community meme: "$SOMETHING" community building around "${cleanTopic}". Collaborative vibe, multiple characters, group activity. Colors: black, white, neon green, Solana purple.`,
    dumb: `Make it dumb meme: "$SOMETHING" doing SOMETHING about "${cleanTopic}". Deliberately stupid simple meme, punchline with "something". Classic meme format. Colors: black, white, neon green, Solana purple.`,
  };

  return categoryPrompts[category] || categoryPrompts["dumb"];
}

// Generate meme via external API
async function callMemeLordApi(prompt: string, category: string): Promise<MemeLordResult> {
  const apiKey = process.env.MEMELORD_API_KEY;
  const apiUrl = process.env.MEMELORD_API_URL;

  if (!apiKey || !apiUrl) {
    throw new Error("MemeLord API configuration missing");
  }

  const memeLordCategory = category === "crypto" || category === "gaming" || category === "breaking"
    ? "trending"
    : "classic";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      count: 1,
      category: memeLordCategory,
      include_nsfw: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`MemeLord API error: ${response.status}`);
  }

  const data = await response.json() as MemeLordResponse;
  const result = data.results?.find((item) => item.success && item.url) || data.results?.find((item) => item.url);

  if (!data.success || !result?.url) {
    throw new Error("MemeLord API malformed response");
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     request.headers.get("x-real-ip") ||
                     "unknown";

    // Check rate limit
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: rateCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const data: MemeRequest = {
      topic: body.topic,
      category: body.category,
    };

    // Validate input
    const validation = validateInput(data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Build prompt
    const prompt = buildPrompt(data.topic, data.category);

    // Call MemeLord API
    const memeResult = await callMemeLordApi(prompt, data.category);

    const response: MemeResponse = {
      imageUrl: memeResult.url as string,
      prompt,
      topic: data.topic,
      templateName: memeResult.template_name,
      expiresIn: memeResult.expires_in,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Meme generation error:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("configuration missing")) {
        return NextResponse.json(
          { error: "MemeLord is not configured yet. Add the server environment variables and try again." },
          { status: 503 }
        );
      }

      if (error.message.includes("MemeLord API")) {
        return NextResponse.json(
          { error: "MemeLord API is not responding. Please try again later." },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { error: "Something went wrong while doing something. Please try again." },
      { status: 500 }
    );
  }
}

// Handle GET for health check
export async function GET() {
  return NextResponse.json({ status: "ok", service: "memelord-api" });
}