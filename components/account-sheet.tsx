"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Wallet, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDate } from "@/lib/date-context"

interface AccountData {
  currentBalance: number
  totalExpense: number
  beginningBalance: number
  totalAdvanced: number
  accountRemaining: number
  accountExpenses: number
  cashRemaining: number
  cashExpenses: number
}

interface AccountSheetProps {
  initialData?: AccountData
  className?: string
}

export function AccountSheet({ initialData, className }: AccountSheetProps) {
  const { currentDate } = useDate()
  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [accountData, setAccountData] = useState<AccountData>({
    currentBalance: 0,
    totalExpense: 0,
    beginningBalance: 0,
    totalAdvanced: 0,
    accountRemaining: 0,
    accountExpenses: 0,
    cashRemaining: 0,
    cashExpenses: 0,
  })

  // Lấy dữ liệu tài khoản khi tháng thay đổi
  useEffect(() => {
    const fetchAccountData = async () => {
      setIsLoading(true)

      try {
        // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
        // Ở đây tôi sẽ tạo dữ liệu mẫu dựa trên tháng hiện tại

        // Giả lập độ trễ của API
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Tạo dữ liệu mẫu với một chút biến động theo tháng
        const monthFactor = currentDate.getMonth() + 1
        const mockData: AccountData = {
          currentBalance: 5500000 + monthFactor * 100000,
          totalExpense: 2500000 + monthFactor * 50000,
          beginningBalance: 7000000 + monthFactor * 100000,
          totalAdvanced: 1500000 + monthFactor * 50000,
          accountRemaining: 2500000 + monthFactor * 75000,
          accountExpenses: 1000000 + monthFactor * 25000,
          cashRemaining: 800000 + monthFactor * 25000,
          cashExpenses: 700000 + monthFactor * 25000,
        }

        setAccountData(mockData)
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tài khoản:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccountData()
  }, [currentDate])

  // Định dạng số tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount)
  }

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  return (
    <Card className={cn("overflow-hidden rounded-lg shadow-md", className)}>
      {/* Phần header - Số dư hiện có */}
      <div className="bg-techcom-red text-white p-5 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Số dư hiện có</p>
            {isLoading ? (
              <div className="h-8 w-32 bg-white/20 animate-pulse rounded-md mt-1"></div>
            ) : (
              <p className="text-2xl font-bold mt-1">{formatCurrency(accountData.currentBalance)} đ</p>
            )}
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <Wallet className="h-6 w-6" />
          </div>
        </div>

        {/* Nút toggle chi tiết */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -bottom-3 right-5 bg-white rounded-lg p-1 shadow-md hover:bg-gray-100"
          onClick={toggleDetails}
          aria-label={showDetails ? "Ẩn chi tiết" : "Hiện chi tiết"}
        >
          {showDetails ? (
            <ChevronUp className="h-5 w-5 text-techcom-red" />
          ) : (
            <ChevronDown className="h-5 w-5 text-techcom-red" />
          )}
        </Button>
      </div>

      {/* Phần nội dung */}
      <CardContent className="p-4">
        {/* Tổng chi tiêu tháng */}
        <div className="flex items-center gap-3">
          <div className="bg-techcom-lightblue p-2 rounded-full">
            <TrendingDown className="h-5 w-5 text-techcom-red" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Tổng chi tiêu tháng {currentDate.getMonth() + 1}</div>
            {isLoading ? (
              <div className="h-6 w-24 bg-gray-100 animate-pulse rounded-md"></div>
            ) : (
              <div className="font-bold text-techcom-red">{formatCurrency(accountData.totalExpense)} đ</div>
            )}
          </div>
        </div>

        {/* Chi tiết tài khoản - hiển thị khi showDetails = true */}
        {showDetails && !isLoading && (
          <div className="mt-4 grid grid-cols-2 gap-4 animate-fade-in">
            {/* Số dư đầu kỳ */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Số dư đầu kỳ</div>
              <div className="font-bold flex items-baseline text-gray-800">
                <span>{formatCurrency(accountData.beginningBalance)}</span>
                <span className="text-gray-500 ml-1 text-xs">đ</span>
              </div>
            </div>

            {/* Tổng đã ứng tháng này */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Tổng đã ứng tháng này</div>
              <div
                className={cn(
                  "font-bold flex items-baseline",
                  accountData.totalAdvanced > 0 ? "text-techcom-blue" : "text-gray-800",
                )}
              >
                <span>{formatCurrency(accountData.totalAdvanced)}</span>
                <span className="text-gray-500 ml-1 text-xs">đ</span>
              </div>
            </div>

            {/* Tài khoản còn */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Tài khoản còn</div>
              <div
                className={cn(
                  "font-bold flex items-baseline",
                  accountData.accountRemaining > 0 ? "text-techcom-blue" : "text-gray-800",
                )}
              >
                <span>{formatCurrency(accountData.accountRemaining)}</span>
                <span className="text-gray-500 ml-1 text-xs">đ</span>
              </div>
            </div>

            {/* Tài khoản chi */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Tài khoản chi</div>
              <div
                className={cn(
                  "font-bold flex items-baseline",
                  accountData.accountExpenses > 0 ? "text-techcom-red" : "text-gray-800",
                )}
              >
                <span>{formatCurrency(accountData.accountExpenses)}</span>
                <span className="text-gray-500 ml-1 text-xs">đ</span>
              </div>
            </div>

            {/* Tiền mặt còn */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Tiền mặt còn</div>
              <div
                className={cn(
                  "font-bold flex items-baseline",
                  accountData.cashRemaining > 0 ? "text-techcom-blue" : "text-gray-800",
                )}
              >
                <span>{formatCurrency(accountData.cashRemaining)}</span>
                <span className="text-gray-500 ml-1 text-xs">đ</span>
              </div>
            </div>

            {/* Tiền mặt chi */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">Tiền mặt chi</div>
              <div
                className={cn(
                  "font-bold flex items-baseline",
                  accountData.cashExpenses > 0 ? "text-techcom-red" : "text-gray-800",
                )}
              >
                <span>{formatCurrency(accountData.cashExpenses)}</span>
                <span className="text-gray-500 ml-1 text-xs">đ</span>
              </div>
            </div>
          </div>
        )}

        {/* Hiển thị skeleton khi đang tải và showDetails = true */}
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
