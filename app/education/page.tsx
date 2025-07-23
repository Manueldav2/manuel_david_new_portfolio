"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { GraduationCap, MapPin, Star, ArrowLeft, Calendar, Award, Users, BookOpen, Target, TrendingUp, Brain, Code } from "lucide-react"
import Link from "next/link"

export default function EducationPage() {
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
          <p className="text-lg text-gray-600">Loading Education...</p>
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
                { name: "Education", href: "/education", active: true },
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
              <GraduationCap className="w-12 h-12" style={{ color: "#7f5539" }} />
              <h1 className="text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Education
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Academic foundation and continuous learning in computer science and technology.
            </p>
          </div>
        </section>

        {/* Education Timeline */}
        <section className="py-24 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {[
                {
                  school: "Arizona State University",
                  degree: "B.S. in Computer Information Systems",
                  status: "Expected May 2028",
                  location: "Tempe, AZ",
                  activities: [
                    "Member - Software Developers Association",
                    "Member - AI in Business Club",
                    "Participating in hackathons and coding competitions",
                    "Learning advanced software development methodologies"
                  ],
                  gradient: "#7f5539",
                  icon: GraduationCap,
                  gpa: "3.8",
                  credits: "45/120"
                },
                {
                  school: "Bentonville High School",
                  degree: "High School Diploma",
                  status: "May 2024",
                  location: "Bentonville, AR",
                  activities: [
                    "Technology & Computer Science Focus",
                    "Advanced Placement Computer Science",
                    "Robotics Club Member",
                    "Academic Excellence Award"
                  ],
                  gradient: "#9c6644",
                  icon: BookOpen,
                  gpa: "3.9",
                  credits: "Graduated"
                },
              ].map((edu, index) => (
                <Card
                  key={index}
                  className="shadow-xl border-0 relative overflow-hidden group hover:shadow-2xl transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, rgba(237, 224, 212, 0.2), rgba(230, 204, 178, 0.1))`,
                  }}>
                  <div className="absolute top-4 right-4 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <edu.icon className="w-8 h-8" style={{ color: edu.gradient }} />
                  </div>
                  <CardHeader
                    className="text-white p-8"
                    style={{ background: `linear-gradient(135deg, ${edu.gradient}, #b08968)` }}>
                    <CardTitle className="text-3xl font-bold mb-2">{edu.school}</CardTitle>
                    <CardDescription className="text-amber-100 text-lg">{edu.degree}</CardDescription>
                    <div className="flex items-center gap-4 mt-4 text-amber-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{edu.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{edu.location}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {/* Academic Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-white/50 rounded-lg">
                          <div className="text-2xl font-bold" style={{ color: edu.gradient }}>{edu.gpa}</div>
                          <div className="text-sm text-gray-600">GPA</div>
                        </div>
                        <div className="text-center p-4 bg-white/50 rounded-lg">
                          <div className="text-2xl font-bold" style={{ color: edu.gradient }}>{edu.credits}</div>
                          <div className="text-sm text-gray-600">Credits</div>
                        </div>
                      </div>

                      {/* Activities */}
                      <div>
                        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: edu.gradient }}>
                          <Users className="w-5 h-5" />
                          Activities & Involvement
                        </h4>
                        <div className="space-y-3">
                          {edu.activities.map((activity, actIndex) => (
                            <div
                              key={actIndex}
                              className="flex items-center gap-3">
                              <Star className="w-4 h-4 flex-shrink-0" style={{ color: edu.gradient }} />
                              <span className="text-gray-700">{activity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications & Skills */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: "#7f5539" }}>
              Certifications & Skills
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: "#9c6644" }}>
                  <Award className="w-5 h-5" />
                  Technical Certifications
                </h4>
                <div className="space-y-3">
                  {[
                    "OpenAI API Development",
                    "React.js Advanced Concepts",
                    "Python Programming",
                    "Web Development Fundamentals"
                  ].map((cert, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#7f5539" }}></div>
                      <span className="text-gray-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: "#9c6644" }}>
                  <BookOpen className="w-5 h-5" />
                  Current Learning
                </h4>
                <div className="space-y-3">
                  {[
                    "Advanced AI/ML Algorithms",
                    "Cloud Architecture (AWS/Azure)",
                    "DevOps & CI/CD Practices",
                    "Data Science & Analytics"
                  ].map((skill, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#b08968" }}></div>
                      <span className="text-gray-700">{skill}</span>
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