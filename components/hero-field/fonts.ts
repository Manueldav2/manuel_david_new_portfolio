import { IBM_Plex_Sans, Newsreader } from "next/font/google";

/**
 * Type system for the /1 CONTEXT FIELD hero only.
 *
 * Deliberately local: the three redesign experiments each define their own
 * faces so they can be judged as complete systems, not as one type system
 * wearing three coats of paint. Nothing here touches lib/fonts.ts.
 *
 * Newsreader: a text serif with real editorial character (open apertures,
 * a genuinely beautiful italic, low-contrast strokes that hold up small on a
 * dark ground). It reads like a magazine deck rather than a landing page.
 *
 * IBM Plex Sans: the metadata voice. Flared terminals and that distinctive
 * double-storey g give the small stuff personality without shouting, and it
 * sits comfortably next to a serif at 12 to 13px.
 */

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
