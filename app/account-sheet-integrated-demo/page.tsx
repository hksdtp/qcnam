"use client"

import { AccountSheetIntegrated } from "@/components/account-sheet-integrated"
import { DateProvider } from "@/lib/date-context"

export default function AccountSheetIntegratedDemo() {
  return (
    <DateProvider>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Thông tin tài khoản (Tích hợp)</h1>

        <div className="max-w-md mx-auto">
          {/* Component AccountSheetIntegrated */}
          <AccountSheetIntegrated />

          <div className="mt-8 bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <p className="mb-2">
              <strong>Hướng dẫn:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nhấn vào tháng/năm ở phía trên để mở hộp thoại chọn tháng và năm</li>
              <li>Sử dụng các nút mũi tên bên cạnh để chuyển qua tháng trước/sau</li>
              <li>Nhấn vào nút mũi tên ở góc phải để xem chi tiết tài khoản</li>
              <li>Dữ liệu sẽ tự động cập nhật khi chuyển tháng</li>
            </ul>
          </div>
        </div>
      </div>
    </DateProvider>
  )
}
