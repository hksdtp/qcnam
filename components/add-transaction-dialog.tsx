"use client"

import { useState, useEffect } from "react"
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
  const [viewportHeight, setViewportHeight] = useState(0)
  const { toast } = useToast()
  const { currentDate } = useDate()
  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()

  // Cập nhật chiều cao viewport khi component mount và khi resize
  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight)
    }

    // Cập nhật ngay khi component mount
    updateViewportHeight()

    // Thêm event listener cho resize
    window.addEventListener("resize", updateViewportHeight)

    // Thêm event listener cho thay đổi hướng màn hình (portrait/landscape)
    window.addEventListener("orientationchange", updateViewportHeight)

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateViewportHeight)
      window.removeEventListener("orientationchange", updateViewportHeight)
    }
  }, [])

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
        className="p-0 overflow-hidden bg-white"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxHeight: viewportHeight ? `${viewportHeight - 24}px` : "90vh",
          width: "min(95%, 380px)",
          borderRadius: "0.5rem",
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
        <div
          className="overflow-y-auto"
          style={{
            maxHeight: viewportHeight ? `${viewportHeight - 80}px` : "calc(90vh - 60px)",
            WebkitOverflowScrolling: "touch", // Cuộn mượt trên iOS
          }}
        >
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
