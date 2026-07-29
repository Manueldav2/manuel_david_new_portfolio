import { Bricolage_Grotesque, Familjen_Grotesk } from "next/font/google";

/**
 * Type system for the /3 PLAYGROUND hero ONLY. Deliberately local to this
 * folder: the three redesign experiments do not share a type system.
 *
 * Bricolage Grotesque — a variable grotesque with genuinely odd details (the
 * flat-topped A, the chopped terminals). It has the chunk a toy needs without
 * tipping into a "kids font", and its wide weight range means the wordmark and
 * the small print can come from one family without looking like the same size.
 *
 * Familjen Grotesk — warm Swedish grotesque for the running copy. Slightly
 * humanist, a little narrow, and nothing like the Inter/Geist default.
 */
export const pgDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pg-display",
});

export const pgBody = Familjen_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pg-body",
});
