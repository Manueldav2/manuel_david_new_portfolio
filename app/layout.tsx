import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Chatbot } from "@/components/ui/chatbot"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-jetbrains-mono"
})

export const metadata: Metadata = {
  title: "Manuel David Portfolio",
  description:
    "Professional portfolio website for Manuel David - Full-Stack Developer, AI Engineer, and Technology Innovator",
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
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
        <Chatbot />
      </body>
    </html>
  )
}
