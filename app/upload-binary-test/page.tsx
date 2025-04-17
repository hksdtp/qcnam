import { UploadBinaryTest } from "@/components/upload-binary-test"

export default function UploadBinaryTestPage() {
  return (
    <div className="container py-6 md:py-10">
      <h1 className="mb-6 text-3xl font-bold">Kiểm tra tải lên ảnh (Phương pháp nhị phân)</h1>
      <p className="mb-6 text-muted-foreground">
        Sử dụng trang này để kiểm tra quá trình tải ảnh lên Google Drive bằng phương pháp nhị phân và xem liệu ảnh có
        thể xem được không.
      </p>

      <div className="max-w-md mx-auto">
        <UploadBinaryTest />
      </div>
    </div>
  )
}
