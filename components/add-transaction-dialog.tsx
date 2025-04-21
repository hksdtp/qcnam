"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { TransactionFormFixed } from "@/components/transaction-form-fixed"
import { Button } from "@/components/ui/button"

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTransaction?: (transaction: any) => void
  initialType?: "expense" | "income"
}

export function AddTransactionDialog({ open, onOpenChange, onAddTransaction, initialType }: AddTransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 rounded-lg overflow-hidden">
        <DialogHeader className="p-4 border-b flex justify-between items-center">
          <DialogTitle className="text-xl">Thêm Giao Dịch Mới</DialogTitle>
        </DialogHeader>
        <TransactionFormFixed
          onSuccess={() => onOpenChange(false)}
          onAddTransaction={onAddTransaction}
          initialType={initialType}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
