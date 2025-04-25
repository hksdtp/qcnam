"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDate } from "@/lib/date-context"
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
  const [dataSource, setDataSource] = useState<string | null>(null)
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

  // Lấy dữ liệu tài khoản từ sheet Vi khi tháng thay đổi
  const fetchAccountData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()

      console.log(`Lấy dữ liệu số dư cho tháng ${month}/${year} từ Sheet1`)

      // Gọi API để lấy dữ liệu tính toán từ Sheet1
      const response = await fetch(`/api/account-data?month=${month}&year=${year}&timestamp=${Date.now()}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Lỗi API: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Không thể lấy dữ liệu tài khoản")
      }

      // Cập nhật state với dữ liệu từ API - CHÚ Ý: Dữ liệu nằm trong result.data, không phải result.accountData
      setAccountData(result.data)
      console.log("Dữ liệu tài khoản:", result.data)
    } catch (error: unknown) {
      console.error("Lỗi khi lấy dữ liệu số dư:", error)
      const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi khi lấy dữ liệu"
      setError(errorMessage)

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
  }

  // Lắng nghe sự thay đổi của tháng
  useEffect(() => {
    fetchAccountData()
  }, [currentDate])

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
    } catch (error: unknown) {
      console.error("Lỗi khi đồng bộ dữ liệu tài khoản:", error)
      const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi khi đồng bộ dữ liệu"
      setError(errorMessage)

      // Hiển thị thông báo lỗi
      toast({
        title: "Đồng bộ thất bại",
        description: errorMessage,
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

  return (
    <Card className={cn("overflow-hidden rounded-lg shadow-md", className)}>
      {/* Phần chọn tháng/năm tích hợp */}
      <div className="bg-white border-b p-3 flex items-center justify-between">
        <button onClick={previousMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>

        {!isDialogOpen ? (
          <button 
            className="flex flex-col items-center relative"
            onClick={() => {
              setSelectedMonth(currentDate.getMonth() + 1);
              setSelectedYear(currentDate.getFullYear());
              setIsDialogOpen(true);
            }}
          >
            <div className="text-lg font-medium">Tháng {currentDate.getMonth() + 1}</div>
            <div className="text-sm text-gray-500">{currentDate.getFullYear()}</div>
          </button>
        ) : (
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[1000] flex items-start justify-center backdrop-blur"
            onClick={() => setIsDialogOpen(false)}
          >
            <div 
              className="bg-white w-[95%] max-w-[360px] rounded-xl overflow-hidden shadow-xl mt-16 animate-in fade-in-50 zoom-in-95 duration-200 border border-gray-200 ios-card-effect"
              onClick={(e) => e.stopPropagation()}
              style={{
                transform: "translateY(0)",
                transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            >
              <div className="px-4 py-3 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-lg font-medium">Chọn tháng và năm</h3>
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Đóng</span>
                </button>
              </div>
              
              <div className="p-4">
                {/* Phần chọn tháng */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Tháng</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                      <button
                        key={month}
                        onClick={() => setSelectedMonth(month)}
                        className={`py-2 px-2 rounded-lg text-sm transition-all ${
                          selectedMonth === month
                            ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-sm'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        T.{month}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Phần chọn năm */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Năm</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 8 }, (_, i) => 2020 + i).map((year) => (
                      <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`py-2 px-2 rounded-lg text-sm transition-all ${
                          selectedYear === year
                            ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-sm'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Nút áp dụng */}
                <div className="flex justify-end">
                  <button
                    onClick={applyDateSelection}
                    className="bg-gradient-to-r from-rose-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-rose-600 hover:to-red-600 transition-all ios-button-effect"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                {accountData ? formatCurrency(accountData.currentBalance) : "---"} đ
              </p>
            )}
          </div>
          {/* Giữ nguyên bố cục nhưng ẩn nút đồng bộ */}
          <div className="h-8 w-8"></div>
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
                {accountData ? formatCurrency(accountData.totalExpense) : "---"} đ
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
                <span>{formatCurrency(accountData.beginningBalance)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">đ</span>
              </div>
            </div>
            <div className="bg-card-lighter p-3 rounded-lg">
              <div className="text-sm text-techcom-lighttext">Tổng đã ứng tháng này</div>
              <div className={cn("font-bold flex items-baseline", getValueColor(accountData.totalAdvanced))}>
                <span>{formatCurrency(accountData.totalAdvanced)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">đ</span>
              </div>
            </div>
            <div className="bg-card-lighter p-3 rounded-lg">
              <div className="text-sm text-techcom-lighttext">Tài khoản còn</div>
              <div className={cn("font-bold flex items-baseline", getValueColor(accountData.accountRemaining))}>
                <span>{formatCurrency(accountData.accountRemaining)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">đ</span>
              </div>
            </div>
            <div className="bg-card-lighter p-3 rounded-lg">
              <div className="text-sm text-techcom-lighttext">Tài khoản chi</div>
              <div className={cn("font-bold flex items-baseline", getValueColor(accountData.accountExpenses, true))}>
                <span>{formatCurrency(accountData.accountExpenses)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">đ</span>
              </div>
            </div>
            <div className="bg-card-lighter p-3 rounded-lg">
              <div className="text-sm text-techcom-lighttext">Tiền mặt còn</div>
              <div className={cn("font-bold flex items-baseline", getValueColor(accountData.cashRemaining))}>
                <span>{formatCurrency(accountData.cashRemaining)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">đ</span>
              </div>
            </div>
            <div className="bg-card-lighter p-3 rounded-lg">
              <div className="text-sm text-techcom-lighttext">Tiền mặt chi</div>
              <div className={cn("font-bold flex items-baseline", getValueColor(accountData.cashExpenses, true))}>
                <span>{formatCurrency(accountData.cashExpenses)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">đ</span>
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
