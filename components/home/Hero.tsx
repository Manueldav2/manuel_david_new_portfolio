"use client"

import Link from "next/link"
import Image from "next/image"
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
 * F1 "driver hero" layout, tuned to the espresso palette pulled from the photo.
 *
 *   BACK   — a giant ghosted "MD" monogram (warm espresso metallic gradient)
 *            bleeding off the right edge; pure depth, sits behind the figure.
 *   FIGURE — Manuel's full-body portrait, centred/right, bleeding off the bottom
 *            edge like a driver standing on the grid. Warm-graded + soft-edged
 *            so it reads as one art-directed layer, not a pasted crop.
 *   FRONT  — top-left metadata (San Francisco / Founding Engineer @ Configure),
 *            the name MANUEL / DAVID bottom-left in Anton bleeding off the left,
 *            the value-prop + CTAs, and the stat rail on the right.
 *
 * Motion (useGSAP + matchMedia, reduced-motion branch lands final states):
 * SplitText rise on the name, metadata slide-ins, figure reveal, monogram drift,
 * and pointer parallax on the depth layers.
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
          const figure = rootRef.current?.querySelector<HTMLElement>("[data-hero-figure]")
          const floaters = gsap.utils.toArray<HTMLElement>("[data-hero-parallax]")

          // ----- Reduced motion: land everything, no animation -----
          if (!animate) {
            gsap.set([...nameLines, ...meta], { opacity: 1, y: 0, rotate: 0 })
            if (figure) gsap.set(figure, { opacity: 1, y: 0 })
            return
          }

          // ----- Figure reveal: fade + subtle rise, ahead of the name -----
          if (figure) {
            gsap.from(figure, {
              opacity: 0,
              yPercent: 6,
              scale: 1.04,
              duration: 1.4,
              ease: "power3.out",
            })
          }

          // ----- Split the name into chars for the rise -----
          const splits = nameLines.map(
            (line) => new SplitText(line, { type: "chars", charsClass: "hero-char" })
          )
          const allChars = splits.flatMap((s) => s.chars)

          const tl = gsap.timeline({ defaults: { ease: "expo.out" } })

          tl.set(nameLines, { opacity: 1 })
            .from(
              allChars,
              {
                yPercent: 120,
                rotate: 8,
                opacity: 0,
                duration: 1.1,
                stagger: { each: 0.028, from: "start" },
                ease: "back.out(1.5)",
              },
              0.35
            )
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
          if (!touch) {
            const ghostX = ghost ? gsap.quickTo(ghost, "x", { duration: 0.9, ease: "power3.out" }) : null
            const ghostY = ghost ? gsap.quickTo(ghost, "y", { duration: 0.9, ease: "power3.out" }) : null
            const figX = figure ? gsap.quickTo(figure, "x", { duration: 1.1, ease: "power3.out" }) : null
            const figY = figure ? gsap.quickTo(figure, "y", { duration: 1.1, ease: "power3.out" }) : null
            const floatQ = floaters.map((el) => ({
              el,
              depth: Number(el.dataset.heroParallax ?? "1"),
              x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }),
              y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }),
            }))

            const onMove = (e: PointerEvent) => {
              const rx = e.clientX / window.innerWidth - 0.5
              const ry = e.clientY / window.innerHeight - 0.5
              if (ghostX && ghostY) {
                ghostX(rx * -46)
                ghostY(ry * -30)
              }
              // Figure drifts gently WITH the cursor for a parallax float.
              if (figX && figY) {
                figX(rx * 14)
                figY(ry * 10)
              }
              floatQ.forEach(({ depth, x, y }) => {
                x(rx * 26 * depth)
                y(ry * 20 * depth)
              })
            }
            window.addEventListener("pointermove", onMove)
            ctx.add?.(() => window.removeEventListener("pointermove", onMove))
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
      className="relative isolate mx-auto flex min-h-[90vh] w-full max-w-[1600px] items-center overflow-hidden px-5 pb-0 sm:px-8 lg:px-14"
    >
      {/* Warm amber bloom, anchored bottom-left behind the name. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[10%] bottom-[-8%] -z-20 h-[70vh] w-[70vh] rounded-full opacity-[0.5] blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, hsl(30 45% 45% / 0.4) 0%, hsl(28 40% 35% / 0.12) 42%, transparent 70%)",
        }}
      />

      {/* BACK LAYER — giant ghosted MD monogram, warm espresso metallic. */}
      <span
        data-hero-ghost
        aria-hidden
        className="pointer-events-none absolute right-[-8%] top-1/2 -z-10 -translate-y-1/2 select-none font-display leading-none tracking-tighter opacity-0"
        style={{
          fontSize: "clamp(320px, 42vw, 780px)",
          backgroundImage:
            "linear-gradient(150deg, rgb(26,19,16) 0%, rgb(38,29,23) 45%, rgb(56,43,34) 78%, rgb(82,64,50) 100%)",
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

      {/* FIGURE — the portrait, dominant on the right, bleeding off the bottom.
          Sits behind the name so the type overlaps the lower body, F1-style.
          The grade + feather + grain live on .hero-portrait; the CSS mask on
          .hero-portrait-mask dissolves the photo's hard edges into espresso. */}
      <div
        data-hero-figure
        aria-hidden
        className="hero-portrait pointer-events-none absolute bottom-0 right-[-4%] top-[6%] -z-[5] hidden w-[48%] max-w-[620px] sm:block lg:right-0 lg:w-[44%]"
      >
        <div className="hero-portrait-mask relative h-full w-full">
          <Image
            src="/images/manuel-hero.jpg"
            alt="Manuel David"
            fill
            priority
            sizes="(max-width: 1024px) 48vw, 620px"
            className="object-cover object-top"
          />
        </div>
      </div>

      {/* CONTENT — left rail, clear of the figure. */}
      <div className="w-full">
        <div className="relative sm:max-w-[54%] lg:max-w-[52%]">
          {/* Top-left metadata — country / circuit style */}
          <div
            data-hero-meta
            className="mb-5 flex flex-col gap-1 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground sm:text-xs"
          >
            <span className="text-foreground/90">{profile.location}</span>
            <span>
              Founding Engineer{" "}
              <span className="text-muted-foreground/50">at</span>{" "}
              <a
                href={profile.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto text-primary transition-opacity hover:opacity-70"
              >
                Configure
              </a>
            </span>
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
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-sm lowercase text-foreground transition-colors hover:bg-foreground/[0.06]"
            >
              see the work
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Glass>
            <Link
              href="/chat"
              className="group inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/[0.1] px-6 py-3 font-mono text-sm lowercase text-primary transition-colors hover:bg-primary/[0.18]"
            >
              ask my ai
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          {/* Stat strip — season-points readout, sitting under the CTAs on the
              left rail so it never collides with the figure. */}
          <div data-hero-meta className="mt-12" data-hero-parallax="0.5">
            <StatStack />
          </div>
        </div>
      </div>
    </section>
  )
}
