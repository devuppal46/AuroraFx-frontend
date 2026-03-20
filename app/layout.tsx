import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, PT_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { UserProvider } from "@/context/UserContext"
import RedirectManager from "@/components/auth/RedirectManager"
import QueryProvider from "@/components/QueryProvider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _ptMono = PT_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pt-mono",
})

export const metadata: Metadata = {
  title: "AuroraFx - AI Customer Support",
  description:
    "Transform your customer support with AuroraFx. AI-powered support agents that resolve issues instantly, 24/7.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#141414",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${_ptMono.variable}`}>
      <body className="font-sans antialiased min-h-screen">
        <QueryProvider>
          <UserProvider>
            <RedirectManager>
              {children}
            </RedirectManager>
          </UserProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
