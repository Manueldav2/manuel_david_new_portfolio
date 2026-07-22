import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Chatbot } from "@/components/ui/chatbot"
import { ThemeProvider } from "@/components/theme-provider"
import { display, body, mono } from "@/lib/fonts"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono"
})

export const metadata: Metadata = {
  title: "Manuel David — Founding Engineer at Configure",
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
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
          <Chatbot />
        </ThemeProvider>
      </body>
    </html>
  )
}
