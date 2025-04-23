"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EditIcon, TrashIcon } from "lucide-react"
import { DirectReceiptViewer } from "@/components/direct-receipt-viewer"
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chi tiết giao dịch</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h3 className="font-medium text-lg">{transaction.description}</h3>
            <p className="text-muted-foreground">{transaction.date}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Loại</p>
              <p className="font-medium">{transaction.type === "income" ? "Thu nhập" : "Chi tiêu"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số tiền</p>
              <p
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
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Danh mục</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{transaction.category}</Badge>
                {transaction.subCategory && (
                  <Badge variant="outline" className="bg-blue-50">
                    {transaction.subCategory}
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phương thức thanh toán</p>
              <p className="font-medium">{transaction.paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản"}</p>
            </div>
          </div>

          {transaction.receiptLink && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Hóa đơn</p>
              <DirectReceiptViewer receiptLink={transaction.receiptLink} size="lg" />
            </div>
          )}

          {transaction.note && (
            <div>
              <p className="text-sm text-muted-foreground">Ghi chú</p>
              <p>{transaction.note}</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={() => onEdit(transaction)}>
            <EditIcon className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button variant="destructive" onClick={() => onDelete(transaction)}>
            <TrashIcon className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
