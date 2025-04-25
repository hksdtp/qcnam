"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Chỉ thực hiện các thay đổi DOM sau khi component đã mount
  // để tránh hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Bắt buộc forcedTheme="light" và disable enableSystem
  // Bỏ các thuộc tính có thể gây ra hydration mismatch
  return (
    <NextThemesProvider 
      forcedTheme="light" 
      enableSystem={false} 
      attribute="class" 
      defaultTheme="light"
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
