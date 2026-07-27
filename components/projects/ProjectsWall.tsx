"use client"

import { useRef, useState, useMemo, useCallback } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Flip } from "gsap/Flip"
import { Search, X } from "lucide-react"
import { Glass } from "@/components/glass/Glass"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { projects, type ProjectStatus } from "@/lib/content"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP, Flip)

/**
 * PROJECTS — a filterable liquid-glass wall.
 *
 * Interaction model (matches the reference the owner loves): a search field +
 * a row of filter pills over a responsive grid of glass cards. Changing the
 * filter or the query re-lays-out the grid with a GSAP Flip animation — cards
 * that survive glide to their new slots while dropped cards fade/scale out and
 * new ones fade/scale in. This is the signature moment of the page.
 *
 * Why every card stays mounted: Flip needs the same DOM nodes present before
 * and after the layout change to interpolate between them. So we never unmount
 * cards on filter — we toggle a `data-hidden` flag that flips `display:none`,
 * capture Flip state around it, and let Flip.from handle enter/leave. React
 * keys are the stable project slug, so node identity is preserved.
 *
 * All motion is wrapped in matchMedia; the reduced-motion branch lands final
 * states with zero duration.
 */

type Filter = "all" | ProjectStatus

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "all" },
  { value: "current", label: "current" },
  { value: "shipped", label: "shipped" },
  { value: "open-source", label: "open source" },
  { value: "exploration", label: "exploration" },
  { value: "archived", label: "archived" },
]

function matches(
  project: (typeof projects)[number],
  filter: Filter,
  query: string
) {
  if (filter !== "all" && project.status !== filter) return false
  if (!query) return true
  const q = query.toLowerCase()
  return (
    project.name.toLowerCase().includes(q) ||
    project.blurb.toLowerCase().includes(q) ||
    project.status.toLowerCase().includes(q)
  )
}

export function ProjectsWall() {
  const rootRef = useRef<HTMLElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")

  // The count each filter would show, for the pill readouts.
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length }
    for (const f of FILTERS) {
      if (f.value === "all") continue
      c[f.value] = projects.filter((p) => p.status === f.value).length
    }
    return c
  }, [])

  const visibleCount = useMemo(
    () => projects.filter((p) => matches(p, filter, query)).length,
    [filter, query]
  )

  // ------- Entrance: cards stagger-rise on first paint -------
  useGSAP(
    () => {
      const grid = gridRef.current
      if (!grid) return
      const cards = gsap.utils.toArray<HTMLElement>("[data-project-card]", grid)

      const mm = gsap.matchMedia()
      mm.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { animate } = ctx.conditions as { animate: boolean }
          if (!animate) {
            gsap.set(cards, { opacity: 1, y: 0, scale: 1 })
            return
          }
          gsap.fromTo(
            cards,
            { opacity: 0, y: 32, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              ease: "power3.out",
              stagger: { each: 0.06, from: "start", grid: "auto" },
              delay: 0.1,
            }
          )
        }
      )
      return () => mm.revert()
    },
    { scope: rootRef }
  )

  // ------- Flip re-layout on filter/search change -------
  // Capture the grid state, mutate which cards are hidden, then Flip.from.
  const runFlip = useCallback((apply: () => void) => {
    const grid = gridRef.current
    if (!grid) {
      apply()
      return
    }
    const cards = gsap.utils.toArray<HTMLElement>("[data-project-card]", grid)

    const mm = gsap.matchMedia()
    // Reduced motion: apply instantly, no Flip.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply()
      return
    }
    mm.revert()

    const state = Flip.getState(cards, { props: "opacity" })
    apply()

    Flip.from(state, {
      duration: 0.6,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
      stagger: 0.03,
      // Cards that are newly shown fade + scale up into place.
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" }
        ),
      // Cards being removed shrink + fade out.
      onLeave: (els) =>
        gsap.to(els, {
          opacity: 0,
          scale: 0.85,
          duration: 0.35,
          ease: "power2.in",
        }),
    })
  }, [])

  const onFilter = (value: Filter) => {
    if (value === filter) return
    runFlip(() => setFilter(value))
  }
  const onQuery = (value: string) => {
    runFlip(() => setQuery(value))
  }

  return (
    <section
      ref={rootRef}
      className="relative mx-auto w-full max-w-6xl px-5 pb-32 sm:px-8"
    >
      {/* ============================== HEADER ============================== */}
      <header className="relative mb-12 select-none sm:mb-16">
        <span
          aria-hidden
          className="block font-display uppercase leading-[0.82] tracking-tight text-foreground/[0.06]"
          style={{ fontSize: "clamp(64px, 15vw, 260px)" }}
        >
          Projects
        </span>

        <div className="mt-1 flex flex-wrap items-baseline gap-x-6 gap-y-2 sm:absolute sm:bottom-3 sm:left-1 sm:mt-0">
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Things I build when no one asks
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
            {String(projects.length).padStart(2, "0")} shipped &amp; in flight
          </span>
        </div>
      </header>

      {/* ============================== CONTROLS ============================== */}
      <div className="mb-10 flex flex-col gap-5">
        {/* Search */}
        <Glass className="flex items-center gap-3 rounded-full px-5 py-3">
          <Search
            size={16}
            aria-hidden
            className="shrink-0 text-muted-foreground"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search projects"
            aria-label="Search projects"
            className="w-full bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="Clear search"
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </Glass>

        {/* Filter pills */}
        <div
          role="group"
          aria-label="Filter projects by status"
          className="flex flex-wrap gap-2"
        >
          {FILTERS.map((f) => {
            const active = filter === f.value
            return (
              <button
                key={f.value}
                type="button"
                aria-pressed={active}
                onClick={() => onFilter(f.value)}
                className={cn(
                  "group/pill relative inline-flex items-center gap-2 rounded-full border px-4 py-2",
                  "font-mono text-[11px] uppercase leading-none tracking-[0.16em] transition-colors duration-300",
                  active
                    ? "border-primary/60 bg-primary text-primary-foreground"
                    : "border-border bg-foreground/[0.03] text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "font-mono text-[10px] tabular-nums transition-colors",
                    active ? "text-primary-foreground/70" : "text-muted-foreground/50"
                  )}
                >
                  {String(counts[f.value] ?? 0).padStart(2, "0")}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ============================== GRID ============================== */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((project) => {
          const show = matches(project, filter, query)
          return (
            <div
              key={project.slug}
              data-project-card
              // Stable node for Flip; hidden ones drop out of flow entirely so
              // the grid reflows and surviving cards animate to new slots.
              className={show ? "block" : "hidden"}
            >
              <ProjectCard project={project} />
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {visibleCount === 0 && (
        <p className="mt-16 text-center font-mono text-sm lowercase tracking-[0.1em] text-muted-foreground">
          nothing matches that. try another word.
        </p>
      )}
    </section>
  )
}
