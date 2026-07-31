"use client"

import dynamic from "next/dynamic"
import type { CSSProperties } from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import { profile, projects, work } from "@/lib/content"
import styles from "./hero-field.module.css"

/**
 * /1 — THE CONTEXT FIELD
 *
 * His life as a drifting field of words, fixed behind the whole page like
 * the layer he builds for a living. The typography below is plain DOM inside
 * the first HTML response, so the page is readable and selectable well
 * before three.js has finished downloading; the field is imported
 * client-side only underneath it.
 *
 * The hero is ONE typographic unit, not corner furniture: name and role,
 * the claim, what the field is, and the ways to reach him, stacked in a
 * tight column that sits left of centre as the gravitational mass the
 * field orbits. Everything else on screen is the field itself.
 *
 * Resting on any word (hover, focus, or a tap on touch) opens a compact
 * story card anchored right beside it; the card, its timers, and its
 * placement all live inside ContextField.
 */
const ContextField = dynamic(() => import("./ContextField"), { ssr: false })

const links = [
  { label: profile.email, href: `mailto:${profile.email}` },
  { label: "github.com/Manueldav2", href: profile.github },
  { label: profile.xHandle, href: profile.x },
]

const contact = [
  { label: profile.email, href: `mailto:${profile.email}` },
  { label: "Book a call", href: profile.calendar },
  { label: "github.com/Manueldav2", href: profile.github },
  { label: "LinkedIn", href: profile.linkedin },
  { label: profile.xHandle, href: profile.x },
]

/** Stagger budget: 420ms of delay, well inside the 500ms ceiling. */
const at = (ms: number) => ({ "--hf-delay": `${ms}ms` }) as CSSProperties

/** Straight apostrophes in the content file, curly ones on the page. */
const typo = (s: string) => s.replace(/'/g, "’")

const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "")

const byCompany = (name: string) => work.find((w) => w.company === name)

/**
 * Person first: the roles read as one continuous story. Configure and Nouvo
 * run their full arcs. Paradigm renders only its vision paragraph: paragraph
 * 0 (the 200-dollar email batch, the break-fast loop) is told in the field's
 * hover cards instead, and paragraph 2 retells the leap and the context wall
 * that About and Configure already carry. Nothing on the page twice.
 */
const ROLES: { company: string; lead: boolean; paragraphs: number[] | "all" }[] = [
  { company: "Configure", lead: true, paragraphs: [0, 1] },
  { company: "Paradigm", lead: false, paragraphs: [1] },
  { company: "Nouvo", lead: false, paragraphs: "all" },
]

const SELECTED_PROJECTS = [
  "idex",
  "ultron",
  "launch-control",
  "gideon",
  "claude-classroom",
  "claude-skills-sync",
  "ats-resume-optimizer",
  "tripfund",
  "sovereign",
  "nouvo-clients",
]

const selectedProjects = SELECTED_PROJECTS.map((slug) =>
  projects.find((p) => p.slug === slug),
).filter((p): p is (typeof projects)[number] => Boolean(p))

