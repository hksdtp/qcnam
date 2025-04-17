"use client"

import { useState } from "react"
import { AccountSheet } from "@/components/account-sheet"
import { DateProvider } from "@/lib/date-context"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function AccountSheetDemo() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const previousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const nextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  return (
    <DateProvider>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Thông tin tài khoản</h1>

        <div className="max-w-md mx-auto">
          {/* Bộ chọn tháng đơn giản */}
          <div className="bg-white rounded-lg shadow-md mb-4 p-3 flex items-center justify-between">
            <Button onClick={previousMonth} variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <div className="text-lg font-medium">Tháng {currentDate.getMonth() + 1}</div>
              <div className="text-sm text-gray-500">{currentDate.getFullYear()}</div>
            </div>

            <Button onClick={nextMonth} variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Component AccountSheet */}
          <AccountSheet />

          <div className="mt-8 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <p className="mb-2">
              <strong>Hướng dẫn:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nhấn vào nút mũi tên ở góc phải để xem chi tiết tài khoản</li>
              <li>Sử dụng các nút chuyển tháng để xem dữ liệu của các tháng khác nhau</li>
              <li>Dữ liệu sẽ tự động cập nhật khi chuyển tháng</li>
            </ul>
          </div>
        </div>
      </div>
    </DateProvider>
  )
}
