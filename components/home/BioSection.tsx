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

          if (!animate) {
            gsap.set(paras, { opacity: 1 })
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
        }
      )

      return () => mm.revert()
    },
    { scope: rootRef }
  )

  return (
    <section
      ref={rootRef}
      className="mx-auto mt-32 w-full max-w-5xl px-5 sm:mt-44 sm:px-8"
    >
      <div
        data-bio-label
        className="mb-10 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground"
      >
        <span className="text-primary">02</span>
        <span className="h-px w-10 bg-border" />
        <span>About</span>
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
    </section>
  )
}
