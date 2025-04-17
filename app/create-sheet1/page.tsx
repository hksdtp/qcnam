import { CreateSheet1Button } from "@/components/create-sheet1-button"

export default function CreateSheet1Page() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Tạo Sheet1</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Tạo hoặc cập nhật Sheet1</h2>

        <p className="mb-4 text-gray-700">
          Nhấn nút bên dưới để tạo Sheet1 mới hoặc cập nhật tiêu đề của Sheet1 hiện có. Thao tác này sẽ không xóa dữ
          liệu hiện có trong Sheet1.
        </p>

        <CreateSheet1Button />
      </div>
    </div>
  )
}
