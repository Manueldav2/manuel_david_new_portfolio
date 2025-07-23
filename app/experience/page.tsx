"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Briefcase, CheckCircle, ArrowLeft, Calendar, MapPin, Building, Brain, Rocket, Monitor, Users, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function ExperiencePage() {
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
          <p className="text-lg text-gray-600">Loading Experience...</p>
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
                { name: "Experience", href: "/experience", active: true },
                { name: "Projects", href: "/projects", active: false },
                { name: "Education", href: "/education", active: false },
                { name: "Skills", href: "/skills", active: false }
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
              <Briefcase className="w-12 h-12" style={{ color: "#7f5539" }} />
              <h1 className="text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Professional Experience
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Proven track record of delivering scalable software solutions and AI-powered applications across diverse industries and business contexts.
            </p>
          </div>
        </section>

        {/* Experience Timeline */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="space-y-12">
              {[
                {
                  title: "AI Engineer",
                  company: "Devvcore",
                  location: "Remote",
                  period: "Feb 2025 – Present",
                  achievements: [
                    "Developed production-ready AI workflows with Python, OpenAI, and Claude to automate support, content generation, and task management",
                    "Delivered scalable internal tools, enhancing developer velocity and user engagement across web platforms",
                    "Implemented advanced AI solutions for content automation and user engagement optimization",
                    "Collaborated with cross-functional teams to integrate AI capabilities into existing systems"
                  ],
                  gradient: "rgba(237, 224, 212, 0.2)",
                  borderColor: "#ddb892",
                  icon: Brain
                },
                {
                  title: "Founder & Lead Developer",
                  company: "Nouvo.dev",
                  location: "Remote",
                  period: "May 2024 – Present",
                  achievements: [
                    "Founded a boutique agency building AI-integrated websites for creators, professionals, and local businesses",
                    "Built Resume AI, Cold Email SaaS, and a smart chatbot assistant to automate lead gen and onboarding",
                    "Delivered 12+ branded business websites with interactive design, intelligent search, and automation",
                    "Managed client relationships and project delivery with 100% client satisfaction rate"
                  ],
                  gradient: "rgba(230, 204, 178, 0.2)",
                  borderColor: "#b08968",
                  icon: Rocket
                },
                {
                  title: "Technology Support & Social Media Lead",
                  company: "Chapel of Praise",
                  location: "Rogers, AR",
                  period: "Aug 2022 – May 2024",
                  achievements: [
                    "Modernized livestream workflows and technical infrastructure to support hybrid services",
                    "Produced and managed creative content strategies, increasing engagement by 35%+ across platforms",
                    "Implemented new streaming technologies and improved technical reliability",
                    "Coordinated with ministry teams to ensure seamless technical support during services"
                  ],
                  gradient: "rgba(221, 184, 146, 0.2)",
                  borderColor: "#9c6644",
                  icon: Monitor
                },
              ].map((job, index) => (
                <Card
                  key={index}
                  className="shadow-xl border-0 relative overflow-hidden group hover:shadow-2xl transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${job.gradient}, rgba(255, 255, 255, 0.8))`,
                  }}>
                  <div className="absolute top-4 right-4 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <job.icon className="w-8 h-8" style={{ color: job.borderColor }} />
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle className="text-3xl font-bold mb-2">{job.title}</CardTitle>
                        <div className="flex items-center gap-4 text-lg text-gray-600">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{job.period}</span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className="text-white text-lg px-4 py-2"
                        style={{ background: `linear-gradient(135deg, ${job.borderColor}, #7f5539)` }}>
                        {job.period}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4 text-gray-700">
                      {job.achievements.map((achievement, achIndex) => (
                        <li
                          key={achIndex}
                          className="flex items-start gap-3 text-lg">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Summary */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold mb-8" style={{ color: "#7f5539" }}>
              Core Competencies
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "AI & Machine Learning", skills: ["OpenAI API", "React", "Python", "Automation"], icon: Brain },
                { title: "Full-Stack Development", skills: ["React", "Node.js", "Python", "Firebase"], icon: Monitor },
                { title: "Business & Leadership", skills: ["Project Management", "Client Relations", "Team Leadership"], icon: Users },
              ].map((category, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-center mb-4">
                    <category.icon className="w-8 h-8" style={{ color: "#9c6644" }} />
                  </div>
                  <h4 className="text-xl font-semibold mb-4" style={{ color: "#9c6644" }}>{category.title}</h4>
                  <div className="space-y-2">
                    {category.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline" className="mr-2 mb-2"
                        style={{ borderColor: "#b08968", color: "#7f5539" }}>
                        {skill}
                      </Badge>
                    ))}
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