"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Brain, MessageSquare, Zap, Target, Code, Database, CheckCircle, TrendingUp, Lightbulb, FileText, Bot, Settings, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ResumeSiteAIPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => setIsLoading(false), 1000)
      return () => clearTimeout(timer)
    }
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
              <FileText className="w-12 h-12" style={{ color: "#7f5539" }} />
              <h1 className="text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Resume Site AI
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              An intelligent portfolio site featuring a smart Q&A agent that dynamically answers questions about your experience using NLP and contextual matching from your resume content.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Badge className="px-4 py-2 text-sm bg-green-100 text-green-800 border-green-200">
                Live Project
              </Badge>
              <Badge className="px-4 py-2 text-sm bg-blue-100 text-blue-800 border-blue-200">
                AI-Powered
              </Badge>
            </div>
          </div>
        </section>

        {/* Project Image */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 shadow-2xl">
                <div className="bg-gray-900 rounded-xl p-6 text-green-400 font-mono text-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="ml-4 text-gray-400">Resume Site AI - Smart Q&A System</span>
                  </div>
                  <div className="space-y-2">
                    <div><span className="text-blue-400">def</span> <span className="text-yellow-400">process_query</span>(user_question):</div>
                    <div className="ml-4"><span className="text-gray-400"># Intelligent content matching</span></div>
                    <div className="ml-4">context = <span className="text-yellow-400">extract_resume_context</span>()</div>
                    <div className="ml-4">response = <span className="text-yellow-400">ai_model.generate</span>(context, user_question)</div>
                    <div className="ml-4"><span className="text-purple-400">return</span> personalized_response</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#7f5539" }}>
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: MessageSquare,
                  title: "Natural Language Q&A Assistant",
                  description: "Intelligent processing of user questions with contextual understanding"
                },
                {
                  icon: Bot,
                  title: "Personalized Content Responses",
                  description: "Dynamic responses tailored to specific resume content and experience"
                },
                {
                  icon: FileText,
                  title: "Dynamic Resume Parsing",
                  description: "Advanced parsing and matching of resume data with semantic understanding"
                },
                {
                  icon: Zap,
                  title: "Clean, Mobile-Friendly UI",
                  description: "Responsive design optimized for all devices and screen sizes"
                }
              ].map((feature, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-stone-100">
                        <feature.icon className="w-6 h-6" style={{ color: "#7f5539" }} />
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
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#7f5539" }}>
              Technologies Used
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "React", "OpenAI API", "Python", "Natural Language Processing (NLP)", "Firebase", "Heroku", "GitHub"
              ].map((tech, index) => (
                <Badge
                  key={index}
                  className="px-6 py-3 text-base bg-gradient-to-r from-amber-100 to-stone-100 text-gray-800 border border-amber-200 hover:shadow-md transition-all duration-200"
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
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#7f5539" }}>
              Build Process
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Structured resume content into a semantic schema. Built React frontend and Python backend, setting up a flask app using Heroku for deployment. Integrated OpenAI for contextual Q&A.
              </p>
              <div className="space-y-6">
                {[
                  "Designed semantic schema for resume content structure",
                  "Built React frontend with modern UI components", 
                  "Python backend, setting up a flask app using Heroku for deployment",
                  "Integrated OpenAI API for contextual Q&A capabilities",
                  "Implemented content parsing and semantic matching",
                  "Optimized for mobile responsiveness and performance"
                ].map((phase, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1"
                      style={{ background: "linear-gradient(135deg, #7f5539, #9c6644)" }}
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
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#7f5539" }}>
              Challenges & Solutions
            </h2>
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-gradient-to-br from-amber-50 to-stone-50 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <Target className="w-6 h-6 mt-1" style={{ color: "#7f5539" }} />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Challenge: Interpreting vague questions</h3>
                    <p className="text-gray-600">Solution: Designed fallback prompts and added intent clarification</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-stone-50 to-amber-50 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <Database className="w-6 h-6 mt-1" style={{ color: "#7f5539" }} />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Challenge: Structuring resume data for NLP</h3>
                    <p className="text-gray-600">Solution: Created a tagging system for roles, skills, and achievements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Future Improvements */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#7f5539" }}>
              Future Improvements
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: MessageSquare,
                  title: "Audio Q&A Support",
                  description: "Add support for voice-based questions and audio responses"
                },
                {
                  icon: TrendingUp,
                  title: "Analytics Dashboard",
                  description: "Analytics dashboard to track questions and user engagement"
                },
                {
                  icon: Settings,
                  title: "Admin Panel",
                  description: "Admin panel for content control and system management"
                }
              ].map((enhancement, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-white/80 rounded-xl shadow-md">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-stone-100">
                    <enhancement.icon className="w-6 h-6" style={{ color: "#7f5539" }} />
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