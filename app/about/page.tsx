import type { Metadata } from "next"
import { AboutStory } from "@/components/about/AboutStory"

export const metadata: Metadata = {
  title: "About — Manuel David",
  description:
    "The story behind the work: leaving college for San Francisco on faith, building fast, and why Manuel David is set on the infrastructure for a world run by agents.",
}

export default function AboutPage() {
  return (
    <div className="mt-8 sm:mt-12">
      <AboutStory />
    </div>
  )
}
