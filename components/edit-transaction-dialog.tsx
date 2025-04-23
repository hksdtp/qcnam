"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TransactionFormFixed } from "@/components/transaction-form-fixed"
import { editTransaction } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"

interface EditTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: any // Replace 'any' with a more specific type if available
  onSuccess: () => void
  onComplete?: () => void
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSuccess,
  onComplete,
}: EditTransactionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Thêm rowIndex vào formData
      formData.append("rowIndex", transaction.rowIndex.toString())

      const result = await editTransaction(formData)

      if (result.success) {
        // Đóng dialog trước
        onOpenChange(false)

        // Sau đó hiển thị thông báo thành công
        setTimeout(() => {
          toast({
            title: "Cập nhật giao dịch thành công",
            description: "Giao dịch đã được cập nhật trong hệ thống",
          })

          // Gọi callback onSuccess nếu có
          if (onSuccess) {
            onSuccess()
          }

          // Gọi callback onComplete nếu có
          if (onComplete) {
            onComplete()
          }
        }, 100)
      } else {
        setError(result.error || "Đã xảy ra lỗi không xác định")
        toast({
          title: "Lỗi khi cập nhật giao dịch",
          description: result.error || "Đã xảy ra lỗi không xác định",
          variant: "destructive",
        })
      }
    } catch (error) {
      setError(error.message || "Đã xảy ra lỗi không xác định")
      toast({
        title: "Lỗi khi cập nhật giao dịch",
        description: error.message || "Đã xảy ra lỗi không xác định",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa giao dịch</DialogTitle>
        </DialogHeader>
        <TransactionFormFixed
          initialType={transaction.type}
          currentDate={new Date(transaction.date)}
          onSuccess={onSuccess}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
