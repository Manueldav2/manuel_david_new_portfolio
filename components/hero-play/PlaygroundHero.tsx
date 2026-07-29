"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { profile, projects, work } from "@/lib/content";
import { pgBody, pgDisplay } from "./fonts";
import { BLOCKS } from "./scene-config";
import type { PlaygroundHandle } from "./playground";
import s from "./hero-play.module.css";

/**
 * /3 — PLAYGROUND.
 *
 * Thesis: he builds things you can pick up, so the page hands you things to
 * pick up. His name is eleven blocks on a cream mat. Further down the same
 * table, every job and every project is an object with its name printed on it,
 * and picking one up opens what it is beside it.
 *
 * The physics is the medium, never the subject. Nothing on this page explains
 * the scene or asks you to admire it. The canvas never remounts: it is one
 * world, one rapier simulation, one continuous table, with ordinary semantic
 * HTML sitting on top in a column the camera deliberately leaves clear.
 */

const LINKS = [
  { label: "Email", href: `mailto:${profile.email}` },
  { label: "GitHub", href: profile.github },
  { label: "X", href: profile.x },
  { label: "LinkedIn", href: profile.linkedin },
];

/**
 * The six that get a physical object. Games are not on this list: what is on
 * the table is the engineering.
 */
const ON_THE_TABLE = [
  "idex",
  "ultron",
  "gideon",
  "launch-control",
  "claude-classroom",
  "satisfying-video-generator",
];

const STATUS_WORD: Record<string, string> = {
  current: "running now",
  shipped: "shipped",
  "open-source": "open source",
  exploration: "an experiment",
  archived: "archived",
  earning: "still mine",
  prior: "prior",
};

const featured = ON_THE_TABLE.map((slug) => projects.find((p) => p.slug === slug)).filter(
  (p): p is (typeof projects)[number] => Boolean(p)
);
const rest = projects.filter((p) => !ON_THE_TABLE.includes(p.slug));

/** The id an object on the table shares with its row in the list. */
const workId = (company: string) => company.toLowerCase();

/**
 * Typewriter apostrophes are the one thing the content file still ships, so
 * they are turned at render time rather than by editing anybody's copy.
 */
function curly(text: string) {
  return text.replace(/(\w)'(\w)/g, "$1’$2").replace(/(\w)'(?=\s|$)/g, "$1’");
}

type Env = { reduced: boolean; webgl: boolean };

