"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteTransaction } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface DeleteTransactionDialogProps {
  transaction: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteTransactionDialog({ transaction, open, onOpenChange, onSuccess }: DeleteTransactionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  if (!transaction) return null

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const formData = new FormData()
      formData.append("rowIndex", transaction.rowIndex.toString())

      const result = await deleteTransaction(formData)

      if (result.success) {
        // Đóng dialog trước
        onOpenChange(false)

        // Sau đó hiển thị thông báo thành công
        setTimeout(() => {
          toast({
            title: "Xóa giao dịch thành công",
            description: "Giao dịch đã được xóa khỏi hệ thống",
          })

          // Gọi callback onSuccess nếu có
          if (onSuccess) {
            onSuccess()
          }
        }, 100)
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
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Không cho phép đóng dialog khi đang xóa
        if (!newOpen && !isDeleting) {
          onOpenChange(newOpen)
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Xác nhận xóa giao dịch</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa giao dịch này? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className="font-medium">{transaction.description}</p>
          <p className="text-sm text-muted-foreground">
            {transaction.date} - {transaction.category}
          </p>
          <p className={`font-semibold ${transaction.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
            {transaction.type === "income" ? "+" : "-"}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              maximumFractionDigits: 0,
            }).format(transaction.amount)}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa giao dịch"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
