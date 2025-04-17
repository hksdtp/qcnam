"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function MonthlyStats() {
  const [showDetails, setShowDetails] = useState(false)
  const [stats, setStats] = useState({
    beginningBalance: 7500000,
    totalAdvanced: 2000000,
    accountRemaining: 3000000,
    accountExpenses: 1500000,
    cashRemaining: 1000000,
    cashExpenses: 1000000,
  })

  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  // Định dạng số tiền VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount)
  }

  return (
    <Card className="techcom-card overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between bg-white">
        <CardTitle className="text-techcom-text font-bold text-base flex items-center gap-2">
          <span className="bg-techcom-lightblue p-1.5 rounded-full">
            <TrendingUp className="h-4 w-4 text-techcom-blue" />
          </span>
          THỐNG KÊ THÁNG 3 2025
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDetails}
          className="text-techcom-blue hover:bg-techcom-lightblue rounded-full h-8 px-3"
        >
          {showDetails ? (
            <span className="flex items-center text-xs">
              Ẩn chi tiết <ChevronUp className="ml-1 h-4 w-4" />
            </span>
          ) : (
            <span className="flex items-center text-xs">
              Xem chi tiết <ChevronDown className="ml-1 h-4 w-4" />
            </span>
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-4 bg-white">
        {showDetails ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-techcom-gray p-3 rounded-xl">
              <div className="text-sm text-techcom-lighttext">Số dư đầu kỳ</div>
              <div className="font-bold flex items-baseline text-techcom-text">
                <span>{formatCurrency(stats.beginningBalance)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">đ</span>
              </div>
            </div>
            <div className="bg-techcom-gray p-3 rounded-xl">
              <div className="text-sm text-techcom-lighttext">Tổng đã ứng tháng này</div>
              <div
                className={cn(
                  "font-bold flex items-baseline",
                  stats.totalAdvanced > 0 ? "text-techcom-blue" : "text-techcom-text",
                )}
              >
                <span>{formatCurrency(stats.totalAdvanced)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">đ</span>
              </div>
            </div>
            <div className="bg-techcom-gray p-3 rounded-xl">
              <div className="text-sm text-techcom-lighttext">Tài khoản còn</div>
              <div
                className={cn(
                  "font-bold flex items-baseline",
                  stats.accountRemaining > 0 ? "text-techcom-blue" : "text-techcom-text",
                )}
              >
                <span>{formatCurrency(stats.accountRemaining)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">đ</span>
              </div>
            </div>
            <div className="bg-techcom-gray p-3 rounded-xl">
              <div className="text-sm text-techcom-lighttext">Tài khoản chi</div>
              <div
                className={cn(
                  "font-bold flex items-baseline",
                  stats.accountExpenses > 0 ? "text-techcom-red" : "text-techcom-text",
                )}
              >
                <span>{formatCurrency(stats.accountExpenses)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">đ</span>
              </div>
            </div>
            <div className="bg-techcom-gray p-3 rounded-xl">
              <div className="text-sm text-techcom-lighttext">Tiền mặt còn</div>
              <div
                className={cn(
                  "font-bold flex items-baseline",
                  stats.cashRemaining > 0 ? "text-techcom-blue" : "text-techcom-text",
                )}
              >
                <span>{formatCurrency(stats.cashRemaining)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">đ</span>
              </div>
            </div>
            <div className="bg-techcom-gray p-3 rounded-xl">
              <div className="text-sm text-techcom-lighttext">Tiền mặt chi</div>
              <div
                className={cn(
                  "font-bold flex items-baseline",
                  stats.cashExpenses > 0 ? "text-techcom-red" : "text-techcom-text",
                )}
              >
                <span>{formatCurrency(stats.cashExpenses)}</span>
                <span className="text-techcom-lighttext ml-1 text-xs">đ</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="bg-techcom-lightblue p-2 rounded-full">
              <TrendingDown className="h-5 w-5 text-techcom-red" />
            </div>
            <div>
              <div className="text-sm text-techcom-lighttext">Tổng chi tiêu tháng này</div>
              <div className="font-bold text-techcom-red">
                {formatCurrency(stats.accountExpenses + stats.cashExpenses)} đ
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
