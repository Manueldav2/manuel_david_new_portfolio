import { Hero } from "@/components/home/Hero"
import { BioSection } from "@/components/home/BioSection"
import { EntryTiles } from "@/components/home/EntryTiles"
import { OpenChatOnMount } from "./OpenChatOnMount"

/**
 * The old /chat route now just renders the home page and auto-opens the chat
 * side-drawer on mount, so direct links and the previous nav target keep
 * working — there is no separate full chat page anymore.
 */
export default function ChatPage() {
  return (
    <>
      <OpenChatOnMount />
      <Hero />
      <BioSection />
      <EntryTiles />
    </>
  )
}
