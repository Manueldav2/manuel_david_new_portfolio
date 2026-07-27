"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

/** Desktop drawer width. Content is pushed left by exactly this on >= md. */
export const DRAWER_WIDTH = "min(440px, 92vw)"

interface ChatContextValue {
  open: boolean
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

/**
 * Holds the chat drawer's open/close state and listens for the site-wide
 * "open-chat" CustomEvent (fired by the hero CTA and the bottom-right pill).
 * The nav "chat" item calls openChat() directly via useChat(). Wrapping the
 * whole app lets the layout shell read `open` to push content left.
 */
export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  const openChat = useCallback(() => setOpen(true), [])
  const closeChat = useCallback(() => setOpen(false), [])
  const toggleChat = useCallback(() => setOpen((v) => !v), [])

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener("open-chat", handler)
    return () => window.removeEventListener("open-chat", handler)
  }, [])

  const value = useMemo(
    () => ({ open, openChat, closeChat, toggleChat }),
    [open, openChat, closeChat, toggleChat]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChat must be used within ChatProvider")
  return ctx
}
