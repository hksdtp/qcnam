"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileType, AlertCircle, Loader2, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { addTransaction } from "@/lib/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import IOSDatePicker from "./ios-date-picker"
import { amountToWords, generateAmountSuggestions, formatCurrency } from "@/lib/number-to-words"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
  existingTransaction?: any
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
  onSubmit,
  isSubmitting,
  initialType = "expense",
  onCancel,
  existingTransaction,
}: TransactionFormProps) {
  const [type, setType] = useState<"expense" | "income">(initialType)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [description, setDescription] = useState<string>(existingTransaction?.description || "")
  const [amount, setAmount] = useState<string>(existingTransaction?.amount ? formatCurrency(existingTransaction.amount) : "")
  const [paymentMethod, setPaymentMethod] = useState<string>(existingTransaction?.paymentMethod || "Chuyển khoản")
  const [date, setDate] = useState<Date>(existingTransaction?.date ? new Date(existingTransaction.date) : new Date())
  const [note, setNote] = useState<string>(existingTransaction?.note || "")
  const [image, setImage] = useState<string>(existingTransaction?.image || "")
  const [subCategories, setSubCategories] = useState<string[]>([])
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(existingTransaction?.subCategory || "")
  const [showAmountSuggestions, setShowAmountSuggestions] = useState(false)
  const [amountSuggestions, setAmountSuggestions] = useState<string[]>([])
  const [fuelLiters, setFuelLiters] = useState<string>(existingTransaction?.fuelLiters ? String(existingTransaction.fuelLiters) : "")
  const [isCarFuelCategory, setIsCarFuelCategory] = useState<boolean>(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const formRef = useRef<HTMLFormElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingTransaction?.image || null)
  
  // Thêm state để kiểm soát hiển thị của category dropdown
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

  // Thêm state để kiểm soát hiển thị của dropdown danh mục con
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false)
  const subCategoryDropdownRef = useRef<HTMLDivElement>(null)

  // Hook để đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (subCategoryDropdownRef.current && !subCategoryDropdownRef.current.contains(event.target as Node)) {
        setShowSubCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { toast } = useToast()
  const formData = useRef(new FormData())

  // Reset form khi chuyển đổi giữa thu và chi
  useEffect(() => {
    if (type !== initialType && !existingTransaction) {
      setSelectedCategory("")
      setSelectedSubCategory("")
      setSubCategories([])
      setDescription("")
      setAmount("")
      setPaymentMethod("")
      setNote("")
      setImage("")
      setFile(null)
      setPreviewUrl(null)
      setFuelLiters("")
      setIsCarFuelCategory(false)
      setErrors({})
    }
  }, [type, initialType, existingTransaction])

  // Khởi tạo giá trị cho form khi có existingTransaction
  useEffect(() => {
    if (existingTransaction) {
      console.log("Initializing form with existing transaction:", existingTransaction);
      
      // Đặt type trước
      setType(existingTransaction.type as "expense" | "income");
      
      // Danh mục và danh mục con cần xử lý cùng nhau để tránh mất đồng bộ
      const category = existingTransaction.category || "";
      const subCategory = existingTransaction.subCategory || "";
      
      // Lưu trữ tạm thởi giá trị để sử dụng sau
      const storedCategory = category;
      const storedSubCategory = subCategory;
      
      // Đặt category trước
      setSelectedCategory(category);
      
      // Cập nhật danh sách danh mục con dựa trên category
      if (category) {
        // Tìm danh sách danh mục dựa trên loại giao dịch
        const categories = existingTransaction.type === "expense" ? ExpenseCategories : IncomeCategories;
        const foundCategory = categories.find(c => c.name === category);
        
        // Nếu tìm thấy, sử dụng danh sách con của nó
        if (foundCategory && foundCategory.subCategories) {
          setSubCategories(foundCategory.subCategories);
          
          // Đảm bảo danh mục con được đặt NGAY SAU KHI danh sách con được cập nhật
          setSelectedSubCategory(subCategory);
        } else {
          // Nếu không tìm thấy danh mục, xóa danh sách con
          setSubCategories([]);
          setSelectedSubCategory("");
        }
        
        // Kiểm tra có phải chi phí xăng xe không
        checkIsCarFuelCategory(category, subCategory);
      }
      
      // Kiểm tra lại sau một khoảng thời gian ngắn để đảm bảo giá trị được đặt đúng
      setTimeout(() => {
        if (selectedCategory !== storedCategory) {
          console.log("Fixing category:", storedCategory);
          setSelectedCategory(storedCategory);
        }
        
        if (selectedSubCategory !== storedSubCategory && storedSubCategory) {
          console.log("Fixing subcategory:", storedSubCategory);
          setSelectedSubCategory(storedSubCategory);
        }
      }, 50);
      
      // Khởi tạo các giá trị khác
      setDescription(existingTransaction.description || "");
      setAmount(existingTransaction.amount ? formatCurrency(existingTransaction.amount) : "");
      
      // Đảm bảo paymentMethod được đặt đúng
      const paymentMethodValue = existingTransaction.paymentMethod || "Chuyển khoản";
      console.log("Setting payment method to:", paymentMethodValue);
      setPaymentMethod(paymentMethodValue);
      
      setDate(existingTransaction.date ? new Date(existingTransaction.date) : new Date());
      setNote(existingTransaction.note || "");
      setImage(existingTransaction.image || "");
      setPreviewUrl(existingTransaction.image || null);
      setFuelLiters(existingTransaction.fuelLiters ? String(existingTransaction.fuelLiters) : "");
    }
  }, [existingTransaction]);

  const updateSubCategories = (category: string) => {
    if (!category) {
      setSubCategories([])
      return
    }

    let subs: string[] = []
    if (type === "expense") {
      const foundCategory = ExpenseCategories.find(c => c.name === category)
      if (foundCategory && foundCategory.subCategories) {
        subs = foundCategory.subCategories
      }
    } else {
      const foundCategory = IncomeCategories.find(c => c.name === category)
      if (foundCategory && foundCategory.subCategories) {
        subs = foundCategory.subCategories
      }
    }

    setSubCategories(subs)
    
    // Nếu loại cũ không còn trong danh sách mới, reset selectedSubCategory
    if (subs.length > 0 && !subs.includes(selectedSubCategory)) {
      setSelectedSubCategory("")
    }
  }

  const checkIsCarFuelCategory = (category: string, subCategory: string) => {
    const isCarFuel = category === "Chi phí xe ô tô" && subCategory === "Xăng"
    setIsCarFuelCategory(isCarFuel)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setSelectedSubCategory("")
    
    updateSubCategories(value)
    checkIsCarFuelCategory(value, "")
  }

  const handleSubCategoryChange = (value: string) => {
    setSelectedSubCategory(value)
    checkIsCarFuelCategory(selectedCategory, value)
  }

  const handleAmountChange = (value: string) => {
    // Cho phép số và dấu chấm
    if (/^[0-9,.]*$/.test(value) || value === "") {
      // Chuẩn hóa giá trị đầu vào
      const normalizedValue = value
        .replace(/\./g, "") // Loại bỏ dấu chấm hiện có
        .replace(/,/g, ".") // Thay thế dấu phẩy bằng dấu chấm
      
      // Định dạng lại giá trị với dấu chấm cho hàng nghìn
      if (normalizedValue === "") {
        setAmount("")
        setShowAmountSuggestions(false)
      } else {
        // Chuyển đổi sang số và định dạng
        const numericValue = parseFloat(normalizedValue)
        if (!isNaN(numericValue)) {
          setAmount(formatCurrency(numericValue))
          
          // Hiển thị gợi ý nếu chỉ nhập một chữ số
          if (normalizedValue.length === 1) {
            suggestAmounts(parseInt(normalizedValue))
          } else {
            setShowAmountSuggestions(false)
          }
        }
      }
    }
  }

  const suggestAmounts = (firstDigit: number) => {
    if (firstDigit >= 1 && firstDigit <= 9) {
      const suggestions = [
        formatCurrency(firstDigit * 10000),
        formatCurrency(firstDigit * 50000),
        formatCurrency(firstDigit * 100000),
        formatCurrency(firstDigit * 1000000)
      ]
      setAmountSuggestions(suggestions)
      setShowAmountSuggestions(true)
    } else {
      setShowAmountSuggestions(false)
    }
  }

  const selectAmountSuggestion = (suggestion: string) => {
    setAmount(suggestion)
    setShowAmountSuggestions(false)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setErrors(prev => ({ ...prev, image: "" }))
      
      // Hiển thị preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const removeImage = () => {
    setFile(null)
    setPreviewUrl(null)
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}
    
    if (!selectedCategory) {
      newErrors.category = "Vui lòng chọn danh mục"
    }
    
    if (subCategories.length > 0 && !selectedSubCategory) {
      newErrors.subCategory = "Vui lòng chọn danh mục con"
    }
    
    if (!description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả"
    }
    
    if (!amount) {
      newErrors.amount = "Vui lòng nhập số tiền"
    }
    
    if (!paymentMethod) {
      newErrors.paymentMethod = "Vui lòng chọn phương thức thanh toán"
    }
    
    if (isCarFuelCategory && !fuelLiters) {
      newErrors.fuelLiters = "Vui lòng nhập số lít xăng"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const droppedFile = event.dataTransfer.files[0]
      setFile(droppedFile)
      
      // Hiển thị preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(droppedFile)
    }
  }

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      const formDataObj = new FormData()
      
      // Lấy giá trị số từ amount đã được định dạng
      const numericAmount = parseFloat(amount.replace(/\./g, ""))
      
      formDataObj.append("type", type)
      formDataObj.append("category", selectedCategory)
      if (selectedSubCategory) formDataObj.append("subCategory", selectedSubCategory)
      formDataObj.append("description", description)
      formDataObj.append("amount", String(numericAmount))
      formDataObj.append("paymentMethod", paymentMethod)
      formDataObj.append("date", date.toISOString())
      if (note) formDataObj.append("note", note)
      
      // Thêm fuelLiters nếu là giao dịch xăng
      if (isCarFuelCategory && fuelLiters) {
        formDataObj.append("fuelLiters", fuelLiters)
      }
      
      // Thêm ID nếu là cập nhật giao dịch
      if (existingTransaction && existingTransaction.id) {
        formDataObj.append("id", existingTransaction.id)
      }
      
      // Thêm hình ảnh nếu có
      if (file) {
        formDataObj.append("image", file)
      } else if (previewUrl && previewUrl.startsWith("http")) {
        formDataObj.append("image", previewUrl)
      }

      if (onSubmit) {
        await onSubmit(formDataObj)
      }
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      // Xử lý lỗi với kiểu an toàn
      const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định";
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
      console.error("Form submit error:", errorMessage)
    }
  }

  const getDateString = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const getFormattedDateForInput = (): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${year}-${month}-${day}`
  }
  
  // Format date for input
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = event.target.value
    // Format: YYYY-MM-DD -> convert to Date
    const dateParts = dateString.split('-')
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0])
      const month = parseInt(dateParts[1]) - 1 // JavaScript months are 0-indexed
      const day = parseInt(dateParts[2])
      
      const newDate = new Date(year, month, day)
      setDate(newDate)
    }
  }
  
  // Format currency with dot separator for thousands
  function formatCurrency(amount: number): string {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // Định nghĩa interface cho danh mục
  interface Category {
    id: string;
    name: string;
    subCategories?: string[];
  }

  // Danh sách danh mục chi tiêu
  const ExpenseCategories: Category[] = [
    { id: "Chi phí xe ô tô", name: "Chi phí xe ô tô", subCategories: ["Xăng", "Vé đỗ xe ô tô", "VETC", "Rửa xe", "Bảo dưỡng", "Sửa chữa", "Bảo hiểm", "Khác"] },
    { id: "Nhà hàng", name: "Nhà hàng" },
    { id: "Giao nhận đồ", name: "Giao nhận đồ" },
    { id: "Mua đồ/ dịch vụ", name: "Mua đồ/ dịch vụ" },
    { id: "Chi phí khác", name: "Chi phí khác" },
  ]

  // Danh mục thu nhập
  const IncomeCategories: Category[] = [
    { id: "Lương", name: "Lương" },
    { id: "Thưởng", name: "Thưởng" },
    { id: "Đầu tư", name: "Đầu tư" },
    { id: "Khác", name: "Khác" },
  ]

  return (
    <div className="w-full">
      <Tabs 
        defaultValue={initialType} 
        value={type} 
        onValueChange={(value) => setType(value as "expense" | "income")}
        className="mb-4"
      >
        <TabsList className="w-full bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg shadow-sm grid grid-cols-2 gap-3">
          <TabsTrigger 
            value="expense" 
            className={`transition-all duration-300 rounded-md ${
              type === 'expense' 
                ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white font-medium shadow-md hover:shadow-red-100 transform scale-100' 
                : 'bg-gradient-to-r from-rose-400 to-red-400 text-white font-medium hover:from-rose-500 hover:to-red-500 hover:shadow-sm'
            }`}
          >
            Tiền ra
          </TabsTrigger>
          <TabsTrigger 
            value="income" 
            className={`transition-all duration-300 rounded-md ${
              type === 'income' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-md hover:shadow-teal-100 transform scale-100' 
                : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white font-medium hover:from-emerald-500 hover:to-teal-500 hover:shadow-sm'
            }`}
          >
            Tiền vào
          </TabsTrigger>
        </TabsList>
        
        <form ref={formRef} onSubmit={handleSubmitForm} className="mt-4 space-y-4">
          {/* Danh mục */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="category" className="font-medium text-sm">
                Danh mục <span className="text-red-500">*</span>
              </Label>
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category}</p>
              )}
            </div>
            
            <div className="relative" ref={categoryDropdownRef}>
              <div 
                className={`flex h-9 items-center justify-between px-3 py-2 text-sm rounded-lg border border-gray-100 bg-white shadow-sm cursor-pointer transition-all duration-200 ${errors.category ? 'border-red-300' : 'hover:border-gray-200 hover:shadow'}`}
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <span className="text-gray-700 font-medium">
                  {selectedCategory || "Chọn danh mục"}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-40">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              
              {/* Custom dropdown panel */}
              {showCategoryDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-[200px] overflow-y-auto">
                  {(type === "expense" ? ExpenseCategories : IncomeCategories).map((category) => (
                    <div
                      key={category.name}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm transition-colors"
                      onClick={() => {
                        handleCategoryChange(category.name);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              )}
              
              <input
                type="hidden"
                name="category"
                value={selectedCategory}
                required
              />
            </div>
          </div>
          
          {/* Danh mục con */}
          {subCategories.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="subCategory" className="font-medium text-sm">
                  Danh mục con <span className="text-red-500">*</span>
                </Label>
                {errors.subCategory && (
                  <p className="text-xs text-red-500">{errors.subCategory}</p>
                )}
              </div>
              
              <div className="relative" ref={subCategoryDropdownRef}>
                <div 
                  className={`flex h-9 items-center justify-between px-3 py-2 text-sm rounded-lg border border-gray-100 bg-white shadow-sm cursor-pointer transition-all duration-200 ${errors.subCategory ? 'border-red-300' : 'hover:border-gray-200 hover:shadow'}`}
                  onClick={() => setShowSubCategoryDropdown(!showSubCategoryDropdown)}
                >
                  <span className="text-gray-700 font-medium">
                    {selectedSubCategory || "Chọn danh mục con"}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-40">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
                
                {/* Custom dropdown panel */}
                {showSubCategoryDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-[200px] overflow-y-auto">
                    {subCategories.map((subCategory) => (
                      <div
                        key={subCategory}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm transition-colors"
                        onClick={() => {
                          handleSubCategoryChange(subCategory);
                          setShowSubCategoryDropdown(false);
                        }}
                      >
                        {subCategory}
                      </div>
                    ))}
                  </div>
                )}
                
                <input
                  type="hidden"
                  name="subCategory"
                  value={selectedSubCategory}
                  required
                />
              </div>
            </div>
          )}
          
          {/* Mô tả */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="description" className="font-medium text-sm">
                Mô tả <span className="text-red-500">*</span>
              </Label>
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </div>
            
            <Input
              id="description"
              placeholder="Nhập mô tả"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-50"
            />
          </div>
          
          {/* Số tiền */}
          <div className="space-y-2 relative">
            <div className="flex justify-between">
              <Label htmlFor="amount" className="font-medium text-sm">
                Số tiền <span className="text-red-500">*</span>
              </Label>
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount}</p>
              )}
            </div>
            
            <div className="flex gap-2 items-center">
              <Input
                id="amount"
                type="text"
                placeholder="0"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="bg-gray-50 pr-14 text-right"
              />
              <span className="absolute right-3 text-gray-500">VND</span>
            </div>
            
            {/* Hiển thị số tiền bằng chữ */}
            {amount && amount.length > 0 && (
              <p className="text-xs text-gray-600 mt-1 italic">
                {amountToWords(parseFloat(amount.replace(/\./g, "").replace(/,/g, ".").replace(/\s+đ/g, "")) || 0)}
              </p>
            )}
            
            {showAmountSuggestions && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {amountSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => selectAmountSuggestion(suggestion)}
                    className="text-xs h-8"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          {/* Phương thức thanh toán */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="paymentMethod" className="font-medium text-sm">
                Phương thức thanh toán <span className="text-red-500">*</span>
              </Label>
              {errors.paymentMethod && (
                <p className="text-xs text-red-500">{errors.paymentMethod}</p>
              )}
            </div>
            
            <div className="relative">
              <div 
                className={`flex h-9 items-center justify-between px-3 py-2 text-sm rounded-lg border border-gray-100 bg-white shadow-sm cursor-pointer transition-all duration-200 ${errors.paymentMethod ? 'border-red-300' : 'hover:border-gray-200 hover:shadow'}`}
                onClick={() => {
                  // Tạo một menu custom đơn giản
                  const currentMethod = paymentMethod === "Tiền mặt" ? "Chuyển khoản" : "Tiền mặt";
                  setPaymentMethod(currentMethod);
                }}
              >
                <div className="flex items-center gap-2">
                  {paymentMethod === "Tiền mặt" ? (
                    <span className="w-4 h-4 flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="12" x="2" y="6" rx="2" />
                        <circle cx="12" cy="12" r="2" />
                        <path d="M6 12h.01M18 12h.01" />
                      </svg>
                    </span>
                  ) : (
                    <span className="w-4 h-4 flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                    </span>
                  )}
                  <span className="text-gray-700 font-medium">{paymentMethod || "Chọn phương thức"}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-40">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              <input
                type="hidden"
                name="paymentMethod"
                value={paymentMethod}
                required
              />
            </div>
          </div>
          
          {/* Số lít xăng - hiển thị khi là chi phí xăng xe */}
          {isCarFuelCategory && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="fuelLiters" className="font-medium text-sm">
                  Số lít xăng <span className="text-red-500">*</span>
                </Label>
                {errors.fuelLiters && (
                  <p className="text-xs text-red-500">{errors.fuelLiters}</p>
                )}
              </div>
              
              <div className="flex gap-2 items-center">
                <Input
                  id="fuelLiters"
                  type="number"
                  placeholder="0"
                  value={fuelLiters}
                  onChange={(e) => setFuelLiters(e.target.value)}
                  className="bg-gray-50 pr-10 text-right"
                  step="0.01"
                />
                <span className="absolute right-3 text-gray-500">L</span>
              </div>
            </div>
          )}
          
          {/* Ngày */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="date" className="font-medium text-sm">
                Ngày <span className="text-red-500">*</span>
              </Label>
            </div>
            
            <IOSDatePicker 
              onDateSelect={(selectedDate: Date) => setDate(selectedDate)}
              initialDate={date}
              onClose={() => {}}
            />
          </div>
          
          {/* Ghi chú */}
          <div className="space-y-2">
            <Label htmlFor="note" className="font-medium text-sm">
              Ghi chú
            </Label>
            
            <Textarea
              id="note"
              placeholder="Nhập ghi chú (không bắt buộc)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-gray-50 min-h-[80px]"
            />
          </div>
          
          {/* Hình ảnh */}
          <div className="space-y-2">
            <Label className="font-medium text-sm">
              Hình ảnh
            </Label>
            
            <div
              className="border-2 border-dashed rounded-md p-4 text-center hover:bg-gray-50 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleImageDrop}
            >
              {previewUrl ? (
                <div className="relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="mx-auto max-h-[200px] object-contain rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 p-1 h-6 w-6"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center mb-2">
                    <Upload className="h-6 w-6 text-gray-400 mb-1" />
                    <p className="text-sm text-gray-500">
                      Kéo thả hoặc nhấp để tải lên
                    </p>
                  </div>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("image")?.click()}
                  >
                    Chọn hình ảnh
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="pt-4 sticky bottom-0 bg-white pb-1 mt-4 flex gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 ios-button-effect"
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 ios-button-effect ${
                type === 'expense' 
                  ? 'bg-gradient-to-r from-rose-500 to-red-500 hover:bg-gradient-to-r hover:from-rose-600 hover:to-red-600 shadow-md' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-600 shadow-md'}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
