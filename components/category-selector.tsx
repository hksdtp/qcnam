"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CategorySelectorProps {
  onCategoryChange?: (category: string, subCategory?: string) => void
  className?: string
}

export function CategorySelector({ onCategoryChange, className }: CategorySelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>("tong")

  // Danh sách các danh mục chính
  const categories = [
    { id: "tong", name: "Tổng" },
    { id: "xe-oto", name: "Chi phí xe ô tô" },
    { id: "nha-hang", name: "Nhà hàng" },
    { id: "giao-nhan", name: "Giao nhận đồ" },
    { id: "mua-do", name: "Mua đồ/ dịch vụ" },
    { id: "khac", name: "Chi phí khác" },
  ]

  // Xử lý khi chọn danh mục chính
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId)
    onCategoryChange && onCategoryChange(categoryId)
  }

  // Gọi callback khi component mount với giá trị mặc định
  useEffect(() => {
    onCategoryChange && onCategoryChange(activeCategory)
  }, [])

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            className={cn(
              "rounded-full text-sm font-medium",
              activeCategory === category.id
                ? "bg-techcom-red hover:bg-techcom-darkred text-white border-0"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-0",
            )}
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
