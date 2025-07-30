"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Rocket, Brain, Mail, Smartphone, Globe, FlaskConical, Code, ArrowLeft, ExternalLink, Github, Info, Target, TrendingUp, Award, Users, Lock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ProjectsPage() {
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
          <p className="text-lg text-gray-600">Loading Projects...</p>
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
                { name: "Projects", href: "/projects", active: true },
                { name: "Education", href: "/education", active: false },
                { name: "Skills", href: "/skills", active: false },
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
              <Rocket className="w-12 h-12" style={{ color: "#7f5539" }} />
              <h1 className="text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Featured Projects
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Innovative AI-powered applications and web solutions that demonstrate technical expertise and creative problem-solving capabilities.
            </p>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-24 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: "Resume ATS Optimizer",
                  slug: "resume-ats-optimizer",
                  description: "AI-powered web app that analyzes and optimizes resumes for applicant tracking systems through four interactive steps with detailed feedback and scoring.",
                  tech: ["React", "TypeScript", "Tailwind CSS", "OpenAI", "AI Analysis"],
                  gradient: "from-blue-50 to-indigo-50",
                  color: "#3b82f6",
                  status: "In Development",
                  github: "https://github.com/Manueldav2/ats-resume-optimizer.git"
                },
                {
                  icon: Brain,
                  title: "Resume Site AI",
                  slug: "resume-site-ai",
                  description: "Smart Q&A agent for resume-based portfolio sites with intelligent content matching and personalized responses.",
                  tech: ["OpenAI API", "React", "Python", "NLP"],
                  gradient: "from-emerald-50 to-teal-50",
                  color: "#10b981",
                  status: "Live",
                  github: "https://github.com/Manueldav2/manuel_david_new_portfolio.git",
                  githubBackend: "https://github.com/Manueldav2/manueldavid-resweb-ai.git"
                },
                {
                  icon: Mail,
                  title: "Cold Email SaaS",
                  slug: "cold-email-saas", 
                  description: "Outreach automation tool integrating OpenAI and BillionMail backend for lead generation and sales optimization.",
                  tech: ["OpenAI", "BillionMail", "Node.js", "Automation"],
                  gradient: "from-purple-50 to-violet-50",
                  color: "#8b5cf6",
                  status: "In Development",
                  github: "privileged"
                },
                {
                  icon: Smartphone,
                  title: "Social Media Auto Content",
                  slug: "social-media-auto-content",
                  description: "Automatically generate and post short-form content to social media based on business images and descriptions using AI-powered content generation.",
                  tech: ["N8N", "AI Content Generation", "Social Media APIs", "Cloudflare R2"],
                  gradient: "from-pink-50 to-rose-50",
                  color: "#ec4899",
                  status: "In Development",
                  github: "privileged"
                },
                {
                  icon: Mail,
                  title: "Smart Email Assistant",
                  slug: "smart-email-assistant",
                  description: "Automatically read, respond to, and send emails, and add events to calendar based on email content—perfect for client communication and appointment setting.",
                  tech: ["N8N", "Gmail API", "Calendar API", "AI Processing"],
                  gradient: "from-cyan-50 to-sky-50",
                  color: "#06b6d4",
                  status: "In Development",
                  github: "https://github.com/Manueldav2/my_ai_backend.git"
                },
                {
                  icon: Smartphone,
                  title: "Therapist AI",
                  slug: "therapist-ai",
                  description: "Voice-interactive mental health assistant using advanced AI and speech synthesis for therapeutic conversations.",
                  tech: ["Python", "Eleven Labs", "OpenAI", "Voice AI"],
                  gradient: "from-orange-50 to-amber-50",
                  color: "#f59e0b",
                  status: "Prototype",
                  github: "https://github.com/Manueldav2/thera_ai.git"
                },
                {
                  icon: Globe,
                  title: "Nouvo.dev Platform",
                  slug: "nouvo-platform",
                  description: "AI agency platform with chatbot assistant and automated client onboarding workflows for digital services.",
                  tech: ["React", "AI APIs", "Automation", "SaaS"],
                  gradient: "from-red-50 to-pink-50",
                  color: "#ef4444",
                  status: "Live",
                  github: "https://github.com/Manueldav2/nouvo.dev.git",
                  githubBackend: "https://github.com/Manueldav2/nouvo.dev_backend.git",
                  externalUrl: "https://nouvo.dev/"
                },
                {
                  icon: FlaskConical,
                  title: "Business Website (Pop Up)",
                  slug: "popup-drink-website",
                  description: "AI-powered drink recommendation tool and brand site with intelligent product matching and user engagement.",
                  tech: ["AI Recommendations", "React", "Firebase", "E-commerce"],
                  gradient: "from-lime-50 to-green-50",
                  color: "#22c55e",
                  status: "Live",
                  github: "privileged"
                },
                {
                  icon: Code,
                  title: "Business Websites Portfolio",
                  slug: "business-websites",
                  description: "Delivered portfolio and e-commerce sites for fashion, tech, and service brands with modern design and functionality.",
                  tech: ["React", "Webflow", "Custom Code", "UI/UX"],
                  gradient: "from-slate-50 to-gray-50",
                  color: "#64748b",
                  status: "Live",
                  github: "https://github.com/Manueldav2/blast-beyond.git",
                  externalUrl: "https://blastnbeyond.com/"
                },
              ].map((project, index) => (
                <Card
                  key={index}
                  className={`group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br ${project.gradient} relative overflow-hidden`}>
                  <div className="absolute top-4 right-4">
                    <Badge 
                      className="text-white text-xs"
                      style={{ 
                        background: project.status === "Live" ? "linear-gradient(135deg, #10b981, #059669)" : 
                                 "linear-gradient(135deg, #f59e0b, #d97706)" 
                      }}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div
                        className="p-3 rounded-xl text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${project.color}, #9c6644)` }}>
                        <project.icon className="w-6 h-6" />
                      </div>
                      <span>{project.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-6 leading-relaxed">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tech.map((tech, techIndex) => (
                        <Badge
                          key={techIndex}
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: project.color, color: project.color }}>
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/projects/${project.slug}`} className="flex-1">
                        <Button size="sm" className="w-full" style={{ background: `linear-gradient(135deg, ${project.color}, #9c6644)` }}>
                          <Info className="w-4 h-4 mr-2" />
                          About
                        </Button>
                      </Link>
                      {project.github === "privileged" ? (
                        <Button variant="outline" size="sm" className="flex-1" disabled>
                          <Lock className="w-4 h-4 mr-2" />
                          Privileged Code
                        </Button>
                      ) : project.githubBackend ? (
                        <div className="flex-1 flex gap-2">
                          <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Github className="w-4 h-4 mr-2" />
                              Frontend
                            </Button>
                          </a>
                          <a href={project.githubBackend} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Github className="w-4 h-4 mr-2" />
                              Backend
                            </Button>
                          </a>
                        </div>
                      ) : (
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Github className="w-4 h-4 mr-2" />
                            Code
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Project Stats */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold mb-8" style={{ color: "#7f5539" }}>
              Project Impact
            </h3>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: "12+", label: "Websites Delivered", icon: Globe },
                { number: "10+", label: "AI Projects", icon: Brain },
                { number: "93%", label: "Client Satisfaction", icon: Award },
                { number: "2+", label: "Years Experience", icon: TrendingUp }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-8 h-8" style={{ color: "#9c6644" }} />
                  </div>
                  <div className="text-3xl font-bold mb-2" style={{ color: "#9c6644" }}>{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
} 