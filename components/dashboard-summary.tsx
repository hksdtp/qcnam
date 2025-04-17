"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTransactionSummary } from "@/lib/hooks"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSummary() {
  const { summary, isLoading } = useTransactionSummary()
  const { totalIncome, totalExpense, balance } = summary

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SummaryCard
        title="Total Income"
        amount={totalIncome}
        icon={<ArrowUpIcon className="h-5 w-5 text-emerald-500" />}
        className="bg-emerald-50 dark:bg-emerald-950/30"
      />
      <SummaryCard
        title="Total Expenses"
        amount={totalExpense}
        icon={<ArrowDownIcon className="h-5 w-5 text-rose-500" />}
        className="bg-rose-50 dark:bg-rose-950/30"
      />
      <SummaryCard
        title="Current Balance"
        amount={balance}
        icon={<WalletIcon className="h-5 w-5 text-blue-500" />}
        className={cn("bg-blue-50 dark:bg-blue-950/30", balance < 0 && "bg-rose-50 dark:bg-rose-950/30")}
      />
    </div>
  )
}

function SummaryCard({
  title,
  amount,
  icon,
  className,
}: {
  title: string
  amount: number
  icon: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-1 text-2xl font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(amount)}
            </h3>
          </div>
          <div className="rounded-full p-2 bg-background/80">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
