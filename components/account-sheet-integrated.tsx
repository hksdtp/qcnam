"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDate } from "@/lib/date-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/number-to-words"

interface AccountData {
  currentBalance: number // Số dư hiện có
  totalExpense: number // Tổng chi tiêu tháng
  beginningBalance: number // Số dư đầu kỳ
  totalAdvanced: number // Tổng đã ứng tháng này
  accountRemaining: number // Tài khoản còn
  accountExpenses: number // Tài khoản chi
  cashRemaining: number // Tiền mặt còn
  cashExpenses: number // Tiền mặt chi
}

interface AccountSheetIntegratedProps {
  initialData?: AccountData
  className?: string
}

export function AccountSheetIntegrated({ initialData, className }: AccountSheetIntegratedProps) {
  const { currentDate, setCurrentDate } = useDate()
  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

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

  // Hàm để đảm bảo giá trị là số hợp lệ
  const ensureValidNumber = (value: any): number => {
    if (value === undefined || value === null || isNaN(Number(value))) {
      return 0
    }
    return Number(value)
  }

  // Lấy dữ liệu tài khoản từ API khi tháng thay đổi
  const fetchAccountData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()

      console.log(`Lấy dữ liệu số dư cho tháng ${month}/${year} từ Sheet1`)

      // Thêm timestamp để tránh cache
      const response = await fetch(`/api/account-data?month=${month}&year=${year}&timestamp=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Lỗi API: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Không thể lấy dữ liệu tài khoản")
      }

      // Đảm bảo tất cả các giá trị là số hợp lệ
      const validData = {
        currentBalance: ensureValidNumber(result.data.currentBalance),
        totalExpense: ensureValidNumber(result.data.totalExpense),
        beginningBalance: ensureValidNumber(result.data.beginningBalance),
        totalAdvanced: ensureValidNumber(result.data.totalAdvanced),
        accountRemaining: ensureValidNumber(result.data.accountRemaining),
        accountExpenses: ensureValidNumber(result.data.accountExpenses),
        cashRemaining: ensureValidNumber(result.data.cashRemaining),
        cashExpenses: ensureValidNumber(result.data.cashExpenses),
      }

      // Cập nhật state với dữ liệu từ API
      setAccountData(validData)
      console.log("Dữ liệu tài khoản:", validData)
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu số dư:", error)
      setError(error.message || "Đã xảy ra lỗi khi lấy dữ liệu")

      // Trong trường hợp lỗi, hiển thị dữ liệu mẫu để kiểm tra giao diện
      setAccountData({
        currentBalance: 0,
        totalExpense: 0,
        beginningBalance: 0,
        totalAdvanced: 0,
        accountRemaining: 0,
        accountExpenses: 0,
        cashRemaining: 0,
        cashExpenses: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentDate])

  // Lắng nghe sự thay đổi của tháng
  useEffect(() => {
    fetchAccountData()
  }, [currentDate, fetchAccountData])

  // Hàm đồng bộ dữ liệu tài khoản
  const syncAccountData = async () => {
    setIsSyncing(true)
    setError(null)

    try {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()

      console.log(`Đồng bộ dữ liệu tài khoản cho tháng ${month}/${year}`)

      const response = await fetch("/api/sync-account-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ month, year }),
      })

      if (!response.ok) {
        throw new Error(`Lỗi API: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Không thể đồng bộ dữ liệu tài khoản")
      }

      // Hiển thị thông báo thành công
      toast({
        title: "Đồng bộ thành công",
        description: `Đã cập nhật dữ liệu tài khoản cho tháng ${month}/${year}`,
      })

      // Tải lại dữ liệu
      await fetchAccountData()
    } catch (error) {
      console.error("Lỗi khi đồng bộ dữ liệu tài khoản:", error)
      setError(error.message || "Đã xảy ra lỗi khi đồng bộ dữ liệu")

      // Hiển thị thông báo lỗi
      toast({
        title: "Đồng bộ thất bại",
        description: error.message || "Đã xảy ra lỗi khi đồng bộ dữ liệu",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

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

  // Xác định màu sắc dựa trên giá trị
  const getValueColor = (value: number, isExpense = false) => {
    if (isExpense) {
      return value > 0 ? "text-techcom-red" : "text-techcom-text"
    }
    return value > 0 ? "text-techcom-blue" : value < 0 ? "text-techcom-red" : "text-techcom-text"
  }

  // Hàm định dạng số tiền an toàn
  const safeFormatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return "0"
    }
    return formatCurrency(value)
  }

  return (
    <Card className={cn("overflow-hidden rounded-lg shadow-md", className)}>
      {/* Phần chọn tháng/năm tích hợp */}
      <div className="bg-white border-b p-3 flex items-center justify-between">
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
          <DialogContent className="sm:max-w-md p-0 rounded-lg overflow-hidden">
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
                    <SelectTrigger className="w-full rounded-lg">
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
                    <SelectTrigger className="w-full rounded-lg">
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
                <Button
                  onClick={applyDateSelection}
                  className="bg-techcom-red text-white px-4 py-2 rounded-lg hover:bg-techcom-darkred"
                >
                  Áp dụng
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Phần header - Số dư hiện có */}
      <div className="bg-techcom-red text-white p-5 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Số dư hiện có</p>
            {isLoading ? (
              <div className="h-8 w-32 bg-white/20 animate-pulse rounded-md mt-1"></div>
            ) : (
              <p className="text-2xl font-bold mt-1">
                {accountData ? safeFormatCurrency(accountData.currentBalance) : "0"} ₫
              </p>
            )}
          </div>
          {/* Chỉ giữ lại một nút đồng bộ */}
          <div>
            <Button
              onClick={syncAccountData}
              disabled={isSyncing}
              className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 p-0 flex items-center justify-center"
              title="Đồng bộ dữ liệu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`${isSyncing ? "animate-spin" : ""}`}
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
            </Button>
          </div>
        </div>

        <div
          className="absolute -bottom-3 right-5 bg-white rounded-lg p-1 shadow-techcom cursor-pointer"
          onClick={toggleDetails}
        >
          {showDetails ? (
            <ChevronUp className="h-5 w-5 text-techcom-red" />
          ) : (
            <ChevronDown className="h-5 w-5 text-techcom-red" />
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-techcom-lighttext">Tổng chi tiêu tháng {currentDate.getMonth() + 1}</p>
            {isLoading ? (
              <div className="h-6 w-24 bg-gray-100 animate-pulse rounded-md mt-1"></div>
            ) : (
              <p className="text-lg font-semibold text-techcom-red">
                {accountData ? safeFormatCurrency(accountData.totalExpense) : "0"} ₫
              </p>
            )}
          </div>
          <div
            className="bg-techcom-lightblue text-techcom-blue rounded-lg px-3 py-1 text-xs font-medium cursor-pointer"
            onClick={toggleDetails}
          >
            {showDetails ? "Ẩn chi tiết" : "Chi tiết"}
          </div>
        </div>

        {error && !isLoading && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        {showDetails && !isLoading && accountData && (
          <div className="mt-4 grid grid-cols-2 gap-4 animate-fade-in">
            <div className="bg-card-lighter p-3 rounded-lg">
              <div className="text-sm text-techcom-lighttext">Số dư đầu kỳ</div>
              <div className="font-bold flex items-baseline text-techcom-text">
                <span>{safeFormatCurrency(accountData.beginningBalance)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">₫</span>
              </div>
            </div>
            <div className="bg-card-lighter p-3 rounded-lg">
              <div className="text-sm text-techcom-lighttext">Tổng đã ứng tháng này</div>
              <div className={cn("font-bold flex items-baseline", getValueColor(accountData.totalAdvanced))}>
                <span>{safeFormatCurrency(accountData.totalAdvanced)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">₫</span>
              </div>
            </div>
            <div className="bg-card-lighter p-3 rounded-lg">
              <div className="text-sm text-techcom-lighttext">Tài khoản còn</div>
              <div className={cn("font-bold flex items-baseline", getValueColor(accountData.accountRemaining))}>
                <span>{safeFormatCurrency(accountData.accountRemaining)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">₫</span>
              </div>
            </div>
            <div className="bg-card-lighter p-3 rounded-lg">
              <div className="text-sm text-techcom-lighttext">Tài khoản chi</div>
              <div className={cn("font-bold flex items-baseline", getValueColor(accountData.accountExpenses, true))}>
                <span>{safeFormatCurrency(accountData.accountExpenses)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">₫</span>
              </div>
            </div>
            <div className="bg-card-lighter p-3 rounded-lg">
              <div className="text-sm text-techcom-lighttext">Tiền mặt còn</div>
              <div className={cn("font-bold flex items-baseline", getValueColor(accountData.cashRemaining))}>
                <span>{safeFormatCurrency(accountData.cashRemaining)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">₫</span>
              </div>
            </div>
            <div className="bg-card-lighter p-3 rounded-lg">
              <div className="text-sm text-techcom-lighttext">Tiền mặt chi</div>
              <div className={cn("font-bold flex items-baseline", getValueColor(accountData.cashExpenses, true))}>
                <span>{safeFormatCurrency(accountData.cashExpenses)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">₫</span>
              </div>
            </div>
          </div>
        )}

        {showDetails && isLoading && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="bg-gray-100 animate-pulse h-16 rounded-lg"></div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AccountSheetIntegrated
