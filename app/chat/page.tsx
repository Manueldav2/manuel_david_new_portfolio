"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Bot, User, Loader2, AlertTriangle, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatbotSuggestions } from "@/components/ui/chatbot-suggestions"
import Link from "next/link"

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  isError?: boolean
}

const CHATBOT_API_URL = 'https://manueldavid-resweb-ai-c4296bfdf0b7.herokuapp.com/api/chat'

export default function ChatPage() {
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
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="font-bold text-2xl hover:opacity-80 transition-opacity"
              style={{
                background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
              Manuel David
            </Link>
            <div className="hidden md:flex gap-2">
              {[
                { name: "Summary", href: "/summary", active: false },
                { name: "Experience", href: "/experience", active: false },
                { name: "Projects", href: "/projects", active: false },
                { name: "Education", href: "/education", active: false },
                { name: "Skills", href: "/skills", active: false },
                { name: "AI Chat", href: "/chat", active: true }
              ].map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    size="sm"
                    className={item.active 
                      ? "text-white" 
                      : "text-gray-700 hover:bg-amber-50 transition-colors duration-200"
                    }
                    style={item.active 
                      ? { background: "linear-gradient(135deg, #9c6644, #7f5539)" }
                      : { color: "#7f5539" }
                    }
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="outline" size="sm" className="border-amber-200 hover:bg-amber-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Bot className="h-8 w-8 text-amber-600" />
              <h1 className="text-4xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                AI Assistant
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have a conversation with Manuel's AI assistant. Ask about his experience, projects, skills, or anything else you'd like to know!
            </p>
            <Badge className="mt-4 bg-gradient-to-r from-amber-500 to-stone-500 text-white">
              Powered by GPT-4
            </Badge>
          </div>

          {/* Chat Interface */}
          <Card className="max-w-4xl mx-auto shadow-2xl">
            <CardHeader 
              className="text-center"
              style={{
                background: "linear-gradient(135deg, #7f5539, #9c6644)",
              }}
            >
              <CardTitle className="text-white flex items-center justify-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Chat with Manuel's AI
                <Badge className="bg-white/20 text-white ml-2">
                  Online
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-[60vh] overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-4 max-w-[85%]",
                      message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        message.sender === 'user'
                          ? "bg-gradient-to-r from-amber-500 to-stone-500"
                          : message.isError
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : "bg-gradient-to-r from-amber-500 to-stone-500"
                      )}
                    >
                      {message.sender === 'user' ? (
                        <User className="h-5 w-5 text-white" />
                      ) : message.isError ? (
                        <AlertTriangle className="h-5 w-5 text-white" />
                      ) : (
                        <Bot className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 max-w-full",
                        message.sender === 'user'
                          ? "bg-gradient-to-r from-amber-100 to-stone-100 text-gray-800 border border-amber-200 ml-2"
                          : message.isError
                          ? "bg-red-50 text-red-800 border border-red-200 mr-2"
                          : "bg-gray-100 text-gray-900 mr-2"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {message.content}
                      </p>
                      <span
                        className={cn(
                          "text-xs opacity-70 mt-2 block",
                          message.sender === 'user' ? "text-amber-600" : message.isError ? "text-red-600" : "text-gray-500"
                        )}
                      >
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-4 max-w-[85%]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-stone-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 mr-2">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        <span className="text-sm text-gray-500">Manuel's AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions (only show initially) */}
              {showSuggestions && (
                <div className="px-6 pb-4">
                  <ChatbotSuggestions 
                    onSuggestionClick={handleSuggestionClick}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {/* Input */}
              <div className="border-t p-6">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about Manuel's experience, projects, skills, or anything else..."
                    className="flex-1 text-sm"
                    disabled={isLoading}
                    maxLength={500}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-gradient-to-r from-amber-600 to-stone-600 hover:from-amber-700 hover:to-stone-700 flex-shrink-0 h-10 px-6"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  AI assistant with comprehensive knowledge about Manuel David's portfolio and experience
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 