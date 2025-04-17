"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDate } from "@/lib/date-context"
import { useAccountData } from "@/lib/hooks"

export function CurrentBalance() {
  const { currentDate } = useDate()
  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()

  const { accountData, isLoading, isError } = useAccountData(month, year)
  const [showDetails, setShowDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update error state when API returns an error
  useEffect(() => {
    if (isError) {
      setError("Đã xảy ra lỗi khi lấy dữ liệu")
    } else {
      setError(null)
    }
  }, [isError])

  // Định dạng số tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount)
  }

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  // Xác định màu sắc dựa trên giá trị
  const getValueColor = (value: number, isExpense = false) => {
    if (isExpense) {
      return value > 0 ? "text-techcom-red" : "text-techcom-text"
    }
    return value > 0 ? "text-techcom-blue" : value < 0 ? "text-techcom-red" : "text-techcom-text"
  }

  return (
    <Card className="rounded-lg overflow-hidden">
      <CardContent className="p-0">
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
            <div className="bg-white/20 p-3 rounded-lg">
              <Wallet className="h-6 w-6" />
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

        <div className="p-4">
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
        </div>
      </CardContent>
    </Card>
  )
}
