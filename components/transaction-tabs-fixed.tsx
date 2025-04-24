"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Receipt,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Edit,
  MoreHorizontal,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { TransactionFormFixed } from "@/components/transaction-form-fixed"
import { useDate } from "@/lib/date-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Transaction } from "@/lib/types"
import { CategorySelector } from "@/components/category-selector"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ReceiptViewer } from "@/components/receipt-viewer"
import { EditTransactionDialog } from "@/components/edit-transaction-dialog"
import { useTransactions } from "@/lib/hooks"

interface TransactionTabsFixedProps {
  transactions?: Transaction[]
  onAddTransaction?: (transaction: any) => void
}

// Helper: Format currency chỉ phía client
function formatCurrency(amount: number) {
  if (typeof window !== "undefined") {
    return amount.toLocaleString("vi-VN") + " đ"
  }
  // SSR fallback
  return amount + " đ"
}

// Helper: Format date chỉ phía client
function formatDate(date: string) {
  if (typeof window !== "undefined") {
    // Nếu là ISO, chuyển sang dd/MM/yyyy
    const d = new Date(date)
    return d.toLocaleDateString("vi-VN")
  }
  return date
}

export function TransactionTabsFixed({
  transactions: initialTransactions,
  onAddTransaction,
}: TransactionTabsFixedProps) {
  const { currentDate } = useDate()
  const [activeCategory, setActiveCategory] = useState("total")
  const [activeSubCategory, setActiveSubCategory] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const transactionsEndRef = useRef<HTMLDivElement>(null)
  const [currentBalance, setCurrentBalance] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0) // Add a refresh key to force re-fetch
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isDebugOpen, setIsDebugOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<(Transaction & { rowIndex?: number }) | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isManualRefresh, setIsManualRefresh] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<(Transaction & { rowIndex?: number }) | null>(null)

  // Sử dụng hook useTransactions
  const { transactions, isLoading, isError, errorMessage, mutate } = useTransactions(
    currentDate.getMonth() + 1,
    currentDate.getFullYear(),
  )

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

  // Cập nhật error state khi có lỗi từ hook
  useEffect(() => {
    if (errorMessage && !isManualRefresh) {
      setError(errorMessage)
    }
  }, [errorMessage, isManualRefresh])

  // Tính toán số dư hiện tại khi transactions thay đổi
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const totalIncome = transactions
        .filter((t: Transaction) => t.type === "income")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

      const totalExpense = transactions
        .filter((t: Transaction) => t.type === "expense")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

      setCurrentBalance(totalIncome - totalExpense)
    }
  }, [transactions])

  // Thêm giao dịch mới
  const addTransaction = (transaction: Transaction) => {
    // Gọi callback nếu có
    if (onAddTransaction) {
      onAddTransaction(transaction)
    }

    // Làm mới dữ liệu
    refreshData()

    // Đặt danh mục hiện tại là danh mục của giao dịch mới
    if (transaction.type === "expense") {
      const categoryId = expenseCategories.find((c) => c.name === transaction.category)?.id || "total"
      setActiveCategory(categoryId)

      // Nếu là chi phí xe ô tô, đặt danh mục con
      if (transaction.category === "Chi phí xe ô tô" && transaction.subCategory) {
        const subCategoryId = carSubCategories.find((c) => c.name === transaction.subCategory)?.id || "all"
        setActiveSubCategory(subCategoryId)
      }
    } else {
      const categoryId = incomeCategories.find((c) => c.name === transaction.category)?.id || "total"
      setActiveCategory(categoryId)
    }

    // Mở rộng danh mục của giao dịch mới
    setExpandedCategory(transaction.category)

    // Cuộn xuống giao dịch mới sau khi render
    setTimeout(() => {
      transactionsEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  // Hàm làm mới dữ liệu
  const refreshData = () => {
    setIsManualRefresh(true)
    setError(null)

    try {
      mutate()
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setIsManualRefresh(false)
    }
  }

  // Xử lý khi tab thay đổi
  const handleTabChange = (value: string) => {
    setActiveTab(value as "expense" | "income")
    setExpandedCategory(null)
    setActiveCategory("total") // Reset về tổng khi chuyển tab
  }

  // Xử lý khi chỉnh sửa giao dịch
  const handleEditTransaction = (transaction: Transaction, rowIndex: number) => {
    setEditingTransaction({ ...transaction, rowIndex })
    setIsEditDialogOpen(true)
  }

  // Xử lý khi xóa giao dịch
  const handleDeleteTransaction = async (transaction: Transaction & { rowIndex?: number }) => {
    setTransactionToDelete(transaction);
    setDeleteConfirmOpen(true);
  };

  // Thực hiện xóa giao dịch sau khi xác nhận
  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    
    try {
      const formData = new FormData();
      formData.append("rowIndex", (transactionToDelete.rowIndex ?? "").toString());
      // Gọi hàm xóa giao dịch từ actions
      const result = await import("@/lib/actions").then(mod => mod.deleteTransaction(formData));
      if (result.success) {
        // Hiển thị thông báo thành công
        console.log("Xóa giao dịch thành công", transactionToDelete);
        // Tải lại dữ liệu
        refreshData();
      } else {
        console.error("Lỗi khi xóa giao dịch:", result.error);
      }
    } catch (error: any) {
      console.error("Lỗi khi xóa giao dịch:", error.message);
    } finally {
      setDeleteConfirmOpen(false);
      setTransactionToDelete(null);
    }
  };

  // Lọc và nhóm giao dịch theo danh mục
  const getFilteredTransactions = (): Record<string, Transaction[]> => {
    const result: Record<string, Transaction[]> = {}

    if (activeTab === "expense") {
      // Lọc giao dịch chi tiêu
      const expenseTransactions = transactions.filter((t: Transaction) => t.type === "expense")

      if (activeCategory === "total") {
        // Nhóm theo danh mục
        expenseCategories.slice(1).forEach((category) => {
          const categoryName = category.name
          const categoryTransactions = expenseTransactions.filter((t: Transaction) => t.category === categoryName)

          if (categoryTransactions.length > 0) {
            // Sắp xếp giao dịch theo thời gian mới nhất
            result[categoryName] = [...categoryTransactions].sort((a, b) => {
              const dateA = new Date(a.timestamp || a.date.split("/").reverse().join("-"))
              const dateB = new Date(b.timestamp || b.date.split("/").reverse().join("-"))
              return dateB.getTime() - dateA.getTime()
            })
          }
        })
      } else {
        // Lọc theo danh mục đã chọn
        const categoryName = expenseCategories.find((c) => c.id === activeCategory)?.name || ""
        const categoryTransactions = expenseTransactions.filter((t: Transaction) => t.category === categoryName)

        if (activeCategory === "car" && activeSubCategory !== "all") {
          // Lọc theo danh mục con
          const subCategoryName = carSubCategories.find((c) => c.id === activeSubCategory)?.name || ""
          const filteredTransactions = categoryTransactions.filter((t: Transaction) => t.subCategory === subCategoryName)

          if (filteredTransactions.length > 0) {
            // Sắp xếp giao dịch theo thời gian mới nhất
            result[subCategoryName] = [...filteredTransactions].sort((a, b) => {
              const dateA = new Date(a.timestamp || a.date.split("/").reverse().join("-"))
              const dateB = new Date(b.timestamp || b.date.split("/").reverse().join("-"))
              return dateB.getTime() - dateA.getTime()
            })
          }
        } else if (categoryTransactions.length > 0) {
          // Sắp xếp giao dịch theo thời gian mới nhất
          result[categoryName] = [...categoryTransactions].sort((a, b) => {
            const dateA = new Date(a.timestamp || a.date.split("/").reverse().join("-"))
            const dateB = new Date(b.timestamp || b.date.split("/").reverse().join("-"))
            return dateB.getTime() - dateA.getTime()
          })
        }
      }
    } else {
      // Lọc giao dịch thu nhập
      const incomeTransactions = transactions.filter((t: Transaction) => t.type === "income")

      if (activeCategory === "total") {
        // Nhóm theo danh mục
        incomeCategories.slice(1).forEach((category) => {
          const categoryName = category.name
          const categoryTransactions = incomeTransactions.filter((t: Transaction) => t.category === categoryName)

          if (categoryTransactions.length > 0) {
            // Sắp xếp giao dịch theo thời gian mới nhất
            result[categoryName] = [...categoryTransactions].sort((a, b) => {
              const dateA = new Date(a.timestamp || a.date.split("/").reverse().join("-"))
              const dateB = new Date(b.timestamp || b.date.split("/").reverse().join("-"))
              return dateB.getTime() - dateA.getTime()
            })
          }
        })
      } else {
        // Lọc theo danh mục đã chọn
        const categoryName = incomeCategories.find((c) => c.id === activeCategory)?.name || ""
        const categoryTransactions = incomeTransactions.filter((t: Transaction) => t.category === categoryName)

        if (categoryTransactions.length > 0) {
          // Sắp xếp giao dịch theo thời gian mới nhất
          result[categoryName] = [...categoryTransactions].sort((a, b) => {
            const dateA = new Date(a.timestamp || a.date.split("/").reverse().join("-"))
            const dateB = new Date(b.timestamp || b.date.split("/").reverse().join("-"))
            return dateB.getTime() - dateA.getTime()
          })
        }
      }
    }

    return result
  }

  // Ánh xạ ID danh mục sang tên danh mục thực tế
  const getCategoryNameFromId = (id: string, isExpense: boolean): string => {
    if (id === "total") return "total"

    const categories = isExpense ? expenseCategories : incomeCategories
    const category = categories.find((c) => c.id === id)

    if (!category) return ""

    return category.name
  }

  // Lấy tổng số giao dịch cho danh mục đã chọn
  const getFilteredTransactionsCount = () => {
    if (activeTab === "expense") {
      const expenseTransactions = transactions.filter((t: Transaction) => t.type === "expense")

      if (activeCategory === "total") {
        return expenseTransactions.length
      } else if (activeCategory === "car" && activeSubCategory !== "all") {
        const categoryName = "Chi phí xe ô tô"
        const subCategoryName = carSubCategories.find((c) => c.id === activeSubCategory)?.name || ""

        return expenseTransactions.filter((t: Transaction) => t.category === categoryName && t.subCategory === subCategoryName)
          .length
      } else {
        const categoryName = getCategoryNameFromId(activeCategory, true)
        return expenseTransactions.filter((t: Transaction) => t.category === categoryName).length
      }
    } else {
      const incomeTransactions = transactions.filter((t: Transaction) => t.type === "income")

      if (activeCategory === "total") {
        return incomeTransactions.length
      } else {
        const categoryName = getCategoryNameFromId(activeCategory, false)
        return incomeTransactions.filter((t: Transaction) => t.category === categoryName).length
      }
    }
  }

  // Lấy tổng tiền cho danh mục đã chọn
  const getTotalAmount = () => {
    if (activeTab === "expense") {
      const expenseTransactions = transactions.filter((t: Transaction) => t.type === "expense")

      if (activeCategory === "total") {
        return expenseTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0)
      } else if (activeCategory === "car" && activeSubCategory !== "all") {
        const categoryName = "Chi phí xe ô tô"
        const subCategoryName = carSubCategories.find((c) => c.id === activeSubCategory)?.name || ""

        return expenseTransactions
          .filter((t: Transaction) => t.category === categoryName && t.subCategory === subCategoryName)
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
      } else {
        const categoryName = getCategoryNameFromId(activeCategory, true)
        return expenseTransactions.filter((t: Transaction) => t.category === categoryName).reduce((sum: number, t: Transaction) => sum + t.amount, 0)
      }
    } else {
      const incomeTransactions = transactions.filter((t: Transaction) => t.type === "income")

      if (activeCategory === "total") {
        return incomeTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0)
      } else {
        const categoryName = getCategoryNameFromId(activeCategory, false)
        return incomeTransactions.filter((t: Transaction) => t.category === categoryName).reduce((sum: number, t: Transaction) => sum + t.amount, 0)
      }
    }
  }

  // Lấy màu cho danh mục
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Chi phí xe ô tô": "bg-blue-100 text-blue-800",
      "Nhà hàng": "bg-orange-100 text-orange-800",
      "Giao nhận đồ": "bg-purple-100 text-purple-800",
      "Mua đồ/ dịch vụ": "bg-green-100 text-green-800",
      "Chi phí khác": "bg-gray-100 text-gray-800",
      "Ứng tài khoản": "bg-emerald-100 text-emerald-800",
      "Ứng tiền mặt": "bg-cyan-100 text-cyan-800",
      "Hoàn tiền": "bg-amber-100 text-amber-800",
    }

    return colors[category] || "bg-gray-100 text-gray-800"
  }

  // Lấy màu cho danh mục con
  const getSubCategoryColor = (subCategory: string) => {
    const colors: Record<string, string> = {
      Xăng: "bg-red-100 text-red-800",
      "Vé đỗ xe ô tô": "bg-blue-100 text-blue-800",
      VETC: "bg-yellow-100 text-yellow-800",
      "Rửa xe": "bg-cyan-100 text-cyan-800",
      "Bảo dưỡng": "bg-orange-100 text-orange-800",
      "Sửa chữa": "bg-purple-100 text-purple-800",
      "Đăng kiểm / Bảo hiểm": "bg-green-100 text-green-800",
    }

    return colors[subCategory] || "bg-gray-100 text-gray-800"
  }

  // Lấy danh sách giao dịch đã lọc và nhóm
  const filteredTransactions = getFilteredTransactions()
  const filteredTransactionsCount = getFilteredTransactionsCount()
  const totalAmount = getTotalAmount()

  // Lấy tiêu đề cho phần tổng tiền
  const getTotalAmountTitle = () => {
    if (activeTab === "expense") {
      if (activeCategory === "total") {
        return "Tổng tiền Chi tiêu"
      } else if (activeCategory === "car" && activeSubCategory !== "all") {
        return `Tổng tiền ${carSubCategories.find((c) => c.id === activeSubCategory)?.name || ""}`
      } else {
        return `Tổng tiền ${getCategoryNameFromId(activeCategory, true)}`
      }
    } else {
      if (activeCategory === "total") {
        return "Tổng tiền Nhập tiền"
      } else {
        return `Tổng tiền ${getCategoryNameFromId(activeCategory, false)}`
      }
    }
  }

  return (
    <Card className="rounded-lg overflow-hidden bg-white shadow-md mt-2">
      <Tabs defaultValue="expense" onValueChange={handleTabChange}>
        <div className="flex items-center justify-between mb-2">
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
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
              className="bg-techcom-red hover:bg-techcom-darkred transition-all duration-300"
            >
              <Plus className="mr-1 h-4 w-4" />
              Thêm mới
            </Button>
          </div>
        </div>

        <TabsContent value="expense" className="m-0">
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
              <span>
                Chi tiêu - Tháng {currentDate.getMonth() + 1} {currentDate.getFullYear()}
              </span>
            </div>

            <CategorySelector
              onCategoryChange={(mainCategory: string, subCategory?: string) => {
                // Ánh xạ từ ID danh mục sang tên danh mục
                const categoryMap: Record<string, string> = {
                  tong: "total",
                  "xe-oto": "car",
                  "nha-hang": "restaurant",
                  "giao-nhan": "delivery",
                  "mua-do": "services",
                  khac: "other",
                }

                // Ánh xạ từ ID danh mục con sang tên danh mục con
                const subCategoryMap: Record<string, string> = {
                  "tat-ca": "all",
                  xang: "gas",
                  "ve-do-xe": "parking",
                  vetc: "vetc",
                  "rua-xe": "wash",
                  "bao-duong": "maintenance",
                  "sua-chua": "repair",
                  "dang-kiem-bh": "insurance",
                }

                setActiveCategory(categoryMap[mainCategory] || mainCategory)
                setActiveSubCategory(subCategory ? subCategoryMap[subCategory] || subCategory : "all")
                setExpandedCategory(null)
              }}
              className="mb-4"
            />

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Hiển thị tổng chi tiêu cho danh mục đã chọn */}
            {!isLoading && transactions.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{getTotalAmountTitle()}</p>
                    <p className="text-sm text-gray-500">{filteredTransactionsCount} giao dịch</p>
                  </div>
                  <div className="text-xl font-bold text-techcom-red">
                    {formatCurrency(totalAmount)}
                  </div>
                </div>
              </div>
            )}

            <div className="text-center py-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-techcom-red mb-4" />
                  <p className="text-gray-500">Đang tải dữ liệu...</p>
                </div>
              ) : transactions.some((t: Transaction) => t.type === "expense") ? (
                <div className="w-full space-y-3">
                  {/* Hiển thị danh sách giao dịch theo nhóm */}
                  {Object.keys(filteredTransactions).length > 0 ? (
                    Object.entries(filteredTransactions).map(([category, categoryTransactions]) => (
                      <Collapsible
                        key={category}
                        open={expandedCategory === category}
                        onOpenChange={(open) => {
                          if (open) {
                            setExpandedCategory(category)
                          } else if (expandedCategory === category) {
                            setExpandedCategory(null)
                          }
                        }}
                        className="w-full"
                      >
                        <CollapsibleTrigger asChild>
                          <div className="bg-white border rounded-lg p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-all duration-300">
                            <div className="flex items-center">
                              <Badge className={cn("mr-2", getCategoryColor(category))}>{category}</Badge>
                              <span className="text-sm text-gray-500">{categoryTransactions.length} giao dịch</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium text-techcom-red mr-2">
                                {formatCurrency(
                                  categoryTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0),
                                )}
                              </span>
                              {expandedCategory === category ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-2 pl-2 transition-all duration-300">
                          {categoryTransactions.map((transaction, index) => (
                            <div
                              key={transaction.id || index}
                              className={cn(
                                "bg-gray-50 p-3 rounded-lg flex justify-between items-center border-l-4 transition-all duration-300 animate-in",
                                transaction.category === "Chi phí xe ô tô" ? "border-blue-400" : "border-techcom-red",
                                index < 3 ? `stagger-${index + 1}` : "",
                              )}
                              ref={index === 0 && expandedCategory === category ? transactionsEndRef : null}
                            >
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <p className="font-medium text-left">{transaction.description}</p>
                                  {transaction.subCategory && (
                                    <Badge className={cn("ml-2 text-xs", getSubCategoryColor(transaction.subCategory))}>
                                      {transaction.subCategory}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 text-left mt-1">{formatDate(transaction.date)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {transaction.receiptLink && (
                                  <ReceiptViewer receiptLink={transaction.receiptLink} size="sm" />
                                )}
                                <div className="text-techcom-red font-medium">
                                  {formatCurrency(transaction.amount)}
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full transition-all duration-200 hover:bg-gray-100"
                                    onClick={() => handleEditTransaction(transaction, index)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full transition-all duration-200 hover:bg-gray-100 text-red-600"
                                    onClick={() => handleDeleteTransaction({ ...transaction, rowIndex: index })}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-500">Không có giao dịch nào trong danh mục này</p>
                    </div>
                  )}
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
          </CardContent>
        </TabsContent>

        <TabsContent value="income" className="m-0">
          <CardContent className="p-4">
            <div className="text-sm font-medium mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
              <span>
                Nhập Tiền - Tháng {currentDate.getMonth() + 1} {currentDate.getFullYear()}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {incomeCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  onClick={() => {
                    setActiveCategory(category.id)
                    setExpandedCategory(null)
                  }}
                  className={
                    activeCategory === category.id
                      ? "bg-techcom-red text-white rounded-lg border-0 transition-all duration-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg border-0 transition-all duration-300"
                  }
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Hiển thị tổng thu nhập cho danh mục đã chọn */}
            {!isLoading && transactions.some((t: Transaction) => t.type === "income") && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">{getTotalAmountTitle()}</p>
                    <p className="text-sm text-gray-500">{filteredTransactionsCount} giao dịch</p>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(totalAmount)}
                  </div>
                </div>
              </div>
            )}

            <div className="text-center py-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-techcom-red mb-4" />
                  <p className="text-gray-500">Đang tải dữ liệu...</p>
                </div>
              ) : transactions.some((t: Transaction) => t.type === "income") ? (
                <div className="w-full space-y-3">
                  {/* Hiển thị danh sách giao dịch theo nhóm */}
                  {Object.keys(filteredTransactions).length > 0 ? (
                    Object.entries(filteredTransactions).map(([category, categoryTransactions]) => (
                      <Collapsible
                        key={category}
                        open={expandedCategory === category}
                        onOpenChange={(open) => {
                          if (open) {
                            setExpandedCategory(category)
                          } else if (expandedCategory === category) {
                            setExpandedCategory(null)
                          }
                        }}
                        className="w-full"
                      >
                        <CollapsibleTrigger asChild>
                          <div className="bg-white border rounded-lg p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-all duration-300">
                            <div className="flex items-center">
                              <Badge className={cn("mr-2", getCategoryColor(category))}>{category}</Badge>
                              <span className="text-sm text-gray-500">{categoryTransactions.length} giao dịch</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium text-green-600 mr-2">
                                {formatCurrency(
                                  categoryTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0),
                                )}
                              </span>
                              {expandedCategory === category ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-2 pl-2 transition-all duration-300">
                          {categoryTransactions.map((transaction, index) => (
                            <div
                              key={transaction.id || index}
                              className={cn(
                                "bg-gray-50 p-3 rounded-lg flex justify-between items-center border-l-4 border-green-400 transition-all duration-300 animate-in",
                                index < 3 ? `stagger-${index + 1}` : "",
                              )}
                              ref={index === 0 && expandedCategory === category ? transactionsEndRef : null}
                            >
                              <div className="flex-1">
                                <p className="font-medium text-left">{transaction.description}</p>
                                <p className="text-xs text-gray-500 text-left mt-1">{formatDate(transaction.date)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {transaction.receiptLink && (
                                  <ReceiptViewer receiptLink={transaction.receiptLink} size="sm" />
                                )}
                                <div className="text-green-600 font-medium">
                                  {formatCurrency(transaction.amount)}
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full transition-all duration-200 hover:bg-gray-100"
                                    onClick={() => handleEditTransaction(transaction, index)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full transition-all duration-200 hover:bg-gray-100 text-red-600"
                                    onClick={() => handleDeleteTransaction({ ...transaction, rowIndex: index })}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-500">Không có giao dịch nào trong danh mục này</p>
                    </div>
                  )}
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
          </CardContent>
        </TabsContent>
      </Tabs>

      {/* Debug Dialog */}
      <Dialog open={isDebugOpen} onOpenChange={setIsDebugOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-[600px] max-h-[80vh] overflow-auto transition-all duration-300 animate-in fade-in-90 slide-in-from-bottom-10">
          <DialogHeader>
            <DialogTitle>Debug Information</DialogTitle>
          </DialogHeader>
          <div className="text-xs font-mono bg-gray-100 p-4 rounded overflow-auto">
            <h3 className="font-bold mb-2">Current Date:</h3>
            <p>
              Month: {currentDate.getMonth() + 1}, Year: {currentDate.getFullYear()}
            </p>

            <h3 className="font-bold mt-4 mb-2">API Response:</h3>
            {debugInfo ? <pre>{JSON.stringify(debugInfo, null, 2)}</pre> : <p>No debug information available</p>}

            <h3 className="font-bold mt-4 mb-2">Current Transactions:</h3>
            <p>Count: {transactions.length}</p>
            {transactions.length > 0 && <pre>{JSON.stringify(transactions.slice(0, 3), null, 2)}</pre>}
          </div>
          <Button onClick={() => setIsDebugOpen(false)} className="transition-all duration-200">
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <AddTransactionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddTransaction={addTransaction}
        initialType={activeTab}
      />

      {/* Dialog chỉnh sửa giao dịch */}
      {editingTransaction && (
        <EditTransactionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          transaction={editingTransaction}
          onSuccess={refreshData}
        />
      )}

      {/* Dialog thêm giao dịch mới - Chỉ một dấu X */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          // Chỉ cho phép đóng dialog khi người dùng nhấn nút Hủy hoặc Lưu
          // Không đóng khi nhấn ra ngoài
          if (!open && isDialogOpen) {
            // Không làm gì, giữ dialog mở
          } else {
            setIsDialogOpen(open)
          }
        }}
      >
        <DialogContent
          className="max-w-[90vw] sm:max-w-[400px] p-0 overflow-auto max-h-[90vh] rounded-lg transition-all duration-300 animate-in fade-in-90 slide-in-from-bottom-10"
          aria-describedby="transaction-dialog-description"
          onInteractOutside={(e) => {
            // Ngăn chặn đóng dialog khi nhấn ra ngoài
            e.preventDefault()
          }}
        >
          <DialogHeader className="px-4 py-2 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <DialogTitle className="text-lg font-medium">Thêm Giao Dịch Mới</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full transition-all duration-200 hover:bg-gray-100"
              onClick={() => setIsDialogOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Đóng</span>
            </Button>
          </DialogHeader>
          <div id="transaction-dialog-description" className="sr-only">
            Biểu mẫu thêm giao dịch mới với các trường thông tin cần thiết
          </div>
          <TransactionFormFixed
            onSuccess={() => {
              setIsDialogOpen(false)
              // Tải lại dữ liệu sau khi thêm giao dịch
              refreshData()
            }}
            onAddTransaction={addTransaction}
            currentDate={currentDate}
            initialType={activeTab}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa giao dịch */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Xác nhận xóa giao dịch
            </DialogTitle>
            <DialogDescription className="pt-3">
              Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {transactionToDelete && (
            <div className="bg-gray-50 p-3 rounded-lg my-3">
              <div className="font-medium">{transactionToDelete.description}</div>
              <div className="flex justify-between mt-1">
                <div className="text-sm text-gray-500">{formatDate(transactionToDelete.date)}</div>
                <div className="font-medium text-red-600">{formatCurrency(transactionToDelete.amount)}</div>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Xóa giao dịch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
