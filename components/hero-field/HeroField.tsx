"use client"

import dynamic from "next/dynamic"
import type { CSSProperties } from "react"
import { useState } from "react"

import { profile, projects, work } from "@/lib/content"
import { KIND_LABEL, neighbours, nodeById } from "./graph"
import styles from "./hero-field.module.css"

/**
 * /1 — THE MIND
 *
 * His life as a connected graph, drawn as a two-lobed volume that reads as a
 * head. The type is plain DOM in the first HTML response; the mind itself is
 * client-only underneath it.
 */
const Mind = dynamic(() => import("./Mind"), { ssr: false })

const at = (ms: number) => ({ "--hf-delay": `${ms}ms` }) as CSSProperties

/** Straight apostrophes in the content file, curly ones on the page. */
const typo = (s: string) => s.replace(/'/g, "’")

const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "")

const byCompany = (name: string) => work.find((w) => w.company === name)

/**
 * Person first: the roles read as one continuous story, Configure fullest
 * because it is current, Nouvo shortest because it is oldest.
 */
const ROLES = [
  { company: "Configure", lead: true, paragraphs: [0, 1] },
  { company: "Paradigm", lead: false, paragraphs: [0, 2] },
  { company: "Nouvo", lead: false, paragraphs: [0] },
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

function StoryPanel({
  selected,
  onSelect,
}: {
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  const node = selected ? nodeById.get(selected) : undefined

  return (
    <div className={styles.panelSlot} aria-live="polite">
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
      ) : (
        <aside className={styles.panel} data-empty="true">
          <p className={styles.panelHint}>
            Every node on this map is a real piece of my life, and every line
            is cause and effect. Select one and I’ll tell you the story behind
            it.
          </p>
        </aside>
      )}
    </div>
  )
}

export function HeroField({ className }: { className?: string }) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className={`${styles.root} ${className ?? ""}`}>
      <section className={styles.hero}>
        <div className={styles.intro}>
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
            in, and started building. First a studio, then a company, then the
            problem I could not stop hitting. This map is my head: how one
            decision led to the next.
          </p>

          <nav
            className={`${styles.links} ${styles.reveal}`}
            style={at(350)}
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

          <div className={styles.reveal} style={at(430)}>
            <StoryPanel selected={selected} onSelect={setSelected} />
          </div>
        </div>

        <div className={styles.mindWrap}>
          <Mind selected={selected} onSelect={setSelected} />
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
                        {p.clients.length} of them are live right now.
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
  )
}
