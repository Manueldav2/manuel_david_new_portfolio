"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Globe, Bot, Users, Workflow, Calendar, MessageSquare, Database, TrendingUp, Lightbulb, Settings, DollarSign, BarChart } from "lucide-react"
import Link from "next/link"

export default function NouvoPlatformPage() {
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
              <Globe className="w-12 h-12" style={{ color: "#ddb892" }} />
              <h1 className="text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #ddb892, #7f5539)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Nouvo.dev Platform
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              An all-in-one AI agency platform that automates service onboarding, client engagement, and task delivery through chatbot and workflow logic.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Badge className="px-4 py-2 text-sm bg-green-100 text-green-800 border-green-200">
                Live Platform
              </Badge>
              <Badge className="px-4 py-2 text-sm bg-blue-100 text-blue-800 border-blue-200">
                AI Agency SaaS
              </Badge>
            </div>
          </div>
        </section>

        {/* Project Image */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Nouvo.dev Agency Dashboard</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Active Platform</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-indigo-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-indigo-600">47</div>
                        <div className="text-sm text-gray-600">Active Clients</div>
                      </div>
                      <div className="bg-cyan-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-cyan-600">89%</div>
                        <div className="text-sm text-gray-600">Automation Rate</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">156</div>
                        <div className="text-sm text-gray-600">Tasks Completed</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Web Development Onboarding</span>
                        <span className="text-sm font-medium text-green-600">Automated</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">AI Chatbot Integration</span>
                        <span className="text-sm font-medium text-blue-600">In Progress</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Client Communication Flow</span>
                        <span className="text-sm font-medium text-purple-600">Active</span>
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
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#ddb892" }}>
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Workflow,
                  title: "Dynamic Onboarding Flows",
                  description: "Automated client onboarding tailored to specific service types"
                },
                {
                  icon: Database,
                  title: "Embedded Service Catalog",
                  description: "Comprehensive catalog of AI agency services and packages"
                },
                {
                  icon: Bot,
                  title: "Custom AI Chatbot Assistant",
                  description: "Intelligent chatbot for client communication and support"
                },
                {
                  icon: Users,
                  title: "Third-Party Integrations",
                  description: "Seamless integration with Calendly, Zoho, and Slack"
                }
              ].map((feature, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100">
                        <feature.icon className="w-6 h-6" style={{ color: "#ddb892" }} />
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
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#ddb892" }}>
              Technologies Used
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "React", "OpenAI + External APIs", "Firebase", "Zoho", "Calendly", "Slack API", "Heroku"
              ].map((tech, index) => (
                <Badge
                  key={index}
                  className="px-6 py-3 text-base bg-gradient-to-r from-indigo-100 to-cyan-100 text-gray-800 border border-indigo-200 hover:shadow-md transition-all duration-200"
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
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#ddb892" }}>
              Build Process
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Built modular components using React. Firebase handled real-time data, functions, and hosting. Designed onboarding to dynamically adjust per service type. Chatbot responds based on form context and client type.
              </p>
              <div className="space-y-6">
                {[
                  "Developed modular React components for platform flexibility",
                  "Implemented Firebase for real-time data and hosting",
                  "Created dynamic onboarding logic based on service types",
                  "Built intelligent chatbot with contextual responses",
                  "Integrated third-party APIs for workflow automation",
                  "Designed responsive UI optimized for agency workflows"
                ].map((phase, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1"
                      style={{ background: "linear-gradient(135deg, #ddb892, #7f5539)" }}
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
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#ddb892" }}>
              Challenges & Solutions
            </h2>
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <Workflow className="w-6 h-6 mt-1" style={{ color: "#ddb892" }} />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Challenge: Automating diverse services</h3>
                    <p className="text-gray-600">Solution: Used schema-driven onboarding logic</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-indigo-50 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <MessageSquare className="w-6 h-6 mt-1" style={{ color: "#ddb892" }} />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Challenge: Client communications sync</h3>
                    <p className="text-gray-600">Solution: Integrated Slack bot alerts and Zoho inbox routing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Future Improvements */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#ddb892" }}>
              Future Improvements
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: Bot,
                  title: "Expand Chatbot Knowledgebase",
                  description: "Enhanced AI capabilities with broader service knowledge"
                },
                {
                  icon: DollarSign,
                  title: "Stripe for Subscriptions",
                  description: "Automated billing and subscription management"
                },
                {
                  icon: BarChart,
                  title: "Workflow Tracking Dashboard",
                  description: "Comprehensive analytics and project tracking system"
                }
              ].map((enhancement, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-white/80 rounded-xl shadow-md">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100">
                    <enhancement.icon className="w-6 h-6" style={{ color: "#ddb892" }} />
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