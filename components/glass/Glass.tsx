"use client"

import { useRef, type ElementType, type HTMLAttributes, type ReactNode } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP)

export interface GlassProps extends HTMLAttributes<HTMLElement> {
  /** Element to render as. Defaults to "div". */
  as?: keyof JSX.IntrinsicElements
  className?: string
  /**
   * Pointer-tracked specular highlight. GSAP quickTo drives --spot-x/--spot-y
   * on the root element; disabled on touch devices and under
   * prefers-reduced-motion via gsap.matchMedia().
   */
  interactive?: boolean
  /**
   * Liquid refraction: applies the shared #glass-distortion SVG filter to a
   * dedicated backdrop layer (never to children — text stays crisp).
   */
  distort?: boolean
  children?: ReactNode
}

/**
 * Liquid Glass surface primitive.
 *
 * Base look: backdrop blur + saturation, ~5% white fill, specular top edge /
 * dark bottom edge via inset shadows, and a 1px gradient border painted on a
 * masked ::before ring. The optional refraction backdrop is the only extra
 * DOM layer; the interactive spot lives on ::after.
 *
 * Drop-in for any shape: nav bars, cards, pills — override radius/padding
 * via className (tailwind-merge resolves conflicts with the rounded-2xl default).
 */
export function Glass({
  as = "div",
  className,
  interactive = false,
  distort = false,
  children,
  ...rest
}: GlassProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const Comp = as as ElementType

  useGSAP(
    () => {
      if (!interactive) return
      const el = rootRef.current
      if (!el) return

      const mm = gsap.matchMedia()

      // Fine pointer + hover only, and never under reduced motion.
      mm.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const xTo = gsap.quickTo(el, "--spot-x", { duration: 0.35, ease: "power3.out" })
          const yTo = gsap.quickTo(el, "--spot-y", { duration: 0.35, ease: "power3.out" })
          const oTo = gsap.quickTo(el, "--spot-opacity", { duration: 0.3, ease: "power2.out" })

          const onEnter = (e: PointerEvent) => {
            const r = el.getBoundingClientRect()
            // Snap to the entry point (px units also let quickTo infer units),
            // then only the glow fades in — no sweep from a stale position.
            gsap.set(el, {
              "--spot-x": `${e.clientX - r.left}px`,
              "--spot-y": `${e.clientY - r.top}px`,
            })
            oTo(1)
          }
          const onMove = (e: PointerEvent) => {
            const r = el.getBoundingClientRect()
            xTo(e.clientX - r.left)
            yTo(e.clientY - r.top)
          }
          const onLeave = () => oTo(0)

          el.addEventListener("pointerenter", onEnter)
          el.addEventListener("pointermove", onMove)
          el.addEventListener("pointerleave", onLeave)

          return () => {
            el.removeEventListener("pointerenter", onEnter)
            el.removeEventListener("pointermove", onMove)
            el.removeEventListener("pointerleave", onLeave)
          }
        }
      )
    },
    { scope: rootRef, dependencies: [interactive] }
  )

  return (
    <Comp
      ref={rootRef}
      className={cn(
        "glass rounded-2xl",
        !distort && "glass-frost",
        interactive && "glass-interactive",
        className
      )}
      {...rest}
    >
      {distort && <span aria-hidden className="glass-refraction" />}
      {children}
    </Comp>
  )
}
