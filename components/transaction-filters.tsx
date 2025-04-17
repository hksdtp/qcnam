"use client"

import { CategorySelector } from "@/components/category-selector"
import { useState } from "react"

export function TransactionFilters() {
  const [selectedCategory, setSelectedCategory] = useState<string>("tong")

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    // Ở đây bạn có thể thêm logic để lọc giao dịch dựa trên danh mục đã chọn
  }

  return (
    <div className="space-y-4">
      <CategorySelector onCategoryChange={handleCategoryChange} />
    </div>
  )
}
