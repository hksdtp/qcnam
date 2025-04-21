"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { addTransaction } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import { IOSDatePicker } from "@/components/ios-date-picker"
import type { Transaction } from "@/lib/types"

interface TransactionFormFixedProps {
  onSuccess?: () => void
  onAddTransaction?: (transaction: any) => void
  currentDate?: Date
  initialType?: "expense" | "income"
  onSubmit?: (formData: FormData) => Promise<void>
  isSubmitting?: boolean
  initialData?: Transaction & { rowIndex?: number }
  isEditing?: boolean
}

export function TransactionFormFixed({
  onSuccess,
  onAddTransaction,
  currentDate = new Date(),
  initialType = "expense",
  onSubmit,
  isSubmitting = false,
  initialData,
  isEditing = false,
}: TransactionFormFixedProps) {
  const [type, setType] = useState<"expense" | "income">(initialType)
  const [category, setCategory] = useState("")
  const [subCategory, setSubCategory] = useState("")
  const [showSubCategory, setShowSubCategory] = useState(false)
  const [showFuelLiters, setShowFuelLiters] = useState(false)
  const [date, setDate] = useState(currentDate)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [fuelLiters, setFuelLiters] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("transfer")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Điền dữ liệu ban đầu nếu đang ở chế độ chỉnh sửa
  useEffect(() => {
    if (initialData && isEditing) {
      setType(initialData.type as "expense" | "income")
      setCategory(initialData.category || "")
      setSubCategory(initialData.subCategory || "")
      setShowSubCategory(initialData.category === "Chi phí xe ô tô")
      setShowFuelLiters(initialData.subCategory === "Xăng")
      setDescription(initialData.description || "")
      setAmount(initialData.amount ? initialData.amount.toString() : "")
      setFuelLiters(initialData.fuelLiters || "")
      setPaymentMethod((initialData.paymentMethod as "cash" | "transfer") || "transfer")

      // Chuyển đổi chuỗi ngày thành đối tượng Date
      if (initialData.date) {
        const parts = initialData.date.split("/")
        if (parts.length === 3) {
          const day = Number.parseInt(parts[0])
          const month = Number.parseInt(parts[1]) - 1 // Tháng trong JavaScript bắt đầu từ 0
          const year = Number.parseInt(parts[2])
          setDate(new Date(year, month, day))
        }
      }
    }
  }, [initialData, isEditing])

  // Danh sách danh mục chi tiêu
  const expenseCategories = ["Chi phí xe ô tô", "Nhà hàng", "Giao nhận đồ", "Mua đồ/ dịch vụ", "Chi phí khác"]

  // Danh sách danh mục thu nhập
  const incomeCategories = ["Ứng tài khoản", "Ứng tiền mặt", "Hoàn tiền"]

  // Danh sách danh mục con cho chi phí xe ô tô
  const carSubCategories = ["Xăng", "Vé đỗ xe ô tô", "VETC", "Rửa xe", "Bảo dưỡng", "Sửa chữa", "Đăng kiểm / Bảo hiểm"]

  // Xử lý khi thay đổi danh mục
  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setShowSubCategory(value === "Chi phí xe ô tô")
    if (value !== "Chi phí xe ô tô") {
      setSubCategory("")
      setShowFuelLiters(false)
      setFuelLiters("")
    }
  }

  // Xử lý khi thay đổi danh mục con
  const handleSubCategoryChange = (value: string) => {
    setSubCategory(value)
    setShowFuelLiters(value === "Xăng")
    if (value !== "Xăng") {
      setFuelLiters("")
    }
  }

  // Định dạng số tiền khi nhập
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ cho phép nhập số
    const value = e.target.value.replace(/[^\d]/g, "")
    setAmount(value)
  }

  // Định dạng số tiền để hiển thị
  const formatAmount = (value: string) => {
    if (!value) return ""
    return new Intl.NumberFormat("vi-VN").format(Number(value))
  }

  // Xử lý khi submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Kiểm tra dữ liệu đầu vào
      if (!date || !category || !description || !amount) {
        toast({
          title: "Thiếu thông tin",
          description: "Vui lòng điền đầy đủ thông tin bắt buộc",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Tạo FormData
      const formData = new FormData()
      formData.append("date", formatDate(date))
      formData.append("category", category)
      formData.append("description", description)
      formData.append("amount", amount)
      formData.append("type", type)

      if (subCategory) {
        formData.append("subCategory", subCategory)
      }

      if (fuelLiters) {
        formData.append("fuelLiters", fuelLiters)
      }

      formData.append("paymentMethod", paymentMethod)

      // Nếu có hàm onSubmit tùy chỉnh (ví dụ: cho chỉnh sửa), sử dụng nó
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // Mặc định: thêm giao dịch mới
        const result = await addTransaction(formData)

        if (result.success) {
          toast({
            title: "Thêm giao dịch thành công",
            description: "Giao dịch đã được thêm vào hệ thống",
          })

          // Reset form
          setDescription("")
          setAmount("")
          setFuelLiters("")

          // Gọi callback nếu có
          if (onSuccess) {
            onSuccess()
          }

          // Gọi callback onAddTransaction nếu có
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
      }
    } catch (error) {
      console.error("Error submitting transaction:", error)
      toast({
        title: "Lỗi khi xử lý giao dịch",
        description: error.message || "Đã xảy ra lỗi không xác định",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="transaction-type">Loại giao dịch</Label>
        <RadioGroup
          id="transaction-type"
          value={type}
          onValueChange={(value) => setType(value as "expense" | "income")}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="expense" id="expense" />
            <Label htmlFor="expense" className="cursor-pointer">
              Chi tiêu
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="income" id="income" />
            <Label htmlFor="income" className="cursor-pointer">
              Nhập tiền
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Ngày</Label>
        <IOSDatePicker date={date} setDate={setDate} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Danh mục</Label>
        <div className="grid grid-cols-2 gap-2">
          {(type === "expense" ? expenseCategories : incomeCategories).map((cat) => (
            <Button
              key={cat}
              type="button"
              variant={category === cat ? "default" : "outline"}
              className={`justify-start text-left ${category === cat ? "bg-techcom-red hover:bg-techcom-darkred" : ""}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {showSubCategory && (
        <div className="space-y-2">
          <Label htmlFor="sub-category">Danh mục con</Label>
          <div className="grid grid-cols-2 gap-2">
            {carSubCategories.map((subCat) => (
              <Button
                key={subCat}
                type="button"
                variant={subCategory === subCat ? "default" : "outline"}
                className={`justify-start text-left ${subCategory === subCat ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                onClick={() => handleSubCategoryChange(subCat)}
              >
                {subCat}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Input
          id="description"
          placeholder="Nhập mô tả giao dịch"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Số tiền (VND)</Label>
        <Input
          id="amount"
          placeholder="Nhập số tiền"
          value={formatAmount(amount)}
          onChange={handleAmountChange}
          required
          inputMode="numeric"
        />
      </div>

      {showFuelLiters && (
        <div className="space-y-2">
          <Label htmlFor="fuel-liters">Số lít xăng</Label>
          <Input
            id="fuel-liters"
            placeholder="Nhập số lít xăng"
            value={fuelLiters}
            onChange={(e) => setFuelLiters(e.target.value.replace(/[^\d.]/g, ""))}
            inputMode="decimal"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="payment-method">Phương thức thanh toán</Label>
        <RadioGroup
          id="payment-method"
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as "cash" | "transfer")}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="transfer" id="transfer" />
            <Label htmlFor="transfer" className="cursor-pointer">
              Chuyển khoản
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cash" id="cash" />
            <Label htmlFor="cash" className="cursor-pointer">
              Tiền mặt
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onSuccess) onSuccess()
          }}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading || isSubmitting} className="bg-techcom-red hover:bg-techcom-darkred">
          {isLoading || isSubmitting ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Thêm giao dịch"}
        </Button>
      </div>
    </form>
  )
}
