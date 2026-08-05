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
 * The personal plates. Five photographs set in the same figure language as
 * the project screenshots: hairline frame, small mono caption. Each one sits
 * beside the prose it belongs to, never in a gallery. The portraits are
 * EXIF-rotated (stored landscape, displayed upright), so width/height here
 * are the DISPLAYED dimensions the browser resolves them to.
 */
type Photo = {
  src: string
  alt: string
  caption: string
  width: number
  height: number
}

const PHOTOS = {
  beach: {
    src: "/photos/beach.jpg",
    alt: "Manuel walking barefoot on a beach at sunset, hands in his pockets, smiling",
    caption: "Off the clock.",
    width: 1050,
    height: 1400,
  },
  antler: {
    src: "/photos/antler.jpg",
    alt: "Manuel standing in front of the Antler wall in San Francisco",
    caption: "Antler, San Francisco.",
    width: 1050,
    height: 1400,
  },
  openai: {
    src: "/photos/openai.jpg",
    alt: "Manuel in front of a giant screen reading OpenAI Voice Hack Night",
    caption: "Voice Hack Night at OpenAI.",
    width: 1400,
    height: 1050,
  },
  buildDay: {
    src: "/photos/claude-build-day.jpg",
    alt: "Manuel on stage in front of the Claude Build Day screen, June 13, San Francisco",
    caption: "Build Day, where Launch Control was born.",
    width: 1050,
    height: 1400,
  },
  optimus: {
    src: "/photos/optimus.jpg",
    alt: "Manuel grinning next to Tesla’s Optimus humanoid robot in a showroom",
    caption: "Meeting Optimus.",
    width: 1050,
    height: 1400,
  },
} satisfies Record<string, Photo>

/**
 * One plate series for the whole page, numbered in document order: the
 * beach (01), Antler (02), Voice Hack Night (03), the five project shots
 * (04 to 08), Build Day beside the Launch Control plate (09), and Optimus
 * at the close (10). PLATE_FIG_BASE keeps the project plates in sequence.
 */
const FIG = { beach: 1, antler: 2, openai: 3, buildDay: 9, optimus: 10 }
const PLATE_FIG_BASE = 4

function PhotoFigure({
  photo,
  fig,
  className,
}: {
  photo: Photo
  fig: number
  className?: string
}) {
  return (
    <figure className={`${styles.photoFigure} ${className ?? ""}`}>
      <img
        className={styles.plateImg}
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading="lazy"
        decoding="async"
      />
      <figcaption className={styles.plateCaption}>
        <span className={styles.photoCaptionFig}>
          fig. {String(fig).padStart(2, "0")}
        </span>
        <span className={styles.photoCaptionText}>{photo.caption}</span>
      </figcaption>
    </figure>
  )
}

/**
 * Person first: the roles read as one continuous story. Configure and Nouvo
 * run their full arcs. Paradigm renders only its vision paragraph: paragraph
 * 0 (the 200-dollar email batch, the break-fast loop) is told in the field's
 * hover cards instead, and paragraph 2 retells the leap and the context wall
 * that About and Configure already carry. Nothing on the page twice.
 *
 * Paradigm carries the founder-era photographs: Antler in the rail under
 * the meta, and the OpenAI voice night closing its prose, since the voice
 * demos are that company's whole thesis.
 */
const ROLES: {
  company: string
  lead: boolean
  paragraphs: number[] | "all"
  railPhoto?: keyof typeof PHOTOS
  prosePhoto?: keyof typeof PHOTOS
}[] = [
  { company: "Configure", lead: true, paragraphs: [0, 1] },
  {
    company: "Paradigm",
    lead: false,
    paragraphs: [1],
    railPhoto: "antler",
    prosePhoto: "openai",
  },
  { company: "Nouvo", lead: false, paragraphs: "all" },
]

/**
 * The featured five: live, working surfaces only, each shown as a plate with
 * a real screenshot. Everything else stays on GitHub (and gets one quiet
 * line, not a slot).
 */
