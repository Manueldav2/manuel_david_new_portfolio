"use client"

import { usePathname } from "next/navigation"
import { Chatbot } from "@/components/ui/chatbot"
import { Nav } from "@/components/site/Nav"
import { Footer } from "@/components/site/Footer"
import { ChatProvider } from "@/components/chat/ChatProvider"
import { ChatShell } from "@/components/chat/ChatShell"
import { ChatDrawer } from "@/components/chat/ChatDrawer"

/**
 * The redesign experiments live at /1, /2 and /3 and must render BARE:
 * no nav, no footer, no chat launcher, no top padding. Each one is a full
 * viewport-owning composition being judged on its own terms, so the existing
 * site chrome would only get in the way of the comparison.
 *
 * Every other route gets the normal chrome.
 */
const BARE_ROUTE = /^\/[123](\/|$)/

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (BARE_ROUTE.test(pathname ?? "")) return <>{children}</>

  return (
    <ChatProvider>
      {/* ChatShell pushes the whole site chrome LEFT when the drawer opens. */}
      <ChatShell>
        <Nav />
        {/* pt clears the fixed nav pill so page content never sits under it. */}
        <main className="pt-24">{children}</main>
        <Footer />
        <Chatbot />
      </ChatShell>
      {/* Right-side drawer — fixed, outside the pushed shell. */}
      <ChatDrawer />
    </ChatProvider>
  )
}
