"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, X, Minimize2, Bot, User, Loader2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatbotSuggestions } from "./chatbot-suggestions"

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  isError?: boolean
}

interface ChatbotProps {
  className?: string
}

const CHATBOT_API_URL = 'https://manueldavid-resweb-ai-c4296bfdf0b7.herokuapp.com/api/chat'

export function Chatbot({ className }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm Manuel's AI assistant. I can answer questions about his experience, projects, skills, and background. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const sendMessage = async (message: string) => {
    if (!message.trim()) return

    // Hide suggestions after first user message
    setShowSuggestions(false)

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      })

      const data = await response.json()

      if (response.ok && data.response) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chatbot error:', error)
      
      // Get error message from the API response
      const errorText = error instanceof Error ? error.message : 'Unknown error'
      
      let errorMessage = "I'm having technical difficulties. Please try again or contact Manuel directly at manueldavid500@gmail.com."
      
      // Provide more specific error messages
      if (errorText.includes('Service configuration error')) {
        errorMessage = "⚙️ The AI service is currently being set up. Please contact Manuel directly at manueldavid500@gmail.com for now."
      } else if (errorText.includes('rate limit')) {
        errorMessage = "⏱️ I'm getting a lot of questions right now. Please wait a moment and try again."
      } else if (errorText.includes('Failed to fetch') || errorText.includes('network')) {
        errorMessage = "🌐 Connection issue. Please check your internet and try again."
      }

      const botErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, botErrorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 h-12 w-12 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50",
          "bg-gradient-to-r from-amber-600 to-stone-600 hover:from-amber-700 hover:to-stone-700",
          className
        )}
        size="icon"
      >
        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        <span className="sr-only">Open chat</span>
      </Button>
    )
  }

  return (
    <Card 
      className={cn(
        "fixed shadow-2xl transition-all duration-300 z-50",
        // Mobile: fullscreen on small devices
        "bottom-0 left-0 right-0 top-20",
        // Desktop: floating bottom-right
        "sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:w-96",
        "sm:max-w-[calc(100vw-2rem)] sm:max-h-[calc(100vh-2rem)]",
        isMinimized ? "sm:h-16" : showSuggestions ? "sm:h-[600px]" : "sm:h-[500px]",
        // Hide on mobile when minimized
        isMinimized ? "hidden sm:block" : "",
        className
      )}
    >
      <CardHeader 
        className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
        style={{
          background: "linear-gradient(135deg, #7f5539, #9c6644)",
        }}
      >
        <CardTitle className="text-white flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="text-sm sm:text-base">Ask Manuel's AI</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className="bg-white/20 text-white text-xs hidden sm:inline-flex">
            Online
          </Badge>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20 hidden sm:inline-flex"
              onClick={(e) => {
                e.stopPropagation()
                setIsMinimized(!isMinimized)
              }}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-[calc(100%-4rem)] p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%]",
                  message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.sender === 'user'
                      ? "bg-gradient-to-r from-amber-500 to-stone-500"
                      : message.isError
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : "bg-gradient-to-r from-amber-500 to-stone-500"
                  )}
                >
                  {message.sender === 'user' ? (
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  ) : message.isError ? (
                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  ) : (
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  )}
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 sm:px-4 sm:py-2 max-w-full",
                    message.sender === 'user'
                      ? "bg-gradient-to-r from-amber-100 to-stone-100 text-gray-800 border border-amber-200 ml-1 sm:ml-2"
                      : message.isError
                      ? "bg-red-50 text-red-800 border border-red-200 mr-1 sm:mr-2"
                      : "bg-gray-100 text-gray-900 mr-1 sm:mr-2"
                  )}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <span
                    className={cn(
                      "text-xs opacity-70 mt-1 block",
                      message.sender === 'user' ? "text-amber-600" : message.isError ? "text-red-600" : "text-gray-500"
                    )}
                  >
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-amber-500 to-stone-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-3 py-2 sm:px-4 sm:py-2 mr-1 sm:mr-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-gray-500" />
                    <span className="text-xs sm:text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (only show initially) */}
          {showSuggestions && (
            <ChatbotSuggestions 
              onSuggestionClick={handleSuggestionClick}
              isLoading={isLoading}
            />
          )}

          {/* Input */}
          <div className="border-t p-3 sm:p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about Manuel's experience, projects, skills..."
                className="flex-1 text-xs sm:text-sm"
                disabled={isLoading}
                maxLength={500}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-amber-600 to-stone-600 hover:from-amber-700 hover:to-stone-700 flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI assistant with knowledge about Manuel David's portfolio
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
} 