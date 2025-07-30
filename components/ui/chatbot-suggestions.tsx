"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb } from "lucide-react"

interface ChatbotSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
  isLoading?: boolean
}

const suggestions = [
  "Tell me about Manuel's AI projects",
  "What technologies does Manuel use?",
  "How can I contact Manuel?",
  "What is Manuel's experience?",
  "Tell me about the Cold Email SaaS",
  "What skills does Manuel have?"
]

export function ChatbotSuggestions({ onSuggestionClick, isLoading }: ChatbotSuggestionsProps) {
  return (
    <div className="p-4 border-t bg-gradient-to-r from-amber-50 to-stone-50">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-medium text-gray-700">Quick Questions</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
            disabled={isLoading}
            className="text-xs text-left justify-start h-auto py-2 px-3 hover:bg-white/60 text-gray-700 hover:text-gray-900"
          >
            "{suggestion}"
          </Button>
        ))}
      </div>
    </div>
  )
} 