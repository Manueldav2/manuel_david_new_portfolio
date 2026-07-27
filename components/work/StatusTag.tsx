import { cn } from "@/lib/utils"
import type { Status } from "@/lib/content"

/**
 * Small uppercase mono status pill, colored by status against the espresso
 * palette. Reused across the work timeline and (later) the projects grid, so it
 * accepts the full Status union and falls back to a muted treatment for any
 * status without a dedicated tone.
 *
 * Work tones:
 *   current  — tan accent, the "live" role you are in now.
 *   earning  — soft warm gold, a thing that still pays without daily work.
 *   prior / everything else — muted, past tense.
 *
 * Project tones (share the espresso palette so both surfaces feel like one
 * system; only `current` is intentionally reused across work + projects):
 *   shipped      — cream/neutral, done and out in the world.
 *   open-source  — tan, the same accent as `current` but without the pulse dot.
 *   exploration  — warm muted clay, a live experiment that is not shipped.
 *   archived     — faded, past tense and shelved.
 *
 * Server-safe (no client hooks); label defaults to the status text.
 */

const TONES: Record<string, string> = {
  // work
  current: "border-primary/40 bg-primary/15 text-primary",
  earning:
    "border-[hsl(38_70%_62%)]/35 bg-[hsl(38_70%_62%)]/[0.12] text-[hsl(38_74%_70%)]",
  prior: "border-border bg-foreground/[0.03] text-muted-foreground",
  // projects
  shipped: "border-foreground/20 bg-foreground/[0.06] text-foreground/90",
  "open-source": "border-primary/35 bg-primary/10 text-primary",
  exploration:
    "border-[hsl(18_45%_58%)]/30 bg-[hsl(18_45%_58%)]/[0.09] text-[hsl(20_50%_72%)]",
  archived: "border-border bg-foreground/[0.02] text-muted-foreground/70",
}

const LABELS: Partial<Record<Status, string>> = {
  current: "current",
  earning: "earning",
  prior: "prior",
  shipped: "shipped",
  "open-source": "open source",
  exploration: "exploration",
  archived: "archived",
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
