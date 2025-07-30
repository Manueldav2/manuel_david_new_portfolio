"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Brain, MessageSquare, Zap, Target, Code, Database, CheckCircle, TrendingUp, Lightbulb, FileText, Bot, Settings, Users, Mail, Calendar, Clock, Bell } from "lucide-react"
import Link from "next/link"

export default function SmartEmailAssistantPage() {
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
              <Mail className="w-12 h-12" style={{ color: "#7f5539" }} />
              <h1 className="text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Smart Email Assistant
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Automatically read, respond to, and send emails, and add events to a calendar based on email content or triggers—perfect for client communication, lead follow-up, and appointment setting.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Badge className="px-4 py-2 text-sm bg-orange-100 text-orange-800 border-orange-200">
                In Development
              </Badge>
              <Badge className="px-4 py-2 text-sm bg-blue-100 text-blue-800 border-blue-200">
                AI-Powered
              </Badge>
              <Badge className="px-4 py-2 text-sm bg-purple-100 text-purple-800 border-purple-200">
                Automation
              </Badge>
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
                  icon: Mail,
                  title: "Auto Email Reading & Parsing",
                  description: "Monitors inbox and extracts key information like sender, intent, and dates"
                },
                {
                  icon: MessageSquare,
                  title: "Smart Auto Responses",
                  description: "Sends intelligent replies using templates or AI-generated content"
                },
                {
                  icon: Calendar,
                  title: "Calendar Integration",
                  description: "Automatically adds events to Google Calendar or Outlook based on email content"
                },
                {
                  icon: Bell,
                  title: "Event Confirmation",
                  description: "Sends confirmation and reminder emails with meeting details and links"
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
                "N8N", "Gmail API", "Calendar API", "AI Processing", "ChatGPT API", "Outlook API", "Microsoft Graph API", "Zoho Mail", "IMAP/SMTP"
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

        {/* Workflow Process */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#7f5539" }}>
              Automation Workflow
            </h2>
            <div className="max-w-4xl mx-auto space-y-6">
              {[
                "Trigger: New email arrives in monitored inbox",
                "Parse: AI extracts content, intent, and potential date/time information",
                "Logic Branch: Determines if it's a meeting request, question, or general inquiry",
                "Response: Sends appropriate reply with booking link or AI-generated answer",
                "Calendar: Automatically creates calendar event if meeting request detected",
                "Follow-up: Sends confirmation emails and reminder notifications"
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
        </section>

        {/* Use Cases */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#7f5539" }}>
              Real-World Use Cases
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Target,
                  title: "Lead Management",
                  description: "Automatically follow up with prospects and manage lead generation for agencies"
                },
                {
                  icon: Clock,
                  title: "Proposal Follow-ups",
                  description: "Send follow-up emails 2 days after initial contact with proposals and pricing"
                },
                {
                  icon: Users,
                  title: "Client Scheduling",
                  description: "Manage multiple clients' schedules automatically with calendar integration"
                },
                {
                  icon: Bot,
                  title: "24/7 Auto-responder",
                  description: "Provide instant responses while you sleep or focus on important work"
                }
              ].map((useCase, index) => (
                <div key={index} className="p-6 bg-gradient-to-br from-amber-50 to-stone-50 rounded-xl shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-stone-100">
                      <useCase.icon className="w-6 h-6" style={{ color: "#7f5539" }} />
                    </div>
                    <h3 className="text-lg font-semibold">{useCase.title}</h3>
                  </div>
                  <p className="text-gray-600">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#7f5539" }}>
              Benefits & Impact
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: Zap,
                  title: "Instant Response Time",
                  description: "Respond to emails within minutes, improving client satisfaction and lead conversion"
                },
                {
                  icon: TrendingUp,
                  title: "Increased Productivity",
                  description: "Focus on high-value tasks while automation handles routine email management"
                },
                {
                  icon: Target,
                  title: "Never Miss Opportunities",
                  description: "Automated follow-ups ensure no leads are lost and all meetings are scheduled"
                }
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-white/80 rounded-xl shadow-md">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-stone-100">
                    <benefit.icon className="w-6 h-6" style={{ color: "#7f5539" }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
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