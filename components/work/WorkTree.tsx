"use client"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { ArrowUpRight } from "lucide-react"
import { StatusTag } from "@/components/work/StatusTag"
import { work } from "@/lib/content"

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

/**
 * WORK — a career telemetry spine.
 *
 * A single left-anchored vertical timeline. An SVG stroke runs down the page as
 * the spine; each work entry is a compact node hung off it, never a big card
 * (the owner explicitly rejected the old huge cards):
 *
 *   left of spine   — the dates, mono, telemetry-style.
 *   on the spine    — a node marker (tan ring). The `current` role's marker
 *                     carries a soft pulsing tan glow; it is the one you are in.
 *   right of spine  — StatusTag + company (font-display) + role (mono) + a
 *                     one-line blurb + an optional `visit` link.
 *
 * The current role (Configure) is deliberately dominant: a larger display size,
 * a tan-lit marker, and a SplitText letter reveal on its name.
 *
 * Motion (useGSAP + gsap.matchMedia, reduced-motion branch lands final states):
 *   - the spine stroke draws in, scrubbed to scroll (stroke-dashoffset 1 -> 0).
 *   - each node reveals as it enters (~85% viewport): fade + slide, its marker
 *     pops with back.out, sibling text staggers in.
 *   - the current marker pulses on a soft loop.
 *   - the Configure name reveals letter-by-letter.
 * Transforms/opacity only; 60fps and reduced-motion safe.
 */
