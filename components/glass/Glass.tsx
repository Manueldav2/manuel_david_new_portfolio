"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
} from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP)

/**
 * Only Chromium renders `filter: url(#…)` applied on top of an element's
 * backdrop-filter as a distortion of that backdrop — WebKit and Firefox drop
 * the backdrop blur entirely on such a layer (verified via Playwright across
 * all three engines). The combination isn't feature-detectable (every engine
 * *parses* it), so we fingerprint Chromium via its proprietary
 * -webkit-app-region property. Cached module-wide; never called during SSR.
 */
let distortSupport: boolean | null = null
function supportsBackdropDistortion(): boolean {
  if (distortSupport === null) {
    distortSupport =
      typeof CSS !== "undefined" && CSS.supports("-webkit-app-region", "drag")
  }
  return distortSupport
}

interface GlassOwnProps {
  className?: string
  /**
   * Pointer-tracked specular highlight. GSAP quickTo drives --spot-x/--spot-y
   * on the root element; disabled on touch devices and under
   * prefers-reduced-motion via gsap.matchMedia(). Spot radius is themable
   * via the --spot-size CSS var (default 180px).
   */
  interactive?: boolean
  /**
   * Liquid refraction: applies the shared #glass-distortion SVG filter to a
   * dedicated backdrop layer (never to children — text stays crisp).
   * Use for hero/nav surfaces; prefer plain frost for card grids — the SVG
   * displacement re-rasterizes on scroll and gets expensive with many
   * instances on screen. Distortion is Chromium-only; other engines keep
   * the plain frosted blur.
   */
  distort?: boolean
  children?: ReactNode
}

export type GlassProps<T extends ElementType = "div"> = GlassOwnProps & {
  /** Element to render as. Defaults to "div". */
  as?: T
} & Omit<ComponentPropsWithoutRef<T>, keyof GlassOwnProps | "as">

/**
 * Liquid Glass surface primitive.
 *
 * Base look: backdrop blur + saturation, ~5% white fill, specular top edge /
 * dark bottom edge via inset shadows, and a 1px gradient border painted on a
 * masked ::before ring. The optional refraction backdrop is the only extra
 * DOM layer; the interactive spot lives on ::after.
 *
 * Polymorphic + ref-forwarding: `<Glass as="a" href="...">` and
 * `<Glass as="button" type="button" ref={...}>` type-check against the
 * rendered element. Drop-in for any shape: nav bars, cards, pills — override
 * radius/padding via className (tailwind-merge resolves conflicts with the
 * rounded-2xl default).
 */
function GlassImpl<T extends ElementType = "div">(
  {
    as,
    className,
    interactive = false,
    distort = false,
    children,
    ...rest
  }: GlassProps<T>,
  forwardedRef: ForwardedRef<HTMLElement>
) {
  const rootRef = useRef<HTMLElement | null>(null)
  const Comp = (as ?? "div") as ElementType

  // SSR and non-Chromium engines render plain frost on the root (safe
  // everywhere); Chromium upgrades to the displacement layer after hydration.
  // Same blur value either way, so the swap is visually seamless.
  const [canDistort, setCanDistort] = useState(false)
  useEffect(() => {
    if (distort) setCanDistort(supportsBackdropDistortion())
  }, [distort])
  const distortActive = distort && canDistort

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node
      if (typeof forwardedRef === "function") forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    },
    [forwardedRef]
  )

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
          const spotVars = { duration: 0.35, ease: "power3.out" } as const
          const oTo = gsap.quickTo(el, "--spot-opacity", { duration: 0.3, ease: "power2.out" })
          // Positional quickTos are (re)created on each pointerenter: killing
          // an in-flight quickTo tween permanently breaks it (resetTo on a
          // dead tween no-ops), so kill-then-recreate is the reliable way to
          // stop a previous hover's tween from fighting the snap below.
          let xTo: ReturnType<typeof gsap.quickTo> | null = null
          let yTo: ReturnType<typeof gsap.quickTo> | null = null

          const onEnter = (e: PointerEvent) => {
            gsap.killTweensOf(el, "--spot-x,--spot-y")
            const r = el.getBoundingClientRect()
            // Snap to the entry point (px units also let quickTo infer units),
            // then only the glow fades in — no sweep from a stale position.
            gsap.set(el, {
              "--spot-x": `${e.clientX - r.left}px`,
              "--spot-y": `${e.clientY - r.top}px`,
            })
            xTo = gsap.quickTo(el, "--spot-x", spotVars)
            yTo = gsap.quickTo(el, "--spot-y", spotVars)
            oTo(1)
          }
          const onMove = (e: PointerEvent) => {
            if (!xTo || !yTo) return
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
            // quickTos created inside event handlers live outside the GSAP
            // context — kill them explicitly.
            gsap.killTweensOf(el, "--spot-x,--spot-y")
          }
        }
      )
    },
    { scope: rootRef, dependencies: [interactive] }
  )

  return (
    <Comp
      ref={setRefs}
      className={cn(
        "glass rounded-2xl",
        !distortActive && "glass-frost",
        interactive && "glass-interactive",
        className
      )}
      {...rest}
    >
      {distortActive && <span aria-hidden className="glass-refraction" />}
      {children}
    </Comp>
  )
}

/**
 * Generic polymorphic forwardRef: the cast is the standard pattern — React's
 * forwardRef signature can't carry the type parameter through, so the export
 * restores it.
 */
export const Glass = forwardRef(GlassImpl) as unknown as (<
  T extends ElementType = "div",
>(
  props: GlassProps<T> & { ref?: ComponentPropsWithRef<T>["ref"] }
) => ReactElement | null) & { displayName?: string }

Glass.displayName = "Glass"
