"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Globe, Palette, Users, ShoppingCart, Zap, Database, TrendingUp, Lightbulb, Settings, FileText, BarChart, Wrench, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function BusinessWebsitesPage() {
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
              <Globe className="w-12 h-12" style={{ color: "#7f5539" }} />
              <h1 className="text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Business Websites Portfolio
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A growing collection of modern, mobile-first websites for brands in fashion, tech, and services — customized for performance, design, and interactivity.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Badge className="px-4 py-2 text-sm bg-green-100 text-green-800 border-green-200">
                Live Portfolio
              </Badge>
              <Badge className="px-4 py-2 text-sm bg-blue-100 text-blue-800 border-blue-200">
                Client Websites
              </Badge>
            </div>
            <div className="flex justify-center mt-6">
              <a href="https://blastnbeyond.com/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="text-white px-8 py-3" style={{ background: "linear-gradient(135deg, #64748b, #475569)" }}>
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Visit Live Site
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Project Image */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Business Website Portfolio Dashboard</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Active Projects</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-violet-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-violet-600">12+</div>
                        <div className="text-sm text-gray-600">Websites Delivered</div>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-indigo-600">93%</div>
                        <div className="text-sm text-gray-600">Client Satisfaction</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">98%</div>
                        <div className="text-sm text-gray-600">Performance Score</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Fashion Brand - Modern E-commerce</span>
                        <span className="text-sm font-medium text-green-600">Live</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Tech Startup - Corporate Site</span>
                        <span className="text-sm font-medium text-blue-600">Live</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Service Business - Portfolio Site</span>
                        <span className="text-sm font-medium text-purple-600">Live</span>
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
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#7f5539" }}>
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Palette,
                  title: "Unique Client Branding",
                  description: "Custom design systems tailored to each brand's identity and values"
                },
                {
                  icon: Users,
                  title: "Responsive Design & UX Flows",
                  description: "Mobile-first design with optimized user experience paths"
                },
                {
                  icon: ShoppingCart,
                  title: "Integrated E-commerce Features",
                  description: "Full e-commerce functionality with payment processing"
                },
                {
                  icon: Zap,
                  title: "SEO & Performance Optimized",
                  description: "Fast loading times and search engine optimization"
                }
              ].map((feature, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100">
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
                "React", "Webflow", "Firebase", "TailwindCSS", "Stripe"
              ].map((tech, index) => (
                <Badge
                  key={index}
                  className="px-6 py-3 text-base bg-gradient-to-r from-violet-100 to-indigo-100 text-gray-800 border border-violet-200 hover:shadow-md transition-all duration-200"
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
                Worked directly with each client to gather brand requirements. Either developed custom React sites or delivered via Webflow for fast deployment. Used Firebase for CMS/data handling and hosting.
              </p>
              <div className="space-y-6">
                {[
                  "Collaborated directly with clients to understand brand requirements",
                  "Created custom design systems and component libraries",
                  "Developed sites using React or deployed via Webflow",
                  "Implemented Firebase for CMS and data management",
                  "Integrated Stripe for secure payment processing",
                  "Optimized for performance, SEO, and mobile responsiveness"
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
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <Palette className="w-6 h-6 mt-1" style={{ color: "#7f5539" }} />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Challenge: Custom designs at scale</h3>
                    <p className="text-gray-600">Solution: Created a reusable design system with components</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <Users className="w-6 h-6 mt-1" style={{ color: "#7f5539" }} />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Challenge: Client non-technical handoff</h3>
                    <p className="text-gray-600">Solution: Built admin panels and site documentation</p>
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
                  icon: Database,
                  title: "Optional CMS Integration",
                  description: "Add optional CMS via Firebase or Sanity for content management"
                },
                {
                  icon: BarChart,
                  title: "Internal Analytics Panel",
                  description: "Develop comprehensive analytics dashboard for site performance"
                },
                {
                  icon: Wrench,
                  title: "Starter Template System",
                  description: "Create reusable templates for faster project deployment"
                }
              ].map((enhancement, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-white/80 rounded-xl shadow-md">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100">
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