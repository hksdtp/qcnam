"use client"

import { useState } from "react"
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
  
  // Type assertion to add mutate property - these hooks actually return mutate from SWR
  const accountData = useAccountData(month, year) as { mutate: () => void; accountData: any; isLoading: boolean; isError: boolean; errorMessage: any }
  const carData = useCarData(month, year) as { mutate: () => void; carData: any; isLoading: boolean; isError: boolean; errorMessage: any }
  const summary = useTransactionSummary() as { mutate: () => void; summary: any; isLoading: boolean; isError: boolean; errorMessage: any }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

    try {
      const result = await addTransaction(formData)

      if (result.success) {
        // Tự động đóng dialog khi thêm giao dịch thành công
        onOpenChange(false)

        // Hiển thị thông báo thành công sau khi đóng dialog
        setTimeout(() => {
          toast({
            title: "Thêm giao dịch thành công",
            description: "Giao dịch đã được thêm vào hệ thống",
          })
        }, 300)

        // Refresh all data
        mutateTransactions()
        accountData.mutate()
        carData.mutate()
        summary.mutate()

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định"
      toast({
        title: "Lỗi khi thêm giao dịch",
        description: errorMessage,
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

  // Cách cải tiến: sử dụng giải pháp native dialog thay vì Radix UI Dialog
  if (typeof window !== "undefined") {
    if (open) {
      document.body.style.overflow = "hidden"; // Ngăn scroll trên body
    } else {
      document.body.style.overflow = "auto"; // Cho phép scroll lại
    }
  }

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={() => !isSubmitting && onOpenChange(false)}
    >
      <div 
        className="bg-white w-[95%] max-w-[380px] rounded-lg overflow-hidden shadow-lg"
        style={{ maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="text-lg font-medium">Thêm giao dịch mới</h3>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Đóng</span>
          </button>
        </div>
        
        <div className="overflow-auto" style={{ maxHeight: "calc(80vh - 57px)" }}>
          <div className="p-4">
            <TransactionFormFixed
              onSuccess={() => onOpenChange(false)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              initialType={initialType}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
