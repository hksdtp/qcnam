"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TransactionFormFixed } from "@/components/transaction-form-fixed"
import { editTransaction } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import type { Transaction } from "@/lib/types"

interface EditTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction & { rowIndex?: number }
  onComplete?: () => void
  onSuccess?: () => void
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onComplete,
  onSuccess,
}: EditTransactionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

    try {
      // Đảm bảo rowIndex được thêm vào formData
      if (transaction.rowIndex) {
        formData.append("rowIndex", transaction.rowIndex.toString())
      }

      console.log("Submitting edit with rowIndex:", transaction.rowIndex)

      const result = await editTransaction(formData)

      if (result.success) {
        toast({
          title: "Cập nhật thành công",
          description: "Giao dịch đã được cập nhật",
        })

        // Gọi callback onSuccess nếu có
        if (onSuccess) onSuccess()

        // Gọi callback onComplete nếu có
        if (onComplete) onComplete()

        // Đóng dialog
        onOpenChange(false)
      } else {
        toast({
          title: "Lỗi khi cập nhật giao dịch",
          description: result.error || "Đã xảy ra lỗi không xác định",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating transaction:", error)
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
          initialData={transaction}
          initialType={transaction.type}
          currentDate={new Date(transaction.date.split("/").reverse().join("-"))}
          onSuccess={onSuccess}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEditing={true}
        />
      </DialogContent>
    </Dialog>
  )
}
