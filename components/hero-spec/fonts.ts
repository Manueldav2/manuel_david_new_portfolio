import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed, IBM_Plex_Mono } from "next/font/google";

/**
 * THE SPEC SHEET (/2) owns its own type system. Nothing here is shared with
 * the rest of the site, and nothing here is loaded on any other route.
 *
 * One superfamily, three widths, three jobs. IBM Plex was drawn for IBM's
 * engineering documentation, which is exactly the register this page argues
 * for: a machine-readable document that a human enjoys reading.
 *
 *   Condensed 600/700 -> the name plate, at enormous scale
 *   Sans      400/500/600 -> prose, field names, section titles
 *   Mono      400/500 -> every value, figure, code and URL (tabular)
 */
export const plexCond = IBM_Plex_Sans_Condensed({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--spec-cond",
});

export const plexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--spec-sans",
});

export const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--spec-mono",
});
