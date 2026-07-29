"use client"

import dynamic from "next/dynamic"
import type { CSSProperties } from "react"
import { useCallback, useRef } from "react"

import { profile } from "@/lib/content"
import styles from "./hero-field.module.css"

/**
 * The field is imported client-side only. The typography below is plain
 * DOM inside the first HTML response, so the page is readable and
 * selectable well before three.js has finished downloading.
 */
const ContextField = dynamic(() => import("./ContextField"), { ssr: false })

const links = [
  { label: profile.email, href: `mailto:${profile.email}` },
  { label: "github.com/Manueldav2", href: profile.github },
  { label: profile.xHandle, href: profile.x },
]

/** Stagger budget: 420ms total, well inside the 500ms ceiling. */
const at = (ms: number) => ({ "--hf-delay": `${ms}ms` }) as CSSProperties

export function HeroField({ className }: { className?: string }) {
  const layerRef = useRef<HTMLDivElement | null>(null)

  // Deliberately not React state: flipping state here would re-render the
  // component that owns the canvas.
  const handleReady = useCallback(() => {
    requestAnimationFrame(() => {
      if (layerRef.current) layerRef.current.dataset.ready = "true"
    })
  }, [])

  return (
    <div className={`${styles.root} ${className ?? ""}`}>
      <div className={styles.vignette} />
      <div ref={layerRef} className={styles.canvasLayer} data-ready="false">
        <ContextField className={styles.canvasHost} onReady={handleReady} />
      </div>
      <div className={styles.grain} />

      <div className={styles.frame}>
        <header className={styles.identity}>
          <h1 className={`${styles.name} ${styles.reveal}`} style={at(0)}>
            {profile.name}
          </h1>
          <p className={`${styles.role} ${styles.reveal}`} style={at(70)}>
            Founding engineer at{" "}
            <a
              className={styles.inlineLink}
              href={profile.companyUrl}
              target="_blank"
              rel="noreferrer"
            >
              Configure
            </a>
          </p>
        </header>

        <p className={`${styles.place} ${styles.reveal}`} style={at(140)}>
          San Francisco
        </p>

        <div className={styles.statement}>
          <p className={`${styles.headline} ${styles.reveal}`} style={at(230)}>
            The layer that lets any agent recognize you.
          </p>
          <p className={`${styles.deck} ${styles.reveal}`} style={at(330)}>
            I build context infrastructure at Configure. One profile you own,
            carried between every agent you use, so nothing you touch has to
            start from zero. <em>Think Plaid, but for personal context.</em>
          </p>
        </div>

        <nav
          className={`${styles.links} ${styles.reveal}`}
          style={at(420)}
          aria-label="Elsewhere"
        >
          {links.map((link) => (
            <a
              key={link.href}
              className={styles.link}
              href={link.href}
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
