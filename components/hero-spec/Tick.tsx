"use client";

import { useEffect, useState } from "react";

const DURATION = 620;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * A value that counts once into place, the way a mechanical readout settles.
 * It never loops and never runs again. Under prefers-reduced-motion it is
 * simply printed. The final value is always in the DOM for assistive tech.
 */
export function Tick({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const start = performance.now();
    setShown(0);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      setShown(Math.round(easeOut(t) * value));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <>
      <span aria-hidden="true">
        {shown}
        {suffix}
      </span>
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
        }}
      >
        {value}
        {suffix}
      </span>
    </>
  );
}
