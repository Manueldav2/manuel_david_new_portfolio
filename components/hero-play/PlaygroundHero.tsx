"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { profile, projects, work } from "@/lib/content";
import { pgBody, pgDisplay } from "./fonts";
import { BLOCKS } from "./scene-config";
import type { PlaygroundHandle } from "./playground";
import s from "./hero-play.module.css";

/**
 * /3 — PLAYGROUND.
 *
 * Thesis: he builds things you can pick up. So the page hands you something to
 * pick up, and then keeps handing you more. His name is eleven physical blocks
 * on a cream mat. Scroll and the camera walks down the same table; each new
 * section drops its own objects onto the next mat, where they land, settle,
 * and stay throwable for the rest of the visit.
 *
 * The canvas never remounts. It is one world, one rapier simulation, one
 * continuous table. The copy is ordinary semantic HTML sitting on top of it,
 * in a column that the camera composition deliberately leaves clear.
 */

const LINKS = [
  { label: "Email", href: `mailto:${profile.email}` },
  { label: "GitHub", href: profile.github },
  { label: "X", href: profile.x },
  { label: "LinkedIn", href: profile.linkedin },
];

/** The projects that get a physical object. The rest live in the DOM list. */
const ON_THE_TABLE = [
  "idex",
  "ultron",
  "gideon",
  "launch-control",
  "claude-classroom",
  "sovereign",
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

type Env = { reduced: boolean; webgl: boolean };

export function PlaygroundHero() {
  const [env, setEnv] = useState<Env | null>(null);
  const [live, setLive] = useState(false);
  const [grabbed, setGrabbed] = useState(false);
  const [noPhysics, setNoPhysics] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const toyRef = useRef<PlaygroundHandle | null>(null);

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
    const max = Math.max(
      (document.documentElement.scrollHeight || vh) - vh,
      1
    );
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
        stops: readStops,
      });
      toyRef.current = handle;
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

  const showToy = env?.webgl === true;
  const reduced = env?.reduced === true;
  const throwable = showToy && !reduced && !noPhysics;
  const stageUp = showToy ? live : Boolean(env);

  const setSection = (i: number) => (el: HTMLElement | null) => {
    sectionRefs.current[i] = el;
  };

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
              {throwable
                ? "Then keep scrolling. More of it falls."
                : "Keep scrolling for the rest of it."}
            </p>
            {throwable && (
              <button type="button" className={s.reset} onClick={reset}>
                Drop them again
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

      {/* ------------------------------------------------------------ work */}
      <section className={s.panel} id="work" ref={setSection(1)}>
        <div className={`${s.copy} ${s.copyLeft}`}>
          <h2 className={s.h2}>The work</h2>
          <p className={s.lede}>
            {throwable
              ? "Three of them just landed on the next mat. "
              : "Three of them are sitting on the next mat. "}
            One is a job I took because the problem was the one I kept hitting.
            Two are companies I started and still run.
          </p>

          <ol className={s.roles}>
            {work.map((w) => (
              <li key={w.company} className={s.role}>
                <h3 className={s.roleName}>
                  {w.url ? (
                    <a href={w.url} target="_blank" rel="noreferrer">
                      {w.company}
                    </a>
                  ) : (
                    w.company
                  )}
                </h3>
                <p className={s.roleMeta}>
                  {w.role}
                  <span className={s.dot}>&middot;</span>
                  {w.dates}
                </p>
                <p className={s.blurb}>{w.blurb}</p>
                {w.story && (
                  <details className={s.story} onToggle={remeasure}>
                    <summary>the story</summary>
                    {w.story.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </details>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* -------------------------------------------------------- projects */}
      <section className={s.panel} id="projects" ref={setSection(2)}>
        <div className={`${s.copy} ${s.copyRight}`}>
          <h2 className={s.h2}>Things I built because I wanted them to exist</h2>
          <p className={s.lede}>
            {profile.projectsTotalLabel} of them by now. A handful are on the mat
            in front of you. The rest are underneath, and every link here goes
            somewhere real.
          </p>

          <ol className={s.gallery}>
            {featured.map((p) => (
              <li key={p.slug} className={s.item}>
                <h3 className={s.itemName}>
                  <a href={p.url ?? p.github} target="_blank" rel="noreferrer">
                    {p.name}
                  </a>
                </h3>
                <p className={s.itemMeta}>
                  {STATUS_WORD[p.status] ?? p.status}
                  <span className={s.dot}>&middot;</span>
                  {p.year}
                </p>
                <p className={s.blurb}>{p.blurb}</p>
              </li>
            ))}
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
                  <span className={s.restNote}>{p.blurb}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>

      {/* --------------------------------------------------------- contact */}
      <section className={s.panel} id="contact" ref={setSection(3)}>
        <div className={`${s.copy} ${s.copyRight}`}>
          <h2 className={s.h2}>That is the whole table</h2>
          <p className={s.lede}>
            If any of it is useful to you, say so. I answer my own email and I
            build fast.
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
              Drop everything again
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
