"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { X, ArrowUp, Sparkles, Rocket, LayoutGrid, Mail, BarChart3 } from "lucide-react"
import { Glass } from "@/components/glass/Glass"
import { Message, type ChatMessage } from "@/components/chat/Message"
import { useChat, DRAWER_WIDTH } from "@/components/chat/ChatProvider"
import { profile } from "@/lib/content"

gsap.registerPlugin(useGSAP)

// Icon-leading suggested prompts (minimal on-brand glyphs, not emoji).
const SUGGESTIONS = [
  { label: "What is Configure?", icon: Sparkles },
  { label: "Tell me about Paradigm", icon: Rocket },
  { label: "Best projects to see", icon: LayoutGrid },
  { label: "How do I reach Manuel?", icon: Mail },
  { label: "Compare projects by year", icon: BarChart3 },
] as const

let idCounter = 0
const nextId = () => `m-${Date.now()}-${idCounter++}`

/**
 * Reads the Anthropic SDK's toReadableStream() output on the client. Each line
 * is a JSON event; we pull text out of content_block_delta events and hand each
 * delta to onDelta so the UI can append it live.
 */
async function readAnthropicStream(
  res: Response,
  onDelta: (text: string) => void
): Promise<void> {
  const reader = res.body?.getReader()
  if (!reader) return
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        const evt = JSON.parse(trimmed)
        if (evt?.type === "content_block_delta" && evt?.delta?.type === "text_delta") {
          onDelta(evt.delta.text as string)
        }
      } catch {
        // Partial/non-JSON line — ignore; the next chunk completes it.
      }
    }
  }
}

/**
 * Right-side chat drawer. Rendered as a fixed <Glass> rail that slides in from
 * the right (the layout shell pushes page content left to make room — see
 * app/layout.tsx). Header with avatar + close, scrollable message list,
 * suggested-prompt chips when empty, and a textarea input (Enter sends,
 * Shift+Enter newlines). Focus moves to the input on open; Escape closes;
 * focus is trapped within the rail. GSAP handles the slide/fade under
 * matchMedia (reduced-motion = instant) and springs messages in.
 */
