"use client"

import dynamic from "next/dynamic"
import type { CSSProperties } from "react"
import { useCallback, useRef } from "react"

import { profile, projects, work } from "@/lib/content"
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

const contact = [
  { label: profile.email, href: `mailto:${profile.email}` },
  { label: "Book a call", href: profile.calendar },
  { label: "github.com/Manueldav2", href: profile.github },
  { label: "LinkedIn", href: profile.linkedin },
  { label: profile.xHandle, href: profile.x },
]

/** Stagger budget: 420ms total, well inside the 500ms ceiling. */
const at = (ms: number) => ({ "--hf-delay": `${ms}ms` }) as CSSProperties

/**
 * Straight apostrophes in the content file, curly ones on the page. Covers
 * possessives that end a word ("my agents' home base") as well as
 * contractions, which a letter-quote-letter rule misses.
 */
const typo = (s: string) => s.replace(/'/g, "’")

const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "")

const byCompany = (name: string) => work.find((w) => w.company === name)

/**
 * How much of each role's story the page tells. Configure is current and gets
 * the most room; Nouvo is the oldest and gets a paragraph. Deliberately not
 * uniform: an identical block per job is the shape of a template, not of
 * three things that mattered different amounts.
 */
const ROLES = [
  { company: "Configure", lead: true, paragraphs: [0, 1] },
  { company: "Paradigm", lead: false, paragraphs: [0, 2] },
  { company: "Nouvo", lead: false, paragraphs: [0] },
]

const SELECTED = [
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

const selectedProjects = SELECTED.map((slug) =>
  projects.find((p) => p.slug === slug),
).filter((p): p is (typeof projects)[number] => Boolean(p))

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
      <div className={styles.backdrop}>
        <div className={styles.vignette} />
        <div ref={layerRef} className={styles.canvasLayer} data-ready="false">
          <ContextField className={styles.canvasHost} onReady={handleReady} />
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
              data-hf-keepout
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

            <div className={styles.cue} aria-hidden="true" data-hf-keepout />
          </div>
        </section>

        <main className={styles.reading}>
          {/* ---------------------------------------------------------- */}
          {/* The work                                                    */}
          {/* ---------------------------------------------------------- */}
          <section className={styles.chapter} aria-labelledby="hf-work">
            <h2 id="hf-work" className={styles.chapterLead}>
              Three things running at once. One of them exists because of a
              wall I kept hitting in the other two.
            </h2>

            {ROLES.map((role) => {
              const entry = byCompany(role.company)
              if (!entry) return null
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
                    {role.paragraphs.map((n) => {
                      const para = entry.story?.[n]
                      return para ? <p key={n}>{typo(para)}</p> : null
                    })}
                  </div>
                </article>
              )
            })}
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Selected work                                               */}
          {/* ---------------------------------------------------------- */}
          <section className={styles.chapter} aria-labelledby="hf-projects">
            <h2 id="hf-projects" className={styles.chapterLead}>
              The rest of it is public. {profile.projectsTotalLabel} builds so
              far, and these are the ones worth your time.
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
                          {p.clients.length} of them are live right now.
                        </span>
                      ) : null}
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Close                                                       */}
          {/* ---------------------------------------------------------- */}
          <section className={styles.chapter} aria-labelledby="hf-close">
            <h2 id="hf-close" className={styles.chapterLead}>
              Why I care about this one thing more than anything else I have
              built.
            </h2>

            <div className={styles.close}>
              <div className={styles.prose}>
                <p className={styles.lede}>{typo(profile.about[4])}</p>
                <p>
                  Everything drifting behind this page is read out of the same
                  file the page is written from. Sweep your cursor through it
                  and scattered pieces of a person link up, hold for a second,
                  then get forgotten. That is the problem in one gesture. Right
                  now every agent you touch starts from nothing, every single
                  time. It should not have to.
                </p>
              </div>

              <aside className={styles.closeAside}>
                <p style={{ margin: 0 }}>
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
    </div>
  )
}
