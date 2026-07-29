"use client";

import { useEffect, useRef, useState } from "react";
import s from "./spec.module.css";

const TZ = "America/Los_Angeles";
const fmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function pad4(n: number) {
  return String(Math.max(0, Math.round(n))).padStart(4, "0");
}

/**
 * The two instruments on the sheet, and the only continuous motion on it.
 *
 *  1. A live clock on Manuel's actual timezone. Tabular figures, so the
 *     digits never jitter as they tick.
 *  2. A cursor-tracked crosshair, the way you lay a rule across a printed
 *     drawing, with the position echoed as a coordinate readout up here.
 *     Fine pointers only, and never under prefers-reduced-motion.
 */
export function Instruments() {
  const [time, setTime] = useState<string | null>(null);
  const [xy, setXy] = useState<{ x: number; y: number } | null>(null);
  const vRef = useRef<HTMLDivElement>(null);
  const hRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;

    let raf = 0;
    let px = 0;
    let py = 0;

    const paint = () => {
      raf = 0;
      if (vRef.current) vRef.current.style.transform = `translate3d(${px}px,0,0)`;
      if (hRef.current) hRef.current.style.transform = `translate3d(0,${py}px,0)`;
      setXy({ x: px, y: py });
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = window.requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <span className={s.instruments}>
        {xy ? (
          <span className={s.coords} aria-hidden="true">
            x{pad4(xy.x)} y{pad4(xy.y)}
          </span>
        ) : null}
        <span className={s.clock}>
          <span className={s.clockDot} aria-hidden="true" />
          <span suppressHydrationWarning>{time ?? "--:--:--"}</span> SF
        </span>
      </span>
      {xy ? (
        <>
          <div ref={vRef} className={s.crossV} aria-hidden="true" />
          <div ref={hRef} className={s.crossH} aria-hidden="true" />
        </>
      ) : null}
    </>
  );
}
