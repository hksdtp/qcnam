"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TransactionFormFixed } from "@/components/transaction-form-fixed"
import { editTransaction } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EditTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: any // Replace 'any' with a more specific type if available
  onSuccess?: () => void
}

export function EditTransactionDialog({ open, onOpenChange, transaction, onSuccess }: EditTransactionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Debugging
  useEffect(() => {
    console.log("EditTransactionDialog rendered with open:", open, "transaction:", transaction)
  }, [open, transaction])

  const handleSubmit = async (formData: FormData) => {
    console.log("Submitting edit form")
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

  // Nếu không có transaction, không hiển thị dialog
  if (!transaction) return null

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
      <DialogContent
        className="sm:max-w-[380px] p-0 overflow-hidden bg-white"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxHeight: "90vh",
          width: "95%",
          zIndex: 50,
        }}
      >
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
        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 60px)" }}>
          <div className="p-4 bg-white">
            <TransactionFormFixed
              initialType={transaction.type}
              initialValues={{
                date: transaction.date,
                category: transaction.category,
                description: transaction.description,
                amount: transaction.amount.toString(),
                subCategory: transaction.subCategory || "",
                fuelLiters: transaction.fuelLiters || "",
                paymentMethod: transaction.paymentMethod || "transfer",
              }}
              onSuccess={onSuccess}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
