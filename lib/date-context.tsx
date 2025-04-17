"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type DateContextType = {
  currentDate: Date
  setCurrentDate: (date: Date) => void
}

const DateContext = createContext<DateContextType | undefined>(undefined)

export function DateProvider({ children }: { children: React.ReactNode }) {
  // Sử dụng useState với callback để đảm bảo giá trị chỉ được tính một lần
  // và giống nhau giữa server và client
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Kiểm tra xem có đang ở môi trường client không
    if (typeof window !== "undefined") {
      // Thử đọc từ localStorage
      const savedDate = localStorage.getItem("currentDate")
      if (savedDate) {
        try {
          return new Date(savedDate)
        } catch (e) {
          console.error("Error parsing saved date:", e)
        }
      }
    }

    // Sử dụng Date cố định để tránh sự khác biệt giữa server và client
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  // Lưu ngày đã chọn vào localStorage khi thay đổi
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentDate", currentDate.toISOString())
    }
  }, [currentDate])

  // Khi ngày thay đổi, phát sự kiện để các component khác có thể lắng nghe
  useEffect(() => {
    const event = new CustomEvent("dateChanged", {
      detail: {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      },
    })
    window.dispatchEvent(event)
  }, [currentDate])

  return <DateContext.Provider value={{ currentDate, setCurrentDate }}>{children}</DateContext.Provider>
}

export function useDate() {
  const context = useContext(DateContext)
  if (context === undefined) {
    throw new Error("useDate must be used within a DateProvider")
  }
  return context
}
