"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Code,
  FlaskConical,
  Download,
  Target,
  Globe,
  CheckCircle,
  Zap,
  Briefcase,
  Rocket,
  Brain,
  Database,
  Server,
  Smartphone,
  ExternalLink,
  Star,
  Award,
  TrendingUp,
  Users,
  User,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ResumePage() {
  const heroRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const floatingElementsRef = useRef<(HTMLDivElement | null)[]>([])
  const textRevealRefs = useRef<(HTMLDivElement | null)[]>([])
  const observerRef = useRef<IntersectionObserver | null>(null)
  const animatedElementsRef = useRef<Set<Element>>(new Set())
  const isInitializedRef = useRef(false)
  const [isLoading, setIsLoading] = useState(true)

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  // Loading animation effect
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // 3 second loading animation

    return () => clearTimeout(loadingTimer)
  }, [])

  // Pre-initialize all animation states to prevent stuttering
  useEffect(() => {
    if (isLoading) return

    const preInitializeStates = () => {
      // Pre-set hero elements to prevent layout shift
      const heroElements = document.querySelectorAll(".hero-title, .hero-subtitle, .hero-description")
      heroElements.forEach((el: any) => {
        el.style.transform = "translate3d(0, 30px, 0)"
        el.style.opacity = "0"
        el.style.willChange = "transform, opacity"
      })

      // Pre-set contact items
      const contactItems = document.querySelectorAll(".hero-contact-item")
      contactItems.forEach((el: any) => {
        el.style.transform = "translate3d(0, 20px, 0)"
        el.style.opacity = "0"
        el.style.willChange = "transform, opacity"
      })

      // Pre-set all fade-in elements
      const fadeElements = document.querySelectorAll(".fade-in-up")
      fadeElements.forEach((el: any) => {
        el.style.transform = "translate3d(0, 20px, 0)"
        el.style.opacity = "0"
        el.style.willChange = "transform, opacity"
      })

      // Pre-set text reveal elements
      textRevealRefs.current.forEach((el) => {
        if (el) {
          el.style.clipPath = "inset(0 100% 0 0)"
          el.style.willChange = "clip-path"
        }
      })

      // Pre-set counter elements
      const counters = document.querySelectorAll(".counter")
      counters.forEach((el: any) => {
        const originalValue = el.textContent
        el.setAttribute("data-target", originalValue)
        el.textContent = "0"
      })

      isInitializedRef.current = true
    }

    // Initialize immediately to prevent any flash
    if (typeof window !== "undefined") {
      preInitializeStates()
    }
  }, [isLoading])

  useEffect(() => {
    if (!isInitializedRef.current || isLoading) return

    let gsapInstance: any
    const cleanupFunctions: (() => void)[] = []

    const loadGSAP = async () => {
      const { gsap } = await import("gsap")
      gsapInstance = gsap

      // Ultra-smooth performance settings
      gsap.config({
        force3D: true,
        nullTargetWarn: false,
      })

      gsap.defaults({
        ease: "power2.out",
        duration: 0.6,
      })

      // Immediate hero animation - no delays
      const animateHero = () => {
        const heroTl = gsap.timeline()

        heroTl
          .to(".hero-title", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          })
          .to(
            ".hero-subtitle",
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
            },
            "-=0.4",
          )
          .to(
            ".hero-description",
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
            },
            "-=0.3",
          )
          .to(
            ".hero-contact-item",
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.05,
              ease: "power2.out",
              onComplete: () => {
                // Clean up willChange after animation
                document
                  .querySelectorAll(".hero-title, .hero-subtitle, .hero-description, .hero-contact-item")
                  .forEach((el: any) => {
                    el.style.willChange = "auto"
                  })
              },
            },
            "-=0.2",
          )
      }

      // Start hero animation immediately
      animateHero()

      // Simple floating animation
      floatingElementsRef.current.forEach((element, index) => {
        if (element) {
          gsap.set(element, { willChange: "transform" })
          gsap.to(element, {
            y: -8,
            duration: 2.5 + index * 0.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: index * 0.2,
          })
        }
      })

      // Optimized intersection observer with immediate animation
      const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px 10% 0px", // Trigger earlier
      }

      const handleIntersection = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedElementsRef.current.has(entry.target)) {
            animatedElementsRef.current.add(entry.target)
            const element = entry.target as HTMLElement

            // Immediate animation without delay
            gsap.to(element, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              onComplete: () => {
                element.style.willChange = "auto"
              },
            })
          }
        })
      }

      observerRef.current = new IntersectionObserver(handleIntersection, observerOptions)

      // Observe all fade-in elements
      document.querySelectorAll(".fade-in-up").forEach((el) => {
        if (observerRef.current) {
          observerRef.current.observe(el)
        }
      })

      // Immediate card hover effects
      cardRefs.current.forEach((card) => {
        if (card) {
          let hoverTween: any = null
          let leaveTween: any = null

          const handleMouseEnter = () => {
            if (leaveTween) leaveTween.kill()
            card.style.willChange = "transform"
            hoverTween = gsap.to(card, {
              scale: 1.015,
              y: -2,
              duration: 0.25,
              ease: "power2.out",
            })
            gsap.to(card.querySelector(".card-glow"), {
              opacity: 0.25,
              duration: 0.25,
              ease: "power2.out",
            })
          }

          const handleMouseLeave = () => {
            if (hoverTween) hoverTween.kill()
            leaveTween = gsap.to(card, {
              scale: 1,
              y: 0,
              duration: 0.25,
              ease: "power2.out",
              onComplete: () => {
                card.style.willChange = "auto"
              },
            })
            gsap.to(card.querySelector(".card-glow"), {
              opacity: 0,
              duration: 0.25,
              ease: "power2.out",
            })
          }

          card.addEventListener("mouseenter", handleMouseEnter, { passive: true })
          card.addEventListener("mouseleave", handleMouseLeave, { passive: true })

          cleanupFunctions.push(() => {
            card.removeEventListener("mouseenter", handleMouseEnter)
            card.removeEventListener("mouseleave", handleMouseLeave)
            if (hoverTween) hoverTween.kill()
            if (leaveTween) leaveTween.kill()
          })
        }
      })

      // Immediate text reveal animations
      textRevealRefs.current.forEach((element) => {
        if (element && observerRef.current) {
          const revealObserver = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  gsap.to(element, {
                    clipPath: "inset(0 0% 0 0)",
                    duration: 0.8,
                    ease: "power2.out",
                    onComplete: () => {
                      element.style.willChange = "auto"
                    },
                  })
                  revealObserver.unobserve(element)
                }
              })
            },
            { threshold: 0.15, rootMargin: "0px 0px 5% 0px" },
          )
          revealObserver.observe(element)
          cleanupFunctions.push(() => revealObserver.disconnect())
        }
      })

      // Immediate counter animations
      document.querySelectorAll(".counter").forEach((element: any) => {
        if (observerRef.current) {
          const counterObserver = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  const endValue = Number.parseInt(element.getAttribute("data-target"))
                  gsap.to(element, {
                    textContent: endValue,
                    duration: 1,
                    ease: "power2.out",
                    snap: { textContent: 1 },
                  })
                  counterObserver.unobserve(element)
                }
              })
            },
            { threshold: 0.3, rootMargin: "0px 0px 10% 0px" },
          )
          counterObserver.observe(element)
          cleanupFunctions.push(() => counterObserver.disconnect())
        }
      })

      // Optimized magnetic button effects
      let rafId: number
      document.querySelectorAll(".magnetic-btn").forEach((button: any) => {
        const handleMouseMove = (e: MouseEvent) => {
          if (rafId) cancelAnimationFrame(rafId)

          rafId = requestAnimationFrame(() => {
            const rect = button.getBoundingClientRect()
            const x = (e.clientX - rect.left - rect.width / 2) * 0.1
            const y = (e.clientY - rect.top - rect.height / 2) * 0.1

            button.style.willChange = "transform"
            gsap.set(button, { x, y })
          })
        }

        const handleMouseLeave = () => {
          if (rafId) cancelAnimationFrame(rafId)
          gsap.to(button, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
              button.style.willChange = "auto"
            },
          })
        }

        button.addEventListener("mousemove", handleMouseMove, { passive: true })
        button.addEventListener("mouseleave", handleMouseLeave, { passive: true })

        cleanupFunctions.push(() => {
          button.removeEventListener("mousemove", handleMouseMove)
          button.removeEventListener("mouseleave", handleMouseLeave)
          if (rafId) cancelAnimationFrame(rafId)
        })
      })
    }

    loadGSAP()

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (gsapInstance) {
        gsapInstance.killTweensOf("*")
      }
      animatedElementsRef.current.clear()
    }
  }, [isLoading])

  // Loading Screen Component
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50">
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>

        {/* Main Loading Content */}
        <div className="relative z-10 text-center">
          {/* Animated Logo */}
          <div className="mb-8 relative">
            {/* Outer Ring */}
            <div
              className="w-32 h-32 mx-auto rounded-full border-4 border-opacity-20 animate-spin"
              style={{
                borderColor: "#9c6644",
                borderTopColor: "#7f5539",
                animationDuration: "3s",
              }}
            >
              {/* Inner Ring */}
              <div
                className="w-24 h-24 mx-auto mt-3 rounded-full border-4 border-opacity-30 animate-spin"
                style={{
                  borderColor: "#b08968",
                  borderRightColor: "#ddb892",
                  animationDuration: "2s",
                  animationDirection: "reverse",
                }}
              >
                {/* Core Logo */}
                <div className="w-16 h-16 mx-auto mt-3 rounded-full bg-gradient-to-br from-amber-100 to-stone-200 flex items-center justify-center shadow-lg">
                  <div
                    className="text-2xl font-bold animate-pulse"
                    style={{
                      background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    MD
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements Around Logo */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-ping"
                  style={{
                    background: `linear-gradient(135deg, #ddb892, #e6ccb2)`,
                    left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
                    top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: "2s",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-4">
            <h1
              className="text-4xl font-bold animate-pulse"
              style={{
                background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Manuel David
            </h1>
            <p className="text-lg text-gray-600 animate-pulse" style={{ animationDelay: "0.5s" }}>
              Loading Portfolio...
            </p>

            {/* Progress Bar */}
            <div className="w-64 h-2 mx-auto bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full animate-pulse"
                style={{
                  background: `linear-gradient(135deg, #9c6644, #b08968)`,
                  width: "100%",
                  animation: "loadingProgress 3s ease-in-out",
                }}
              />
            </div>

            {/* Loading Dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full animate-bounce"
                  style={{
                    background: `linear-gradient(135deg, #ddb892, #e6ccb2)`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Tech Stack Icons */}
          <div className="mt-12 flex justify-center space-x-6 opacity-60">
            {[Code, Brain, Rocket, Database].map((Icon, i) => (
              <div
                key={i}
                className="p-3 rounded-full bg-white/50 backdrop-blur-sm animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                <Icon className="w-6 h-6" style={{ color: "#7f5539" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Custom CSS for loading animation */}
        <style jsx>{`
          @keyframes loadingProgress {
            0% {
              width: 0%;
              opacity: 0.5;
            }
            50% {
              opacity: 1;
            }
            100% {
              width: 100%;
              opacity: 0.8;
            }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          ref={(el) => { floatingElementsRef.current[0] = el }}
          className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-6"
          style={{
            background: "linear-gradient(135deg, #7f5539, #9c6644)",
            transform: "translate3d(0, 0, 0)",
          }}
        ></div>
        <div
          ref={(el) => { floatingElementsRef.current[1] = el }}
          className="absolute top-40 right-20 w-24 h-24 rounded-full opacity-6"
          style={{
            background: "linear-gradient(135deg, #b08968, #ddb892)",
            transform: "translate3d(0, 0, 0)",
          }}
        ></div>
        <div
          ref={(el) => { floatingElementsRef.current[2] = el }}
          className="absolute bottom-40 left-1/4 w-40 h-40 rounded-full opacity-6"
          style={{
            background: "linear-gradient(135deg, #ddb892, #e6ccb2)",
            transform: "translate3d(0, 0, 0)",
          }}
        ></div>
        <div
          ref={(el) => { floatingElementsRef.current[3] = el }}
          className="absolute bottom-20 right-1/3 w-28 h-28 rounded-full opacity-6"
          style={{
            background: "linear-gradient(135deg, #9c6644, #b08968)",
            transform: "translate3d(0, 0, 0)",
          }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div
              className="font-bold text-2xl"
              style={{
                background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Resume
            </div>
            <div className="hidden md:flex gap-2">
              {[
                { name: "Summary", href: "/summary" },
                { name: "Experience", href: "/experience" },
                { name: "Projects", href: "/projects" },
                { name: "Education", href: "/education" },
                { name: "Skills", href: "/skills" },
                { name: "AI Chat", href: "/chat" }
              ].map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:bg-amber-50 magnetic-btn transition-colors duration-200"
                    style={{ color: "#7f5539", transform: "translate3d(0, 0, 0)" }}
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-amber-200 hover:bg-amber-50 bg-transparent magnetic-btn transition-colors duration-200"
                style={{
                  borderColor: "#b08968",
                  color: "#b08968",
                  transform: "translate3d(0, 0, 0)",
                }}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/manuel-resume.pdf';
                  link.download = 'Manuel_David_Resume.pdf';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Resume
              </Button>
              <Button
                size="sm"
                className="text-white hover:opacity-90 magnetic-btn transition-opacity duration-200"
                style={{
                  background: "linear-gradient(135deg, #9c6644, #7f5539)",
                  transform: "translate3d(0, 0, 0)",
                }}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://i.imgur.com/EGSz1Un.jpg"
            alt="Manuel Uyiosa David - Software Developer & AI Engineer"
            fill
            className="object-cover object-top"
            priority
            quality={85}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, rgba(127, 85, 57, 0.4), rgba(156, 102, 68, 0.3), rgba(176, 137, 104, 0.2))`,
            }}
          ></div>
        </div>

        <div className="relative z-10 text-center text-white px-6 max-w-5xl">
          <div className="mb-8">
            <h1
              className="hero-title text-5xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-lg"
              style={{ transform: "translate3d(0, 30px, 0)", opacity: 0 }}
            >
              Manuel Uyiosa David
            </h1>
            <p
              className="hero-subtitle text-xl md:text-2xl mb-8 leading-relaxed max-w-4xl mx-auto font-light"
              style={{ transform: "translate3d(0, 30px, 0)", opacity: 0 }}
            >
              Software Developer • AI Engineer • Technology Innovator
            </p>
            <div
              className="hero-description text-lg mb-8 max-w-3xl mx-auto text-gray-100"
              style={{ transform: "translate3d(0, 30px, 0)", opacity: 0 }}
            >
              Experienced professional specializing in scalable software solutions and AI-powered applications that drive business growth and operational efficiency. Proven track record of delivering innovative technical solutions.
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              { icon: Mail, text: "manueldavid500@gmail.com", href: "mailto:manueldavid500@gmail.com" },
              { icon: Phone, text: "(479) 250-8678", href: "tel:+14792508678" },
              { icon: MapPin, text: "Atlanta, GA", href: null },
              { icon: Globe, text: "nouvo.dev", href: "https://nouvo.dev" },
            ].map((item, index) => (
              <div
                key={index}
                className="hero-contact-item relative group"
                style={{ transform: "translate3d(0, 20px, 0)", opacity: 0 }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full border border-white/50 text-gray-700 hover:bg-white transition-colors duration-200 magnetic-btn"
                    style={{ transform: "translate3d(0, 0, 0)" }}
                  >
                    <item.icon className="w-4 h-4" style={{ color: "#7f5539" }} />
                    <span>{item.text}</span>
                  </a>
                ) : (
                  <div
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full border border-white/50 text-gray-700"
                    style={{ transform: "translate3d(0, 0, 0)" }}
                  >
                    <item.icon className="w-4 h-4" style={{ color: "#7f5539" }} />
                    <span>{item.text}</span>
                  </div>
                )}
                <div
                  className="card-glow absolute inset-0 rounded-full opacity-0 blur-xl pointer-events-none"
                  style={{ background: "linear-gradient(135deg, #ddb892, #e6ccb2)" }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div
            className="w-6 h-10 border-2 rounded-full flex justify-center animate-pulse"
            style={{ borderColor: "#e6ccb2" }}
          >
            <div className="w-1 h-3 rounded-full mt-2" style={{ backgroundColor: "#ddb892" }}></div>
          </div>
        </div>
      </header>

      <main className="relative z-10 bg-white">
        {/* Quick Overview Section */}
        <section className="py-24 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, rgba(237, 224, 212, 0.3), rgba(230, 204, 178, 0.2))`,
          }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6"
                style={{
                  background: `linear-gradient(135deg, #7f5539, #9c6644)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                Professional Portfolio
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Experienced Software Developer & AI Engineer with proven expertise in delivering innovative solutions that drive business outcomes and operational excellence.
              </p>
            </div>

            {/* Navigation Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  title: "Professional Summary",
                  description: "Comprehensive overview of experience, expertise, and career objectives.",
                  href: "/summary",
                  icon: User,
                  color: "#7f5539"
                },
                {
                  title: "Work Experience",
                  description: "Detailed employment history with achievements and technical contributions.",
                  href: "/experience",
                  icon: Briefcase,
                  color: "#9c6644"
                },
                {
                  title: "Featured Projects",
                  description: "Portfolio of AI-powered applications and innovative software solutions.",
                  href: "/projects",
                  icon: Rocket,
                  color: "#b08968"
                },
                {
                  title: "Education",
                  description: "Academic credentials and continuous professional development.",
                  href: "/education",
                  icon: GraduationCap,
                  color: "#ddb892"
                },
                {
                  title: "Technical Skills",
                  description: "Comprehensive technical expertise and proficiency assessments.",
                  href: "/skills",
                  icon: Code,
                  color: "#e6ccb2"
                },
                {
                  title: "Contact Information",
                  description: "Professional contact details for recruitment and collaboration opportunities.",
                  href: "mailto:manueldavid500@gmail.com",
                  icon: Mail,
                  color: "#7f5539"
                }
              ].map((item, index) => (
                <Link key={index} href={item.href}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-stone-50 to-amber-50 relative overflow-hidden cursor-pointer h-full">
                    <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                      <item.icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold" style={{ color: item.color }}>
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      <div className="flex items-center text-sm font-medium" style={{ color: item.color }}>
                        View Details →
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          className="py-24 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, #7f5539, #9c6644, #b08968)` }}>
          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <div className="fade-in-up" style={{ transform: "translate3d(0, 20px, 0)", opacity: 0 }}>
              <h2 className="text-5xl font-bold mb-8">Ready to Collaborate?</h2>
              <p className="text-2xl mb-12 leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                Let's discuss how my technical expertise can contribute to your organization's success.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                {[
                  {
                    icon: Download,
                    text: "Download Resume",
                    style: { backgroundColor: "white", color: "#7f5539" },
                    action: () => {
                      const link = document.createElement('a');
                      link.href = '/manuel-resume.pdf';
                      link.download = 'Manuel_David_Resume.pdf';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    },
                  },
                  {
                    icon: Mail,
                    text: "Schedule Interview",
                    style: { borderColor: "white", color: "white", backgroundColor: "transparent" },
                    action: () => (window.location.href = "mailto:manueldavid500@gmail.com"),
                  },
                  {
                    icon: ExternalLink,
                    text: "View Portfolio",
                    style: { borderColor: "white", color: "white", backgroundColor: "transparent" },
                    action: () => window.location.href = "/projects",
                  },
                ].map((btn, index) => (
                  <Button
                    key={index}
                    size="lg"
                    variant={index === 0 ? "default" : "outline"}
                    className="text-lg px-8 py-4 rounded-full shadow-xl magnetic-btn transition-all duration-200"
                    style={{ ...btn.style, transform: "translate3d(0, 0, 0)" }}
                    onClick={btn.action}
                  >
                    <btn.icon className="w-6 h-6 mr-3" />
                    {btn.text}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Professional Footer */}
      <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center fade-in-up" style={{ transform: "translate3d(0, 20px, 0)", opacity: 0 }}>
            <h3
              className="text-3xl font-bold mb-4"
              style={{
                background: `linear-gradient(135deg, #ddb892, #e6ccb2)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Manuel Uyiosa David
            </h3>
            <p className="text-gray-400 mb-8 text-lg">Software Developer • AI Engineer • Technology Innovator</p>
            <Separator className="my-8 max-w-md mx-auto bg-gray-700" />
            <div className="flex justify-center gap-8 text-gray-400 mb-8 flex-wrap">
              {[
                { icon: Mail, text: "manueldavid500@gmail.com", href: "mailto:manueldavid500@gmail.com" },
                { icon: Phone, text: "(479) 250-8678", href: "tel:+14792508678" },
                { icon: MapPin, text: "Atlanta, GA", href: null },
                { icon: Globe, text: "nouvo.dev", href: "https://nouvo.dev" },
              ].map((contact, index) => (
                <div key={index} className="magnetic-btn" style={{ transform: "translate3d(0, 0, 0)" }}>
                  {contact.href ? (
                    <a
                      href={contact.href}
                      target={contact.href.startsWith("http") ? "_blank" : undefined}
                      rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-3 hover:text-white transition-colors duration-200"
                    >
                      <contact.icon className="w-5 h-5" />
                      <span>{contact.text}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3">
                      <contact.icon className="w-5 h-5" />
                      <span>{contact.text}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500">© 2025 Manuel Uyiosa David. Professional Portfolio & Resume</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
