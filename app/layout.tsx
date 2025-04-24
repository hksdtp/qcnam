import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"
import { TestDropdown } from "@/components/test-dropdown"

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
        {/* Đã tạm thởi vô hiệu hóa TestDropdown để xác định nguyên nhân lỗi */}
        {/*
        {process.env.NODE_ENV !== "production" && (
          <div style={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}>
            <TestDropdown />
          </div>
        )}
        */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
