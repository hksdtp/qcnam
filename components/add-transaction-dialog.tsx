"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { TransactionFormFixed } from "@/components/transaction-form-fixed"
import { addTransaction } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { useTransactions, useAccountData, useCarData, useTransactionSummary } from "@/lib/hooks"
import { useDate } from "@/lib/date-context"
import { X } from "lucide-react"

export function AddTransactionDialog({
  open,
  onOpenChange,
  onAddTransaction,
  initialType = "expense",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTransaction?: (transaction: any) => void
  initialType?: "expense" | "income"
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { currentDate } = useDate()
  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()

  // Get mutate functions to refresh data after adding a transaction
  const { mutate: mutateTransactions } = useTransactions(month, year)
  const { mutate: mutateAccountData } = useAccountData(month, year)
  const { mutate: mutateCarData } = useCarData(month, year)
  const { mutate: mutateSummary } = useTransactionSummary()

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

    try {
      const result = await addTransaction(formData)

      if (result.success) {
        toast({
          title: "Thêm giao dịch thành công",
          description: "Giao dịch đã được thêm vào hệ thống",
        })

        // Refresh all data
        mutateTransactions()
        mutateAccountData()
        mutateCarData()
        mutateSummary()

        // Close the dialog
        onOpenChange(false)

        // Call onAddTransaction callback if provided
        if (onAddTransaction && result.transaction) {
          onAddTransaction(result.transaction)
        }
      } else {
        toast({
          title: "Lỗi khi thêm giao dịch",
          description: result.error || "Đã xảy ra lỗi không xác định",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi khi thêm giao dịch",
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

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Không cho phép đóng dialog khi nhấn ra ngoài
        if (!newOpen && !isSubmitting) {
          // Chỉ cho phép đóng khi không đang submit
          onOpenChange(newOpen)
        }
      }}
    >
      <DialogContent
        className="w-full max-w-md mx-auto overflow-y-auto"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxHeight: "90vh",
          width: "95%",
          zIndex: 50,
        }}
        onInteractOutside={(e) => {
          // Ngăn chặn đóng dialog khi nhấn ra ngoài
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          // Ngăn chặn đóng dialog khi nhấn ESC
          e.preventDefault()
        }}
      >
        <DialogHeader className="px-4 py-3 border-b flex flex-row justify-between items-center sticky top-0 bg-white z-10">
          <DialogTitle className="text-lg font-medium">Thêm giao dịch mới</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 60px)" }}>
          <div className="p-4 bg-white">
            <TransactionFormFixed
              onSuccess={() => onOpenChange(false)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              initialType={initialType}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
