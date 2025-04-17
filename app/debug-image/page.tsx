"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function DebugImagePage() {
  const [imageUrl, setImageUrl] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleCheck = async () => {
    if (!imageUrl) {
      setError("Vui lòng nhập URL ảnh")
      return
    }

    setIsChecking(true)
    setResult(null)
    setError(null)
    setImageLoaded(false)
    setImageError(false)

    try {
      const response = await fetch(`/api/debug-image?url=${encodeURIComponent(imageUrl)}`)

      if (!response.ok) {
        throw new Error(`Lỗi server: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Lỗi khi kiểm tra:", error)
      setError(error.message || "Đã xảy ra lỗi khi kiểm tra URL")
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="container py-6 md:py-10">
      <h1 className="mb-6 text-3xl font-bold">Kiểm tra URL ảnh</h1>
      <p className="mb-6 text-muted-foreground">
        Sử dụng công cụ này để kiểm tra xem URL ảnh có thể truy cập được không.
      </p>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Kiểm tra URL ảnh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập URL ảnh cần kiểm tra"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <Button onClick={handleCheck} disabled={isChecking}>
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang kiểm tra...
                </>
              ) : (
                "Kiểm tra"
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "URL có thể truy cập" : "URL không thể truy cập"}</AlertTitle>
                <AlertDescription>
                  {result.success ? (
                    <div className="space-y-1">
                      <p>
                        Status: {result.status} {result.statusText}
                      </p>
                      <p>Content-Type: {result.contentType || "Không xác định"}</p>
                      <p>Content-Length: {result.contentLength || "Không xác định"}</p>
                    </div>
                  ) : (
                    <p>Lỗi: {result.error}</p>
                  )}
                </AlertDescription>
              </Alert>

              {result.success && (
                <div className="space-y-2">
                  <p className="font-medium">Thử tải ảnh:</p>
                  <div className="border rounded-md p-4 flex items-center justify-center min-h-[200px]">
                    {!imageLoaded && !imageError && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
                    {imageError && (
                      <div className="text-center text-destructive">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>Không thể tải ảnh</p>
                      </div>
                    )}
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt="Test image"
                      className={`max-h-[300px] max-w-full ${imageLoaded ? "block" : "hidden"}`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                    />
                  </div>
                </div>
              )}

              <div className="bg-muted p-4 rounded-md">
                <p className="font-medium mb-2">Chi tiết kỹ thuật:</p>
                <pre className="text-xs overflow-auto max-h-[200px]">{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
