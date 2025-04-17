export interface Transaction {
  id: string
  date: string
  category: string
  description: string
  amount: number
  type: "income" | "expense"
  receiptLink: string | null
  timestamp: string
  subCategory?: string | null
  quantity?: string | number | null
  paymentMethod?: string
  note?: string | null
  fuelLiters?: string
}
