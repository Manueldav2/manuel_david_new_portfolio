"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, MapPin, Globe, Download, ExternalLink, ArrowLeft, User, Award, Target, TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SummaryPage() {
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
          <p className="text-lg text-gray-600">Loading Summary...</p>
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
                { name: "Summary", href: "/summary", active: true },
                { name: "Experience", href: "/experience", active: false },
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
              <User className="w-12 h-12" style={{ color: "#7f5539" }} />
              <h1 className="text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Professional Summary
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experienced Software Developer & AI Engineer with proven track record of delivering scalable solutions and driving business innovation.
            </p>
          </div>
        </section>

        {/* Professional Summary */}
        <section className="py-24 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, rgba(237, 224, 212, 0.3), rgba(230, 204, 178, 0.2))`,
          }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="relative w-full max-w-lg mx-auto">
                  <div className="relative w-full h-[600px] overflow-hidden rounded-3xl shadow-2xl">
                    <Image
                      src="https://i.imgur.com/DOIEjZI.jpg"
                      alt="Manuel David - Project Portfolio Overview"
                      fill
                      className="object-cover object-top"
                      priority
                    />
                  </div>
                  <div
                    className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-20"
                    style={{ background: `linear-gradient(135deg, #9c6644, #7f5539)` }}
                  ></div>
                  <div
                    className="absolute -top-6 -left-6 w-20 h-20 rounded-full opacity-30"
                    style={{ background: `linear-gradient(135deg, #ddb892, #e6ccb2)` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <h2 className="text-5xl font-bold mb-6"
                    style={{
                      background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>
                    Executive Summary
                  </h2>
                  <p className="text-xl text-gray-700 leading-relaxed mb-6">
                    Results-driven Software Developer & AI Engineer with{" "}
                    <span className="font-bold" style={{ color: "#9c6644" }}>2+</span> years of experience architecting and deploying high-performance, full-stack applications and AI-driven web solutions. Proven ability to lead technical initiatives and deliver measurable business outcomes.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Specialized in React, Python, and AI APIs including OpenAI and Eleven Labs to automate workflows, power intelligent chatbots, and scale SaaS platforms. Demonstrated expertise in delivering clean, maintainable code and innovative client-facing solutions that drive user engagement and business growth.
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Seeking senior software engineering roles that leverage AI and full-stack development expertise to drive organizational transformation and technological innovation.
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: "2", label: "Years Experience", icon: Award, color: "#7f5539" },
                    { value: "12", label: "Websites Delivered", icon: Target, color: "#9c6644" },
                    { value: "5", label: "AI Projects", icon: TrendingUp, color: "#b08968" },
                    { value: "1", label: "Company Founded", icon: User, color: "#ddb892" },
                  ].map((metric, index) => (
                    <div
                      key={index}
                      className="text-center p-6 rounded-2xl shadow-lg relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, rgba(237, 224, 212, 0.4), rgba(230, 204, 178, 0.3))`,
                      }}>
                      <div className="flex justify-center mb-3">
                        <metric.icon className="w-8 h-8" style={{ color: metric.color }} />
                      </div>
                      <div
                        className="text-3xl font-bold"
                        style={{
                          background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}>
                        {metric.value}{metric.label.includes("Years") || metric.label.includes("Projects") ? "+" : ""}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">{metric.label}</div>
                    </div>
                  ))}
                </div>

                {/* Contact Info */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-4" style={{ color: "#7f5539" }}>Professional Contact</h3>
                  <div className="space-y-3">
                    {[
                      { icon: Mail, text: "manueldavid500@gmail.com", href: "mailto:manueldavid500@gmail.com" },
                      { icon: Phone, text: "(479) 250-8678", href: "tel:+14792508678" },
                      { icon: MapPin, text: "Atlanta, GA", href: null },
                      { icon: Globe, text: "nouvo.dev", href: "https://nouvo.dev" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" style={{ color: "#7f5539" }} />
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.href.startsWith("http") ? "_blank" : undefined}
                            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="text-gray-700 hover:text-amber-600 transition-colors"
                          >
                            {item.text}
                          </a>
                        ) : (
                          <span className="text-gray-700">{item.text}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold mb-6" style={{ color: "#7f5539" }}>
              Ready to Discuss Opportunities?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Let's explore how my technical expertise and proven track record can contribute to your organization's success.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="text-white"
                style={{ background: `linear-gradient(135deg, #9c6644, #7f5539)` }}>
                <Mail className="w-5 h-5 mr-2" />
                Schedule Interview
              </Button>
              <Button variant="outline" size="lg" className="border-amber-200 hover:bg-amber-50">
                <Download className="w-5 h-5 mr-2" />
                Download Resume
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
} 