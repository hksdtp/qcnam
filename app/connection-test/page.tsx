import { ConnectionTest } from "@/components/connection-test"

export default function ConnectionTestPage() {
  return (
    <div className="container py-6 md:py-10">
      <h1 className="mb-6 text-3xl font-bold">Kiểm tra kết nối Google APIs</h1>
      <p className="mb-6 text-muted-foreground">
        Sử dụng công cụ này để kiểm tra chi tiết kết nối với Google Sheets và Google Drive.
      </p>

      <ConnectionTest />
    </div>
  )
}
