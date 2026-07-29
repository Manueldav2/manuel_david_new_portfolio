"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/lib/content";
import { pgBody, pgDisplay } from "./fonts";
import { BLOCKS } from "./scene-config";
import type { PlaygroundHandle } from "./playground";
import s from "./hero-play.module.css";

/**
 * /3 — PLAYGROUND.
 *
 * Thesis: he builds things you can pick up. So the page hands you something to
 * pick up. His name is eleven physical blocks on a cream mat; they fall in one
 * at a time, and from then on they are yours to grab, drag, throw and knock
 * over. The type around the toy stays quiet so the toy is the argument.
 */

const LINKS = [
  { label: "Email", href: `mailto:${profile.email}` },
  { label: "GitHub", href: profile.github },
  { label: "X", href: profile.x },
  { label: "LinkedIn", href: profile.linkedin },
];

type Env = { reduced: boolean; webgl: boolean };

export function PlaygroundHero() {
  const [env, setEnv] = useState<Env | null>(null);
  const [live, setLive] = useState(false);
  const [grabbed, setGrabbed] = useState(false);
  const [noPhysics, setNoPhysics] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
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

  // three and rapier are loaded here, off the initial route bundle. The DOM
  // hero is already readable by the time this resolves.
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
  }, [env]);

  const reset = useCallback(() => toyRef.current?.reset(), []);

  const showToy = env?.webgl === true;
  const reduced = env?.reduced === true;
  const throwable = showToy && !reduced && !noPhysics;
  const stageUp = showToy ? live : Boolean(env);

  return (
    <main className={`${s.root} ${pgDisplay.variable} ${pgBody.variable}`}>
      <div
        ref={hostRef}
        className={`${s.stage} ${stageUp ? s.stageReady : ""}`}
        aria-hidden="true"
      >
        {env && !showToy && <StaticTiles />}
      </div>

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
