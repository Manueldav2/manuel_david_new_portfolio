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

const SITE_URL = "https://manueldavid.dev"
const SITE_DESCRIPTION =
  "Building context infrastructure for AI agents. Founding Engineer at Configure and founder of Paradigm, based in San Francisco."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Manuel David — Founding Engineer at Configure",
  description: SITE_DESCRIPTION,
  generator: "Manuel David Portfolio",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Manuel David — Founding Engineer at Configure",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Manuel David",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manuel David — Founding Engineer at Configure",
    description: SITE_DESCRIPTION,
    creator: "@manny2techy",
  },
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