export function PlaygroundHero() {
  const [env, setEnv] = useState<Env | null>(null);
  const [live, setLive] = useState(false);
  const [grabbed, setGrabbed] = useState(false);
  const [noPhysics, setNoPhysics] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const toyRef = useRef<PlaygroundHandle | null>(null);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  /** Set when the pick came from the canvas, so focus is not stolen. */
  const fromCanvas = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let webgl = false;
    try {
      const probe = document.createElement("canvas");
      webgl = Boolean(
        probe.getContext("webgl2") ||
          probe.getContext("webgl") ||
          probe.getContext("experimental-webgl")
      );
    } catch {
      webgl = false;
    }
    setEnv({ reduced: mq.matches, webgl });

    const onChange = (e: MediaQueryListEvent) =>
      setEnv((prev) => (prev ? { ...prev, reduced: e.matches } : prev));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /**
   * The scroll offset at which each section is centred in the viewport, which
   * is the scroll offset at which its camera stop is composed. Read from the
   * live DOM so opening a story or changing the type size cannot desync the
   * camera from the copy.
   */
  const readStops = useCallback(() => {
    const vh = window.innerHeight || 1;
    const max = Math.max((document.documentElement.scrollHeight || vh) - vh, 1);
    const y = window.scrollY || 0;
    return sectionRefs.current.map((el, i) => {
      if (!el) return i * vh;
      const top = el.getBoundingClientRect().top + y;
      const mid = top + el.offsetHeight / 2 - vh / 2;
      return Math.min(Math.max(mid, 0), max);
    });
  }, []);

  // three and rapier are loaded here, off the initial route bundle. The DOM
  // page is already readable, linkable and crawlable by the time this resolves.
  useEffect(() => {
    if (!env || !env.webgl || !hostRef.current) return;
    const host = hostRef.current;
    let handle: PlaygroundHandle | null = null;
    let cancelled = false;

    import("./playground").then(({ createPlayground }) => {
      if (cancelled) return;
      handle = createPlayground(host, {
        reduced: env.reduced,
        fontFamily: `${pgDisplay.style.fontFamily}, sans-serif`,
        onGrab: () => setGrabbed(true),
        onReady: () => setLive(true),
        onNoPhysics: () => setNoPhysics(true),
        onSelect: (id) => {
          fromCanvas.current = true;
          setPicked(id);
        },
        stops: readStops,
      });
      toyRef.current = handle;
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __playground?: PlaygroundHandle }).__playground = handle;
      }
    });

    return () => {
      cancelled = true;
      handle?.dispose();
      toyRef.current = null;
      setLive(false);
      setNoPhysics(false);
    };
  }, [env, readStops]);

  // Anything that changes the height of the document (a story opening, a font
  // arriving, a rotation) moves the stops, so re-measure rather than guess.
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const ro = new ResizeObserver(() => toyRef.current?.measure());
    ro.observe(page);
    return () => ro.disconnect();
  }, [env]);

  const reset = useCallback(() => toyRef.current?.reset(), []);
  const remeasure = useCallback(() => toyRef.current?.measure(), []);

  /** One way in for both the list rows and the objects on the table. */
  const choose = useCallback((id: string | null) => {
    fromCanvas.current = false;
    setPicked((prev) => {
      const next = prev === id ? null : id;
      toyRef.current?.select(next);
      return next;
    });
  }, []);

  const dismiss = useCallback(
    (returnFocus: boolean) => {
      setPicked((prev) => {
        if (prev && returnFocus) rowRefs.current[prev]?.focus();
        toyRef.current?.select(null);
        return null;
      });
    },
    []
  );

  // Escape closes whatever is open, from anywhere on the page.
  useEffect(() => {
    if (!picked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picked, dismiss]);

  // Scrolling on to the next part of the table puts the open panel away.
  useEffect(() => {
    if (!picked) return;
    const host = document.getElementById(
      featured.some((p) => p.slug === picked) ? "projects" : "work"
    );
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) dismiss(false);
      },
      { threshold: 0 }
    );
    io.observe(host);
    return () => io.disconnect();
  }, [picked, dismiss]);

  // Moving into the panel is what makes this usable from the keyboard. A pick
  // made on the canvas leaves focus alone: the pointer is already there.
  useEffect(() => {
    if (!picked) return;
    if (fromCanvas.current) {
      fromCanvas.current = false;
      return;
    }
    panelRefs.current[picked]?.focus({ preventScroll: true });
  }, [picked]);

  useEffect(() => {
    remeasure();
  }, [picked, remeasure]);

  const showToy = env?.webgl === true;
  const reduced = env?.reduced === true;
  const throwable = showToy && !reduced && !noPhysics;
  const stageUp = showToy ? live : Boolean(env);

  const setSection = (i: number) => (el: HTMLElement | null) => {
    sectionRefs.current[i] = el;
  };

  const openWork = useMemo(
    () => work.find((w) => workId(w.company) === picked) ?? null,
    [picked]
  );
  const openProject = useMemo(
    () => featured.find((p) => p.slug === picked) ?? null,
    [picked]
  );

  return (
    <main className={`${s.root} ${pgDisplay.variable} ${pgBody.variable}`} ref={pageRef}>
      <div
        ref={hostRef}
        className={`${s.stage} ${stageUp ? s.stageReady : ""}`}
        aria-hidden="true"
      >
        {env && !showToy && <StaticTiles />}
      </div>

      {/* ------------------------------------------------------------ hero */}
      <section className={s.hero} ref={setSection(0)}>
        <header className={`${s.head} ${s.enter}`}>
          <h1 className={s.name}>{profile.name}</h1>
          <p className={s.meta}>
            {profile.role} at{" "}
            <a href={profile.companyUrl} target="_blank" rel="noreferrer">
              {profile.company}
            </a>
            <span className={s.dot}>&middot;</span>
            {profile.location}
          </p>
        </header>

        <div className={s.foot}>
          <div className={`${s.say} ${s.enter} ${s.d1}`}>
            <p className={s.headline}>{profile.headline}</p>
            <p className={s.invite}>
              {throwable
                ? "Go ahead. Throw my name around."
                : "Eleven blocks with my name on them, already landed."}
            </p>
            <p className={s.cue}>
              Two companies of my own, and a job I took because the problem would
              not leave me alone.
            </p>
            {throwable && (
              <button type="button" className={s.reset} onClick={reset}>
                Put them back
              </button>
            )}
          </div>

          <nav className={`${s.links} ${s.enter} ${s.d2}`} aria-label="Elsewhere">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                {...(l.href.startsWith("mailto:")
                  ? {}
                  : { target: "_blank", rel: "noreferrer" })}
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        {throwable && (
          <p className={`${s.hint} ${grabbed ? s.hintGone : ""}`} aria-hidden="true">
            grab a letter
          </p>
        )}
      </section>

      {/* ----------------------------------------------------------- about */}
      <section className={s.panel} id="about" ref={setSection(1)}>
        <div className={`${s.copy} ${s.reader}`}>
          <h2 className={s.h2}>I do not wait my turn.</h2>
          <p className={s.lede}>{curly(profile.about[0])}</p>
          {profile.about.slice(1).map((para, i) => (
            <p key={i} className={s.para}>
              {curly(para)}
            </p>
          ))}
          <p className={s.pull}>{curly(profile.bioClosing)}</p>
        </div>
      </section>

      {/* ------------------------------------------------------------ work */}
      <section className={`${s.panel} ${s.split}`} id="work" ref={setSection(2)}>
        <div className={`${s.copy} ${s.rail}`}>
          <h2 className={s.h2}>The work</h2>
          <p className={s.lede}>
            Configure is the job. Paradigm and Nouvo are mine.{" "}
            {showToy
              ? "Pick one up for the story of how it actually went."
              : "Open one for the story of how it actually went."}
          </p>

          <ol className={s.roles}>
            {work.map((w) => {
              const id = workId(w.company);
              const open = picked === id;
              return (
                <li key={w.company} className={`${s.role} ${open ? s.rowOpen : ""}`}>
                  <h3 className={s.roleName}>
                    <button
                      type="button"
                      ref={(el) => {
                        rowRefs.current[id] = el;
                      }}
                      className={s.rowButton}
                      aria-expanded={open}
                      aria-controls={`detail-${id}`}
                      onClick={() => choose(id)}
                    >
                      {w.company}
                    </button>
                  </h3>
                  <p className={s.roleMeta}>
                    {w.role}
                    <span className={s.dot}>&middot;</span>
                    {w.dates}
                  </p>
                  <p className={s.blurb}>{curly(w.blurb)}</p>
                </li>
              );
            })}
          </ol>
        </div>

        <div className={s.detailSlot}>
          {openWork && (
            <article
              id={`detail-${workId(openWork.company)}`}
              className={s.detail}
              aria-label={`${openWork.company}, in full`}
            >
              <div
                className={s.detailHead}
                tabIndex={-1}
                ref={(el) => {
                  panelRefs.current[workId(openWork.company)] = el;
                }}
              >
                <h3 className={s.detailName}>{openWork.company}</h3>
                <p className={s.detailMeta}>
                  {openWork.role}
                  <span className={s.dot}>&middot;</span>
                  {openWork.dates}
                </p>
              </div>
              <div className={s.detailBody}>
                {(openWork.story ?? [openWork.blurb]).map((para, i) => (
                  <p key={i}>{curly(para)}</p>
                ))}
              </div>
              <div className={s.detailFoot}>
                {openWork.url && (
                  <a
                    className={s.detailLink}
                    href={openWork.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {openWork.url.replace(/^https?:\/\//, "")}
                  </a>
                )}
                <button type="button" className={s.close} onClick={() => dismiss(true)}>
                  Put it back
                </button>
              </div>
            </article>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------- projects */}
      <section
        className={`${s.panel} ${s.split} ${s.splitFlip}`}
        id="projects"
        ref={setSection(3)}
      >
        <div className={s.detailSlot}>
          {openProject && (
            <article
              id={`detail-${openProject.slug}`}
              className={s.detail}
              aria-label={`${openProject.name}, in full`}
            >
              <div
                className={s.detailHead}
                tabIndex={-1}
                ref={(el) => {
                  panelRefs.current[openProject.slug] = el;
                }}
              >
                <h3 className={s.detailName}>{openProject.name}</h3>
                <p className={s.detailMeta}>
                  {STATUS_WORD[openProject.status] ?? openProject.status}
                  <span className={s.dot}>&middot;</span>
                  {openProject.year}
                </p>
              </div>
              <div className={s.detailBody}>
                <p>{curly(openProject.blurb)}</p>
              </div>
              <div className={s.detailFoot}>
                {openProject.url && (
                  <a
                    className={s.detailLink}
                    href={openProject.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {openProject.url.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {openProject.github && (
                  <a
                    className={s.detailLink}
                    href={openProject.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    the code
                  </a>
                )}
                <button type="button" className={s.close} onClick={() => dismiss(true)}>
                  Put it back
                </button>
              </div>
            </article>
          )}
        </div>

        <div className={`${s.copy} ${s.rail}`}>
          <h2 className={s.h2}>The things I built because I wanted them to exist</h2>
          <p className={s.lede}>
            {profile.projectsTotalLabel} of them by now. These six are the ones I
            still open.{" "}
            {showToy
              ? "Pick one up and it tells you what it is."
              : "Open one and it tells you what it is."}
          </p>

          <ol className={s.gallery}>
            {featured.map((p) => {
              const open = picked === p.slug;
              return (
                <li key={p.slug} className={`${s.item} ${open ? s.rowOpen : ""}`}>
                  <h3 className={s.itemName}>
                    <button
                      type="button"
                      ref={(el) => {
                        rowRefs.current[p.slug] = el;
                      }}
                      className={s.rowButton}
                      aria-expanded={open}
                      aria-controls={`detail-${p.slug}`}
                      onClick={() => choose(p.slug)}
                    >
                      {p.name}
                    </button>
                  </h3>
                  <p className={s.itemMeta}>
                    {STATUS_WORD[p.status] ?? p.status}
                    <span className={s.dot}>&middot;</span>
                    {p.year}
                  </p>
                </li>
              );
            })}
          </ol>

          <details className={`${s.story} ${s.more}`} onToggle={remeasure}>
            <summary>the other {rest.length}, with links</summary>
            <ul className={s.rest}>
              {rest.map((p) => (
                <li key={p.slug}>
                  {p.url || p.github ? (
                    <a href={p.url ?? p.github} target="_blank" rel="noreferrer">
                      {p.name}
                    </a>
                  ) : (
                    <span>{p.name}</span>
                  )}
                  <span className={s.restNote}>{curly(p.blurb)}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>

      {/* --------------------------------------------------------- contact */}
      <section className={s.panel} id="contact" ref={setSection(4)}>
        <div className={`${s.copy} ${s.copyRight}`}>
          <h2 className={s.h2}>I am just getting started.</h2>
          <p className={s.lede}>
            If you are building toward the same future, I want to hear about it.
            If you want me building it with you, even better.
          </p>

          <p className={s.big}>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </p>

          <nav className={s.links} aria-label="Elsewhere">
            <a href={profile.calendar} target="_blank" rel="noreferrer">
              Book a time
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={profile.x} target="_blank" rel="noreferrer">
              X {profile.xHandle}
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </nav>

          {throwable && (
            <button type="button" className={s.reset} onClick={reset}>
              Put everything back
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

/** No WebGL, or a machine that should not be asked for it. Same idea, flat. */
function StaticTiles() {
  const tone: Record<string, string> = {
    ink: s.tile,
    vermilion: `${s.tile} ${s.tileRed}`,
    spruce: `${s.tile} ${s.tileGreen}`,
  };
  const row1 = BLOCKS.slice(0, 6);
  const row2 = BLOCKS.slice(6);

  return (
    <div className={s.fallback}>
      <div className={s.fallbackMat}>
        {row1.map((b) => (
          <span key={b.id} className={tone[b.color]}>
            {b.char}
          </span>
        ))}
        {row2.map((b) => (
          <span key={b.id} className={tone[b.color]}>
            {b.char}
          </span>
        ))}
        <span className={`${s.tile} ${s.tileGap}`} />
      </div>
    </div>
  );
}
