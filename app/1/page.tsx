import type { Metadata } from "next"

import { HeroField } from "@/components/hero-field/HeroField"
import { hfSans, hfSerif } from "@/components/hero-field/fonts"

export const metadata: Metadata = {
  title: "Manuel David — Context field",
  description:
    "The layer that lets any agent recognize you. Context infrastructure, built at Configure.",
}

/**
 * /1 — CONTEXT FIELD
 *
 * Renders bare (SiteChrome skips nav, footer and chat for /1, /2, /3).
 * Server component on purpose: the typography ships in the first HTML
 * response and paints before any JavaScript runs. The WebGL field is
 * dynamically imported client-side underneath it.
 */
export default function ContextFieldPage() {
  return <HeroField className={`${hfSerif.variable} ${hfSans.variable}`} />
}
