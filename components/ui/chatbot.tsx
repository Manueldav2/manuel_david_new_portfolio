"use client"

import { Glass } from "@/components/glass/Glass"
import { cn } from "@/lib/utils"

interface ChatbotProps {
  className?: string
}

/**
 * Quiet, on-brand chat launcher. A small liquid-glass pill fixed bottom-right
 * in the site's mono vocabulary — not a SaaS bubble. It opens the chat
 * side-drawer (which slides in from the right and pushes page content left);
 * that drawer + the rebuilt chat is a separate task, so here we only fire the
 * hook it will listen for. Hover lifts and brightens; the lift is motion-safe
 * so reduced-motion users get the color change only.
 */
export function Chatbot({ className }: ChatbotProps) {
  return (
    <Glass
      as="button"
      type="button"
      interactive
      distort
      aria-label="Ask Manuel’s AI"
      // chat side-drawer wired in the chat task
      onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
      className={cn(
        "group fixed bottom-4 right-4 z-50 inline-flex items-center gap-1.5 rounded-full px-4 py-2",
        "font-mono text-xs lowercase text-muted-foreground",
        "transition-[transform,color,background-color] duration-300 ease-out",
        "hover:text-foreground hover:bg-foreground/[0.06] motion-safe:hover:-translate-y-0.5",
        "sm:bottom-6 sm:right-6 sm:px-5 sm:py-2.5 sm:text-sm",
        className
      )}
    >
      ask my ai
      <span
        aria-hidden
        className="text-primary transition-transform duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
      >
        ↗
      </span>
    </Glass>
  )
}
