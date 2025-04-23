"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DirectReceiptViewer } from "@/components/direct-receipt-viewer"
import { cn } from "@/lib/utils"

interface TransactionDetailDialogProps {
  transaction: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (transaction: any) => void
  onDelete?: (transaction: any) => void
}

export function TransactionDetailDialog({
  transaction,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TransactionDetailDialogProps) {
  if (!transaction) return null

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
          <div>
            <h3 className="font-medium text-lg">{transaction.description}</h3>
            <p className="text-muted-foreground">{transaction.date}</p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-bold text-xl",
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

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
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
            </div>
          </div>

          {transaction.receiptLink && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Hóa đơn/Biên lai:</h4>
              <div className="flex justify-center">
                <DirectReceiptViewer receiptLink={transaction.receiptLink} size="lg" />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(transaction)} className="flex items-center gap-1">
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={() => onDelete(transaction)} className="flex items-center gap-1">
                <Trash2 className="h-4 w-4" />
                Xóa
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
