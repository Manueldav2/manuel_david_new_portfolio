"use client"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { profile } from "@/lib/content"

gsap.registerPlugin(useGSAP)

/**
 * Single-row infinite marquee of skill pills. The track holds two identical
 * copies of the skill list; GSAP animates it -50% on xPercent and wraps, so
 * the loop is seamless. Pauses on hover. Under reduced motion the track wraps
 * to a static, centered flex-wrap (no motion, no duplicate noise for readers).
 */
export function SkillsMarquee() {
  const rootRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const track = trackRef.current
      if (!track) return
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tween = gsap.to(track, {
          xPercent: -50,
          duration: 34,
          ease: "none",
          repeat: -1,
        })

        const enter = () => gsap.to(tween, { timeScale: 0, duration: 0.4 })
        const leave = () => gsap.to(tween, { timeScale: 1, duration: 0.4 })
        track.addEventListener("pointerenter", enter)
        track.addEventListener("pointerleave", leave)

        return () => {
          track.removeEventListener("pointerenter", enter)
          track.removeEventListener("pointerleave", leave)
          tween.kill()
        }
      })

      return () => mm.revert()
    },
    { scope: rootRef }
  )

  return (
    <section
      ref={rootRef}
      aria-label="Tools and technologies"
      className="mt-28 w-full overflow-hidden sm:mt-36"
    >
      <div className="mx-auto mb-8 max-w-5xl px-5 sm:px-8">
        <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          <span className="text-primary">03</span>
          <span className="h-px w-10 bg-border" />
          <span>Toolkit</span>
        </div>
      </div>

      {/* Edge fade masks the marquee into the background at both ends. */}
      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
        }}
      >
        <div
          ref={trackRef}
          className="flex w-max flex-nowrap gap-3 motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:px-5"
        >
          {[...profile.skills, ...profile.skills].map((skill, i) => (
            <span
              key={`${skill}-${i}`}
              // The duplicate half is a visual seam only — hide from readers.
              aria-hidden={i >= profile.skills.length ? true : undefined}
              className="shrink-0 whitespace-nowrap rounded-full border border-border bg-white/[0.03] px-5 py-2.5 font-mono text-sm text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
