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
 * Renders bare (SiteChrome skips nav, footer and chat on the root). Server
 * component on purpose: the whole page, hero and reading both, ships in the
 * first HTML response and paints before any JavaScript runs. The field is
 * dynamically imported client-side underneath it.
 */
export default function HomePage() {
  return (
    <HeroField
      className={`${hfSerif.variable} ${hfSans.variable} ${hfDisplay.variable}`}
    />
  )
}
