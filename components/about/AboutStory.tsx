"use client"

import Image from "next/image"
import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { profile } from "@/lib/content"

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

/**
 * ABOUT — an editorial story page, not a wall of text.
 *
 * Structure (top to bottom):
 *   - an oversized ghost "ABOUT" numeral header in the home/work/projects
 *     language, with a mono kicker + name sitting inside it like telemetry.
 *   - a lead: the portrait on one side, a single large pull-line on the other,
 *     the sentence that opens his story.
 *   - the body: his five paragraphs set large in font-body, each reading like a
 *     beat of the story. The first line of each paragraph is line-split and
 *     revealed on scroll; a thin tan rule and a two-digit index mark each beat.
 *   - a quiet closing kicker.
 *
 * Motion (useGSAP + gsap.matchMedia, reduced-motion branch lands final states):
 *   - the pull-line splits into lines and reveals up as it enters.
 *   - each story beat fades + rises as it scrolls in, its index + rule drawing
 *     with it.
 * Transforms/opacity only, 60fps, reduced-motion safe.
 */
export function AboutStory() {
  const rootRef = useRef<HTMLElement | null>(null)
  const leadRef = useRef<HTMLParagraphElement | null>(null)

  const [lead, ...rest] = profile.about

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { animate } = ctx.conditions as { animate: boolean }

          const beats = gsap.utils.toArray<HTMLElement>("[data-beat]")
          const portrait =
            rootRef.current?.querySelector<HTMLElement>("[data-portrait]")

          if (!animate) {
            if (leadRef.current) gsap.set(leadRef.current, { opacity: 1 })
            gsap.set(beats, { opacity: 1, y: 0 })
            if (portrait) gsap.set(portrait, { opacity: 1, y: 0 })
            return
          }

          // ---- Portrait: gentle rise on load ----
          if (portrait) {
            gsap.fromTo(
              portrait,
              { opacity: 0, y: 28, scale: 1.02 },
              { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out", delay: 0.15 }
            )
          }

          // ---- Lead pull-line: split into lines, reveal up on scroll ----
          if (leadRef.current) {
            const split = new SplitText(leadRef.current, {
              type: "lines",
              linesClass: "about-line",
            })
            gsap.set(leadRef.current, { opacity: 1 })
            gsap.fromTo(
              split.lines,
              { yPercent: 110, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                duration: 0.9,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: { trigger: leadRef.current, start: "top 82%" },
              }
            )
          }

          // ---- Story beats: fade + rise as each enters ----
          beats.forEach((beat) => {
            const inner = gsap.utils.toArray<HTMLElement>("[data-beat-inner]", beat)
            gsap.fromTo(
              inner,
              { opacity: 0, y: 26 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: { trigger: beat, start: "top 84%" },
              }
            )
          })
        }
      )

      return () => mm.revert()
    },
    { scope: rootRef }
  )

  return (
    <section
      ref={rootRef}
      className="relative mx-auto w-full max-w-5xl px-5 pb-32 sm:px-8"
    >
      {/* ============================== HEADER ============================== */}
      <header className="relative mb-14 select-none sm:mb-20">
        <span
          aria-hidden
          className="block font-display uppercase leading-[0.82] tracking-tight text-foreground/[0.06]"
          style={{ fontSize: "clamp(80px, 17vw, 300px)" }}
        >
          About
        </span>

        <div className="mt-1 flex flex-wrap items-baseline gap-x-6 gap-y-2 sm:absolute sm:bottom-3 sm:left-1 sm:mt-0">
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
            The story behind the work
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
            {profile.name}
          </span>
        </div>
      </header>

      {/* ============================== LEAD ============================== */}
      {/* Portrait + the opening line of the story, set big. */}
      <div className="mb-20 grid grid-cols-1 gap-8 sm:mb-28 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-center sm:gap-12">
        <div
          data-portrait
          className="relative aspect-[4/5] w-40 overflow-hidden rounded-2xl border border-foreground/10 opacity-0 shadow-[0_24px_60px_-24px_hsl(20_24%_4%/0.9)] sm:w-full"
        >
          <Image
            src="/images/manuel-hero.jpg"
            alt="Manuel David"
            fill
            sizes="(min-width: 640px) 220px, 160px"
            className="object-cover"
            priority
          />
          {/* espresso wash over the lower edge so it reads as one with the page */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent"
          />
        </div>

        <p
          ref={leadRef}
          className="max-w-[24ch] font-display uppercase leading-[0.98] tracking-[-0.01em] text-foreground opacity-0"
          style={{ fontSize: "clamp(28px, 4.4vw, 52px)" }}
        >
          {lead}
        </p>
      </div>

      {/* ============================== BODY ============================== */}
      {/* Each remaining paragraph is a story beat: a two-digit index + a thin
          tan rule on the left, the text set large in font-body. */}
      <ol className="relative space-y-16 sm:space-y-24">
        {rest.map((para, i) => (
          <li
            key={i}
            data-beat
            className="grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-10"
          >
            {/* index + rule rail */}
            <div
              data-beat-inner
              className="flex flex-col items-center gap-3 pt-1.5 opacity-0"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                aria-hidden
                className="w-px flex-1 bg-gradient-to-b from-primary/40 to-transparent"
              />
            </div>

            <p
              data-beat-inner
              className="max-w-[54ch] font-body leading-[1.6] text-foreground/90 opacity-0 [text-wrap:pretty]"
              style={{ fontSize: "clamp(18px, 2.2vw, 24px)" }}
            >
              {para}
            </p>
          </li>
        ))}
      </ol>

      {/* ============================== CLOSING ============================== */}
      <div className="mt-20 border-t border-border/60 pt-8 sm:mt-28">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Building the infrastructure for a world run by agents.
        </p>
      </div>
    </section>
  )
}
