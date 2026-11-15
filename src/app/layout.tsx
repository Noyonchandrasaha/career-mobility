import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/feedback/toaster"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})
export const metadata: Metadata = {
  title: { default: "Career Mobility", template: "%s | Career Mobility" },
  description:
    "Explore fictional international opportunities with explainable profile matching.",
}
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <a href="#main-content" className="app-skip-link">
          Skip to main content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
