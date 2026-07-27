"use client"

import Link from "next/link"
import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { SplitText } from "gsap/SplitText"
import { ArrowUpRight } from "lucide-react"
import { Glass } from "@/components/glass/Glass"
import { StatStack } from "@/components/home/StatStack"
import { profile } from "@/lib/content"

gsap.registerPlugin(useGSAP, SplitText)

/**
 * F1-75 "max drama" hero. A layered z-stack used as a full-bleed canvas:
 *
 *   BACK   — a giant ghosted "MD" monogram (gradient-clip + mask, matching the
 *            footer wordmark) bleeding off the right edge; pure depth.
 *   MID    — the name MANUEL / DAVID in Anton, massive, bleeding past the left
 *            edge. The focal point.
 *   FRONT  — corner mono metadata (San Francisco / Founding Engineer), the
 *            headline value-prop, CTA glass buttons, and a floating liquid-glass
 *            card. On the right rail: the F1-style StatStack.
 *
 * Motion (all via useGSAP + gsap.matchMedia, reduced-motion branch sets final
 * states only): SplitText shatter-rise on the name chars, offset metadata
 * slide-ins, monogram drift, and pointer parallax on the depth layers.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement | null>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
          touch: "(hover: none), (pointer: coarse)",
        },
        (ctx) => {
          const { animate, touch } = ctx.conditions as {
            animate: boolean
            reduce: boolean
            touch: boolean
          }

          const nameLines = gsap.utils.toArray<HTMLElement>("[data-name-line]")
          const meta = gsap.utils.toArray<HTMLElement>("[data-hero-meta]")
          const ghost = rootRef.current?.querySelector<HTMLElement>("[data-hero-ghost]")
          const floaters = gsap.utils.toArray<HTMLElement>("[data-hero-parallax]")

          // ----- Reduced motion: land everything, no animation -----
          if (!animate) {
            gsap.set([...nameLines, ...meta], { opacity: 1, y: 0, rotate: 0 })
            return
          }

          // ----- Split the name into chars for the shatter-rise -----
          const splits = nameLines.map(
            (line) => new SplitText(line, { type: "chars", charsClass: "hero-char" })
          )
          const allChars = splits.flatMap((s) => s.chars)

          const tl = gsap.timeline({ defaults: { ease: "expo.out" } })

          tl.set(nameLines, { opacity: 1 })
            .from(allChars, {
              yPercent: 120,
              rotate: 8,
              opacity: 0,
              duration: 1.1,
              stagger: { each: 0.028, from: "start" },
              ease: "back.out(1.5)",
            })
            .from(
              meta,
              {
                y: 18,
                opacity: 0,
                duration: 0.7,
                stagger: 0.09,
                ease: "power3.out",
              },
              "-=0.7"
            )

          // ----- Ghost monogram slow drift (independent, looping) -----
          if (ghost) {
            gsap.fromTo(
              ghost,
              { opacity: 0 },
              { opacity: 1, duration: 1.4, ease: "power2.out" }
            )
            gsap.to(ghost, {
              yPercent: 4,
              xPercent: -2,
              duration: 9,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            })
          }

          // ----- Pointer parallax (opposing translations for 3D depth) -----
          // Skipped on touch — no meaningful pointer to track.
          if (!touch) {
            const ghostX = ghost ? gsap.quickTo(ghost, "x", { duration: 0.9, ease: "power3.out" }) : null
            const ghostY = ghost ? gsap.quickTo(ghost, "y", { duration: 0.9, ease: "power3.out" }) : null
            const floatQ = floaters.map((el) => ({
              el,
              depth: Number(el.dataset.heroParallax ?? "1"),
              x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }),
              y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }),
            }))

            const onMove = (e: PointerEvent) => {
              const rx = e.clientX / window.innerWidth - 0.5
              const ry = e.clientY / window.innerHeight - 0.5
              // Ghost moves opposite the cursor (it sits behind), a big amount.
              if (ghostX && ghostY) {
                ghostX(rx * -46)
                ghostY(ry * -30)
              }
              floatQ.forEach(({ depth, x, y }) => {
                x(rx * 26 * depth)
                y(ry * 20 * depth)
              })
            }
            window.addEventListener("pointermove", onMove)
            ctx.add?.(() => window.removeEventListener("pointermove", onMove))
            // matchMedia cleanup also handles removal; explicit for safety:
            return () => window.removeEventListener("pointermove", onMove)
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
      className="relative isolate mx-auto flex min-h-[88vh] w-full max-w-[1600px] items-center overflow-hidden px-5 sm:px-8 lg:px-14"
    >
      {/* Atmospheric red bloom, anchored bottom-left behind the name. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[10%] bottom-[-8%] -z-20 h-[70vh] w-[70vh] rounded-full opacity-[0.55] blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,45,45,0.32) 0%, rgba(255,45,45,0.08) 40%, transparent 70%)",
        }}
      />

      {/* BACK LAYER — giant ghosted MD monogram, bleeding off the right edge. */}
      <span
        data-hero-ghost
        aria-hidden
        className="pointer-events-none absolute right-[-8%] top-1/2 -z-10 -translate-y-1/2 select-none font-display leading-none tracking-tighter opacity-0"
        style={{
          fontSize: "clamp(320px, 42vw, 780px)",
          backgroundImage:
            "linear-gradient(150deg, rgb(20,20,23) 0%, rgb(30,30,34) 45%, rgb(46,46,52) 78%, rgb(64,64,71) 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          maskImage:
            "radial-gradient(120% 120% at 70% 45%, rgb(0,0,0) 40%, rgba(0,0,0,0.35) 72%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(120% 120% at 70% 45%, rgb(0,0,0) 40%, rgba(0,0,0,0.35) 72%, transparent 100%)",
        }}
      >
        MD
      </span>

      {/* Fine grid ticks, top-left — a nod to a telemetry HUD. */}
      <div
        data-hero-meta
        aria-hidden
        className="pointer-events-none absolute left-5 top-2 hidden font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 sm:left-8 lg:left-14 lg:block"
      >
        01 &nbsp;—&nbsp; HOME
      </div>

      {/* MAIN GRID — name on the left, stat rail on the right (desktop). */}
      <div className="grid w-full grid-cols-1 items-center gap-y-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-10">
        {/* LEFT COLUMN */}
        <div className="relative">
          {/* Top-left metadata — country/circuit style */}
          <div
            data-hero-meta
            className="mb-5 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground sm:text-xs"
          >
            <span className="text-[#ff2d2d]">▲</span>
            <span>{profile.location}</span>
          </div>

          {/* THE NAME — massive, bleeding left */}
          <h1 className="relative -ml-[0.04em] select-none font-display uppercase leading-[0.92] tracking-[-0.01em] text-foreground">
            <span
              data-name-line
              className="block text-[clamp(56px,13vw,228px)] opacity-0"
            >
              Manuel
            </span>
            <span
              data-name-line
              className="block text-[clamp(56px,13vw,228px)] opacity-0"
            >
              David
            </span>
          </h1>

          {/* Role tag pinned near the name, F1 driver-line style */}
          <div
            data-hero-meta
            className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs"
          >
            <span className="text-foreground/90">Founding Engineer</span>
            <span className="text-muted-foreground/50">@</span>
            <a
              href={profile.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff2d2d] transition-opacity hover:opacity-70"
            >
              Configure
            </a>
          </div>

          {/* Headline value prop */}
          <p
            data-hero-meta
            className="mt-8 max-w-md font-body text-lg leading-snug text-muted-foreground sm:text-xl"
          >
            {profile.headline}
          </p>

          {/* CTAs */}
          <div data-hero-meta className="mt-9 flex flex-wrap items-center gap-3">
            <Glass
              as={Link}
              href="/projects"
              interactive
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-sm lowercase text-foreground transition-colors hover:bg-white/[0.07]"
            >
              see the work
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Glass>
            <Link
              href="/chat"
              className="group inline-flex items-center gap-2 rounded-full border border-[#ff2d2d]/30 bg-[#ff2d2d]/[0.08] px-6 py-3 font-mono text-sm lowercase text-[#ff2d2d] transition-colors hover:bg-[#ff2d2d]/[0.14]"
            >
              ask my ai
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN — stat rail + floating glass card */}
        <div
          data-hero-meta
          className="relative flex flex-row items-start justify-between gap-6 lg:flex-col lg:items-end lg:gap-10 lg:pl-4"
        >
          {/* Floating liquid-glass status card */}
          <Glass
            distort
            interactive
            data-hero-parallax="1.4"
            className="w-full max-w-[220px] rounded-2xl px-5 py-4 lg:w-[220px]"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff2d2d] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff2d2d]" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Status
              </span>
            </div>
            <p className="mt-2 font-display text-xl uppercase leading-none text-foreground">
              Shipping
            </p>
            <p className="mt-1.5 font-body text-xs leading-snug text-muted-foreground">
              Context infrastructure, live in San Francisco.
            </p>
          </Glass>

          {/* Stat stack */}
          <div className="pt-1 lg:pt-0" data-hero-parallax="0.6">
            <StatStack />
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        data-hero-meta
        aria-hidden
        className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 lg:flex"
      >
        <span>scroll</span>
        <span className="h-8 w-px bg-gradient-to-b from-muted-foreground/40 to-transparent" />
      </div>
    </section>
  )
}
