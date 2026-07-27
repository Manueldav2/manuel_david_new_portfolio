"use client"

import Image from "next/image"
import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ArrowUpRight } from "lucide-react"
import { Glass } from "@/components/glass/Glass"
import { StatusTag } from "@/components/work/StatusTag"
import { BrandIcon } from "@/components/site/BrandIcon"
import type { Project } from "@/lib/content"

gsap.registerPlugin(useGSAP)

/**
 * A single project on the wall — a tactile liquid-glass card, not a flat box.
 *
 * Composition (top to bottom):
 *   - a favicon/monogram TILE (top-left) sitting on a light frosted backing so
 *     dark marks stay visible against the espresso card; the year + StatusTag
 *     ride the top-right as mono telemetry.
 *   - the project name in Anton caps, clamp-sized to hold the grid rhythm.
 *   - a one-line blurb, font-body, muted, clamped to two lines.
 *   - a links row: `visit ↗` (tan, new tab) and the official GitHub mark.
 *
 * Motion: the whole card tilts toward the cursor (rotateX/Y ±6deg + a small
 * translateZ pop) via GSAP quickTo, layered under Glass's own specular spot.
 * Tilt is created inside pointer handlers, so it lives in matchMedia's
 * fine-pointer + no-reduced-motion branch and is torn down on touch. The tile
 * and arrow get a subtle secondary shift so the motion has depth, not just a
 * flat plane rotation.
 */
export function ProjectCard({ project }: { project: Project }) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLAnchorElement | HTMLDivElement | null>(null)
  const tileRef = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      const wrap = wrapRef.current
      const card = cardRef.current
      if (!wrap || !card) return

      const mm = gsap.matchMedia()
      mm.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const rotX = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" })
          const rotY = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" })
          const zTo = gsap.quickTo(card, "z", { duration: 0.5, ease: "power3.out" })
          const tileX = tileRef.current
            ? gsap.quickTo(tileRef.current, "x", { duration: 0.6, ease: "power3.out" })
            : null
          const tileY = tileRef.current
            ? gsap.quickTo(tileRef.current, "y", { duration: 0.6, ease: "power3.out" })
            : null

          const onMove = (e: PointerEvent) => {
            const r = wrap.getBoundingClientRect()
            const px = (e.clientX - r.left) / r.width - 0.5 // -0.5 .. 0.5
            const py = (e.clientY - r.top) / r.height - 0.5
            rotY(px * 12) // ±6deg
            rotX(py * -12)
            zTo(26)
            if (tileX && tileY) {
              tileX(px * 10)
              tileY(py * 10)
            }
          }
          const onLeave = () => {
            rotX(0)
            rotY(0)
            zTo(0)
            if (tileX && tileY) {
              tileX(0)
              tileY(0)
            }
          }

          wrap.addEventListener("pointermove", onMove)
          wrap.addEventListener("pointerleave", onLeave)
          return () => {
            wrap.removeEventListener("pointermove", onMove)
            wrap.removeEventListener("pointerleave", onLeave)
            gsap.killTweensOf(card)
            if (tileRef.current) gsap.killTweensOf(tileRef.current)
          }
        }
      )
      return () => mm.revert()
    },
    { scope: wrapRef }
  )

  const monogram = project.name.trim().charAt(0).toUpperCase()
  const host = project.url
    ? project.url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "")
    : null

  // The whole card is a link when there is a live URL; otherwise a plain
  // container (github-only projects link out via the footer mark instead).
  const commonCardClass =
    "group/card relative flex h-full min-h-[248px] flex-col gap-5 rounded-2xl p-6 sm:min-h-[268px] sm:p-7 [transform-style:preserve-3d] [backface-visibility:hidden]"

  const cardInner = (
    <>
      {/* ---------- TOP ROW: tile + telemetry ---------- */}
      <div className="flex items-start justify-between gap-4">
        {/* favicon / monogram tile — light frosted backing keeps dark marks
            legible on the espresso card. */}
        <div
          ref={tileRef}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-foreground/12 bg-foreground/[0.08] shadow-[inset_0_1px_0_hsl(35_35%_92%/0.14),0_8px_24px_-12px_hsl(20_24%_4%/0.9)] [transform:translateZ(30px)] sm:h-14 sm:w-14"
        >
          {project.favicon ? (
            <Image
              src={project.favicon}
              alt=""
              width={48}
              height={48}
              className="h-8 w-8 object-contain sm:h-9 sm:w-9"
            />
          ) : (
            <span className="font-display text-2xl leading-none text-primary sm:text-3xl">
              {monogram}
            </span>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 pt-0.5 text-right [transform:translateZ(22px)]">
          <StatusTag status={project.status} />
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {project.year}
          </span>
        </div>
      </div>

      {/* ---------- NAME ---------- */}
      <h3
        className="mt-auto font-display uppercase leading-[0.94] tracking-[-0.01em] text-foreground [transform:translateZ(18px)]"
        style={{ fontSize: "clamp(26px, 2.4vw, 34px)" }}
      >
        {project.name}
      </h3>

      {/* ---------- BLURB ---------- */}
      <p className="line-clamp-2 max-w-[42ch] font-body text-sm leading-relaxed text-muted-foreground [transform:translateZ(12px)]">
        {project.blurb}
      </p>

      {/* ---------- LINKS ROW ---------- */}
      <div className="mt-1 flex items-center justify-between gap-4 [transform:translateZ(16px)]">
        {host ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs lowercase tracking-[0.08em] text-primary transition-opacity group-hover/card:opacity-80">
            visit {host}
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5"
            />
          </span>
        ) : (
          <span className="font-mono text-xs lowercase tracking-[0.08em] text-muted-foreground/70">
            on github
          </span>
        )}

        {project.github &&
          // The GitHub mark navigates to the repo. When the card itself is an
          // anchor (has a live url), this must NOT be a nested <a> — invalid
          // HTML that breaks hydration — so it is a button that opens the repo
          // and stops the click from bubbling to the card link. When the card
          // is a plain container (github-only project), a real anchor is fine.
          (project.url ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open(project.github, "_blank", "noopener,noreferrer")
              }}
              aria-label={`${project.name} on GitHub`}
              className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.08] hover:text-foreground"
            >
              <BrandIcon name="github" size={18} />
            </button>
          ) : (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.name} on GitHub`}
              className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.08] hover:text-foreground"
            >
              <BrandIcon name="github" size={18} />
            </a>
          ))}
      </div>
    </>
  )

  return (
    // Perspective wrapper — owns the pointer math; the Glass tilts inside it.
    <div
      ref={wrapRef}
      className="group/wrap h-full [perspective:1000px]"
    >
      {project.url ? (
        <Glass
          as="a"
          ref={cardRef as React.Ref<HTMLAnchorElement>}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          interactive
          aria-label={`${project.name} — visit ${host}`}
          className={commonCardClass}
        >
          {cardInner}
        </Glass>
      ) : (
        <Glass
          ref={cardRef as React.Ref<HTMLDivElement>}
          interactive
          className={commonCardClass}
        >
          {cardInner}
        </Glass>
      )}
    </div>
  )
}
