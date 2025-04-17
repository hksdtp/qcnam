"use client"

import type React from "react"

import { useState } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)

  const handleLoadingComplete = () => {
    setLoading(false)
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
      {loading && (
        <LoadingScreen appName="BÁO CÁO CHI TIÊU" backgroundColor="#E51A22" onLoadingComplete={handleLoadingComplete} />
      )}

      <div
        className={loading ? "opacity-0" : "opacity-100"}
        style={{
          transition: "opacity 1.2s ease-out", // Much slower transition
          visibility: loading ? "hidden" : "visible",
        }}
      >
        <main className="container max-w-md mx-auto py-4 px-4">{children}</main>
      </div>
      <Toaster />
    </ThemeProvider>
  )
}
