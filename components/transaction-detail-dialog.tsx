"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Edit, Trash } from "lucide-react"
import { DirectReceiptViewer } from "@/components/direct-receipt-viewer"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { EditTransactionDialog } from "@/components/edit-transaction-dialog"
import { DeleteTransactionDialog } from "@/components/delete-transaction-dialog"

interface TransactionDetailDialogProps {
  transaction: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (transaction: any) => void
  onDelete: (transaction: any) => void
  onSuccess: () => void
}

export function TransactionDetailDialog({
  transaction,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onSuccess,
}: TransactionDetailDialogProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!transaction) return null

  const handleEdit = () => {
    onOpenChange(false)
    setTimeout(() => {
      setShowEditDialog(true)
    }, 100)
  }

  const handleDelete = () => {
    onOpenChange(false)
    setTimeout(() => {
      setShowDeleteDialog(true)
    }, 100)
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    onSuccess()
  }

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false)
    onSuccess()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Chi tiết giao dịch</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">{transaction.description}</h3>
              <p className="text-muted-foreground">{transaction.date}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Danh mục</p>
                <p className="font-medium">{transaction.category}</p>
              </div>
              {transaction.subCategory && (
                <div>
                  <p className="text-sm text-muted-foreground">Danh mục con</p>
                  <p className="font-medium">{transaction.subCategory}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Số tiền</p>
                <p
                  className={cn(
                    "font-medium text-lg",
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
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phương thức thanh toán</p>
                <p className="font-medium">{transaction.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}</p>
              </div>
            </div>

            {transaction.fuelLiters && (
              <div>
                <p className="text-sm text-muted-foreground">Số lít xăng</p>
                <p className="font-medium">{transaction.fuelLiters} lít</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{transaction.category}</Badge>
              {transaction.subCategory && (
                <Badge variant="outline" className="bg-blue-50">
                  {transaction.subCategory}
                </Badge>
              )}
              <Badge variant="outline" className="bg-gray-50">
                {transaction.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}
              </Badge>
              <Badge variant="outline" className={transaction.type === "income" ? "bg-emerald-50" : "bg-rose-50"}>
                {transaction.type === "income" ? "Thu nhập" : "Chi tiêu"}
              </Badge>
            </div>

            {transaction.receiptLink && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Hóa đơn/biên lai</p>
                <div className="flex justify-center">
                  <DirectReceiptViewer receiptLink={transaction.receiptLink} size="lg" />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" className="flex items-center gap-1" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
                Sửa
              </Button>
              <Button variant="destructive" className="flex items-center gap-1" onClick={handleDelete}>
                <Trash className="h-4 w-4" />
                Xóa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showEditDialog && (
        <EditTransactionDialog
          transaction={transaction}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={handleEditSuccess}
        />
      )}

      {showDeleteDialog && (
        <DeleteTransactionDialog
          transaction={transaction}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  )
}
