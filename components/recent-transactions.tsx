"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DirectReceiptViewer } from "@/components/direct-receipt-viewer"
import { useDate } from "@/lib/date-context"
import { useTransactions } from "@/lib/hooks"
import { Skeleton } from "@/components/ui/skeleton"

export function RecentTransactions() {
  const { currentDate } = useDate()
  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()

  const { transactions, isLoading } = useTransactions(month, year)

  // Sort by timestamp and take the 5 most recent
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/transactions">View All Transactions</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No transactions yet</p>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{transaction.date}</span>
                    <Badge variant="outline">{transaction.category}</Badge>
                    {transaction.receiptLink && <DirectReceiptViewer receiptLink={transaction.receiptLink} size="sm" />}
                  </div>
                </div>
                <span
                  className={cn(
                    "font-medium",
                    transaction.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/transactions">View All Transactions</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
