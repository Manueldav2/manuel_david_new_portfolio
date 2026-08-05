import type { Metadata } from "next"

import { HeroField } from "@/components/hero-field/HeroField"
import { hfDisplayWonk, hfSans, hfSerif } from "@/components/hero-field/fonts"

export const metadata: Metadata = {
  title: "Manuel David",
  description:
    "I moved to San Francisco and went all in on building. Founding engineer at Configure, founder of Paradigm and Nouvo. My life, drawn as a living context map.",
}

/**
 * /1 — SHARPER SERIF. The current direction executed harder: Fraunces with
 * its SOFT/WONK axes live, run at real display scale, Newsreader kept for
 * prose only. Same page, same mechanics, sharper voice.
 */
export default function Variant1Page() {
  return (
    <HeroField
      variant="serif"
      className={`${hfSerif.variable} ${hfSans.variable} ${hfDisplayWonk.variable}`}
    />
  )
}
