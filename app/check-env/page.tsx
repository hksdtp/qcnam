"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function CheckEnvPage() {
  const [envStatus, setEnvStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function checkEnvironmentVariables() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/check-env")
      const data = await response.json()
      setEnvStatus(data)
    } catch (err) {
      setError("Lỗi khi kiểm tra biến môi trường")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkEnvironmentVariables()
  }, [])

  return (
    <div className="container py-6 md:py-10">
      <h1 className="mb-6 text-3xl font-bold">Kiểm tra biến môi trường</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Trạng thái biến môi trường</span>
            <Button
              variant="outline"
              size="sm"
              onClick={checkEnvironmentVariables}
              disabled={loading}
              className="ml-auto"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Làm mới</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : envStatus ? (
            <div className="space-y-4">
              <Alert variant={envStatus.success ? "default" : "destructive"}>
                {envStatus.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>
                  {envStatus.success ? "Tất cả biến môi trường đã được cấu hình" : "Thiếu biến môi trường"}
                </AlertTitle>
                <AlertDescription>
                  {envStatus.success ? (
                    "Ứng dụng đã sẵn sàng để sử dụng Google APIs"
                  ) : (
                    <div>
                      <p>Các biến môi trường sau đang bị thiếu:</p>
                      <ul className="list-disc list-inside mt-2">
                        {envStatus.missingVars.map((variable: string) => (
                          <li key={variable}>{variable}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(envStatus.configured).map(([key, value]: [string, boolean]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{key}</span>
                    {value ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" /> Đã cấu hình
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> Chưa cấu hình
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn cấu hình</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Để ứng dụng hoạt động đúng, bạn cần cấu hình các biến môi trường sau trong file
              <code className="px-1 py-0.5 bg-muted rounded">.env.local</code>:
            </p>

            <div className="bg-muted p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
                {`SPREADSHEET_ID=your_spreadsheet_id
DRIVE_FOLDER_ID=your_drive_folder_id
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"`}
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Lưu ý quan trọng:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Đảm bảo rằng <code className="px-1 py-0.5 bg-muted rounded">GOOGLE_PRIVATE_KEY</code> bao gồm các ký
                  tự xuống dòng <code className="px-1 py-0.5 bg-muted rounded">\\n</code>
                </li>
                <li>Tài khoản dịch vụ phải có quyền truy cập vào Google Sheets và Google Drive</li>
                <li>Thư mục Drive phải được chia sẻ với tài khoản dịch vụ với quyền chỉnh sửa</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
