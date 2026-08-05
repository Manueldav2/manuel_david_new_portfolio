import type { Metadata } from "next"

import { HeroField } from "@/components/hero-field/HeroField"
import { hfMono, hfSans, hfSerif, hfSerifDisplay } from "@/components/hero-field/fonts"

export const metadata: Metadata = {
  title: "Manuel David",
  description:
    "I moved to San Francisco and went all in on building. Founding engineer at Configure, founder of Paradigm and Nouvo. My life, drawn as a living context map.",
}

/**
 * /3 — DATA-EDITORIAL. Newsreader speaks everywhere the display voice
 * lives (headline, chapter leads, the seven anchors, card titles), light
 * and high-contrast; the field words are set in IBM Plex Mono, smaller and
 * letterspaced, so the map reads as a live data layer under an editorial
 * page.
 */
export default function Variant3Page() {
  return (
    <HeroField
      variant="mono"
      className={`${hfSerif.variable} ${hfSans.variable} ${hfSerifDisplay.variable} ${hfMono.variable}`}
    />
  )
}
