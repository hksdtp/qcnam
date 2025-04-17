"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export function ConnectionTest() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function testSheetConnection() {
    setLoading(true)
    setResults(null)
    setError(null)

    try {
      const response = await fetch("/api/test-connection")
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message || "Lỗi không xác định khi kiểm tra kết nối")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Kiểm tra kết nối chi tiết</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Công cụ này sẽ kiểm tra từng bước kết nối với Google APIs để xác định vấn đề cụ thể.
        </p>

        <Button onClick={testSheetConnection} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang kiểm tra...
            </>
          ) : (
            "Kiểm tra kết nối"
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <div className="space-y-4">
            <Alert variant={results.authSuccess ? "default" : "destructive"}>
              {results.authSuccess ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>1. Xác thực tài khoản dịch vụ</AlertTitle>
              <AlertDescription>
                {results.authSuccess
                  ? "Xác thực thành công với tài khoản dịch vụ"
                  : `Lỗi xác thực: ${results.authError || "Không xác định"}`}
              </AlertDescription>
            </Alert>

            <Alert variant={results.sheetSuccess ? "default" : "destructive"}>
              {results.sheetSuccess ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>2. Kết nối Google Sheets</AlertTitle>
              <AlertDescription>
                {results.sheetSuccess
                  ? `Kết nối thành công với bảng tính: ${results.sheetTitle || "Không có tiêu đề"}`
                  : `Lỗi kết nối bảng tính: ${results.sheetError || "Không xác định"}`}
              </AlertDescription>
            </Alert>

            <Alert variant={results.driveSuccess ? "default" : "destructive"}>
              {results.driveSuccess ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>3. Kết nối Google Drive</AlertTitle>
              <AlertDescription>
                {results.driveSuccess
                  ? `Kết nối thành công với thư mục: ${results.folderName || "Không có tên"}`
                  : `Lỗi kết nối thư mục: ${results.driveError || "Không xác định"}`}
              </AlertDescription>
            </Alert>

            {results.details && (
              <div className="rounded-md bg-muted p-4 text-xs font-mono overflow-auto max-h-60">
                <pre>{JSON.stringify(results.details, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
