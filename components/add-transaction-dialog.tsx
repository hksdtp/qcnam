"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TransactionFormFixed } from "@/components/transaction-form-fixed"
import { addTransaction } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { useTransactions, useAccountData, useCarData, useTransactionSummary } from "@/lib/hooks"
import { useDate } from "@/lib/date-context"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

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

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Chỉ cho phép đóng dialog khi người dùng nhấn nút X, Cancel hoặc sau khi hoàn thành
        if (!newOpen && !isSubmitting) {
          onOpenChange(newOpen)
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[400px] max-h-[90vh] p-0 overflow-hidden bg-white"
        onInteractOutside={(e) => {
          // Ngăn chặn đóng dialog khi nhấn ra ngoài
          e.preventDefault()
        }}
      >
        <DialogHeader className="px-4 py-2 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <DialogTitle className="text-lg font-medium">Thêm giao dịch mới</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Đóng</span>
          </Button>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
          <div className="p-4 bg-white">
            <TransactionFormFixed
              onSuccess={() => onOpenChange(false)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              initialType={initialType}
            />
          </div>
        </div>
        <div className="px-4 py-3 border-t flex justify-end gap-2 sticky bottom-0 bg-white z-10">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="h-9">
            Hủy
          </Button>
          <Button
            type="submit"
            form="transaction-form"
            disabled={isSubmitting}
            className="bg-techcom-red hover:bg-techcom-darkred text-white h-9"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
