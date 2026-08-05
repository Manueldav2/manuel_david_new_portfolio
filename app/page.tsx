import type { Metadata } from "next"

import { HeroField } from "@/components/hero-field/HeroField"
import { hfDisplay, hfSans, hfSerif } from "@/components/hero-field/fonts"

export const metadata: Metadata = {
  title: "Manuel David",
  description:
    "I moved to San Francisco and went all in on building. Founding engineer at Configure, founder of Paradigm and Nouvo. My life, drawn as a living context map.",
}

/**
 * THE CONTEXT FIELD — the site.
 *
 * Wears the HEAVY STOCK identity: the audited context map printed on warm
 * uncoated cardstock, the web inked into the fiber, Fraunces at press
 * weight, one oxide accent that only ever appears under the hand. The
 * field runs its calmest density tier, because a sheet earns its gravity
 * from what it leaves off. The dark lit-ink mono identity this route used
 * to wear lives on at /2; /1 /2 /3 stay up for comparison.
 *
 * Renders bare (SiteChrome skips nav, footer and chat on the root). Server
 * component on purpose: the whole page, hero and reading both, ships in the
 * first HTML response and paints before any JavaScript runs. The field is
 * dynamically imported client-side underneath it.
 */
export default function HomePage() {
  return (
    <HeroField
      variant="paper"
      className={`${hfSerif.variable} ${hfSans.variable} ${hfDisplay.variable}`}
    />
  )
}