const FEATURED_PROJECTS = [
  "paradigm",
  "nouvo-clients",
  "ultron",
  "gideon",
  "launch-control",
]

const featuredProjects = FEATURED_PROJECTS.map((slug) =>
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
              {/* The margin figure: the warm photograph beside the personal
                  prose, in the rail column the grid already holds open. */}
              <PhotoFigure
                photo={PHOTOS.beach}
                fig={FIG.beach}
                className={styles.marginFigure}
              />
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
                    {role.railPhoto ? (
                      <PhotoFigure
                        photo={PHOTOS[role.railPhoto]}
                        fig={FIG[role.railPhoto]}
                        className={styles.railFigure}
                      />
                    ) : null}
                  </div>

                  <div className={styles.prose}>
                    <p className={styles.lede}>{typo(entry.blurb)}</p>
                    {paragraphs.map((para, n) => (
                      <p key={n}>{typo(para)}</p>
                    ))}
                    {role.prosePhoto ? (
                      <PhotoFigure
                        photo={PHOTOS[role.prosePhoto]}
                        fig={FIG[role.prosePhoto]}
                        className={styles.proseFigure}
                      />
                    ) : null}
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
              {profile.projectsTotalLabel} builds so far. These five are live
              right now; go see them.
            </h2>

            <ul className={styles.plates}>
              {featuredProjects.map((p, i) => {
                const href =
                  p.slug === "nouvo-clients" ? "https://nouvo.dev" : (p.url ?? p.github)
                const site = href ? host(href) : null
                return (
                  <li key={p.slug} className={styles.plate}>
                    <div className={styles.plateText}>
                      <p className={styles.plateYear}>{p.year}</p>
                      <h3 className={styles.plateName}>
                        {href ? (
                          <a href={href} target="_blank" rel="noreferrer">
                            {p.name}
                          </a>
                        ) : (
                          p.name
                        )}
                      </h3>
                      <p className={styles.plateBlurb}>
                        {typo(p.blurb)}
                        {p.clients ? (
                          <span className={styles.plateNote}>
                            {" "}
                            The full gallery lives at{" "}
                            <a
                              className={styles.plateNoteLink}
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
                      {p.slug === "launch-control" ? (
                        /* The companion plate: the night the project comes
                           from, set under its words at snapshot size. */
                        <PhotoFigure
                          photo={PHOTOS.buildDay}
                          fig={FIG.buildDay}
                          className={styles.companionFigure}
                        />
                      ) : null}
                    </div>

                    {p.shot ? (
                      <figure className={styles.plateFigure}>
                        <a
                          className={styles.plateShotLink}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          tabIndex={-1}
                        >
                          <img
                            className={styles.plateImg}
                            src={p.shot}
                            alt={p.shotAlt ?? `Screenshot of ${p.name}`}
                            width={960}
                            height={600}
                            loading="lazy"
                            decoding="async"
                          />
                        </a>
                        <figcaption className={styles.plateCaption}>
                          <span>
                            fig. {String(i + PLATE_FIG_BASE).padStart(2, "0")}
                          </span>
                          {site ? <span>{site}</span> : null}
                        </figcaption>
                      </figure>
                    ) : null}
                  </li>
                )
              })}
            </ul>

            <p className={styles.platesFoot}>
              The other twenty-some, IDEX, Claude Classroom, the ATS Resume
              Optimizer and the rest, live on{" "}
              <a
                className={styles.plateNoteLink}
                href={profile.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              .
            </p>
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
                {/* Him and a humanoid robot IS this section. */}
                <PhotoFigure
                  photo={PHOTOS.optimus}
                  fig={FIG.optimus}
                  className={styles.closeFigure}
                />
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
              <span>Set in Fraunces, Newsreader and IBM Plex Sans</span>
            </p>
          </section>
        </main>
      </div>

      {/* Story card mount; see cardMountRef above. */}
      <div ref={cardMountRef} />
    </div>
  )
}
