"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Coffee, Brain, Target, ShoppingCart, Sparkles, Database, TrendingUp, Lightbulb, Settings, Users, MapPin, Star } from "lucide-react"
import Link from "next/link"

export default function PopupDrinkWebsitePage() {
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
              <Coffee className="w-12 h-12" style={{ color: "#e6ccb2" }} />
              <h1 className="text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #e6ccb2, #7f5539)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Business Website (Pop Up)
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              An interactive beverage brand site that uses AI to recommend drinks based on user taste, vibe, or event — combining e-commerce with AI-powered engagement.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Badge className="px-4 py-2 text-sm bg-green-100 text-green-800 border-green-200">
                Live Website
              </Badge>
              <Badge className="px-4 py-2 text-sm bg-purple-100 text-purple-800 border-purple-200">
                AI E-commerce
              </Badge>
            </div>
          </div>
        </section>

        {/* Project Image */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">AI Drink Recommendation Engine</h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">AI Active</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Taste Quiz Results</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">Sweet & Fruity</div>
                          <div className="text-sm text-gray-600">Preference</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-600">Party Vibe</div>
                          <div className="text-sm text-gray-600">Event Type</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg border-l-4 border-orange-400">
                        <div className="flex items-center gap-3">
                          <Coffee className="w-5 h-5 text-orange-600" />
                          <span className="text-sm font-medium text-gray-700">Tropical Sunrise Smoothie</span>
                        </div>
                        <span className="text-sm font-bold text-orange-600">97% Match</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg border-l-4 border-pink-400">
                        <div className="flex items-center gap-3">
                          <Coffee className="w-5 h-5 text-pink-600" />
                          <span className="text-sm font-medium text-gray-700">Berry Burst Energy</span>
                        </div>
                        <span className="text-sm font-bold text-pink-600">89% Match</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-400">
                        <div className="flex items-center gap-3">
                          <Coffee className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-gray-700">Citrus Party Mix</span>
                        </div>
                        <span className="text-sm font-bold text-purple-600">85% Match</span>
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
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#e6ccb2" }}>
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Brain,
                  title: "AI Drink Recommendation Tool",
                  description: "Intelligent matching based on taste preferences and occasion"
                },
                {
                  icon: Target,
                  title: "Taste Quiz with GPT Integration",
                  description: "Interactive quiz that learns user preferences through AI"
                },
                {
                  icon: Sparkles,
                  title: "Real-time Product Filters",
                  description: "Dynamic filtering based on AI recommendations and preferences"
                },
                {
                  icon: ShoppingCart,
                  title: "Clean E-commerce Flow",
                  description: "Streamlined purchasing experience with conversion optimization"
                }
              ].map((feature, index) => (
                <Card key={index} className="shadow-lg border-0 bg-white/80 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100">
                        <feature.icon className="w-6 h-6" style={{ color: "#e6ccb2" }} />
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
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#e6ccb2" }}>
              Technologies Used
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "React", "OpenAI", "Firebase", "Custom CSS Animations"
              ].map((tech, index) => (
                <Badge
                  key={index}
                  className="px-6 py-3 text-base bg-gradient-to-r from-orange-100 to-pink-100 text-gray-800 border border-orange-200 hover:shadow-md transition-all duration-200"
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
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#e6ccb2" }}>
              Build Process
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Created a taste-quiz interface that routes user data to GPT for recommendation logic. Firebase handles cart, user data, and real-time updates. Designed with a bright brand palette and conversion-optimized layout.
              </p>
              <div className="space-y-6">
                {[
                  "Developed interactive taste quiz interface with engaging UX",
                  "Integrated OpenAI GPT for intelligent drink recommendations",
                  "Implemented Firebase for cart and user data management",
                  "Created real-time product filtering and matching system",
                  "Designed bright brand palette with conversion optimization",
                  "Added custom CSS animations for enhanced user experience"
                ].map((phase, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1"
                      style={{ background: "linear-gradient(135deg, #e6ccb2, #7f5539)" }}
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
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#e6ccb2" }}>
              Challenges & Solutions
            </h2>
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <Target className="w-6 h-6 mt-1" style={{ color: "#e6ccb2" }} />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Challenge: Mapping AI suggestions to real products</h3>
                    <p className="text-gray-600">Solution: Built a matching layer using categories and tags</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-orange-50 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-6 h-6 mt-1" style={{ color: "#e6ccb2" }} />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Challenge: Optimizing performance on mobile</h3>
                    <p className="text-gray-600">Solution: Lazy-loaded all assets and images, and used Lottie for lightweight animations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Future Improvements */}
        <section className="py-16 bg-gradient-to-br from-stone-50 to-amber-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#e6ccb2" }}>
              Future Improvements
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: Star,
                  title: "User Reviews System",
                  description: "Add customer reviews and ratings for each drink product"
                },
                {
                  icon: MapPin,
                  title: "Store Locator with Geolocation",
                  description: "Find nearby stores that carry recommended drinks"
                },
                {
                  icon: Target,
                  title: "Gamify Recommendation Quiz",
                  description: "Add interactive elements and rewards to the taste quiz"
                }
              ].map((enhancement, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-white/80 rounded-xl shadow-md">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100">
                    <enhancement.icon className="w-6 h-6" style={{ color: "#e6ccb2" }} />
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