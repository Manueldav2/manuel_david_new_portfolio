"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Brain, FileText, CheckCircle, Target, Code, Upload, MessageSquare, Download, Star, Zap, TrendingUp, Settings, Users, AlertTriangle, Lightbulb } from "lucide-react"
import Link from "next/link"

export default function ResumeATSOptimizerPage() {
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
              <FileText className="w-12 h-12" style={{ color: "#3b82f6" }} />
              <h1 className="text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #3b82f6, #1d4ed8)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Resume ATS Optimizer
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              An AI-powered web app designed to help users improve their resumes so they perform better with applicant tracking systems (ATS). The tool guides users through four interactive steps with detailed feedback and scoring.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Badge className="px-4 py-2 text-sm bg-orange-100 text-orange-800 border-orange-200">
                In Development
              </Badge>
              <Badge className="px-4 py-2 text-sm bg-blue-100 text-blue-800 border-blue-200">
                AI-Powered
              </Badge>
              <Badge className="px-4 py-2 text-sm bg-purple-100 text-purple-800 border-purple-200">
                Career Tools
              </Badge>
            </div>
          </div>
        </section>

        {/* Four-Step Process */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#3b82f6" }}>
              Four Interactive Steps
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Upload,
                  title: "Upload Resume",
                  description: "Users upload their existing resume for AI analysis and processing",
                  step: "1"
                },
                {
                  icon: Brain,
                  title: "AI Analysis",
                  description: "Advanced AI models evaluate resume content, structure, and ATS compatibility",
                  step: "2"
                },
                {
                  icon: MessageSquare,
                  title: "Follow-up Questions",
                  description: "Interactive questionnaire to gather additional context and preferences",
                  step: "3"
                },
                {
                  icon: Download,
                  title: "Optimized Resume",
                  description: "Receive fully optimized resume with detailed feedback and scoring",
                  step: "4"
                }
              ].map((step, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 hover:shadow-xl transition-all duration-300 relative">
                  <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                        <step.icon className="w-6 h-6" style={{ color: "#3b82f6" }} />
                      </div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technologies Used */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#3b82f6" }}>
              Technologies Used
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "React", "TypeScript", "Tailwind CSS", "OpenAI", "AI Analysis", "Lucide Icons", "File Upload API", "Resume Parsing"
              ].map((tech, index) => (
                <Badge
                  key={index}
                  className="px-6 py-3 text-base bg-gradient-to-r from-blue-100 to-indigo-100 text-gray-800 border border-blue-200 hover:shadow-md transition-all duration-200"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Challenges */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#3b82f6" }}>
              Technical Challenges & Solutions
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {[
                {
                  challenge: "User Flow & State Management",
                  solution: "Structured natural user flow with conditional rendering across multiple steps and complex state updates for resume data, AI responses, and user answers.",
                  icon: Target
                },
                {
                  challenge: "File Processing & Security",
                  solution: "Implemented secure file upload parsing, resume content processing, and professional result formatting with careful UI/UX planning and API design.",
                  icon: Settings
                }
              ].map((item, index) => (
                <Card key={index} className="shadow-xl bg-white border-0 hover:shadow-2xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="w-6 h-6 text-orange-500" />
                      <CardTitle className="text-xl" style={{ color: "#3b82f6" }}>Challenge</CardTitle>
                    </div>
                    <CardDescription className="text-gray-700 text-base leading-relaxed">
                      {item.challenge}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-l-4 pl-4" style={{ borderColor: "#60a5fa" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold text-gray-800">Solution</h4>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{item.solution}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#3b82f6" }}>
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: "AI Resume Analysis",
                  description: "Advanced AI models evaluate resume content for ATS compatibility and optimization opportunities"
                },
                {
                  icon: Star,
                  title: "Detailed Scoring",
                  description: "Comprehensive scoring system with specific feedback on resume strengths and areas for improvement"
                },
                {
                  icon: FileText,
                  title: "Professional Formatting",
                  description: "Clean, professional result formatting that presents feedback in a clear and actionable way"
                },
                {
                  icon: Upload,
                  title: "Secure File Upload",
                  description: "Safe and secure resume upload with intelligent parsing and content extraction"
                },
                {
                  icon: MessageSquare,
                  title: "Interactive Questionnaire",
                  description: "Follow-up questions to gather context and personalize optimization recommendations"
                },
                {
                  icon: CheckCircle,
                  title: "ATS Optimization",
                  description: "Specifically designed to improve resume performance with applicant tracking systems"
                }
              ].map((feature, index) => (
                <div key={index} className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                      <feature.icon className="w-6 h-6" style={{ color: "#3b82f6" }} />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Project Impact */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#3b82f6" }}>
              Project Impact & Learnings
            </h2>
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-xl bg-white border-0">
                <CardContent className="p-8">
                  <p className="text-lg text-gray-700 leading-relaxed mb-6">
                    This project demonstrates the ability to combine thoughtful user experience with cutting-edge AI to solve a real-world career challenge. The Resume ATS Optimizer addresses a critical pain point for job seekers who struggle to get their resumes past automated screening systems.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        icon: Target,
                        title: "Problem Solving",
                        description: "Tackles real-world career challenges with innovative AI solutions"
                      },
                      {
                        icon: Users,
                        title: "User Experience",
                        description: "Carefully designed user flow that feels natural and helpful throughout the process"
                      },
                      {
                        icon: TrendingUp,
                        title: "Technical Growth",
                        description: "Advanced state management and complex conditional rendering across multiple steps"
                      }
                    ].map((impact, index) => (
                      <div key={index} className="text-center">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                            <impact.icon className="w-6 h-6" style={{ color: "#3b82f6" }} />
                          </div>
                        </div>
                        <h4 className="text-lg font-semibold mb-2" style={{ color: "#3b82f6" }}>{impact.title}</h4>
                        <p className="text-gray-600 text-sm">{impact.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
} 