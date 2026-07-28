"use client"

import { useCallback, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ArrowUpRight, X } from "lucide-react"
import { Glass } from "@/components/glass/Glass"
import type { ProjectClient } from "@/lib/content"

gsap.registerPlugin(useGSAP)

/**
 * ClientGalleryModal — the overlay that opens off the Nouvo Clients card.
 *
 * A glass panel over a blurred espresso scrim that lists real, live client
 * sites: each row carries the client name (cream, font-display), the kind of
 * site (mono, muted), and a `visit ↗` link that opens in a new tab. The panel
 * closes on a muted mono line, "There's more. This is not all." because the
 * gallery is a slice, not the whole studio.
 *
 * Accessibility: role="dialog" + aria-modal, labelled by its heading. Escape
 * and a backdrop click both close it; focus moves into the panel on open and
 * returns to the trigger on close; Tab is trapped inside the dialog. Body
 * scroll is locked while open.
 *
 * Motion: GSAP entrance (scrim blurs/fades in, panel scales + fades up) wrapped
 * in matchMedia. The reduced-motion branch lands the final state instantly. On
 * close the parent unmounts us, so the exit is handled by the parent's flag;
 * we keep the open animation self-contained.
 */
export function ClientGalleryModal({
  title,
  clients,
  onClose,
  triggerRef,
}: {
  title: string
  clients: readonly ProjectClient[]
  onClose: () => void
  triggerRef?: React.RefObject<HTMLElement | null>
}) {
  const scrimRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  // Close and hand focus back to whatever opened us.
  const close = useCallback(() => {
    onClose()
    triggerRef?.current?.focus()
  }, [onClose, triggerRef])

  // Lock body scroll while the modal is open; restore on unmount.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // Escape to close + a simple focus trap around the panel's tabbables.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== "Tab") return
      const panel = panelRef.current
      if (!panel) return
      const tabbables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (tabbables.length === 0) return
      const first = tabbables[0]
      const last = tabbables[tabbables.length - 1]
      const active = document.activeElement
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [close])

  useGSAP(() => {
    const scrim = scrimRef.current
    const panel = panelRef.current
    if (!scrim || !panel) return

    // Move focus into the panel once it exists.
    closeBtnRef.current?.focus()

    const mm = gsap.matchMedia()
    mm.add(
      {
        animate: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { animate } = ctx.conditions as { animate: boolean }
        if (!animate) {
          gsap.set(scrim, { opacity: 1 })
          gsap.set(panel, { opacity: 1, y: 0, scale: 1 })
          return
        }
        gsap.fromTo(
          scrim,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: "power2.out" }
        )
        gsap.fromTo(
          panel,
          { opacity: 0, y: 24, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }
        )
        const rows = gsap.utils.toArray<HTMLElement>("[data-client-row]", panel)
        gsap.fromTo(
          rows,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power3.out",
            stagger: 0.06,
            delay: 0.12,
          }
        )
      }
    )
    return () => mm.revert()
  }, { scope: scrimRef })

  const headingId = "nouvo-gallery-title"

  const modal = (
    <div
      ref={scrimRef}
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-background/70 px-4 py-6 backdrop-blur-md sm:items-center sm:py-10"
      onMouseDown={(e) => {
        // Backdrop click closes; clicks inside the panel do not bubble here.
        if (e.target === e.currentTarget) close()
      }}
    >
      <Glass
        as="div"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        ref={panelRef as React.Ref<HTMLDivElement>}
        className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8"
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
              Nouvo studio
            </span>
            <h2
              id={headingId}
              className="mt-2 font-display uppercase leading-[0.94] tracking-[-0.01em] text-foreground"
              style={{ fontSize: "clamp(30px, 5vw, 44px)" }}
            >
              {title}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={close}
            aria-label="Close gallery"
            className="relative z-10 -mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.08] hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* client list */}
        <ul className="mt-6 flex flex-col divide-y divide-border/70">
          {clients.map((client) => (
            <li
              key={client.url}
              data-client-row
              className="flex items-center justify-between gap-4 py-3.5 first:pt-0"
            >
              <div className="min-w-0">
                <p className="truncate font-display uppercase leading-tight tracking-[-0.01em] text-foreground/95 text-lg sm:text-xl">
                  {client.name}
                </p>
                <p className="mt-0.5 font-mono text-[11px] lowercase tracking-[0.1em] text-muted-foreground">
                  {client.kind}
                </p>
              </div>
              <a
                href={client.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/visit inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-foreground/[0.03] px-3.5 py-2 font-mono text-xs lowercase tracking-[0.08em] text-primary transition-colors hover:border-primary/40 hover:bg-foreground/[0.06]"
              >
                visit
                <ArrowUpRight
                  size={13}
                  className="transition-transform duration-300 group-hover/visit:translate-x-0.5 group-hover/visit:-translate-y-0.5"
                />
              </a>
            </li>
          ))}
        </ul>

        {/* the closing note */}
        <p className="mt-6 border-t border-border/70 pt-5 font-mono text-xs lowercase tracking-[0.12em] text-muted-foreground/70">
          There&rsquo;s more. This is not all.
        </p>
      </Glass>
    </div>
  )

  // Portal to body so the fixed overlay escapes any transformed/clipped
  // ancestor (the tilt wrapper + Glass overflow-hidden on the card).
  if (typeof document === "undefined") return null
  return createPortal(modal, document.body)
}
