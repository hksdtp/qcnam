"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DirectReceiptViewer } from "@/components/direct-receipt-viewer"
import { EditIcon, TrashIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TransactionDetailDialogProps {
  transaction: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (transaction: any) => void
  onDelete: (transaction: any) => void
}

export function TransactionDetailDialog({
  transaction,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TransactionDetailDialogProps) {
  if (!transaction) return null

  // Debug log to verify transaction data
  console.log("Transaction detail dialog:", transaction)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b flex flex-row justify-between items-center sticky top-0 bg-white z-10">
          <DialogTitle className="text-lg font-medium">Chi tiết giao dịch</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Đóng</span>
          </Button>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{transaction.description}</h3>
              <p className="text-sm text-muted-foreground">{transaction.date}</p>
            </div>
            <div
              className={cn(
                "font-medium text-xl",
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Danh mục</p>
              <Badge variant="outline" className="mt-1">
                {transaction.category}
              </Badge>
            </div>
            {transaction.subCategory && (
              <div>
                <p className="text-sm text-muted-foreground">Danh mục phụ</p>
                <Badge variant="outline" className="mt-1 bg-blue-50">
                  {transaction.subCategory}
                </Badge>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Loại giao dịch</p>
              <Badge
                variant="outline"
                className={`mt-1 ${transaction.type === "income" ? "bg-emerald-50" : "bg-rose-50"}`}
              >
                {transaction.type === "income" ? "Thu nhập" : "Chi tiêu"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phương thức</p>
              <Badge variant="outline" className="mt-1 bg-gray-50">
                {transaction.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}
              </Badge>
            </div>
            {transaction.fuelLiters && (
              <div>
                <p className="text-sm text-muted-foreground">Số lít xăng</p>
                <p className="font-medium">{transaction.fuelLiters} lít</p>
              </div>
            )}
          </div>

          {transaction.receiptLink && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Hóa đơn</p>
              <div className="flex justify-center">
                <DirectReceiptViewer receiptLink={transaction.receiptLink} size="lg" />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => onEdit(transaction)}
              data-testid="detail-edit-button"
            >
              <EditIcon className="h-4 w-4" />
              Chỉnh sửa
            </Button>
            <Button
              variant="destructive"
              className="flex items-center gap-1"
              onClick={() => onDelete(transaction)}
              data-testid="detail-delete-button"
            >
              <TrashIcon className="h-4 w-4" />
              Xóa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
