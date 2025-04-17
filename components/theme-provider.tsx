"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    // Thêm class 'light' vào thẻ html để đảm bảo CSS selector hoạt động đúng
    document.documentElement.classList.add("light")
    document.documentElement.classList.remove("dark")
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
