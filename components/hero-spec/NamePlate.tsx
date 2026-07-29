"use client";

import { useCallback, useEffect, useRef } from "react";
import s from "./spec.module.css";

/** 2% overshoot, split evenly, so the outer stems are shaved by the trim. */
const BLEED = 0.02;
/** Must match the tracking on .name in spec.module.css. */
const TRACK_EM = -0.022;
const PROBE = 100;

let ctx: CanvasRenderingContext2D | null | undefined;
function getCtx() {
  if (ctx === undefined) ctx = document.createElement("canvas").getContext("2d");
  return ctx;
}

/**
 * Ink extents, not the layout box. A layout box carries the sidebearing of
 * the last letter with it, so metric-flush type looks a few pixels shy of the
 * rule. Measuring the actual glyph bounds is what makes it sit optically
 * flush. Returns null if the browser cannot report ink bounds, and the caller
 * falls back to the layout box.
 */
function measureInk(el: HTMLElement, text: string) {
  const c = getCtx();
  if (!c) return null;
  const cs = getComputedStyle(el);
  c.font = `${cs.fontStyle} ${cs.fontWeight} ${PROBE}px ${cs.fontFamily}`;
  try {
    (c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      `${TRACK_EM * PROBE}px`;
  } catch {
    /* older engines ignore tracking; the error is sub-pixel at this scale */
  }
  const m = c.measureText(text);
  const left = m.actualBoundingBoxLeft;
  const right = m.actualBoundingBoxRight;
  if (!Number.isFinite(left) || !Number.isFinite(right) || left + right <= 0) return null;
  return { width: left + right, left };
}

/**
 * The name plate, optically justified to the full trim width.
 *
 * Wide viewports set MANUEL DAVID on one line; narrow ones stack it and
 * justify each word independently, so the pair locks into a black rectangle
 * with both edges dead flush. CSS decides which; this solves the size.
 *
 * A vw font-size gets it approximately right before hydration, so there is no
 * layout jump. It re-solves on resize and again once the webfont has landed,
 * because fallback metrics are never the same.
 */
export function NamePlate() {
  const plateRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lastWidth = useRef(-1);

  const fit = useCallback((force = false) => {
    const plate = plateRef.current;
    const name = nameRef.current;
    if (!plate || !name) return;

    const W = plate.clientWidth;
    if (W <= 0) return;
    // Re-fitting changes the plate's HEIGHT, which re-fires the observer.
    // Only a change of width can change the answer.
    if (!force && W === lastWidth.current) return;
    lastWidth.current = W;

    const target = W * (1 + BLEED);
    const hang = (W * BLEED) / 2;

    const solve = (el: HTMLElement) => {
      const text = (el.textContent ?? "").trim().toUpperCase();
      const ink = measureInk(el, text);
      if (ink) {
        const size = (PROBE * target) / ink.width;
        el.style.fontSize = `${size}px`;
        el.style.marginLeft = `${-hang + (ink.left * size) / PROBE}px`;
        return;
      }
      el.style.fontSize = `${PROBE}px`;
      const box = el.getBoundingClientRect().width;
      if (box > 0) el.style.fontSize = `${(PROBE * target) / box}px`;
      el.style.marginLeft = `${-hang}px`;
    };

    const clear = (el: HTMLElement) => {
      el.style.fontSize = "";
      el.style.marginLeft = "";
    };

    const stacked =
      lineRefs.current[0] !== null &&
      getComputedStyle(lineRefs.current[0] as HTMLElement).display === "block";

    if (stacked) {
      clear(name);
      for (const line of lineRefs.current) if (line) solve(line);
    } else {
      for (const line of lineRefs.current) if (line) clear(line);
      solve(name);
    }
  }, []);

  useEffect(() => {
    fit(true);
    const ro = new ResizeObserver(() => fit());
    if (plateRef.current) ro.observe(plateRef.current);
    document.fonts?.ready.then(() => fit(true)).catch(() => {});
    return () => ro.disconnect();
  }, [fit]);

  return (
    <div ref={plateRef} className={`${s.plate} ${s.wipe}`}>
      <h1 ref={nameRef} className={s.name} aria-label="Manuel David">
        <span
          ref={(el) => {
            lineRefs.current[0] = el;
          }}
          className={`${s.nameLine} ${s.nameLine1}`}
        >
          Manuel
        </span>{" "}
        <span
          ref={(el) => {
            lineRefs.current[1] = el;
          }}
          className={`${s.nameLine} ${s.nameLine2}`}
        >
          David
        </span>
      </h1>
    </div>
  );
}
