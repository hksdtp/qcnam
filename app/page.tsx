import { Suspense } from "react"
import { AccountSheetIntegrated } from "@/components/account-sheet-integrated" // Thay thế CurrentBalance và MonthSelector
import { TransactionTabsFixed } from "@/components/transaction-tabs-fixed"
import { CarManagement } from "@/components/car-management"
import { Skeleton } from "@/components/ui/skeleton"
import { DateProvider } from "@/lib/date-context"

// Ngăn chặn caching để luôn lấy dữ liệu mới nhất
export const dynamic = "force-dynamic"
export const revalidate = 0

export default function Dashboard() {
  return (
    <DateProvider>
      <div className="flex flex-col gap-4">
        <div className="animate-in stagger-1">
          <AccountSheetIntegrated /> {/* Thay thế cả CurrentBalance và MonthSelector */}
        </div>

        <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-lg" />}>
          <div className="animate-in stagger-3">
            <TransactionTabsFixed />
          </div>
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[200px] w-full rounded-lg" />}>
          <div className="animate-in stagger-4">
            <CarManagement />
          </div>
        </Suspense>
      </div>
    </DateProvider>
  )
}
