"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    // Luôn đảm bảo giao diện sáng, không cho phép dark mode
    document.documentElement.classList.add("light")
    document.documentElement.classList.remove("dark")
    document.documentElement.style.colorScheme = "light"
  }, [])

  // Bắt buộc forcedTheme="light" và disable enableSystem
  return (
    <NextThemesProvider forcedTheme="light" enableSystem={false} attribute="class" {...props}>
      {children}
    </NextThemesProvider>
  )
}
