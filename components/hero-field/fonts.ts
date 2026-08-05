import {
  Bricolage_Grotesque,
  Fraunces,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Instrument_Sans,
  Newsreader,
} from "next/font/google";

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

/* ------------------------------------------------------------------ */
/* The three type-identity experiments (/1, /2, /3). Each route loads  */
/* only the faces it wears; the CSS keys off the same custom          */
/* properties, so a variant is a different set of variables on the    */
/* same markup.                                                        */
/* ------------------------------------------------------------------ */

/**
 * /1 "sharper serif": the SAME Fraunces, with its SOFT and WONK optical
 * axes exposed so the display cut can run wonky (WONK 1, SOFT 0) at real
 * headline scale while the field words stay composed. It answers the
 * base --hf-display slot, so everything display-voiced sharpens at once.
 */
export const hfDisplayWonk = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--hf-display",
});

/**
 * /2 "modern grotesk": Bricolage Grotesque is the loud voice, a grotesk
 * with real quirk in its cuts (that flared g, the tight apertures) and an
 * optical axis so it holds up from 12px metadata to a 70px headline.
 * Instrument Sans is the quiet workhorse beside it: prose, metadata, the
 * field's long tail. Weight does the hierarchy serif italics used to.
 */
export const hfGrotesk = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
  variable: "--hf-display",
});

export const hfGroteskText = Instrument_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--hf-sans",
});

/**
 * /3 "data-editorial": Newsreader takes over the DISPLAY slot too, with its
 * optical axis live, so the headline is a light, high-contrast editorial
 * serif that reads nothing like Fraunces next door; IBM Plex Mono carries
 * the field words as live telemetry. Same family DNA as the Plex Sans
 * metadata voice.
 */
export const hfSerifDisplay = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  axes: ["opsz"],
  variable: "--hf-display",
});


export const hfMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--hf-mono",
});