export function HeroField({ className }: { className?: string }) {
  const layerRef = useRef<HTMLDivElement | null>(null)
  // The story card portals here: a mount above the page content, still
  // inside .root so the palette and font variables reach it. The field
  // itself lives in the fixed backdrop, whose stacking context could never
  // lift a card over the hero type.
  const cardMountRef = useRef<HTMLDivElement | null>(null)
  const [verb, setVerb] = useState<"hover" | "tap">("hover")

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) setVerb("tap")
  }, [])

  // Deliberately not React state: flipping state here would re-render the
  // component that owns the canvas.
  const handleReady = useCallback(() => {
    requestAnimationFrame(() => {
      if (layerRef.current) layerRef.current.dataset.ready = "true"
    })
  }, [])

  return (
    <div className={`${styles.root} ${className ?? ""}`}>
      <div className={styles.backdrop}>
        <div className={styles.vignette} />
        <div ref={layerRef} className={styles.canvasLayer} data-ready="false">
          <ContextField
            className={styles.canvasHost}
            onReady={handleReady}
            cardMount={cardMountRef}
          />
        </div>
        <div className={styles.grain} />
      </div>

      <div className={styles.content}>
        <section className={styles.hero}>
          <div className={styles.frame}>
            {/* One block, one keep-out. Identity, claim, the field's own
                caption, and the ways out, set as a single column the field
                drifts around. */}
            <div className={styles.block} data-hf-keepout>
              <header className={`${styles.kicker} ${styles.reveal}`} style={at(0)}>
                <h1 className={styles.kickerName}>{profile.name}</h1>
                <p className={styles.kickerRole}>
                  Founding engineer at{" "}
                  <a
                    className={styles.inlineLink}
                    href={profile.companyUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Configure
                  </a>
                  , San Francisco
                </p>
              </header>

              <p className={`${styles.headline} ${styles.reveal}`} style={at(90)}>
                Welcome to my <em>context page.</em>
              </p>

              <p className={`${styles.deck} ${styles.reveal}`} style={at(210)}>
                Behind this is the context of my life.
              </p>

              <p className={`${styles.invite} ${styles.reveal}`} style={at(290)}>
                {verb === "tap"
                  ? "Tap any word and it will tell you its story."
                  : "Hover any word and it will tell you its story."}
              </p>

              <nav
                className={`${styles.heroLinks} ${styles.reveal}`}
                style={at(370)}
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

            <div className={styles.cue} aria-hidden="true" data-hf-keepout />
          </div>
        </section>

        <main className={styles.reading}>
          {/* ------------------------------------------------------------ */}
          {/* Who he is                                                     */}
          {/* ------------------------------------------------------------ */}
          <section className={styles.chapter} aria-labelledby="mk-about">
            <h2 id="mk-about" className={styles.chapterLead}>
              Who I am, before what I do.
            </h2>
            <div className={styles.chapterBody}>
              <div className={styles.prose}>
                <p className={styles.lede}>{typo(profile.about[0])}</p>
                <p>{typo(profile.about[1])}</p>
                <p>{typo(profile.about[2])}</p>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* The work                                                      */}
          {/* ------------------------------------------------------------ */}
          <section className={styles.chapter} aria-labelledby="mk-work">
            <h2 id="mk-work" className={styles.chapterLead}>
              The work runs in one line: a studio, then a company, then the
              wall that company kept hitting.
            </h2>

            {ROLES.map((role) => {
              const entry = byCompany(role.company)
              if (!entry) return null
              const paragraphs =
                role.paragraphs === "all"
                  ? (entry.story ?? [])
                  : role.paragraphs
                      .map((n) => entry.story?.[n])
                      .filter((p): p is string => Boolean(p))
              return (
                <article
                  key={entry.company}
                  className={styles.entry}
                  data-lead={role.lead ? "true" : undefined}
                >
                  <div className={styles.rail}>
                    <h3 className={styles.entryName}>{entry.company}</h3>
                    <p className={styles.railMeta}>
                      {typo(entry.role)}
                      <br />
                      {entry.dates}
                    </p>
                    {entry.url ? (
                      <a
                        className={styles.railLink}
                        href={entry.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {host(entry.url)}
                      </a>
                    ) : null}
                  </div>

                  <div className={styles.prose}>
                    <p className={styles.lede}>{typo(entry.blurb)}</p>
                    {paragraphs.map((para, n) => (
                      <p key={n}>{typo(para)}</p>
                    ))}
                  </div>
                </article>
              )
            })}
          </section>

          {/* ------------------------------------------------------------ */}
          {/* Selected projects                                             */}
          {/* ------------------------------------------------------------ */}
          <section className={styles.chapter} aria-labelledby="mk-projects">
            <h2 id="mk-projects" className={styles.chapterLead}>
              The rest is public. {profile.projectsTotalLabel} builds so far,
              and these are the ones worth your time.
            </h2>

            <ul className={styles.list}>
              {selectedProjects.map((p) => {
                const href = p.url ?? p.github
                return (
                  <li key={p.slug} className={styles.row}>
                    <span className={styles.rowYear}>{p.year}</span>
                    <h3 className={styles.rowName}>
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer">
                          {p.name}
                        </a>
                      ) : (
                        p.name
                      )}
                    </h3>
                    <p className={styles.rowBlurb}>
                      {typo(p.blurb)}
                      {p.clients ? (
                        <span className={styles.rowNote}>
                          {" "}
                          Check them out at{" "}
                          <a
                            className={styles.rowNoteLink}
                            href="https://nouvo.dev"
                            target="_blank"
                            rel="noreferrer"
                          >
                            nouvo.dev
                          </a>
                          .
                        </span>
                      ) : null}
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* Close                                                         */}
          {/* ------------------------------------------------------------ */}
          <section className={styles.chapter} aria-labelledby="mk-close">
            <h2 id="mk-close" className={styles.chapterLead}>
              Where I think all of it is going.
            </h2>

            <div className={styles.close}>
              <div className={styles.prose}>
                <p className={styles.lede}>{typo(profile.about[4])}</p>
              </div>

              <aside className={styles.closeAside}>
                <p className={styles.closeNote}>
                  Open to the interesting version of this conversation.
                </p>
                <div className={styles.closeLinks}>
                  {contact.map((link) => (
                    <a
                      key={link.href}
                      className={styles.link}
                      href={link.href}
                      target={
                        link.href.startsWith("mailto:") ? undefined : "_blank"
                      }
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </aside>
            </div>

            <p className={styles.colophon}>
              <span>{profile.name}, San Francisco</span>
              <span>Set in Newsreader and IBM Plex Sans</span>
            </p>
          </section>
        </main>
      </div>

      {/* Story card mount; see cardMountRef above. */}
      <div ref={cardMountRef} />
    </div>
  )
}
