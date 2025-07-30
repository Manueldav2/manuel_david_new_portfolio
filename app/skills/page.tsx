"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Code, Brain, Server, Database, Zap, Target, ArrowLeft, Star, TrendingUp, CheckCircle, Award, BookOpen, Users } from "lucide-react"
import Link from "next/link"

export default function SkillsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Skills...</p>
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
            <div className="hidden md:flex gap-2">
              {[
                { name: "Summary", href: "/summary", active: false },
                { name: "Experience", href: "/experience", active: false },
                { name: "Projects", href: "/projects", active: false },
                { name: "Education", href: "/education", active: false },
                { name: "Skills", href: "/skills", active: true },
                { name: "AI Chat", href: "/chat", active: false }
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

      <main className="pt-24">
        {/* Header */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Code className="w-12 h-12" style={{ color: "#7f5539" }} />
              <h1 className="text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Manuel David Portfolio website
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive technical expertise spanning full-stack development, AI integration, and modern cloud technologies.
            </p>
          </div>
        </section>

        {/* Skills Grid */}
        <section className="py-24 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Code,
                  title: "Programming Languages",
                  skills: [
                    { name: "Python", level: "Expert", color: "#7f5539" },
                    { name: "JavaScript", level: "Expert", color: "#9c6644" },
                    { name: "HTML", level: "Expert", color: "#b08968" },
                    { name: "SQL", level: "Expert", color: "#ddb892" },
                    { name: "Java", level: "Intermediate", color: "#e6ccb2" }
                  ],
                  color: "#7f5539",
                  description: "Core programming languages for web and software development"
                },
                {
                  icon: Server,
                  title: "Frameworks & Libraries",
                  skills: [
                    { name: "React", level: "Expert", color: "#7f5539" },
                    { name: "Flask", level: "Advanced", color: "#9c6644" },
                    { name: "Node.js", level: "Advanced", color: "#b08968" },
                    { name: "Next.js", level: "Expert", color: "#ddb892" }
                  ],
                  color: "#9c6644",
                  description: "Modern frameworks for building scalable applications"
                },
                {
                  icon: Brain,
                  title: "AI/ML Tools",
                  skills: [
                    { name: "Eleven Labs", level: "Expert", color: "#7f5539" },
                    { name: "N8N", level: "Expert", color: "#9c6644" },
                    { name: "Gemini", level: "Advanced", color: "#b08968" },
                    { name: "Copilot", level: "Advanced", color: "#ddb892" },
                    { name: "Perplexity", level: "Intermediate", color: "#e6ccb2" },
                    { name: "Perplexity API", level: "Intermediate", color: "#f5f5f5" }
                  ],
                  color: "#b08968",
                  description: "AI integration and automation tools"
                },
                {
                  icon: Database,
                  title: "Cloud & Platforms",
                  skills: [
                    { name: "Firebase", level: "Expert", color: "#7f5539" },
                    { name: "Heroku", level: "Expert", color: "#9c6644" },
                    { name: "Git/GitHub", level: "Expert", color: "#b08968" },
                    { name: "Docker", level: "Intermediate", color: "#ddb892" },
                    { name: "Webflow", level: "Intermediate", color: "#e6ccb2" }
                  ],
                  color: "#ddb892",
                  description: "Cloud infrastructure and deployment platforms"
                },
                {
                  icon: Zap,
                  title: "Automation & Tools",
                  skills: [
                    { name: "Cursor", level: "Expert", color: "#7f5539" },
                    { name: "Reactbits", level: "Expert", color: "#9c6644" },
                    { name: "Linear", level: "Advanced", color: "#b08968" },
                    { name: "Calendly", level: "Advanced", color: "#ddb892" }
                  ],
                  color: "#e6ccb2",
                  description: "Productivity and development tools"
                },
                {
                  icon: Target,
                  title: "Core Strengths",
                  skills: [
                    { name: "Full-Stack Development", level: "Expert", color: "#7f5539" },
                    { name: "AI Automation", level: "Expert", color: "#9c6644" },
                    { name: "SaaS Engineering", level: "Advanced", color: "#b08968" },
                    { name: "Responsive UI/UX", level: "Expert", color: "#ddb892" }
                  ],
                  color: "#7f5539",
                  description: "Key areas of expertise and specialization"
                },
              ].map((category, index) => (
                <Card
                  key={index}
                  className="shadow-xl border-0 relative overflow-hidden group hover:shadow-2xl transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, rgba(237, 224, 212, 0.2), rgba(230, 204, 178, 0.1))`,
                  }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <category.icon className="w-6 h-6 flex-shrink-0" style={{ color: category.color }} />
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.skills.map((skill, skillIndex) => (
                        <div
                          key={skillIndex}
                          className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4" style={{ color: skill.color }} />
                            <span className="text-gray-700 font-medium">{skill.name}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ 
                              borderColor: skill.color, 
                              color: skill.color,
                              background: skill.level === "Expert" ? `${skill.color}10` : "transparent"
                            }}>
                            {skill.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Skill Levels */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: "#7f5539" }}>
              Skill Proficiency Levels
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  level: "Expert",
                  description: "Deep understanding, can teach others, leads projects",
                  color: "#7f5539",
                  icon: Award
                },
                {
                  level: "Advanced",
                  description: "Strong skills, independent work, some mentoring",
                  color: "#9c6644",
                  icon: TrendingUp
                },
                {
                  level: "Intermediate",
                  description: "Good foundation, learning advanced concepts",
                  color: "#b08968",
                  icon: BookOpen
                }
              ].map((level, index) => (
                <div key={index} className="text-center p-6 bg-gradient-to-br from-stone-50 to-amber-50 rounded-xl">
                  <div className="flex justify-center mb-4">
                    <level.icon className="w-8 h-8" style={{ color: level.color }} />
                  </div>
                  <h4 className="text-xl font-bold mb-2" style={{ color: level.color }}>{level.level}</h4>
                  <p className="text-gray-600">{level.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Journey */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold mb-8" style={{ color: "#7f5539" }}>
              Continuous Learning Journey
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: "#9c6644" }}>
                  <TrendingUp className="w-5 h-5" />
                  Currently Learning
                </h4>
                <div className="space-y-3">
                  {[
                    "Advanced AI/ML Algorithms",
                    "Cloud Architecture (AWS/Azure)",
                    "Webflow",
                    "Perplexity API"
                  ].map((skill, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: "#9c6644" }}>
                  <Star className="w-5 h-5" />
                  Future Goals
                </h4>
                <div className="space-y-3">
                  {[
                    "Machine Learning Engineering",
                    "Cloud Solutions Architecture",
                    "Technical Leadership",
                    "Open Source Contributions"
                  ].map((goal, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white/80 rounded-lg">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#7f5539" }}></div>
                      <span className="text-gray-700">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
} 