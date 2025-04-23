"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EditIcon, TrashIcon, EyeIcon, MoreVertical } from "lucide-react"
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
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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
    setActiveMenuId(null)
  }

  const handleEdit = (transaction: any) => {
    console.log("Editing transaction:", transaction)
    setEditingTransaction(transaction)
    setActiveMenuId(null)
  }

  const handleDelete = async (transaction: any) => {
    console.log("Deleting transaction:", transaction)
    setActiveMenuId(null)

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

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Toggle menu for:", id)
    setActiveMenuId(activeMenuId === id ? null : id)
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
              {filteredTransactions.map((transaction) => {
                const transactionId = transaction.id || `${transaction.date}-${transaction.amount}-${Math.random()}`
                return (
                  <div
                    key={transactionId}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 relative"
                  >
                    {/* Vùng có thể click để xem chi tiết */}
                    <div
                      className="flex-1 pr-16 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                      onClick={() => handleViewDetail(transaction)}
                    >
                      <div className="space-y-1">
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
                    </div>

                    {/* Phần hiển thị số tiền và nút menu */}
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

                      {/* Nút menu đơn giản */}
                      <div className="relative" ref={menuRef}>
                        <button
                          type="button"
                          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                          onClick={(e) => toggleMenu(transactionId, e)}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {/* Menu đơn giản */}
                        {activeMenuId === transactionId && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white shadow-lg rounded-md border border-gray-200 py-1 z-50">
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                              onClick={() => handleViewDetail(transaction)}
                            >
                              <EyeIcon className="h-4 w-4 mr-2" />
                              Chi tiết
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center"
                              onClick={() => handleEdit(transaction)}
                            >
                              <EditIcon className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center"
                              onClick={() => handleDelete(transaction)}
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
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
