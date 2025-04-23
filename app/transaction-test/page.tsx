import { TransactionTest } from "@/components/transaction-test"
import { DateProvider } from "@/lib/date-context"

export default function TransactionTestPage() {
  return (
    <DateProvider>
      <TransactionTest />
    </DateProvider>
  )
}
