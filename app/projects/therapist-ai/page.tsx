"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Brain, MessageSquare, Mic, Heart, Shield, Users, Database, TrendingUp, Lightbulb, Settings, Globe, FileText } from "lucide-react"
import Link from "next/link"

export default function TherapistAIPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Project Details...</p>
        </div>
      </div>
    )
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
            <div className="flex gap-3">
              <Link href="/projects">
                <Button variant="outline" size="sm" className="border-amber-200 hover:bg-amber-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Header */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Brain className="w-12 h-12" style={{ color: "#b08968" }} />
              <h1 className="text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #b08968, #7f5539)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Therapist AI
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A voice-based AI mental health assistant that engages in empathetic, therapeutic conversations, using natural dialogue and emotional nuance.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Badge className="px-4 py-2 text-sm bg-orange-100 text-orange-800 border-orange-200">
                Prototype
              </Badge>
              <Badge className="px-4 py-2 text-sm bg-green-100 text-green-800 border-green-200">
                Voice AI
              </Badge>
            </div>
          </div>
        </section>

        {/* Project Image */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Therapist AI Session Interface</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">Active Session</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Mic className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">"I've been feeling really overwhelmed lately..."</p>
                          <span className="text-xs text-gray-500">User - 2:34 PM</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">"I hear that you're feeling overwhelmed. That sounds really difficult. Can you tell me more about what's contributing to these feelings?"</p>
                          <span className="text-xs text-gray-500">Therapist AI - 2:34 PM</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Recording...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#b08968" }}>
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: MessageSquare,
                  title: "Conversational Voice Interaction",
                  description: "Natural speech-based conversations with empathetic AI responses"
                },
                {
                  icon: Brain,
                  title: "Topic Memory Across Sessions",
                  description: "Maintains conversation context and remembers important topics"
                },
                {
                  icon: Heart,
                  title: "Emotion-Aware Response Tuning",
                  description: "Adapts responses based on emotional context and user state"
                },
                {
                  icon: Shield,
                  title: "Safe-Mode for Mental Health",
                  description: "Built-in safety protocols for mental health conversations"
                }
              ].map((feature, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100">
                        <feature.icon className="w-6 h-6" style={{ color: "#b08968" }} />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technologies Used */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#b08968" }}>
              Technologies Used
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "Python", "OpenAI API", "Eleven Labs", "Firebase"
              ].map((tech, index) => (
                <Badge
                  key={index}
                  className="px-6 py-3 text-base bg-gradient-to-r from-emerald-100 to-teal-100 text-gray-800 border border-emerald-200 hover:shadow-md transition-all duration-200"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Build Process */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#b08968" }}>
              Build Process
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Built a Python-based conversational engine with Firebase as the backend. Integrated Eleven Labs for TTS and recorded sessions. Tuned OpenAI prompts for empathy and safety.
              </p>
              <div className="space-y-6">
                {[
                  "Designed Python-based conversational AI engine",
                  "Integrated Eleven Labs for text-to-speech synthesis",
                  "Implemented Firebase for data storage and session management",
                  "Developed OpenAI prompt tuning for empathetic responses",
                  "Added safety protocols and mental health safeguards",
                  "Created session recording and playback functionality"
                ].map((phase, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1"
                      style={{ background: "linear-gradient(135deg, #b08968, #7f5539)" }}
                    >
                      {index + 1}
                    </div>
                    <p className="text-gray-700 flex-1">{phase}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Challenges & Solutions */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#b08968" }}>
              Challenges & Solutions
            </h2>
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 mt-1" style={{ color: "#b08968" }} />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Challenge: Ensuring ethical responses</h3>
                    <p className="text-gray-600">Solution: Embedded OpenAI's moderation API + post-processing filters</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <Mic className="w-6 h-6 mt-1" style={{ color: "#b08968" }} />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Challenge: Natural voice cadence</h3>
                    <p className="text-gray-600">Solution: Preprocessed responses with timing metadata</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Future Improvements */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#b08968" }}>
              Future Improvements
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: FileText,
                  title: "Journaling & Session History",
                  description: "Add journaling capabilities and comprehensive session tracking"
                },
                {
                  icon: Globe,
                  title: "Multi-lingual Voice Support",
                  description: "Expand voice synthesis to support multiple languages"
                },
                {
                  icon: Settings,
                  title: "Therapist-Mode Toggle",
                  description: "Reflection prompts and specialized therapeutic techniques"
                }
              ].map((enhancement, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-white/80 rounded-xl shadow-md">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100">
                    <enhancement.icon className="w-6 h-6" style={{ color: "#b08968" }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{enhancement.title}</h3>
                    <p className="text-gray-600">{enhancement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
} 