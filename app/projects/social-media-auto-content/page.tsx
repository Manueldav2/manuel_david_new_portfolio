"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Brain, MessageSquare, Zap, Target, Code, Database, CheckCircle, TrendingUp, Lightbulb, FileText, Bot, Settings, Users, Smartphone, Calendar, Share2, Image, Cloud } from "lucide-react"
import Link from "next/link"

export default function SocialMediaAutoContentPage() {
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
              <Share2 className="w-12 h-12" style={{ color: "#7f5539" }} />
              <h1 className="text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Social Media Auto Content
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Automatically generate and post short-form content to social media based on business images and descriptions using AI-powered content generation that makes each post unique, engaging, and on-brand.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Badge className="px-4 py-2 text-sm bg-orange-100 text-orange-800 border-orange-200">
                In Development
              </Badge>
              <Badge className="px-4 py-2 text-sm bg-blue-100 text-blue-800 border-blue-200">
                AI-Powered
              </Badge>
              <Badge className="px-4 py-2 text-sm bg-purple-100 text-purple-800 border-purple-200">
                No-Code
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
                  icon: Brain,
                  title: "AI Content Generation",
                  description: "Takes business descriptions and photos to generate unique, engaging posts"
                },
                {
                  icon: Image,
                  title: "Media Handling",
                  description: "Automatically processes and optimizes images/videos for social platforms"
                },
                {
                  icon: Calendar,
                  title: "Auto-Scheduling",
                  description: "Automatically schedules or posts content through social media APIs"
                },
                {
                  icon: Settings,
                  title: "Custom Templates",
                  description: "Define themes, voice tones, and goals for brand-consistent content"
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
                "N8N", "AI Content Generation", "Social Media APIs", "Cloudflare R2", "Buffer/Publer", "ChatGPT API", "Google Drive", "Zapier"
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
                "Upload client media and business description to cloud storage",
                "AI analyzes content and generates captions, hashtags, and post ideas", 
                "System selects appropriate media assets for each post",
                "Content is formatted for specific platforms (Instagram, TikTok, Facebook)",
                "Posts are automatically scheduled or published through social media APIs",
                "Performance tracking and analytics are collected for optimization"
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

        {/* Benefits */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#7f5539" }}>
              Benefits & Impact
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: Zap,
                  title: "Time Savings",
                  description: "Automates content creation process, saving hours of manual work daily"
                },
                {
                  icon: TrendingUp,
                  title: "Consistent Posting",
                  description: "Maintains regular social media presence with brand-consistent content"
                },
                {
                  icon: Target,
                  title: "Scalable Solution",
                  description: "Can handle multiple clients and brands with customized templates"
                }
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-gradient-to-br from-amber-50 to-stone-50 rounded-xl shadow-md">
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