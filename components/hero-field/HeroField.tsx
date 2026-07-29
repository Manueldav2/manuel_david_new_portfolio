"use client"

import dynamic from "next/dynamic"
import type { CSSProperties } from "react"
import { useEffect, useRef, useState } from "react"

import { profile, projects, work } from "@/lib/content"
import { KIND_LABEL, neighbours, nodeById } from "./graph"
import styles from "./hero-field.module.css"

/**
 * /1 — THE CONTEXT MAP
 *
 * His life as a connected web, fixed behind the whole page like the layer he
 * builds for a living. The type is plain DOM in the first HTML response and
 * floats over the web; the map itself is client-only underneath it. Clicking
 * a node opens a floating story panel that follows you anywhere on the page.
 */
const Mind = dynamic(() => import("./Mind"), { ssr: false })

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

const contact = [
  { label: profile.email, href: `mailto:${profile.email}` },
  { label: "Book a call", href: profile.calendar },
  { label: "github.com/Manueldav2", href: profile.github },
  { label: "LinkedIn", href: profile.linkedin },
  { label: profile.xHandle, href: profile.x },
]

/**
 * The floating story panel. Fixed to the lower right (a bottom sheet on
 * phones), so a story reads the same whether you clicked a node at the top
 * of the web or halfway down the page. Solid ink, hairline border, no blur.
 */
function StoryPanel({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  const node = selected ? nodeById.get(selected) : undefined

  return (
    <div className={styles.panelWrap} aria-live="polite">
      {node ? (
        <aside key={node.id} className={styles.panel}>
          <p className={styles.panelKind}>{KIND_LABEL[node.kind]}</p>
          <p className={styles.panelTitle}>{node.label}</p>
          <p className={styles.panelStory}>{node.story}</p>
          {node.link ? (
            <p className={styles.panelMeta}>
              <a
                className={styles.panelLink}
                href={node.link.href}
                target="_blank"
                rel="noreferrer"
              >
                {node.link.label}
              </a>
            </p>
          ) : null}
          <p className={styles.panelRelated}>
            <span className={styles.panelRelatedWord}>connected to</span>
            {(neighbours.get(node.id) ?? []).map((id) => {
              const n = nodeById.get(id)
              if (!n) return null
              return (
                <button
                  key={id}
                  type="button"
                  className={styles.panelChip}
                  onClick={() => onSelect(id)}
                >
                  {n.label}
                </button>
              )
            })}
          </p>
          <button
            type="button"
            className={styles.panelClose}
            onClick={() => onSelect(null)}
          >
            close
          </button>
        </aside>
      ) : null}
    </div>
  )
}

const HINT_KEY = "hf-map-hint-done"

export function HeroField({ className }: { className?: string }) {
  const [selected, setSelected] = useState<string | null>(null)
  // null = not yet known (avoids a server/client flash); the hint renders
  // only once we know this visitor has never opened a node.
  const [hintDone, setHintDone] = useState<boolean | null>(null)
  const [verb, setVerb] = useState("click")
  const introRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    try {
      setHintDone(window.localStorage.getItem(HINT_KEY) === "1")
    } catch {
      setHintDone(false)
    }
    if (window.matchMedia("(hover: none)").matches) setVerb("tap")
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const select = (id: string | null) => {
    setSelected(id)
    if (id && hintDone === false) {
      setHintDone(true)
      try {
        window.localStorage.setItem(HINT_KEY, "1")
      } catch {
        /* private mode; the hint just returns next visit */
      }
    }
  }

  return (
    <div className={`${styles.root} ${className ?? ""}`}>
      {/* The map: fixed behind everything, spanning the viewport. */}
      <Mind selected={selected} onSelect={select} keepOut={introRef} />

      <section className={styles.hero}>
        <div className={styles.heroScrim} aria-hidden="true" />

        <div className={styles.intro} ref={introRef}>
          <header>
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
              . San Francisco.
            </p>
          </header>

          <p className={`${styles.headline} ${styles.reveal}`} style={at(160)}>
            I could see where everything was heading, and I refused to miss
            it.
          </p>

          <p className={`${styles.deck} ${styles.reveal}`} style={at(260)}>
            So I dropped out of college, moved to a city I had never set foot
            in, and started building. First a studio, then a company, then
            the problem I could not stop hitting.
          </p>

          <p className={`${styles.mapNote} ${styles.reveal}`} style={at(340)}>
            The web behind this page is my context map. Every node is a real
            piece of my life, every string is cause and effect. Pick one and
            I’ll tell you the story.
          </p>

          <nav
            className={`${styles.links} ${styles.reveal}`}
            style={at(430)}
            aria-label="Elsewhere"
          >
            <a className={styles.link} href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <a
              className={styles.link}
              href={profile.github}
              target="_blank"
              rel="noreferrer"
            >
              github.com/Manueldav2
            </a>
            <a
              className={styles.link}
              href={profile.x}
              target="_blank"
              rel="noreferrer"
            >
              {profile.xHandle}
            </a>
          </nav>
        </div>

        {/* Names the layer, and invites the first click. The hint line
            retires forever after the first node is opened. */}
        <div
          className={`${styles.mapTag} ${styles.reveal}`}
          style={at(600)}
          aria-hidden="true"
        >
          <span className={styles.mapTagName}>my context map</span>
          {hintDone === false ? (
            <span className={styles.mapTagHint}>
              {verb} a node for its story
            </span>
          ) : null}
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

      <StoryPanel selected={selected} onSelect={select} />
    </div>
  )
}
