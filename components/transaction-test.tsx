"use client"
import { TransactionList } from "./transaction-list"
import { useTransactions } from "@/lib/hooks"

export function TransactionTest() {
  // Use current month and year instead of date context
  const today = new Date()
  const month = today.getMonth() + 1
  const year = today.getFullYear()

  const { transactions, isLoading, error } = useTransactions(month, year)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transaction Test</h1>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-2">
          Transaction List ({month}/{year})
        </h2>
        {isLoading ? (
          <p>Loading transactions...</p>
        ) : error ? (
          <p className="text-red-500">Error loading transactions: {error.message}</p>
        ) : (
          <TransactionList transactions={transactions || []} isLoading={isLoading} />
        )}
      </div>
    </div>
  )
}
