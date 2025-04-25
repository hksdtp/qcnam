"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { HeartLoadingScreen } from "@/components/heart-loading-screen"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)

  // Đảm bảo setLoading(false) được gọi sau khi component mount
  useEffect(() => {
    // Timeout ngắn để đảm bảo client-side hydration đã xong
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // Thời gian tối đa cho loading screen
    
    return () => clearTimeout(timer);
  }, []);

  const handleLoadingComplete = () => {
    setLoading(false)
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
      {loading && (
        <HeartLoadingScreen appName="BÁO CÁO CHI TIÊU" onLoadingComplete={handleLoadingComplete} />
      )}

      <div
        className={loading ? "opacity-0" : "opacity-100"}
        style={{
          transition: "opacity 1.2s ease-out", // Much slower transition
          visibility: loading ? "hidden" : "visible",
          display: loading ? "none" : "block", // Đảm bảo hiển thị khi không loading
        }}
      >
        <main 
          className="container max-w-md mx-auto py-4 px-4 ios-scroll-container"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            height: 'calc(100vh - 2rem)',
            overflowY: 'auto',
            borderRadius: '0.75rem',
          }}
        >
          {children}
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
