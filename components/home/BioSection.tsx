"use client"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { SplitText } from "gsap/SplitText"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { profile } from "@/lib/content"

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger)

/**
 * The arc bio. Two paragraphs at a large, readable measure, revealed
 * line-by-line as the section scrolls into view (SplitText lines + a masked
 * rise). A mono section label ("02 / ABOUT") sits above, telemetry-style.
 * Reduced motion renders everything statically.
 */
export function BioSection() {
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
          const paras = gsap.utils.toArray<HTMLElement>("[data-bio-para]")
          const label = rootRef.current?.querySelector<HTMLElement>("[data-bio-label]")
          const closing = rootRef.current?.querySelector<HTMLElement>("[data-bio-closing]")

          if (!animate) {
            gsap.set(paras, { opacity: 1 })
            if (closing) gsap.set(closing, { opacity: 1 })
            return
          }

          if (label) {
            gsap.from(label, {
              opacity: 0,
              y: 12,
              duration: 0.6,
              ease: "power3.out",
              scrollTrigger: { trigger: label, start: "top 88%" },
            })
          }

          paras.forEach((para) => {
            const split = new SplitText(para, { type: "lines", mask: "lines", linesClass: "bio-line" })
            gsap.set(para, { opacity: 1 })
            gsap.from(split.lines, {
              yPercent: 110,
              opacity: 0,
              duration: 0.9,
              stagger: 0.08,
              ease: "power4.out",
              scrollTrigger: { trigger: para, start: "top 82%" },
            })
          })

          // Closing line — a firmer rise + slight blur clear, landing after the
          // paragraphs it caps off.
          if (closing) {
            gsap.set(closing, { opacity: 1 })
            gsap.from(closing, {
              y: 26,
              opacity: 0,
              filter: "blur(6px)",
              duration: 1,
              ease: "power3.out",
              scrollTrigger: { trigger: closing, start: "top 88%" },
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
      className="mx-auto mt-24 w-full max-w-5xl px-5 sm:mt-32 sm:px-8"
    >
      <div data-bio-label className="relative mb-10 select-none">
        <span
          aria-hidden
          className="block font-display leading-none text-foreground/[0.06]"
          style={{ fontSize: "clamp(80px, 10vw, 160px)" }}
        >
          01
        </span>
        <span className="absolute bottom-1 left-1 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
          About
        </span>
      </div>

      <div className="max-w-3xl space-y-8">
        {profile.bio.map((paragraph, i) => (
          <p
            key={i}
            data-bio-para
            className="font-body text-2xl leading-[1.35] text-foreground/85 opacity-0 sm:text-[1.75rem] sm:leading-[1.4]"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* Closing line — futuristic accent font, its own beat. */}
      <p
        data-bio-closing
        className="mt-12 font-future text-2xl font-medium uppercase tracking-[0.04em] text-primary opacity-0 sm:mt-14 sm:text-4xl"
      >
        {profile.bioClosing}
      </p>
    </section>
  )
}
