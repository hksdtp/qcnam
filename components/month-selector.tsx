"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { useDate } from "@/lib/date-context"

export function MonthSelector() {
  const { currentDate, setCurrentDate } = useDate()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ]

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i)

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

  const applyDateSelection = () => {
    const newDate = new Date(selectedYear, selectedMonth - 1)
    setCurrentDate(newDate)
    setIsDialogOpen(false)
  }

  useEffect(() => {
    // Cập nhật giá trị mặc định khi dialog mở
    if (isDialogOpen) {
      setSelectedMonth(currentDate.getMonth() + 1)
      setSelectedYear(currentDate.getFullYear())
    }
  }, [isDialogOpen, currentDate])

  return (
    <div className="bg-white rounded-lg shadow-md mb-4">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={previousMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center">
              <div className="text-lg font-medium">Tháng {currentDate.getMonth() + 1}</div>
              <div className="text-sm text-gray-500">{currentDate.getFullYear()}</div>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-0 rounded-lg overflow-hidden bg-background">
            <DialogHeader className="p-4 border-b flex justify-between items-center">
              <DialogTitle className="text-xl">Chọn tháng và năm</DialogTitle>
              <button onClick={() => setIsDialogOpen(false)} className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </DialogHeader>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tháng</label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-full rounded-lg bg-background border border-input">
                      <SelectValue placeholder="Tháng" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Năm</label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-full rounded-lg bg-background border border-input">
                      <SelectValue placeholder="Năm" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={applyDateSelection}
                  className="bg-techcom-red text-white px-4 py-2 rounded-lg hover:bg-techcom-darkred"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}
