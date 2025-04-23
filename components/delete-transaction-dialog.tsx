"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import { deleteTransaction } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"

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
        onOpenChange(false)

        setTimeout(() => {
          toast({
            title: "Xóa giao dịch thành công",
            description: "Giao dịch đã được xóa khỏi hệ thống",
          })

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
    <Dialog open={open} onOpenChange={(newOpen) => !isDeleting && onOpenChange(newOpen)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Xác nhận xóa giao dịch
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa giao dịch này? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-md p-3 bg-gray-50">
            <p className="font-medium">{transaction.description}</p>
            <p className="text-sm text-muted-foreground">{transaction.date}</p>
            <p className="text-sm mt-1">
              <span className="text-muted-foreground">Số tiền:</span>{" "}
              <span className={transaction.type === "income" ? "text-emerald-600" : "text-rose-600"}>
                {transaction.type === "income" ? "+" : "-"}
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                }).format(transaction.amount)}
              </span>
            </p>
          </div>

          <div className="flex justify-end gap-3">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
