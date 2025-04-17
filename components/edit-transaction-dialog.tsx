"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TransactionFormFixed } from "@/components/transaction-form-fixed"

interface EditTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: any // Replace 'any' with a more specific type if available
  onSuccess: () => void
}

export function EditTransactionDialog({ open, onOpenChange, transaction, onSuccess }: EditTransactionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    onSuccess()
    onOpenChange(false)
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
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
