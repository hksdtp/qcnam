"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Loader2 } from "lucide-react"

interface TransactionFormProps {
  onSubmit: (formData: FormData) => Promise<void>
  isSubmitting?: boolean
  initialType?: "expense" | "income"
  initialValues?: {
    date?: Date
    category?: string
    description?: string
    amount?: string
    subCategory?: string
    fuelLiters?: string
    paymentMethod?: string
  }
  onCancel?: () => void
}

export function TransactionForm({
  onSubmit,
  isSubmitting = false,
  initialType = "expense",
  initialValues = {},
  onCancel,
}: TransactionFormProps) {
  const [type, setType] = useState<"expense" | "income">(initialType)
  const [date, setDate] = useState<Date>(initialValues.date || new Date())
  const [category, setCategory] = useState<string>(initialValues.category || "")
  const [subCategory, setSubCategory] = useState<string>(initialValues.subCategory || "")
  const [description, setDescription] = useState<string>(initialValues.description || "")
  const [amount, setAmount] = useState<string>(initialValues.amount || "")
  const [formattedAmount, setFormattedAmount] = useState<string>("")
  const [fuelLiters, setFuelLiters] = useState<string>(initialValues.fuelLiters || "")
  const [paymentMethod, setPaymentMethod] = useState<string>(initialValues.paymentMethod || "transfer")
  const [showCarSubcategories, setShowCarSubcategories] = useState(
    initialValues.category === "Chi phí xe ô tô" || false,
  )

  // Format initial amount if provided
  useEffect(() => {
    if (initialValues.amount) {
      const numericAmount = Number(initialValues.amount.replace(/[^\d]/g, ""))
      if (!isNaN(numericAmount)) {
        setFormattedAmount(
          new Intl.NumberFormat("vi-VN", {
            style: "decimal",
            maximumFractionDigits: 0,
          }).format(numericAmount),
        )
      }
    }
  }, [initialValues.amount])

  // Format amount when it changes
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "")
    setAmount(value)

    if (value) {
      const numericValue = Number(value)
      setFormattedAmount(
        new Intl.NumberFormat("vi-VN", {
          style: "decimal",
          maximumFractionDigits: 0,
        }).format(numericValue),
      )
    } else {
      setFormattedAmount("")
    }
  }

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setCategory(value)

    // Show car subcategories if category is "Chi phí xe ô tô"
    if (value === "Chi phí xe ô tô") {
      setShowCarSubcategories(true)
      setSubCategory("Xăng") // Default subcategory
    } else {
      setShowCarSubcategories(false)
      setSubCategory("")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validate form
    if (!category || !description || !amount) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    // Format date as DD/MM/YYYY
    const formattedDate = format(date, "dd/MM/yyyy")

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

    // Submit form
    await onSubmit(formData)
  }

  // Danh sách danh mục chi tiêu
  const expenseCategories = ["Chi phí xe ô tô", "Nhà hàng", "Giao nhận đồ", "Mua đồ/dịch vụ", "Chi phí khác"]

  // Danh sách danh mục thu nhập
  const incomeCategories = ["Ứng tài khoản", "Ứng tiền mặt", "Hoàn tiền"]

  // Danh sách danh mục con cho chi phí xe ô tô
  const carSubCategories = [
    { id: "xang", name: "Xăng" },
    { id: "ve-do-xe", name: "Vé đỗ xe ô tô" },
    { id: "vetc", name: "VETC" },
    { id: "rua-xe", name: "Rửa xe" },
    { id: "bao-duong", name: "Bảo dưỡng" },
    { id: "sua-chua", name: "Sửa chữa" },
    { id: "dang-kiem-bh", name: "Đăng kiểm / Bảo hiểm" },
  ]

  // Danh sách phương thức thanh toán
  const paymentMethods = [
    { id: "transfer", name: "Chuyển khoản" },
    { id: "cash", name: "Tiền mặt" },
  ]

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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">Danh mục</Label>
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              {type === "expense"
                ? expenseCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))
                : incomeCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>

        {showCarSubcategories && (
          <div className="grid gap-2">
            <Label htmlFor="subCategory">Loại chi phí xe</Label>
            <Select value={subCategory} onValueChange={setSubCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại chi phí xe" />
              </SelectTrigger>
              <SelectContent>
                {carSubCategories.map((subCat) => (
                  <SelectItem key={subCat.id} value={subCat.name}>
                    {subCat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {subCategory === "Xăng" && (
          <div className="grid gap-2">
            <Label htmlFor="fuelLiters">Số lít xăng</Label>
            <Input
              id="fuelLiters"
              placeholder="Nhập số lít xăng"
              value={fuelLiters}
              onChange={(e) => setFuelLiters(e.target.value)}
              type="number"
              step="0.01"
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
              {paymentMethods.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Hủy
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Lưu giao dịch"
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
