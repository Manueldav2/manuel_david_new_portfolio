import type { Metadata } from "next"

import { HeroField } from "@/components/hero-field/HeroField"
import { hfDisplay, hfSans, hfSerif } from "@/components/hero-field/fonts"

export const metadata: Metadata = {
  title: "Manuel David",
  description:
    "I moved to San Francisco and went all in on building. Founding engineer at Configure, founder of Paradigm and Nouvo. My life, drawn as a living context map.",
}

/**
 * /2 — HEAVY STOCK. The same audited context map, re-materialized as a
 * printed object: warm uncoated cardstock, the web inked into the fiber,
 * type at real press weight. The field runs its calmest density tier,
 * because a sheet earns its gravity from what it leaves off. Every
 * interaction is weighted: ink darkens under the cursor like pressure,
 * nothing floats.
 */
export default function Variant2Page() {
  return (
    <HeroField
      variant="paper"
      className={`${hfSerif.variable} ${hfSans.variable} ${hfDisplay.variable}`}
    />
  )
}
