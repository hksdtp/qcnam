import { UploadTest } from "@/components/upload-test"

export default function UploadTestPage() {
  return (
    <div className="container py-6 md:py-10">
      <h1 className="mb-6 text-3xl font-bold">Kiểm tra tải lên ảnh</h1>
      <p className="mb-6 text-muted-foreground">
        Sử dụng trang này để kiểm tra quá trình tải ảnh lên Google Drive và xem liệu ảnh có thể xem được không.
      </p>

      <div className="max-w-md mx-auto">
        <UploadTest />
      </div>
    </div>
  )
}
