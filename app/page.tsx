import { Hero } from "@/components/home/Hero"
import { BioSection } from "@/components/home/BioSection"
import { SkillsMarquee } from "@/components/home/SkillsMarquee"
import { EntryTiles } from "@/components/home/EntryTiles"

export default function HomePage() {
  return (
    <>
      <Hero />
      <BioSection />
      <SkillsMarquee />
      <EntryTiles />
    </>
  )
}
