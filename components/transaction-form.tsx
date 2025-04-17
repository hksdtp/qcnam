"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"
import { Upload } from "lucide-react"

// Cập nhật interface TransactionFormProps
interface TransactionFormProps {
  onSuccess?: () => void
  onAddTransaction?: (transaction: any) => void
  currentDate?: Date
}

// Cập nhật TransactionForm để nhận currentDate
export function TransactionForm({ onSuccess, onAddTransaction, currentDate = new Date() }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("expense")
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    description: "",
    amount: "",
    paymentMethod: "transfer",
    date: `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()}`,
    type: "expense",
    receiptUrl: "",
  })

  // Thêm state cho file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState("")

  // Cập nhật handleChange để cập nhật type dựa trên tab
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Thêm hàm xử lý khi chọn tab
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setFormData((prev) => ({ ...prev, type: value }))
  }

  // Thêm hàm xử lý file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setUploadStatus(`Đã chọn file: ${file.name}`)
    }
  }

  // Giả lập upload file
  const uploadFile = async (file: File) => {
    setUploadProgress(0)
    setUploadStatus("Đang tải lên...")

    // Giả lập tiến trình upload
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Giả lập URL ảnh đã upload
    const fakeReceiptUrl = "https://example.com/receipts/" + Date.now() + ".jpg"
    setUploadStatus("Đã tải lên thành công")
    return fakeReceiptUrl
  }

  // Cập nhật handleSubmit để lưu giao dịch và gọi onAddTransaction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let receiptUrl = ""

      // Upload file nếu có
      if (selectedFile) {
        receiptUrl = await uploadFile(selectedFile)
      }

      // Tạo đối tượng giao dịch
      const transaction = {
        ...formData,
        receiptUrl,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      }

      // Giả lập lưu lên Google Sheets
      console.log("Lưu giao dịch lên Google Sheets:", transaction)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Gọi callback để thêm giao dịch vào state
      if (onAddTransaction) {
        onAddTransaction(transaction)
      }

      // Reset form
      setFormData({
        category: "",
        subCategory: "",
        description: "",
        amount: "",
        paymentMethod: "transfer",
        date: `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()}`,
        type: activeTab,
        receiptUrl: "",
      })
      setSelectedFile(null)
      setUploadProgress(0)
      setUploadStatus("")

      // Gọi callback thành công
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Lỗi khi lưu giao dịch:", error)
      setUploadStatus("Lỗi khi lưu giao dịch")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Danh sách danh mục chi tiêu
  const expenseCategories = ["Chi phí xe ô tô", "Nhà hàng", "Giao nhận đồ", "Mua đồ/dịch vụ", "Chi phí khác"]

  // Danh sách danh mục thu nhập - Cập nhật theo yêu cầu
  const incomeCategories = ["Ứng tài khoản", "Ứng tiền mặt", "Hoàn tiền"]

  // Danh sách phương thức thanh toán - Cập nhật theo yêu cầu
  const paymentMethods = [
    { id: "transfer", name: "Chuyển khoản" },
    { id: "cash", name: "Tiền mặt" },
  ]

  return (
    <div className="p-4">
      <Tabs defaultValue="expense" onValueChange={handleTabChange}>
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger
            value="expense"
            className="py-3 bg-gray-100 data-[state=active]:bg-techcom-red data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-700 rounded-l-lg"
          >
            Chi
          </TabsTrigger>
          <TabsTrigger
            value="income"
            className="py-3 bg-gray-100 data-[state=active]:bg-techcom-red data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-700 rounded-r-lg"
          >
            Thu
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                Danh mục <span className="text-red-500 ml-1">*</span>
              </label>
              <TabsContent value="expense">
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)} required>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>

              <TabsContent value="income">
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)} required>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                Mô tả <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                placeholder="Nhập mô tả"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                Số tiền <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  required
                  className="pr-16 rounded-lg"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                  VND
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                Phương thức thanh toán <span className="text-red-500 ml-1">*</span>
              </label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => handleChange("paymentMethod", value)}
                required
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Chọn phương thức" />
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

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                Ngày <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  required
                  className="pl-10 rounded-lg"
                  readOnly
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hình ảnh (hóa đơn, biên lai...)</label>
              <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                <input type="file" id="receipt" className="hidden" accept="image/*" onChange={handleFileChange} />
                <label htmlFor="receipt" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-6 w-6 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">Bấm để tải lên hoặc kéo thả file</p>
                </label>
              </div>
              {selectedFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{uploadStatus}</p>
                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-techcom-red h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onSuccess} className="w-full rounded-lg">
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-techcom-red hover:bg-techcom-darkred text-white rounded-lg"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
