import type { Metadata } from "next"

import { HeroField } from "@/components/hero-field/HeroField"
import { hfGrotesk, hfGroteskText } from "@/components/hero-field/fonts"

export const metadata: Metadata = {
  title: "Manuel David",
  description:
    "I moved to San Francisco and went all in on building. Founding engineer at Configure, founder of Paradigm and Nouvo. My life, drawn as a living context map.",
}

/**
 * /2 — MODERN GROTESK. Bricolage Grotesque carries the headline and the
 * field's anchors, Instrument Sans carries everything quiet. Weight and
 * tracking do the hierarchy the serif italics used to; the serif slot is
 * remapped to the sans in CSS, so no serif loads at all.
 */
export default function Variant2Page() {
  return (
    <HeroField
      variant="grotesk"
      className={`${hfGroteskText.variable} ${hfGrotesk.variable}`}
    />
  )
}
