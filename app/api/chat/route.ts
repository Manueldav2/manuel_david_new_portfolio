import { GoogleGenAI } from "@google/genai"
import { buildSystemPrompt } from "@/lib/chat-system-prompt"

// Run on the Node runtime (the Firebase frameworks backend is Cloud Functions,
// which is Node anyway). Keep dynamic so it never gets prerendered.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

// Built once at module load so the (large, stable) prompt is byte-identical on
// every request.
const SYSTEM = buildSystemPrompt()

const MODEL = "gemini-2.5-flash" // fast; free-tier friendly

// Per-IP token bucket. This is a public, unauthenticated endpoint proxying an
// external API, so we cap request volume per IP. In-memory (per warm Cloud
// Function instance) — not perfect across cold starts, but it stops the trivial
// single-source flood, which is the realistic threat for a personal site.
const BUCKET = new Map<string, { tokens: number; ts: number }>()
const RL_LIMIT = 20 // requests
const RL_WINDOW_MS = 60_000 // per minute per IP
const RL_REFILL = RL_LIMIT / RL_WINDOW_MS

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const b = BUCKET.get(ip) ?? { tokens: RL_LIMIT, ts: now }
  b.tokens = Math.min(RL_LIMIT, b.tokens + (now - b.ts) * RL_REFILL)
  b.ts = now
  if (b.tokens < 1) {
    BUCKET.set(ip, b)
    return true
  }
  b.tokens -= 1
  BUCKET.set(ip, b)
  if (BUCKET.size > 5000) BUCKET.clear() // crude unbounded-growth guard
  return false
}

type Role = "user" | "assistant"
interface InMessage {
  role: unknown
  content: unknown
}

/**
 * Streaming chat endpoint. Validates and clamps input, then streams Gemini
 * output straight back to the browser as a plain text/plain body — each chunk
 * is a raw text delta the client appends live. If no GEMINI_API_KEY is
 * configured (e.g. before deploy), it returns a friendly JSON error the UI can
 * render as a "warming up" state — it never throws, so the build and the route
 * stay healthy with or without a key.
 */
export async function POST(req: Request): Promise<Response> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  if (rateLimited(ip)) {
    return Response.json(
      { error: "Too many requests. Give it a moment." },
      { status: 429, headers: { "Retry-After": "30" } }
    )
  }

  let body: { messages?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 })
  }

  const raw = body?.messages
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 40) {
    return Response.json({ error: "Bad request." }, { status: 400 })
  }

  // Sanitize: keep only well-formed user/assistant turns, clamp content length,
  // and take the last ~12 turns to bound the request size.
  const messages = (raw as InMessage[])
    .filter(
      (m): m is { role: Role; content: string } =>
        (m?.role === "user" || m?.role === "assistant") &&
        typeof m?.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "Bad request." }, { status: 400 })
  }

  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      {
        error:
          "The chat is warming up. It needs an API key on the server before it can answer. In the meantime, reach Manuel at manuel@configure.dev.",
        code: "no_api_key",
      },
      { status: 503 }
    )
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    // Map validated turns to Gemini contents: assistant -> "model", user -> "user".
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))

    const result = await ai.models.generateContentStream({
      model: MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM,
        maxOutputTokens: 800,
      },
    })

    // Re-emit the Gemini stream as a plain UTF-8 text stream of raw deltas.
    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of result) {
            const text = chunk.text
            if (text) controller.enqueue(encoder.encode(text))
          }
        } catch (err) {
          console.error("chat stream error:", err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    })
  } catch (err) {
    console.error("chat route error:", err)
    return Response.json(
      { error: "The chat hit a snag. Try again in a moment." },
      { status: 500 }
    )
  }
}
