import type { Metadata } from "next"

import { HeroField } from "@/components/hero-field/HeroField"
import { hfMono, hfSans, hfSerif, hfSerifDisplay } from "@/components/hero-field/fonts"

export const metadata: Metadata = {
  title: "Manuel David",
  description:
    "I moved to San Francisco and went all in on building. Founding engineer at Configure, founder of Paradigm and Nouvo. My life, drawn as a living context map.",
}

/**
 * /2 — LIT INK (data-editorial). The dark identity the root used to wear:
 * Newsreader display over an IBM Plex Mono field, serif anchors, the
 * scene graded so Configure reads as the light source. The root now wears
 * HEAVY STOCK; this route keeps the night version up for comparison.
 */
export default function Variant2Page() {
  return (
    <HeroField
      variant="mono"
      className={`${hfSerif.variable} ${hfSans.variable} ${hfSerifDisplay.variable} ${hfMono.variable}`}
    />
  )
}
