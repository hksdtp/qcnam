"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategorySelector } from "@/components/category-selector"
import { IOSDatePicker } from "@/components/ios-date-picker"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { addTransaction } from "@/lib/actions"
import { useTransactions, useAccountData, useCarData, useTransactionSummary } from "@/lib/hooks"
import { useDate } from "@/lib/date-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TransactionFormFixedProps {
  onSuccess?: () => void
  onSubmit?: (formData: FormData) => Promise<void>
  isSubmitting?: boolean
  initialType?: "expense" | "income"
  currentDate?: Date
  onCancel?: () => void
  initialValues?: {
    date?: string
    category?: string
    description?: string
    amount?: string
    subCategory?: string
    fuelLiters?: string
    paymentMethod?: string
  }
}

export function TransactionFormFixed({
  onSuccess,
  onSubmit,
  isSubmitting = false,
  initialType = "expense",
  currentDate,
  onCancel,
  initialValues = {},
}: TransactionFormFixedProps) {
  const [type, setType] = useState<"expense" | "income">(initialType)
  const [category, setCategory] = useState<string>(initialValues.category || "")
  const [subCategory, setSubCategory] = useState<string>(initialValues.subCategory || "")
  const [amount, setAmount] = useState<string>(initialValues.amount || "")
  const [formattedAmount, setFormattedAmount] = useState<string>("")
  const [description, setDescription] = useState<string>(initialValues.description || "")
  const [date, setDate] = useState<Date>(currentDate || new Date())
  const [fuelLiters, setFuelLiters] = useState<string>(initialValues.fuelLiters || "")
  const [paymentMethod, setPaymentMethod] = useState<string>(initialValues.paymentMethod || "transfer")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { currentDate: contextDate } = useDate()
  const month = contextDate.getMonth() + 1
  const year = contextDate.getFullYear()

  // Get mutate functions to refresh data after adding a transaction
  const { mutate: mutateTransactions } = useTransactions(month, year)
  const { mutate: mutateAccountData } = useAccountData(month, year)
  const { mutate: mutateCarData } = useCarData(month, year)
  const { mutate: mutateSummary } = useTransactionSummary()

  // Format initial amount if provided
  useEffect(() => {
    if (initialValues.amount) {
      const numericAmount = Number(initialValues.amount.replace(/[^\d]/g, ""))
      if (!isNaN(numericAmount)) {
        setFormattedAmount(formatCurrency(numericAmount))
      }
    }
  }, [initialValues.amount])

  // Format amount when it changes
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "")
    setAmount(value)

    if (value) {
      const numericValue = Number(value)
      setFormattedAmount(formatCurrency(numericValue))
    } else {
      setFormattedAmount("")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate form
    if (!category || !description || !amount) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Format date as DD/MM/YYYY
    const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`

    // Create FormData
    const formData = new FormData()
    formData.append("date", formattedDate)
    formData.append("category", category)
    formData.append("description", description)
    formData.append("amount", amount)
    formData.append("type", type)
    if (subCategory) formData.append("subCategory", subCategory)
    if (fuelLiters) formData.append("fuelLiters", fuelLiters)
    formData.append("paymentMethod", paymentMethod)

    try {
      if (onSubmit) {
        // Use custom submit handler if provided
        await onSubmit(formData)
        if (onSuccess) onSuccess()
      } else {
        // Use default submit handler
        const result = await addTransaction(formData)

        if (result.success) {
          toast({
            title: "Thêm giao dịch thành công",
            description: "Giao dịch đã được thêm vào hệ thống",
          })

          // Reset form
          setCategory("")
          setSubCategory("")
          setAmount("")
          setFormattedAmount("")
          setDescription("")
          setDate(new Date())
          setFuelLiters("")

          // Refresh all data
          mutateTransactions()
          mutateAccountData()
          mutateCarData()
          mutateSummary()

          // Call onSuccess callback if provided
          if (onSuccess) onSuccess()
        } else {
          toast({
            title: "Lỗi khi thêm giao dịch",
            description: result.error || "Đã xảy ra lỗi không xác định",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi khi thêm giao dịch",
        description: error.message || "Đã xảy ra lỗi không xác định",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue={type} onValueChange={(value) => setType(value as "expense" | "income")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expense">Chi tiêu</TabsTrigger>
          <TabsTrigger value="income">Thu nhập</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="date">Ngày</Label>
          <IOSDatePicker date={date} setDate={setDate} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">Danh mục</Label>
          <CategorySelector
            type={type}
            value={category}
            onChange={(value) => {
              setCategory(value)
              // Reset sub-category when category changes
              setSubCategory("")
            }}
          />
        </div>

        {category === "Xăng dầu" && (
          <div className="grid gap-2">
            <Label htmlFor="fuelLiters">Số lít xăng</Label>
            <Input
              id="fuelLiters"
              placeholder="Nhập số lít xăng"
              value={fuelLiters}
              onChange={(e) => setFuelLiters(e.target.value)}
            />
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="description">Mô tả</Label>
          <Input
            id="description"
            placeholder="Nhập mô tả giao dịch"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="amount">Số tiền</Label>
          <Input
            id="amount"
            placeholder="Nhập số tiền"
            value={formattedAmount}
            onChange={handleAmountChange}
            required
            inputMode="numeric"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn phương thức thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transfer">Chuyển khoản</SelectItem>
              <SelectItem value="cash">Tiền mặt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isLoading}>
              Hủy
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? "Đang xử lý..." : "Lưu giao dịch"}
          </Button>
        </div>
      </div>
    </form>
  )
}
