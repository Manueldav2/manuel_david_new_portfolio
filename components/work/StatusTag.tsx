import { cn } from "@/lib/utils"
import type { Status } from "@/lib/content"

/**
 * Small uppercase mono status pill, colored by status against the espresso
 * palette. Reused across the work timeline and (later) the projects grid, so it
 * accepts the full Status union and falls back to a muted treatment for any
 * status without a dedicated tone.
 *
 * Tones:
 *   current  — tan accent, the "live" role you are in now.
 *   earning  — warm emerald, a thing that still pays without daily work.
 *   prior / everything else — muted, past tense.
 *
 * Server-safe (no client hooks); label defaults to the status text.
 */

const TONES: Record<string, string> = {
  current: "border-primary/40 bg-primary/15 text-primary",
  earning: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  prior: "border-border bg-foreground/[0.03] text-muted-foreground",
}

const LABELS: Partial<Record<Status, string>> = {
  current: "current",
  earning: "earning",
  prior: "prior",
}

export function StatusTag({
  status,
  label,
  className,
}: {
  status: Status
  label?: string
  className?: string
}) {
  const tone = TONES[status] ?? TONES.prior
  const text = label ?? LABELS[status] ?? status

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "font-mono text-[10px] uppercase leading-none tracking-[0.18em]",
        tone,
        className
      )}
    >
      {status === "current" && (
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-current"
        />
      )}
      {text}
    </span>
  )
}
