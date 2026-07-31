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
 * Resting on a storied word (hover, focus, or a tap on touch) opens a
 * compact story card anchored right beside it; the card, its timers, and
 * its placement all live inside ContextField. This component carries the
 * page, the hero frame, and the hint.
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
 * run their full arcs; Paradigm keeps the two paragraphs that are not
 * already retold elsewhere on the page.
 */
const ROLES: { company: string; lead: boolean; paragraphs: number[] | "all" }[] = [
  { company: "Configure", lead: true, paragraphs: [0, 1] },
  { company: "Paradigm", lead: false, paragraphs: [0, 2] },
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

const HINT_KEY = "hf-map-hint-done"

export function HeroField({ className }: { className?: string }) {
  const layerRef = useRef<HTMLDivElement | null>(null)
  // The story card portals here: a mount above the page content, still
  // inside .root so the palette and font variables reach it. The field
  // itself lives in the fixed backdrop, whose stacking context could never
  // lift a card over the hero type.
  const cardMountRef = useRef<HTMLDivElement | null>(null)
  // null = not yet known (avoids a server/client flash); the hint renders
  // only once we know this visitor has never opened a card.
  const [hintDone, setHintDone] = useState<boolean | null>(null)
  const [verb, setVerb] = useState<"hover" | "tap">("hover")

  useEffect(() => {
    try {
      setHintDone(window.localStorage.getItem(HINT_KEY) === "1")
    } catch {
      setHintDone(false)
    }
    if (window.matchMedia("(hover: none)").matches) setVerb("tap")
  }, [])

  // Deliberately not React state: flipping state here would re-render the
  // component that owns the canvas.
  const handleReady = useCallback(() => {
    requestAnimationFrame(() => {
      if (layerRef.current) layerRef.current.dataset.ready = "true"
    })
  }, [])

  /** A card opened; the hint has done its job, forever. */
  const markOpened = useCallback(() => {
    setHintDone(true)
    try {
      window.localStorage.setItem(HINT_KEY, "1")
    } catch {
      /* private mode; the hint just returns next visit */
    }
  }, [])

  return (
    <div className={`${styles.root} ${className ?? ""}`}>
      <div className={styles.backdrop}>
        <div className={styles.vignette} />
        <div ref={layerRef} className={styles.canvasLayer} data-ready="false">
          <ContextField
            className={styles.canvasHost}
            onReady={handleReady}
            onOpen={markOpened}
            cardMount={cardMountRef}
          />
        </div>
        <div className={styles.grain} />
      </div>

      <div className={styles.content}>
        <section className={styles.hero}>
          <div className={styles.frame}>
            <header className={styles.identity} data-hf-keepout>
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

            <p
              className={`${styles.place} ${styles.reveal}`}
              style={at(140)}
              data-hf-keepout
            >
              San Francisco
            </p>

            <div className={styles.statement} data-hf-keepout>
              <p className={`${styles.headline} ${styles.reveal}`} style={at(230)}>
                I could see where everything was heading, and I refused to
                miss it.
              </p>
              <p className={`${styles.deck} ${styles.reveal}`} style={at(330)}>
                So I dropped out of college, moved to a city I had never set
                foot in, and started building. First a studio, then a company,
                then the problem I could not stop hitting.
              </p>
              <p className={`${styles.mapNote} ${styles.reveal}`} style={at(400)}>
                The words behind this page are my context map, real pieces of
                my life set adrift.{" "}
                {verb === "tap"
                  ? "Tap one and I’ll tell you the story."
                  : "Hover one and I’ll tell you the story."}
              </p>
            </div>

            <div
              className={`${styles.corner} ${styles.reveal}`}
              style={at(420)}
              data-hf-keepout
            >
              {/* Names the layer, and invites the first hover (tap on
                  touch). The hint retires after the first card opens. */}
              <div className={styles.mapTag} aria-hidden="true">
                <span className={styles.mapTagName}>my context map</span>
                {hintDone === false ? (
                  <span className={styles.mapTagHint}>
                    {verb} a word for its story
                  </span>
                ) : null}
              </div>

              <nav className={styles.links} aria-label="Elsewhere">
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
