"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileType, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { addTransaction } from "@/lib/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import IOSDatePicker from "./ios-date-picker"
import { amountToWords, generateAmountSuggestions, formatCurrency } from "@/lib/number-to-words"
import { Button } from "@/components/ui/button"

// Định nghĩa các loại file được phép
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Cập nhật interface TransactionFormProps
interface TransactionFormProps {
  onSuccess?: () => void
  onAddTransaction?: (transaction: any) => void
  currentDate?: Date
  initialType?: "expense" | "income"
  onSubmit?: (formData: FormData) => Promise<void>
  isSubmitting?: boolean
  onCancel?: () => void
}

// Hàm xác thực file trước khi tải lên
function validateFileBeforeUpload(file: File): { valid: boolean; error?: string } {
  console.log("Validating file:", file.name, file.type, file.size)

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Định dạng file không được hỗ trợ. Vui lòng sử dụng JPEG, PNG hoặc PDF.",
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File quá lớn. Vui lòng tải file nhỏ hơn 5MB.",
    }
  }

  return { valid: true }
}

// Cập nhật TransactionForm để nhận currentDate
export function TransactionFormFixed({
  onSuccess,
  onAddTransaction,
  currentDate = new Date(),
  initialType = "expense",
  onSubmit,
  isSubmitting: externalIsSubmitting,
  onCancel,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"expense" | "income">(initialType)
  const [fuelLiters, setFuelLiters] = useState<string>("")
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    description: "",
    amount: "",
    paymentMethod: "transfer",
    date: format(currentDate, "dd/MM/yyyy"),
    type: initialType,
    fuelLiters: "",
  })
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate)
  const [amountInWords, setAmountInWords] = useState<string>("")
  const [amountSuggestions, setAmountSuggestions] = useState<number[]>([])
  const [displayAmount, setDisplayAmount] = useState<string>("")

  // Thêm state cho file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState("")
  const [receiptLink, setReceiptLink] = useState<string | null>(null)
  const [receiptDirectLink, setReceiptDirectLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showCarSubcategories, setShowCarSubcategories] = useState(false)

  const { toast } = useToast()

  // Cập nhật handleChange để cập nhật type dựa trên tab
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      // Nếu đang thay đổi category và category là "Chi phí xe ô tô"
      if (field === "category" && value === "Chi phí xe ô tô") {
        setShowCarSubcategories(true)
        return { ...prev, [field]: value, subCategory: "Xăng" }
      }
      // Nếu đang thay đổi category và category không phải là "Chi phí xe ô tô"
      else if (field === "category" && value !== "Chi phí xe ô tô") {
        setShowCarSubcategories(false)
        return { ...prev, [field]: value, subCategory: "" }
      }

      // Nếu đang thay đổi amount, cập nhật số tiền bằng chữ
      if (field === "amount") {
        // Chỉ chấp nhận số nguyên không có dấu chấm, dấu phẩy
        const cleanValue = value.replace(/[^\d]/g, "")

        if (cleanValue) {
          const numValue = Number(cleanValue)
          setAmountInWords(amountToWords(numValue))
          setAmountSuggestions(generateAmountSuggestions(cleanValue))
          setDisplayAmount(formatCurrency(numValue))
          return { ...prev, [field]: cleanValue }
        } else {
          setAmountInWords("")
          setAmountSuggestions([])
          setDisplayAmount("")
          return { ...prev, [field]: "" }
        }
      }

      return { ...prev, [field]: value }
    })
  }

  // Xử lý khi chọn một mẫu tiền
  const handleSelectAmountSuggestion = (amount: number) => {
    setFormData((prev) => ({
      ...prev,
      amount: amount.toString(),
    }))
    setAmountInWords(amountToWords(amount))
    setDisplayAmount(formatCurrency(amount))
    setAmountSuggestions([])
  }

  // Thêm hàm xử lý khi chọn tab
  const handleTabChange = (value: "expense" | "income") => {
    setActiveTab(value)
    setFormData((prev) => ({
      ...prev,
      type: value,
      // Reset category when switching tabs
      category: "",
      subCategory: "",
    }))
    setShowCarSubcategories(false)
  }

  // Thêm hàm xử lý file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationErrors([])

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      console.log("File selected:", file.name, file.type, file.size)

      // Xác thực file trước khi chấp nhận
      const validation = validateFileBeforeUpload(file)
      if (!validation.valid) {
        setValidationErrors([validation.error || "Lỗi không xác định"])
        toast({
          title: "Lỗi",
          description: validation.error,
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      setUploadStatus(`Đã chọn file: ${file.name}`)
      setError(null)
    }
  }

  // Xử lý khi ngày thay đổi
  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    setFormData((prev) => ({
      ...prev,
      date: format(date, "dd/MM/yyyy"),
    }))
  }

  // Tải file lên Google Drive sử dụng API mới
  const uploadFile = async (file: File) => {
    setUploadProgress(0)
    setUploadStatus("Đang chuẩn bị...")
    setError(null)

    try {
      console.log("Preparing to upload file:", file.name, file.type, file.size)

      // Kiểm tra lại file trước khi tải lên
      const validation = validateFileBeforeUpload(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Bước 1: Lấy thông tin file ID từ server
      setUploadStatus("Đang khởi tạo...")
      const generateUrlResponse = await fetch("/api/generate-upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      })

      if (!generateUrlResponse.ok) {
        const errorData = await generateUrlResponse.json()
        throw new Error(errorData.error || `Lỗi server: ${generateUrlResponse.status}`)
      }

      const { fileId, uploadUrl } = await generateUrlResponse.json()

      if (!fileId || !uploadUrl) {
        throw new Error("Không thể tạo thông tin tải lên")
      }

      console.log("Got file ID:", fileId)
      console.log("Got upload URL:", uploadUrl)

      // Bước 2: Tải file lên trực tiếp
      setUploadStatus("Đang tải lên...")
      setUploadProgress(10)

      // Sử dụng XMLHttpRequest để theo dõi tiến trình tải lên
      const xhr = new XMLHttpRequest()

      // Thiết lập sự kiện theo dõi tiến trình
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 90) + 10
          setUploadProgress(percentComplete)

          if (percentComplete < 30) {
            setUploadStatus("Đang tải lên...")
          } else if (percentComplete < 70) {
            setUploadStatus("Đang xử lý...")
          } else {
            setUploadStatus("Gần hoàn thành...")
          }
        }
      })

      // Thiết lập sự kiện hoàn thành
      return new Promise<any>((resolve, reject) => {
        xhr.addEventListener("load", async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              setUploadProgress(100)
              setUploadStatus("Đã tải lên thành công")
              setReceiptLink(response.webViewLink)
              setReceiptDirectLink(response.directViewLink)

              resolve(response)
            } catch (error) {
              // Nếu không thể parse JSON, có thể là lỗi
              reject(new Error("Lỗi khi xử lý phản hồi từ server"))
            }
          } else {
            reject(new Error(`Lỗi tải lên: ${xhr.status} ${xhr.statusText}`))
          }
        })

        xhr.addEventListener("error", () => {
          reject(new Error("Lỗi kết nối khi tải lên file"))
        })

        xhr.addEventListener("abort", () => {
          reject(new Error("Quá trình tải lên đã bị hủy"))
        })

        // Gửi file
        xhr.open("PUT", uploadUrl, true)
        xhr.setRequestHeader("Content-Type", file.type)
        xhr.send(file)
      })
    } catch (error) {
      console.error("Lỗi khi tải file:", error)
      setUploadStatus(`Lỗi: ${error.message}`)
      setError(`Lỗi khi tải file: ${error.message}`)
      setUploadProgress(0)
      throw error
    }
  }

  // Xác thực form trước khi submit
  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!formData.category) {
      errors.push("Vui lòng chọn danh mục")
    }

    if (!formData.description) {
      errors.push("Vui lòng nhập mô tả")
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      errors.push("Vui lòng nhập số tiền hợp lệ")
    }

    return { valid: errors.length === 0, errors }
  }

  // Cập nhật handleSubmit để lưu giao dịch và gọi onAddTransaction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Xác thực form
    const { valid, errors } = validateForm()
    if (!valid) {
      setValidationErrors(errors)
      return
    }

    setIsSubmitting(true)
    setError(null)
    setValidationErrors([])

    try {
      console.log("Submitting transaction form")

      // Tải file lên nếu có
      let uploadedReceipt = {
        webViewLink: null,
        directViewLink: null,
        thumbnailLink: null,
        proxyLink: null,
        fileId: null,
      }

      if (selectedFile) {
        try {
          console.log("Uploading receipt file")
          uploadedReceipt = await uploadFile(selectedFile)
          console.log("Receipt uploaded successfully", uploadedReceipt)
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError)
          // Continue with transaction without receipt
        }
      }

      // Tạo FormData để gửi đến server action
      console.log("Creating form data for server action")
      const serverFormData = new FormData()
      serverFormData.append("date", formData.date)
      serverFormData.append("category", formData.category)
      serverFormData.append("description", formData.description)
      serverFormData.append("amount", formData.amount)
      serverFormData.append("type", formData.type)
      serverFormData.append("paymentMethod", formData.paymentMethod)

      if (formData.subCategory) {
        serverFormData.append("subCategory", formData.subCategory)
      }

      // Thêm số lít xăng nếu có
      if (formData.subCategory === "Xăng" && formData.fuelLiters) {
        serverFormData.append("fuelLiters", formData.fuelLiters)
      }

      // Thêm tất cả các loại link ảnh
      if (uploadedReceipt.fileId) {
        serverFormData.append("fileId", uploadedReceipt.fileId)
      }
      if (uploadedReceipt.webViewLink) {
        serverFormData.append("webViewLink", uploadedReceipt.webViewLink)
      }
      if (uploadedReceipt.directViewLink) {
        serverFormData.append("directViewLink", uploadedReceipt.directViewLink)
      }
      if (uploadedReceipt.thumbnailLink) {
        serverFormData.append("thumbnailLink", uploadedReceipt.thumbnailLink)
      }
      if (uploadedReceipt.proxyLink) {
        serverFormData.append("proxyLink", uploadedReceipt.proxyLink)
      }

      console.log("Submitting transaction to server action")

      // Use the provided onSubmit function if available, otherwise use the default addTransaction
      if (onSubmit) {
        await onSubmit(serverFormData)
      } else {
        // Gọi server action để lưu vào Google Sheets
        const result = await addTransaction(serverFormData)

        if (result.success) {
          console.log("Transaction added successfully:", result)

          // Gọi callback để thêm giao dịch vào state
          if (onAddTransaction) {
            onAddTransaction(result.transaction)
          }

          // Hiển thị thông báo thành công
          toast({
            title: "Thành công",
            description: "Đã lưu giao dịch thành công",
          })

          // Gọi callback thành công
          if (onSuccess) {
            onSuccess()
          }
        } else {
          throw new Error(result.error || "Lỗi khi lưu giao dịch")
        }
      }

      // Reset form
      setFormData({
        category: "",
        subCategory: "",
        description: "",
        amount: "",
        paymentMethod: "transfer",
        date: format(currentDate, "dd/MM/yyyy"),
        type: activeTab,
        fuelLiters: "",
      })
      setSelectedFile(null)
      setUploadProgress(0)
      setUploadStatus("")
      setReceiptLink(null)
      setReceiptDirectLink(null)
      setAmountInWords("")
      setAmountSuggestions([])
      setDisplayAmount("")
    } catch (error) {
      console.error("Lỗi khi lưu giao dịch:", error)
      setError(`Lỗi khi lưu giao dịch: ${error.message}`)

      toast({
        title: "Lỗi",
        description: error.message || "Lỗi khi lưu giao dịch",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Danh sách danh mục chi tiêu
  const expenseCategories = ["Chi phí xe ô tô", "Nhà hàng", "Giao nhận đồ", "Mua đồ/dịch vụ", "Chi phí khác"]

  // Danh sách danh mục thu nhập - Cập nhật theo yêu cầu
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

  // Danh sách phương thức thanh toán - Cập nhật theo yêu cầu
  const paymentMethods = [
    { id: "transfer", name: "Chuyển khoản" },
    { id: "cash", name: "Tiền mặt" },
  ]

  // Use external isSubmitting if provided
  const submitting = externalIsSubmitting !== undefined ? externalIsSubmitting : isSubmitting

  // Cập nhật phần cuối của component để tối ưu hóa cho thiết bị di động
  return (
    <div className="p-2 pb-4 dialog-scrollable">
      <Tabs defaultValue={activeTab} onValueChange={(value) => handleTabChange(value as "expense" | "income")}>
        <TabsList className="w-full grid grid-cols-2 mb-3">
          <TabsTrigger
            value="expense"
            className="py-1.5 text-xs bg-gray-100 data-[state=active]:bg-techcom-red data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-700 rounded-l-lg min-h-[44px]"
          >
            Chi
          </TabsTrigger>
          <TabsTrigger
            value="income"
            className="py-1.5 text-xs bg-gray-100 data-[state=active]:bg-techcom-red data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-700 rounded-r-lg min-h-[44px]"
          >
            Thu
          </TabsTrigger>
        </TabsList>

        {error && (
          <Alert variant="destructive" className="mb-3 py-1.5">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-3 py-1.5">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription>
              <ul className="list-disc pl-4 space-y-0.5 text-xs">
                {validationErrors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form id="transaction-form" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <TabsContent value="expense" className="mt-0 pt-0">
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center">
                  Danh mục <span className="text-red-500 ml-1">*</span>
                </label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)} required>
                  <SelectTrigger className="rounded-lg h-9 bg-white text-xs">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category} className="cursor-pointer text-xs">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hiển thị danh mục con cho chi phí xe ô tô */}
              {showCarSubcategories && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium flex items-center">
                    Loại chi phí xe <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Select
                    value={formData.subCategory || carSubCategories[0].id}
                    onValueChange={(value) => handleChange("subCategory", value)}
                    required
                  >
                    <SelectTrigger className="rounded-lg h-9 bg-white text-xs">
                      <SelectValue placeholder="Chọn loại chi phí xe" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {carSubCategories.map((subCategory) => (
                        <SelectItem key={subCategory.id} value={subCategory.name} className="cursor-pointer text-xs">
                          {subCategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Thêm trường nhập số lít xăng khi chọn Xăng */}
                  {formData.subCategory === "Xăng" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium flex items-center">Số lít xăng</label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.fuelLiters}
                          onChange={(e) => handleChange("fuelLiters", e.target.value)}
                          className="pr-12 rounded-lg h-9 text-xs"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 text-xs">
                          Lít
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="income" className="mt-0 pt-0">
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center">
                  Danh mục <span className="text-red-500 ml-1">*</span>
                </label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)} required>
                  <SelectTrigger className="rounded-lg h-9 bg-white text-xs">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {incomeCategories.map((category) => (
                      <SelectItem key={category} value={category} className="cursor-pointer text-xs">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center">
                Mô tả <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                placeholder="Nhập mô tả"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
                className="rounded-lg h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center">
                Số tiền <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  required
                  className="pr-12 rounded-lg h-9 text-xs"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 text-xs">
                  VND
                </div>
              </div>

              {/* Hiển thị số tiền đã định dạng */}
              {displayAmount && <div className="text-xs text-gray-600 mt-1">{displayAmount} ₫</div>}

              {/* Hiển thị số tiền bằng chữ */}
              {amountInWords && <div className="text-xs text-gray-600 italic mt-1">{amountInWords}</div>}

              {/* Hiển thị các mẫu tiền gợi ý */}
              {amountSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 mb-2 max-h-[60px] overflow-y-auto">
                  {amountSuggestions.map((amount, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectAmountSuggestion(amount)}
                      className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-xs flex-shrink-0"
                    >
                      {formatCurrency(amount)} ₫
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center">
                Phương thức thanh toán <span className="text-red-500 ml-1">*</span>
              </label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => handleChange("paymentMethod", value)}
                required
              >
                <SelectTrigger className="rounded-lg h-9 bg-white text-xs">
                  <SelectValue placeholder="Chọn phương thức" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id} className="cursor-pointer text-xs">
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center">
                Ngày <span className="text-red-500 ml-1">*</span>
              </label>
              <IOSDatePicker onDateSelect={handleDateChange} initialDate={selectedDate} onClose={() => {}} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Hình ảnh (hóa đơn, biên lai...)</label>
              <div className="border border-dashed border-gray-300 rounded-lg p-2 flex flex-col items-center justify-center">
                <input
                  type="file"
                  id="receipt"
                  className="hidden"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileChange}
                />
                <label htmlFor="receipt" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-4 w-4 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500 text-center">Bấm để tải lên hoặc kéo thả file</p>
                  <p className="text-xs text-gray-400 mt-0.5">Hỗ trợ: JPEG, PNG, PDF (tối đa 5MB)</p>
                </label>
              </div>
              {selectedFile && (
                <div className="mt-1">
                  <div className="flex items-center gap-1">
                    <FileType className="h-3 w-3 text-gray-500" />
                    <p className="text-xs text-gray-600 font-medium truncate">{selectedFile.name}</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{uploadStatus}</p>
                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div className="bg-techcom-red h-1 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 sticky bottom-0 bg-white pb-1 mt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
                className="flex-1 h-12 text-sm font-medium border-gray-300"
              >
                Huỷ
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-techcom-red hover:bg-techcom-darkred text-white h-12 text-sm font-medium"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