export function WorkTree() {
  const rootRef = useRef<HTMLElement | null>(null)

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

          const nodes = gsap.utils.toArray<HTMLElement>("[data-node]")
          const spinePath =
            rootRef.current?.querySelector<SVGPathElement>("[data-spine-path]")
          const currentGlow =
            rootRef.current?.querySelector<HTMLElement>("[data-current-glow]")
          const currentName =
            rootRef.current?.querySelector<HTMLElement>("[data-current-name]")

          // ---------- Reduced motion: land everything, no animation ----------
          if (!animate) {
            gsap.set(nodes, { opacity: 1, y: 0 })
            gsap.utils.toArray<HTMLElement>("[data-node-inner]").forEach((el) =>
              gsap.set(el, { opacity: 1, y: 0 })
            )
            gsap.utils.toArray<HTMLElement>("[data-marker]").forEach((el) =>
              gsap.set(el, { opacity: 1, scale: 1 })
            )
            if (spinePath) gsap.set(spinePath, { strokeDashoffset: 0 })
            return
          }

          // ---------- Spine draw, scrubbed to scroll ----------
          if (spinePath) {
            const len = spinePath.getTotalLength()
            gsap.set(spinePath, { strokeDasharray: len, strokeDashoffset: len })
            gsap.to(spinePath, {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: {
                trigger: rootRef.current,
                start: "top 70%",
                end: "bottom 75%",
                scrub: 0.6,
              },
            })
          }

          // ---------- Per-node reveal ----------
          nodes.forEach((node) => {
            const marker = node.querySelector<HTMLElement>("[data-marker]")
            const inner = gsap.utils.toArray<HTMLElement>(
              "[data-node-inner]",
              node
            )
            const isCurrent = node.dataset.node === "current"

            const tl = gsap.timeline({
              scrollTrigger: { trigger: node, start: "top 85%" },
              defaults: { ease: "power3.out" },
            })

            if (marker) {
              tl.fromTo(
                marker,
                { opacity: 0, scale: 0 },
                { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(2.4)" },
                0
              )
            }

            tl.fromTo(
              node,
              { opacity: 0 },
              { opacity: 1, duration: 0.5 },
              0
            )

            // The current node gets a letter reveal on its name; others slide
            // their text blocks up as a soft stagger.
            if (isCurrent && currentName) {
              const split = new SplitText(currentName, {
                type: "chars",
                charsClass: "work-char",
              })
              gsap.set(currentName, { opacity: 1 })
              tl.fromTo(
                split.chars,
                { yPercent: 115, opacity: 0 },
                {
                  yPercent: 0,
                  opacity: 1,
                  duration: 0.8,
                  stagger: 0.03,
                  ease: "back.out(1.6)",
                },
                0.12
              )
              const others = inner.filter((el) => el !== currentName)
              tl.fromTo(
                others,
                { opacity: 0, y: 18 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
                0.2
              )
            } else {
              tl.fromTo(
                inner,
                { opacity: 0, y: 22 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
                0.12
              )
            }
          })

          // ---------- Current marker: soft looping tan glow ----------
          if (currentGlow) {
            gsap.to(currentGlow, {
              opacity: 0.85,
              scale: 1.35,
              duration: 1.9,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            })
          }
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
      <header className="relative mb-16 select-none sm:mb-24">
        {/* Oversized ghost WORK numeral treatment, home-page language. */}
        <span
          aria-hidden
          className="block font-display uppercase leading-[0.82] tracking-tight text-foreground/[0.06]"
          style={{ fontSize: "clamp(88px, 17vw, 300px)" }}
        >
          Work
        </span>

        {/* Kicker + count, sitting inside the ghost like telemetry. */}
        <div className="mt-1 flex flex-wrap items-baseline gap-x-6 gap-y-2 sm:absolute sm:bottom-3 sm:left-1 sm:mt-0">
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Where I&rsquo;ve put the hours
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
            {String(work.length).padStart(2, "0")} roles
          </span>
        </div>
      </header>

      {/* ============================== TIMELINE ============================== */}
      {/* The rail column (spine + markers) is a fixed narrow gutter on the left;
          content sits to its right. On mobile the gutter narrows but the layout
          holds — single-column, left-spine, no horizontal overflow. */}
      <div className="relative">
        {/* SVG spine — a single vertical stroke that draws in on scroll. It is
            absolutely positioned over the marker gutter and stretches the full
            height of the list. */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[7px] h-full w-[2px] sm:left-[11px]"
          preserveAspectRatio="none"
          viewBox="0 0 2 1000"
        >
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="1000"
            className="stroke-border"
            strokeWidth="2"
          />
          <path
            data-spine-path
            d="M1 0 L1 1000"
            className="stroke-primary"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        <ol className="relative space-y-16 sm:space-y-24">
          {work.map((entry, i) => {
            const isCurrent = entry.status === "current"
            return (
              <li
                key={entry.company}
                data-node={isCurrent ? "current" : "past"}
                className="relative grid grid-cols-[16px_1fr] gap-x-5 opacity-0 sm:grid-cols-[24px_1fr] sm:gap-x-8"
              >
                {/* ---------- Marker column ---------- */}
                <div className="relative pt-1.5">
                  <div
                    data-marker
                    className="relative flex items-center justify-center"
                  >
                    {isCurrent && (
                      <span
                        data-current-glow
                        aria-hidden
                        className="absolute h-4 w-4 rounded-full bg-primary/60 opacity-40 blur-[6px] sm:h-5 sm:w-5"
                      />
                    )}
                    <span
                      className={
                        isCurrent
                          ? "relative z-10 h-4 w-4 rounded-full border-2 border-primary bg-primary shadow-[0_0_16px_2px_hsl(var(--primary)/0.55)] sm:h-5 sm:w-5"
                          : "relative z-10 h-3 w-3 rounded-full border-2 border-primary/70 bg-background sm:h-3.5 sm:w-3.5"
                      }
                    />
                  </div>
                </div>

                {/* ---------- Content column ---------- */}
                <div className="min-w-0 pb-1">
                  {/* dates + status: on wide screens the dates sit to the far
                      left as a telemetry rail; on mobile they stack above. */}
                  <div
                    data-node-inner
                    className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 opacity-0"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {entry.dates}
                    </span>
                    <StatusTag status={entry.status} />
                  </div>

                  {/* company — dominant for the current role. */}
                  {isCurrent ? (
                    <h2
                      data-current-name
                      data-node-inner
                      className="font-display uppercase leading-[0.9] tracking-[-0.01em] text-foreground opacity-0"
                      style={{ fontSize: "clamp(44px, 8vw, 104px)" }}
                    >
                      {entry.company}
                    </h2>
                  ) : (
                    <h2
                      data-node-inner
                      className="font-display uppercase leading-[0.92] tracking-[-0.01em] text-foreground/90 opacity-0"
                      style={{ fontSize: "clamp(34px, 5.5vw, 60px)" }}
                    >
                      {entry.company}
                    </h2>
                  )}

                  {/* role */}
                  <p
                    data-node-inner
                    className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-primary opacity-0 sm:text-sm"
                  >
                    {entry.role}
                  </p>

                  {/* blurb */}
                  <p
                    data-node-inner
                    className={
                      "mt-4 max-w-[52ch] font-body leading-relaxed text-muted-foreground opacity-0 " +
                      (isCurrent ? "text-base sm:text-lg" : "text-sm sm:text-base")
                    }
                  >
                    {entry.blurb}
                  </p>

                  {/* visit link */}
                  {entry.url && (
                    <div data-node-inner className="mt-5 opacity-0">
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 font-mono text-xs lowercase tracking-[0.12em] text-primary transition-opacity hover:opacity-70"
                      >
                        visit{" "}
                        {entry.url
                          .replace(/^https?:\/\//, "")
                          .replace(/\/$/, "")}
                        <ArrowUpRight
                          size={14}
                          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </a>
                    </div>
                  )}
                </div>

                {/* index tick, faint, far right — telemetry seasoning. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-0 top-1 hidden font-mono text-[10px] uppercase tracking-[0.24em] text-foreground/20 sm:block"
                >
                  {String(i + 1).padStart(2, "0")} / {String(work.length).padStart(2, "0")}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
