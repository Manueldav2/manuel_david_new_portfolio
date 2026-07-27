"use client"

import { useEffect } from "react"
import { useChat } from "@/components/chat/ChatProvider"

/** Fires once on mount to open the chat drawer for direct /chat visits. */
export function OpenChatOnMount() {
  const { openChat } = useChat()
  useEffect(() => {
    openChat()
  }, [openChat])
  return null
}
