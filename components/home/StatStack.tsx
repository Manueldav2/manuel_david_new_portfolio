"use client"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { profile } from "@/lib/content"

gsap.registerPlugin(useGSAP)

/**
 * F1-style stacked stat readout. Each stat renders as a giant font-display
 * numeral (zero-padded to two digits, like season points) with a tiny mono
 * label underneath. The last stat is painted in the #ff2d2d accent — the
 * "most important number" the eye lands on.
 *
 * Numbers count up on mount via a proxy tween (snap:1). Under reduced motion
 * they render at their final value with no animation.
 */
export function StatStack() {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const nodes = gsap.utils.toArray<HTMLElement>("[data-stat-value]")
      if (!nodes.length) return

      const mm = gsap.matchMedia()

      mm.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { animate } = ctx.conditions as { animate: boolean }

          nodes.forEach((node) => {
            const target = Number(node.dataset.statValue ?? "0")
            const pad = (node.dataset.statPad ?? "0").length

            if (!animate) {
              node.textContent = String(target).padStart(pad, "0")
              return
            }

            const proxy = { v: 0 }
            gsap.to(proxy, {
              v: target,
              duration: 1.6,
              ease: "power2.out",
              delay: 0.9,
              snap: { v: 1 },
              onUpdate: () => {
                node.textContent = String(Math.round(proxy.v)).padStart(pad, "0")
              },
            })
          })

          // Subtle landing pop on the whole stack once numbers settle.
          gsap.fromTo(
            nodes,
            { scale: animate ? 0.92 : 1, opacity: animate ? 0 : 1 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.7,
              delay: 0.8,
              stagger: 0.14,
              ease: "back.out(1.6)",
              transformOrigin: "left center",
            }
          )
        }
      )

      return () => mm.revert()
    },
    { scope: rootRef }
  )

  return (
    <div
      ref={rootRef}
      className="flex flex-col gap-6 sm:gap-8"
      aria-hidden="true"
    >
      {profile.stats.map((stat, i) => {
        const isLast = i === profile.stats.length - 1
        const padSample = String(stat.value).padStart(2, "0")
        return (
          <div key={stat.label} className="flex flex-col items-start">
            <span
              data-stat-value={stat.value}
              data-stat-pad={padSample}
              className={
                "font-display leading-[0.82] tracking-tight tabular-nums " +
                "text-[clamp(56px,7vw,110px)] " +
                (isLast ? "text-[#ff2d2d]" : "text-foreground/85")
              }
            >
              {padSample}
            </span>
            <span className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
              {stat.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
