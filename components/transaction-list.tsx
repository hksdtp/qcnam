"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EditIcon, TrashIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { DirectReceiptViewer } from "@/components/direct-receipt-viewer"
import { EditTransactionDialog } from "@/components/edit-transaction-dialog"
import { useDate } from "@/lib/date-context"
import { useTransactions } from "@/lib/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { deleteTransaction } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { TransactionDetailDialog } from "./transaction-detail-dialog"

export function TransactionList({
  category = "all",
  type = "all",
}: {
  category?: string
  type?: string
}) {
  const { currentDate } = useDate()
  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()

  const { transactions, isLoading, mutate } = useTransactions(month, year)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [viewingTransaction, setViewingTransaction] = useState<any>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const { toast } = useToast()

  // Debug log to verify transactions are loaded
  useEffect(() => {
    if (transactions.length > 0) {
      console.log("Transactions loaded:", transactions.length)
    }
  }, [transactions])

  // Filter transactions based on props
  const filteredTransactions = transactions
    .filter((transaction) => {
      if (category !== "all" && transaction.category !== category) return false
      if (type !== "all" && transaction.type !== type) return false
      return true
    })
    .sort((a, b) => {
      // Sắp xếp theo danh mục trước
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }

      // Nếu cùng danh mục, sắp xếp theo thời gian mới nhất
      const dateA = new Date(a.timestamp || a.date.split("/").reverse().join("-"))
      const dateB = new Date(b.timestamp || b.date.split("/").reverse().join("-"))
      return dateB.getTime() - dateA.getTime()
    })

  const handleViewDetail = (transaction: any) => {
    console.log("Viewing transaction details:", transaction)
    setViewingTransaction(transaction)
    setShowDetailDialog(true)
  }

  const handleEdit = (transaction: any) => {
    console.log("Editing transaction:", transaction)
    setEditingTransaction(transaction)
  }

  const handleDelete = async (transaction: any) => {
    console.log("Deleting transaction:", transaction)

    if (!window.confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) return

    const formData = new FormData()
    formData.append("rowIndex", transaction.rowIndex.toString())

    try {
      const result = await deleteTransaction(formData)

      if (result.success) {
        toast({
          title: "Xóa giao dịch thành công",
          description: "Giao dịch đã được xóa khỏi hệ thống",
        })

        // Refresh data with force revalidation
        mutate(undefined, { revalidate: true })
      } else {
        toast({
          title: "Lỗi khi xóa giao dịch",
          description: result.error || "Đã xảy ra lỗi không xác định",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast({
        title: "Lỗi khi xóa giao dịch",
        description: error.message || "Đã xảy ra lỗi không xác định",
        variant: "destructive",
      })
    }
  }

  const handleEditComplete = () => {
    setEditingTransaction(null)
    // Refresh data with force revalidation
    mutate(undefined, { revalidate: true })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Giao dịch</CardTitle>
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
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Không có giao dịch nào</p>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id || `${transaction.date}-${transaction.amount}-${Math.random()}`}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 hover:bg-gray-50 rounded-md p-2 -mx-2 transition-colors cursor-pointer"
                  onClick={() => handleViewDetail(transaction)}
                  data-testid="transaction-item"
                >
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">{transaction.date}</span>
                      <Badge variant="outline">{transaction.category}</Badge>
                      {transaction.subCategory && (
                        <Badge variant="outline" className="bg-blue-50">
                          {transaction.subCategory}
                        </Badge>
                      )}
                      {transaction.paymentMethod && (
                        <Badge variant="outline" className="bg-gray-50">
                          {transaction.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}
                        </Badge>
                      )}
                      {transaction.receiptLink && (
                        <span onClick={(e) => e.stopPropagation()}>
                          <DirectReceiptViewer receiptLink={transaction.receiptLink} size="sm" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
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
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleEdit(transaction)
                        }}
                        data-testid="edit-button"
                      >
                        <EditIcon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDelete(transaction)
                        }}
                        data-testid="delete-button"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => {
            if (!open) setEditingTransaction(null)
          }}
          onSuccess={handleEditComplete}
        />
      )}

      {viewingTransaction && (
        <TransactionDetailDialog
          transaction={viewingTransaction}
          open={showDetailDialog}
          onOpenChange={(open) => {
            setShowDetailDialog(open)
            if (!open) setViewingTransaction(null)
          }}
          onEdit={(transaction) => {
            setShowDetailDialog(false)
            setViewingTransaction(null)
            setTimeout(() => handleEdit(transaction), 100)
          }}
          onDelete={(transaction) => {
            setShowDetailDialog(false)
            setViewingTransaction(null)
            setTimeout(() => handleDelete(transaction), 100)
          }}
        />
      )}
    </>
  )
}
