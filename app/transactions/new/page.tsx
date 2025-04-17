import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { TransactionFormFixed } from "@/components/transaction-form-fixed"
import { DateProvider } from "@/lib/date-context"

export default function NewTransactionPage() {
  return (
    <DateProvider>
      <div className="container max-w-2xl py-6 md:py-10">
        <div className="mb-6 flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại trang chủ
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Thêm giao dịch mới</h1>
        </div>
        <TransactionFormFixed />
      </div>
    </DateProvider>
  )
}
