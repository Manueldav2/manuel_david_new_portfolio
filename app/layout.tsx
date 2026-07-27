import type { Metadata } from "next"
import "./globals.css"
import { Chatbot } from "@/components/ui/chatbot"
import { ThemeProvider } from "@/components/theme-provider"
import { Nav } from "@/components/site/Nav"
import { Footer } from "@/components/site/Footer"
import { ChatProvider } from "@/components/chat/ChatProvider"
import { ChatShell } from "@/components/chat/ChatShell"
import { ChatDrawer } from "@/components/chat/ChatDrawer"
import { display, body, mono, future } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "Manuel David, Founding Engineer at Configure",
  description:
    "Building context infrastructure for AI agents. Founder of Paradigm. Based in San Francisco.",
  generator: 'Manuel David Portfolio',
  icons: {
    icon: [
      {
        url: 'https://i.imgur.com/EGSz1Un.jpg',
        sizes: 'any',
      }
    ],
    apple: [
      {
        url: 'https://i.imgur.com/EGSz1Un.jpg',
        sizes: '180x180',
        type: 'image/jpeg',
      }
    ]
  },
  openGraph: {
    title: 'Manuel David Portfolio',
    description: 'Full-Stack Developer, AI Engineer, and Technology Innovator',
    images: [{
      url: 'https://i.imgur.com/EGSz1Un.jpg',
      width: 1200,
      height: 630,
      alt: 'Manuel David'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manuel David Portfolio',
    description: 'Full-Stack Developer, AI Engineer, and Technology Innovator',
    images: ['https://i.imgur.com/EGSz1Un.jpg'],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} ${future.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {/* Shared liquid-glass refraction filter — referenced by
            components/glass/Glass.tsx via filter: url(#glass-distortion). */}
        <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
          <filter
            id="glass-distortion"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.008"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="2" result="softNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="softNoise"
              scale="70"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
        <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
          <ChatProvider>
            {/* ChatShell pushes the whole site chrome LEFT when the drawer opens. */}
            <ChatShell>
              <Nav />
              {/* pt clears the fixed nav pill so page content never sits under it. */}
              <main className="pt-24">{children}</main>
              <Footer />
              <Chatbot />
            </ChatShell>
            {/* Right-side drawer — fixed, outside the pushed shell. */}
            <ChatDrawer />
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
