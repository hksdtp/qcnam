"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Receipt, Image, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { TransactionForm } from "@/components/transaction-form"
import { X } from "lucide-react"
import { useDate } from "@/lib/date-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function TransactionTabs() {
  const { currentDate } = useDate()
  const [transactions, setTransactions] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState("total")
  const [activeSubCategory, setActiveSubCategory] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)

  // Danh mục chi tiêu
  const expenseCategories = [
    { id: "total", name: "Tổng" },
    { id: "car", name: "Chi phí xe ô tô" },
    { id: "restaurant", name: "Nhà hàng" },
    { id: "delivery", name: "Giao nhận đồ" },
    { id: "services", name: "Mua đồ/ dịch vụ" },
    { id: "other", name: "Chi phí khác" },
  ]

  // Danh mục con cho chi phí xe ô tô
  const carSubCategories = [
    { id: "all", name: "Tất cả chi phí xe" },
    { id: "gas", name: "Xăng" },
    { id: "parking", name: "Vé đỗ xe ô tô" },
    { id: "vetc", name: "VETC" },
    { id: "wash", name: "Rửa xe" },
    { id: "maintenance", name: "Bảo dưỡng" },
    { id: "repair", name: "Sửa chữa" },
    { id: "insurance", name: "Đăng kiểm / Bảo hiểm" },
  ]

  // Danh mục thu nhập
  const incomeCategories = [
    { id: "total", name: "Tổng" },
    { id: "account", name: "Ứng tài khoản" },
    { id: "cash", name: "Ứng tiền mặt" },
    { id: "refund", name: "Hoàn tiền" },
  ]

  // Thêm giao dịch mới
  const addTransaction = (transaction: any) => {
    setTransactions((prev) => [transaction, ...prev])
  }

  // Xem hình ảnh hóa đơn
  const viewReceiptImage = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setImageError(false)
    setImageLoading(true)
    setIsImageDialogOpen(true)
  }

  // Xử lý khi hình ảnh tải lỗi
  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  // Xử lý khi hình ảnh tải thành công
  const handleImageLoad = () => {
    setImageLoading(false)
  }

  // Mở hình ảnh trong tab mới
  const openImageInNewTab = (imageUrl: string) => {
    window.open(imageUrl, "_blank")
  }

  // Trong transaction-tabs.tsx, dữ liệu giao dịch đang được giả lập
  // thay vì lấy từ Google Sheets

  // Lấy dữ liệu giao dịch khi tháng thay đổi
  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      // Giả lập gọi API để lấy dữ liệu giao dịch
      console.log(`Lấy dữ liệu giao dịch cho tháng ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`)

      // Tạo dữ liệu mẫu dựa trên tháng hiện tại
      const mockTransactions = [
        {
          id: "1",
          date: `15/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`,
          category: "Chi phí xe ô tô",
          subCategory: "gas",
          description: `Đổ xăng tháng ${currentDate.getMonth() + 1}`,
          amount: "500000",
          type: "expense",
          paymentMethod: "cash",
          receiptUrl: "/api/image-proxy/1DoYOqddWGSXhUuCgxKmYqONcpgAZ4lUj",
        },
        {
          id: "2",
          date: `10/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`,
          category: "Nhà hàng",
          description: `Ăn trưa tháng ${currentDate.getMonth() + 1}`,
          amount: "150000",
          type: "expense",
          paymentMethod: "transfer",
          receiptUrl: "/api/image-proxy/1DoYOqddWGSXhUuCgxKmYqONcpgAZ4lUj",
        },
        {
          id: "3",
          date: `05/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`,
          category: "Chi phí xe ô tô",
          subCategory: "maintenance",
          description: `Bảo dưỡng xe tháng ${currentDate.getMonth() + 1}`,
          amount: "2000000",
          type: "expense",
          paymentMethod: "transfer",
          receiptUrl: "/api/image-proxy/1DoYOqddWGSXhUuCgxKmYqONcpgAZ4lUj",
        },
        {
          id: "4",
          date: `20/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`,
          category: "Ứng tài khoản",
          description: `Ứng lương tháng ${currentDate.getMonth() + 1}`,
          amount: "3000000",
          type: "income",
          paymentMethod: "transfer",
        },
      ]

      // Cập nhật state với dữ liệu mới
      setTransactions(mockTransactions)
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu giao dịch:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Lắng nghe sự thay đổi của tháng
  useEffect(() => {
    fetchTransactions()
  }, [currentDate])

  // Tính tổng tiền cho danh mục đã chọn
  const calculateCategoryTotal = (category: string, subCategory = "") => {
    let filteredTransactions = transactions.filter((t) => t.type === "expense")

    if (category !== "total") {
      filteredTransactions = filteredTransactions.filter((t) => t.category === category)

      if (category === "Chi phí xe ô tô" && subCategory && subCategory !== "all") {
        filteredTransactions = filteredTransactions.filter((t) => t.subCategory === subCategory)
      }
    }

    const total = filteredTransactions.reduce((sum, t) => sum + Number.parseInt(t.amount), 0)
    return {
      total,
      count: filteredTransactions.length,
    }
  }

  // Thử tải lại hình ảnh với URL khác
  const tryAlternativeImageUrl = () => {
    if (selectedImage.includes("/api/image-proxy/")) {
      const fileId = selectedImage.split("/api/image-proxy/")[1]
      // Thử với URL trực tiếp từ Google Drive
      setSelectedImage(`https://drive.google.com/uc?export=view&id=${fileId}`)
      setImageError(false)
      setImageLoading(true)
    }
  }

  return (
    <Card className="rounded-lg overflow-hidden bg-white shadow-md mt-6">
      <Tabs defaultValue="expense">
        <TabsList className="w-full grid grid-cols-2 p-0 bg-white">
          <TabsTrigger
            value="expense"
            className="py-3 border-b-2 data-[state=active]:border-techcom-red data-[state=active]:text-techcom-red data-[state=inactive]:border-transparent rounded-none"
          >
            Chi Tiêu
          </TabsTrigger>
          <TabsTrigger
            value="income"
            className="py-3 border-b-2 data-[state=active]:border-techcom-red data-[state=active]:text-techcom-red data-[state=inactive]:border-transparent rounded-none"
          >
            Nhập Tiền
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="m-0">
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-3">
              Chi tiêu - Tháng {currentDate.getMonth() + 1} {currentDate.getFullYear()}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {expenseCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  onClick={() => {
                    setActiveCategory(category.id)
                    setActiveSubCategory("all")
                  }}
                  className={
                    activeCategory === category.id
                      ? "bg-techcom-red text-white rounded-lg border-0"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg border-0"
                  }
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {activeCategory === "car" && (
              <div className="flex flex-wrap gap-2 mb-4">
                {carSubCategories.map((subCategory) => (
                  <Button
                    key={subCategory.id}
                    variant="outline"
                    onClick={() => setActiveSubCategory(subCategory.id)}
                    className={
                      activeSubCategory === subCategory.id
                        ? "bg-techcom-red text-white rounded-lg border-0"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg border-0"
                    }
                    size="sm"
                  >
                    {subCategory.name}
                  </Button>
                ))}
              </div>
            )}

            {/* Hiển thị tổng chi tiêu cho danh mục đã chọn */}
            {!isLoading && transactions.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      {activeCategory === "total"
                        ? "Tổng tiền Chi tiêu"
                        : activeCategory === "car" && activeSubCategory !== "all"
                          ? `Tổng tiền ${carSubCategories.find((c) => c.id === activeSubCategory)?.name || ""}`
                          : `Tổng tiền ${expenseCategories.find((c) => c.id === activeCategory)?.name || ""}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {
                        calculateCategoryTotal(
                          activeCategory === "total"
                            ? "total"
                            : expenseCategories.find((c) => c.id === activeCategory)?.name || "",
                          activeSubCategory,
                        ).count
                      }{" "}
                      giao dịch
                    </p>
                  </div>
                  <div className="text-xl font-bold text-techcom-red">
                    {new Intl.NumberFormat("vi-VN").format(
                      calculateCategoryTotal(
                        activeCategory === "total"
                          ? "total"
                          : expenseCategories.find((c) => c.id === activeCategory)?.name || "",
                        activeSubCategory,
                      ).total,
                    )}{" "}
                    đ
                  </div>
                </div>
              </div>
            )}

            <div className="text-center py-4">
              {isLoading ? (
                <div className="w-full space-y-3">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="bg-gray-100 animate-pulse h-16 rounded-lg"></div>
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                <div className="w-full space-y-3">
                  {transactions
                    .filter((t) => t.type === "expense")
                    .filter((t) => {
                      if (activeCategory === "total") return true
                      if (activeCategory === "car" && activeSubCategory !== "all") {
                        return t.category === "Chi phí xe ô tô" && t.subCategory === activeSubCategory
                      }
                      return t.category === expenseCategories.find((c) => c.id === activeCategory)?.name
                    })
                    .map((transaction, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium text-left">{transaction.description}</p>
                          <p className="text-sm text-gray-500 text-left">
                            {transaction.date} • {transaction.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {transaction.receiptUrl && (
                            <button
                              onClick={() => viewReceiptImage(transaction.receiptUrl)}
                              className="text-gray-500 hover:text-techcom-red"
                            >
                              <Image className="h-4 w-4" />
                            </button>
                          )}
                          <div className="text-techcom-red font-medium">
                            {Number.parseInt(transaction.amount).toLocaleString("vi-VN")} đ
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="bg-gray-100 rounded-lg p-4 mb-3">
                    <Receipt className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">
                    Không có dữ liệu giao dịch cho tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center mt-4">
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-techcom-red hover:bg-techcom-darkred text-white rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm giao dịch mới
              </Button>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="income" className="m-0">
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-3">
              Tiền vào - Tháng {currentDate.getMonth() + 1} {currentDate.getFullYear()}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {incomeCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  onClick={() => setActiveCategory(category.id)}
                  className={
                    activeCategory === category.id
                      ? "bg-techcom-red text-white rounded-lg border-0"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg border-0"
                  }
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Hiển thị tổng thu nhập cho danh mục đã chọn */}
            {!isLoading && transactions.some((t) => t.type === "income") && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      {activeCategory === "total"
                        ? "Tổng tiền Nhập tiền"
                        : `Tổng tiền ${incomeCategories.find((c) => c.id === activeCategory)?.name}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {
                        transactions.filter(
                          (t) =>
                            t.type === "income" &&
                            (activeCategory === "total" ||
                              t.category === incomeCategories.find((c) => c.id === activeCategory)?.name),
                        ).length
                      }{" "}
                      giao dịch
                    </p>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {new Intl.NumberFormat("vi-VN").format(
                      transactions
                        .filter(
                          (t) =>
                            t.type === "income" &&
                            (activeCategory === "total" ||
                              t.category === incomeCategories.find((c) => c.id === activeCategory)?.name),
                        )
                        .reduce((sum, t) => sum + Number.parseInt(t.amount), 0),
                    )}{" "}
                    đ
                  </div>
                </div>
              </div>
            )}

            <div className="text-center py-4">
              {isLoading ? (
                <div className="w-full space-y-3">
                  {[1, 2].map((_, index) => (
                    <div key={index} className="bg-gray-100 animate-pulse h-16 rounded-lg"></div>
                  ))}
                </div>
              ) : transactions.some((t) => t.type === "income") ? (
                <div className="w-full space-y-3">
                  {transactions
                    .filter(
                      (t) =>
                        t.type === "income" &&
                        (activeCategory === "total" ||
                          t.category === incomeCategories.find((c) => c.id === activeCategory)?.name),
                    )
                    .map((transaction, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium text-left">{transaction.description}</p>
                          <p className="text-sm text-gray-500 text-left">
                            {transaction.date} • {transaction.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {transaction.receiptUrl && (
                            <button
                              onClick={() => viewReceiptImage(transaction.receiptUrl)}
                              className="text-gray-500 hover:text-green-600"
                            >
                              <Image className="h-4 w-4" />
                            </button>
                          )}
                          <div className="text-green-600 font-medium">
                            {Number.parseInt(transaction.amount).toLocaleString("vi-VN")} đ
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="bg-gray-100 rounded-lg p-4 mb-3">
                    <Receipt className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">
                    Không có dữ liệu giao dịch cho tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center mt-4">
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-techcom-red hover:bg-techcom-darkred text-white rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm giao dịch mới
              </Button>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>

      {/* Dialog thêm giao dịch mới */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 rounded-lg overflow-hidden">
          <DialogHeader className="p-4 border-b flex justify-between items-center">
            <DialogTitle className="text-xl">Thêm Giao Dịch Mới</DialogTitle>
            <button onClick={() => setIsDialogOpen(false)} className="rounded-full p-1 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </DialogHeader>
          <TransactionForm
            onSuccess={() => setIsDialogOpen(false)}
            onAddTransaction={addTransaction}
            currentDate={currentDate}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog xem hình ảnh hóa đơn */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md p-4 rounded-lg">
          <DialogHeader className="mb-4">
            <DialogTitle>Hình ảnh hóa đơn</DialogTitle>
          </DialogHeader>

          {imageLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-techcom-red"></div>
            </div>
          )}

          {imageError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Không thể tải hình ảnh. ID file có thể không tồn tại hoặc bạn không có quyền truy cập.
              </AlertDescription>
            </Alert>
          )}

          {selectedImage && (
            <div className="flex flex-col items-center">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Hóa đơn"
                className={`max-w-full max-h-[70vh] rounded-lg ${imageLoading ? "hidden" : ""} ${imageError ? "hidden" : ""}`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />

              {imageError && (
                <div className="mt-4 flex flex-col items-center">
                  <p className="text-gray-500 mb-2">Thử mở hình ảnh với phương thức khác:</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={tryAlternativeImageUrl}>
                      Thử lại với URL khác
                    </Button>
                    <Button variant="outline" onClick={() => openImageInNewTab(selectedImage)}>
                      Mở trong tab mới
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
