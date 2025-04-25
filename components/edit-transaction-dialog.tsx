"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { editTransaction } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { TransactionFormFixed } from "./transaction-form-fixed"

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
    } catch (error: unknown) {
      console.error("Error editing transaction:", error)
      toast({
        title: "Lỗi khi cập nhật giao dịch",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định",
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
      <DialogPortal>
        <DialogOverlay className="bg-black/30 backdrop-blur-[2px] animate-in fade-in-50 duration-100 backdrop-blur" />
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden fixed left-[50%] top-16 translate-x-[-50%] rounded-xl border border-gray-200 bg-white shadow-xl animate-in fade-in-50 zoom-in-95 duration-200 sm:w-full max-h-[80vh] data-[state=open]:animate-in data-[state=closed]:animate-out dialog-content ios-card-effect">
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
            <TransactionFormFixed
              initialType={transaction.type}
              existingTransaction={transaction}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onCancel={handleCancel}
            />
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
