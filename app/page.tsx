import type { Metadata } from "next"

import { HeroField } from "@/components/hero-field/HeroField"
import { hfInter, hfMono } from "@/components/hero-field/fonts"

export const metadata: Metadata = {
  title: "Manuel David",
  description:
    "I moved to San Francisco and went all in on building. Founding engineer at Configure, founder of Paradigm and Nouvo. My life, drawn as a living context map.",
}

/**
 * THE CONTEXT FIELD — the site.
 *
 * Wears the CONFIGURE identity: his employer's brand system, applied as
 * discipline rather than costume. Inter carries everything (Display 500,
 * Body 400), IBM Plex Mono carries the data, the ground is flat canvas
 * gray, the web is ink, and Configure Slate is the single accent — worn at
 * rest by exactly one word, Configure, sitting at the center of the map.
 * The scroll descent converges on that word: the whole field flies past,
 * Configure grows to meet you, and the page passes through it into the
 * reading. The earlier identities live on at /1 /2 /3 for comparison.
 *
 * Renders bare (SiteChrome skips nav, footer and chat on the root). Server
 * component on purpose: the whole page, hero and reading both, ships in the
 * first HTML response and paints before any JavaScript runs. The field is
 * dynamically imported client-side underneath it.
 */
export default function HomePage() {
  return (
    <HeroField
      variant="configure"
      className={`${hfInter.variable} ${hfMono.variable}`}
    />
  )
}