export function ChatDrawer() {
  const { open, closeChat } = useChat()
  const railRef = useRef<HTMLElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Auto-scroll to the newest content while it streams.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [messages, streaming])

  // Slide-in / slide-out + fade via matchMedia. Reduced motion snaps.
  useGSAP(
    () => {
      const rail = railRef.current
      if (!rail) return
      const mm = gsap.matchMedia()
      mm.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { animate } = ctx.conditions as { animate: boolean }
          if (open) {
            gsap.killTweensOf(rail)
            if (animate) {
              gsap.fromTo(
                rail,
                { xPercent: 100, autoAlpha: 0 },
                { xPercent: 0, autoAlpha: 1, duration: 0.55, ease: "power4.out" }
              )
              // Calm stagger on the welcome content, just behind the slide.
              const welcome = rail.querySelector<HTMLElement>("[data-chat-welcome]")
              if (welcome) {
                gsap.from(welcome.children, {
                  y: 14,
                  autoAlpha: 0,
                  duration: 0.6,
                  stagger: 0.1,
                  delay: 0.18,
                  ease: "power3.out",
                })
              }
            } else {
              gsap.set(rail, { xPercent: 0, autoAlpha: 1 })
            }
          }
        }
      )
      return () => mm.revert()
    },
    { scope: railRef, dependencies: [open] }
  )

  // Focus the input on open; restore nothing special on close (the launcher
  // that opened it keeps DOM focus semantics reasonable).
  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 60)
      return () => window.clearTimeout(t)
    }
  }, [open])

  // Escape closes; basic focus trap keeps Tab within the rail while open.
  useEffect(() => {
    if (!open) return
    const rail = railRef.current
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        closeChat()
        return
      }
      if (e.key === "Tab" && rail) {
        const focusables = rail.querySelectorAll<HTMLElement>(
          'button, [href], textarea, input, [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, closeChat])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || streaming) return

      const userMsg: ChatMessage = { id: nextId(), role: "user", content: trimmed }
      const assistantId = nextId()
      const history = [...messages, userMsg]

      setMessages([...history, { id: assistantId, role: "assistant", content: "" }])
      setInput("")
      setStreaming(true)

      const setAssistant = (updater: (prev: string) => string) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: updater(m.content) } : m))
        )

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        })

        // Graceful no-key / error path: the route returns JSON, not a stream.
        const contentType = res.headers.get("content-type") ?? ""
        if (!res.ok || contentType.includes("application/json")) {
          let msg = "The chat hit a snag. Try again in a moment."
          try {
            const data = (await res.json()) as { error?: string }
            if (data?.error) msg = data.error
          } catch {
            /* keep default */
          }
          setAssistant(() => msg)
          return
        }

        await readAnthropicStream(res, (delta) => setAssistant((prev) => prev + delta))

        setAssistant((prev) =>
          prev.trim().length > 0 ? prev : "Sorry, I didn't catch that. Try asking again."
        )
      } catch {
        setAssistant(
          () =>
            "I couldn't reach the server just now. Try again, or reach Manuel at manuel@configure.dev."
        )
      } finally {
        setStreaming(false)
        inputRef.current?.focus()
      }
    },
    [messages, streaming]
  )

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  // Keep the rail out of the a11y/tab tree entirely when closed.
  if (!open) return null

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="Ask Manuel's AI"
      className="fixed inset-y-0 right-0 z-[60]"
      style={{ width: mounted ? DRAWER_WIDTH : undefined }}
    >
      <Glass
        as="section"
        ref={railRef as React.Ref<HTMLElement>}
        className="flex h-full w-full flex-col rounded-none border-l border-border/70 sm:rounded-l-2xl"
      >
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-primary/40 bg-primary/15">
            <Image
              src="/images/manuel-hero.jpg"
              alt=""
              fill
              sizes="36px"
              className="object-cover object-top"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[13px] lowercase tracking-wide text-foreground">
              ask manuel&rsquo;s ai
            </p>
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {profile.role} · {profile.company}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close chat"
            onClick={closeChat}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            <X size={18} />
          </button>
        </header>

        {/* Message list */}
        <div
          ref={listRef}
          className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
        >
          {messages.length === 0 ? (
            <div data-chat-welcome className="flex flex-col gap-6 px-1 pt-2">
              {/* Greeting-led welcome — big and warm, one word in tan. Top-anchored. */}
              <div>
                <h2 className="font-display text-[2rem] uppercase leading-[0.98] tracking-tight text-foreground">
                  Hey. I&rsquo;m{" "}
                  <span className="text-primary">Manuel&rsquo;s</span> AI.
                </h2>
                <p className="mt-3 max-w-[20rem] font-body text-[14px] leading-relaxed text-muted-foreground">
                  Ask me anything about his work, his projects, or how to reach him.
                </p>
              </div>

              {/* Suggested prompts — icon-leading chips in a wrapped grid. */}
              <div>
                <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  try one of these
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => send(label)}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-foreground/[0.04] px-3 py-2 font-body text-[13px] text-foreground/80 transition-colors hover:border-primary/50 hover:bg-primary/[0.1] hover:text-foreground"
                    >
                      <Icon
                        size={13}
                        className="text-primary/70 transition-colors group-hover:text-primary"
                      />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((m, i) => {
              const isStreamingAssistant =
                streaming && i === messages.length - 1 && m.role === "assistant"
              return (
                <div key={m.id} data-chat-msg>
                  <Message message={m} />
                  {isStreamingAssistant && m.content.length === 0 && (
                    <span className="mt-1 inline-flex items-center gap-1" aria-label="Thinking">
                      <span className="chat-shimmer-dot h-1.5 w-1.5 rounded-full bg-primary/70" />
                      <span className="chat-shimmer-dot h-1.5 w-1.5 rounded-full bg-primary/70 [animation-delay:0.15s]" />
                      <span className="chat-shimmer-dot h-1.5 w-1.5 rounded-full bg-primary/70 [animation-delay:0.3s]" />
                    </span>
                  )}
                </div>
              )
            })
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border/60 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-end gap-2 rounded-2xl border border-border/70 bg-foreground/[0.04] px-3 py-2 transition-colors focus-within:border-primary/50"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={2000}
              placeholder={"Ask Manuel’s AI…"}
              className="max-h-28 min-h-[24px] flex-1 resize-none bg-transparent font-body text-[14px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!input.trim() || streaming}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            >
              <ArrowUp size={17} />
            </button>
          </form>
          <p className="mt-1.5 px-1 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">
            answers grounded in Manuel&rsquo;s real work
          </p>
        </div>
      </Glass>
    </aside>
  )
}
