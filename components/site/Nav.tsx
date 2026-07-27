"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { Flip } from "gsap/Flip"
import { useGSAP } from "@gsap/react"
import { Menu, X } from "lucide-react"
import { Glass } from "@/components/glass/Glass"
import { cn } from "@/lib/utils"

gsap.registerPlugin(useGSAP, Flip)

const LINKS = [
  { href: "/work", label: "work" },
  { href: "/projects", label: "projects" },
  { href: "/chat", label: "chat" },
] as const

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Nav() {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement | null>(null)
  const indicatorRef = useRef<HTMLSpanElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const firstMobileLinkRef = useRef<HTMLAnchorElement | null>(null)
  // First paint must snap the underline into place; only route CHANGES animate.
  // Without this the indicator flies from a full-width box on hard load.
  const hasMounted = useRef(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Slide the accent underline between links on route change using GSAP Flip.
  useGSAP(
    () => {
      const indicator = indicatorRef.current
      const nav = navRef.current
      if (!indicator || !nav) return

      const active = nav.querySelector<HTMLElement>('[data-nav-link][data-active="true"]')

      if (!active) {
        indicator.style.opacity = "0"
        return
      }

      const state = Flip.getState(indicator)
      // Re-parent the indicator into the active link so its measured box
      // matches that link, then Flip animates from the captured position.
      active.appendChild(indicator)
      indicator.style.opacity = "1"

      // First mount: snap into place (no fly-in). Subsequent route changes animate.
      if (!hasMounted.current) {
        hasMounted.current = true
        Flip.from(state, { duration: 0 })
        return
      }

      const mm = gsap.matchMedia()
      mm.add(
        {
          animate: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { animate } = ctx.conditions as { animate: boolean }
          Flip.from(state, {
            duration: animate ? 0.4 : 0,
            ease: "power3.inOut",
            absolute: false,
          })
        }
      )
      return () => mm.revert()
    },
    { scope: navRef, dependencies: [pathname] }
  )

  // Mobile menu a11y: Escape closes, focus moves to first link on open and
  // returns to the toggle on close.
  useEffect(() => {
    if (!menuOpen) return
    firstMobileLinkRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [menuOpen])

  const closeMenu = () => {
    setMenuOpen(false)
    toggleRef.current?.focus()
  }

  return (
    <header
      ref={navRef}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <Glass
        as="nav"
        distort
        className="relative flex w-full max-w-5xl items-center justify-between gap-4 rounded-full px-6 py-3"
      >
        {/* Wordmark — deliberate letterspaced caps, set in the mono face. */}
        <Link
          href="/"
          className="font-mono text-sm uppercase tracking-[0.18em] text-foreground transition-opacity hover:opacity-70"
        >
          Manuel David
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                data-nav-link
                data-active={active}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative px-3 py-2 font-mono text-sm lowercase transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            )
          })}
          {/* Shared sliding accent underline (moved between links via Flip) */}
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-primary"
          />
        </nav>

        {/* Mobile menu trigger */}
        <button
          ref={toggleRef}
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/10 md:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </Glass>

      {/* Mobile menu — rendered OUTSIDE the Glass bar because Glass clips
          overflow (overflow: hidden). Absolute sibling panel. */}
      {menuOpen && (
        <div id="mobile-nav" className="absolute inset-x-4 top-[calc(100%+0.5rem)] md:hidden">
          <Glass className="flex flex-col gap-1 rounded-2xl p-3">
            {LINKS.map((link, i) => {
              const active = isActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={i === 0 ? firstMobileLinkRef : undefined}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-xl px-4 py-3 font-mono text-base lowercase transition-colors",
                    active
                      ? "bg-foreground/5 text-foreground"
                      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {active && (
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                    {link.label}
                  </span>
                </Link>
              )
            })}
          </Glass>
        </div>
      )}
    </header>
  )
}
