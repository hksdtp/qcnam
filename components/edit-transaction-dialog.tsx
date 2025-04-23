"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { editTransaction } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { TransactionForm } from "./transaction-form"

interface EditTransactionDialogProps {
  transaction: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditTransactionDialog({ transaction, open, onOpenChange, onSuccess }: EditTransactionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  if (!transaction) return null

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

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
        }, 100)
      } else {
        toast({
          title: "Lỗi khi cập nhật giao dịch",
          description: result.error || "Đã xảy ra lỗi không xác định",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error editing transaction:", error)
      toast({
        title: "Lỗi khi cập nhật giao dịch",
        description: error.message || "Đã xảy ra lỗi không xác định",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  // Parse date string to Date object
  const dateObj = (() => {
    try {
      const [day, month, year] = transaction.date.split("/").map(Number)
      return new Date(year, month - 1, day)
    } catch (e) {
      return new Date()
    }
  })()

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Không cho phép đóng dialog khi đang submit
        if (!newOpen && !isSubmitting) {
          onOpenChange(newOpen)
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b flex flex-row justify-between items-center sticky top-0 bg-white z-10">
          <DialogTitle className="text-lg font-medium">Chỉnh sửa giao dịch</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-gray-100"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Đóng</span>
          </Button>
        </DialogHeader>
        <div className="p-4">
          <TransactionForm
            initialType={transaction.type}
            initialValues={{
              date: dateObj,
              category: transaction.category,
              description: transaction.description,
              amount: transaction.amount.toString(),
              subCategory: transaction.subCategory || "",
              fuelLiters: transaction.fuelLiters || "",
              paymentMethod: transaction.paymentMethod || "transfer",
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
