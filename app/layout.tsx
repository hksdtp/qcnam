import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Báo cáo chi phí",
  description: "", // Removed the description
  openGraph: {
    title: "Báo cáo chi phí",
    description: "", // Empty description for OpenGraph
    images: [],
  },
  twitter: {
    title: "Báo cáo chi phí",
    description: "", // Empty description for Twitter cards
    images: [],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}


import './globals.css'