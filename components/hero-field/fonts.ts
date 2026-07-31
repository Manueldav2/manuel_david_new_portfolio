import { Fraunces, IBM_Plex_Sans, Newsreader } from "next/font/google";

/**
 * Type system for the /1 CONTEXT FIELD hero only.
 *
 * Deliberately local: the three redesign experiments each define their own
 * faces so they can be judged as complete systems, not as one type system
 * wearing three coats of paint. Nothing here touches lib/fonts.ts.
 *
 * Fraunces: the display voice, and the page's identity. A wonky old-style
 * soft-serif whose optical axis swings from sturdy text cuts to a
 * high-contrast display cut with real character in the italic. It carries
 * the headline, the chapter leads, the card titles, and the seven anchor
 * words in the field, so the same voice speaks at 60px and at 28px.
 *
 * Newsreader: the prose voice. A text serif with open apertures and
 * low-contrast strokes that hold up small on a dark ground; it reads like a
 * magazine column, which is what the reading channel is.
 *
 * IBM Plex Sans: the metadata voice. Flared terminals and that distinctive
 * double-storey g give the small stuff personality without shouting, and it
 * sits comfortably next to a serif at 12 to 13px.
 */

export const hfDisplay = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  axes: ["opsz"],
  variable: "--hf-display",
});

export const hfSerif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--hf-serif",
});

export const hfSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--hf-sans",
});
