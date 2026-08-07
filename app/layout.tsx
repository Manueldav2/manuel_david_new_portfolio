import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteChrome } from "@/components/site/SiteChrome"
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
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "256x256" }],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
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

/**
 * The frame runs edge to edge on a phone. `viewport-fit: cover` lets the
 * flat canvas reach under the notch and the home indicator instead of
 * ending in two letterboxed bars, which is the only way the field reads as
 * one continuous ground; every piece of CONTENT then buys its clearance
 * back with env(safe-area-inset-*) padding (see hero-field.module.css), so
 * nothing readable or tappable ever sits under the hardware.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
          <SiteChrome>{children}</SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  )
}
