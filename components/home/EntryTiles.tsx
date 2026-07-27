"use client"

import Link from "next/link"
import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowUpRight } from "lucide-react"
import { Glass } from "@/components/glass/Glass"
import { work, projects } from "@/lib/content"

gsap.registerPlugin(useGSAP, ScrollTrigger)

type Tile = {
  index: string
  title: string
  href: string
  desc: string
  meta: string
}

const TILES: Tile[] = [
  {
    index: "01",
    title: "Work",
    href: "/work",
    desc: "Where I spend my days: Configure, Paradigm, and Nouvo, the studio that still pays the bills on its own.",
    meta: `${work.length} roles`,
  },
  {
    index: "02",
    title: "Projects",
    href: "/projects",
    desc: "Things I built because I wanted them to exist. Agents, tools, games, a browser RTS.",
    meta: `${projects.length} builds`,
  },
  {
    index: "03",
    title: "Chat",
    href: "/chat",
    desc: "Ask an AI that knows my work anything. It answers from what I have actually done.",
    meta: "live",
  },
]

/**
 * Three large glass entry tiles — the real navigation into the site. Each has
 * a big mono index, a display title, one line of copy, and a magnetic hover:
 * the tile and its arrow ease toward the cursor via quickTo, snapping back on
 * leave. Magnetism is fine-pointer only. Tiles rise in on scroll; reduced
 * motion lands them statically with no pointer follow.
 */
export function EntryTiles() {
  const rootRef = useRef<HTMLElement | null>(null)

  useGSAP(
    (_ctx, contextSafe) => {
      const mm = gsap.matchMedia()

      // Scroll reveal (respects reduced motion via the query branch).
      mm.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { animate } = ctx.conditions as { animate: boolean }
          const cards = gsap.utils.toArray<HTMLElement>("[data-tile]")
          if (!animate) {
            gsap.set(cards, { opacity: 1, y: 0 })
            return
          }
          // fromTo, not from: the cards carry an `opacity-0` class, so a plain
          // from({opacity:0}) would record 0 as the endpoint and animate 0 → 0.
          gsap.fromTo(
            cards,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.12,
              ease: "power3.out",
              scrollTrigger: { trigger: rootRef.current, start: "top 82%" },
            }
          )
        }
      )

      // Magnetic hover — fine pointer only, never under reduced motion.
      mm.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const cards = gsap.utils.toArray<HTMLElement>("[data-tile]")
          const cleanups: (() => void)[] = []

          cards.forEach((card) => {
            const arrow = card.querySelector<HTMLElement>("[data-tile-arrow]")
            const xTo = gsap.quickTo(card, "x", { duration: 0.5, ease: "power3.out" })
            const yTo = gsap.quickTo(card, "y", { duration: 0.5, ease: "power3.out" })
            const axTo = arrow ? gsap.quickTo(arrow, "x", { duration: 0.5, ease: "power3.out" }) : null
            const ayTo = arrow ? gsap.quickTo(arrow, "y", { duration: 0.5, ease: "power3.out" }) : null

            const onMove = contextSafe!((e: PointerEvent) => {
              const r = card.getBoundingClientRect()
              const relX = e.clientX - r.left - r.width / 2
              const relY = e.clientY - r.top - r.height / 2
              xTo(relX * 0.12)
              yTo(relY * 0.14)
              if (axTo && ayTo) {
                axTo(relX * 0.22)
                ayTo(relY * 0.22)
              }
            })
            const onLeave = contextSafe!(() => {
              xTo(0)
              yTo(0)
              if (axTo && ayTo) {
                axTo(0)
                ayTo(0)
              }
            })

            card.addEventListener("pointermove", onMove)
            card.addEventListener("pointerleave", onLeave)
            cleanups.push(() => {
              card.removeEventListener("pointermove", onMove)
              card.removeEventListener("pointerleave", onLeave)
            })
          })

          return () => cleanups.forEach((fn) => fn())
        }
      )

      return () => mm.revert()
    },
    { scope: rootRef }
  )

  return (
    <section
      ref={rootRef}
      className="mx-auto mt-28 w-full max-w-6xl px-5 sm:mt-40 sm:px-8"
    >
      <div className="relative mb-10 select-none">
        <span
          aria-hidden
          className="block font-display leading-none text-foreground/[0.06]"
          style={{ fontSize: "clamp(80px, 10vw, 160px)" }}
        >
          02
        </span>
        <span className="absolute bottom-1 left-1 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Enter
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TILES.map((tile) => (
          <Glass
            key={tile.href}
            as={Link}
            href={tile.href}
            interactive
            data-tile
            className="group relative flex min-h-[240px] flex-col justify-between rounded-3xl p-7 opacity-0 will-change-transform sm:min-h-[300px]"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {tile.index}
              </span>
              <span
                data-tile-arrow
                className="text-muted-foreground transition-colors group-hover:text-primary"
              >
                <ArrowUpRight size={22} strokeWidth={1.75} />
              </span>
            </div>

            <div>
              <h3 className="font-display text-4xl uppercase leading-none text-foreground sm:text-5xl">
                {tile.title}
              </h3>
              <p className="mt-4 max-w-[26ch] font-body text-sm leading-relaxed text-muted-foreground">
                {tile.desc}
              </p>
              <span className="mt-5 inline-block font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                {tile.meta}
              </span>
            </div>
          </Glass>
        ))}
      </div>
    </section>
  )
}
