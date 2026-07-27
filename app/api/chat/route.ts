import Anthropic from "@anthropic-ai/sdk"
import { buildSystemPrompt } from "@/lib/chat-system-prompt"

// The installed @anthropic-ai/sdk pulls Node built-ins (node:fs / node:path for
// credential-file resolution) that the edge runtime can't bundle, so we run on
// the Node runtime. Streaming still works, and the Firebase frameworks backend
// (Cloud Functions) is Node anyway. Keep dynamic so it never gets prerendered.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

// Built once at module load so the (large, stable) prompt is a byte-identical
// prefix on every request — this is what makes the ephemeral cache_control
// below actually hit and gives near-instant repeat starts.
const SYSTEM = buildSystemPrompt()

const MODEL = "claude-haiku-4-5-20251001" // fast; low time-to-first-token

type Role = "user" | "assistant"
interface InMessage {
  role: unknown
  content: unknown
}

/**
 * Streaming chat endpoint. Validates and clamps input, then streams Anthropic
 * events straight back to the browser via the SDK's toReadableStream(). If no
 * ANTHROPIC_API_KEY is configured (e.g. before deploy), it returns a friendly
 * JSON error the UI can render as a "warming up" state — it never throws, so
 * the build and the route stay healthy with or without a key.
 */
export async function POST(req: Request): Promise<Response> {
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

  if (!process.env.ANTHROPIC_API_KEY) {
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
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 800,
      system: [
        {
          type: "text",
          text: SYSTEM,
          // Prompt caching: the stable system prefix is cached, so repeat
          // requests skip re-processing it and start faster / cheaper.
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    })

    return new Response(stream.toReadableStream(), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
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
