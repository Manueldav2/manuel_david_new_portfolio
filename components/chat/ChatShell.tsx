"use client"

import type { ReactNode } from "react"
import { useChat, DRAWER_WIDTH } from "@/components/chat/ChatProvider"

/**
 * Wraps the site chrome (nav + main + footer). When the chat drawer is open,
 * it applies a right margin equal to the drawer width on >= md so the whole
 * page content is pushed LEFT (not overlaid), animating smoothly. On mobile
 * the drawer is (near) full-width and covers the content, so no push is applied
 * there — the drawer itself sits on top.
 */
export function ChatShell({ children }: { children: ReactNode }) {
  const { open } = useChat()
  return (
    <div
      data-chat-shell
      className="transition-[margin]"
      style={{
        marginRight: open ? "var(--chat-push, 0px)" : "0px",
        transitionDuration: "500ms",
        transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
      }}
    >
      {/* Desktop-only push width; mobile keeps 0 so the drawer overlays. */}
      <style>{`@media (min-width:768px){[data-chat-shell]{--chat-push:${DRAWER_WIDTH};}}`}</style>
      {children}
    </div>
  )
}
