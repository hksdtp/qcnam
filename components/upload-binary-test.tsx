"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, CheckCircle, AlertCircle, ExternalLink, Image } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function UploadBinaryTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setError(null)

      // Tạo URL xem trước cho file
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Xóa URL cũ khi component unmount
      return () => URL.revokeObjectURL(objectUrl)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Vui lòng chọn file để tải lên")
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadResult(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      // Giả lập tiến trình tải lên
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev < 90) return prev + 5
          return prev
        })
      }, 200)

      // Sử dụng API route mới để tải lên
      const response = await fetch("/api/upload-binary", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Lỗi server: ${response.status}`)
      }

      const data = await response.json()
      setUploadResult(data)
    } catch (error) {
      console.error("Lỗi khi tải lên:", error)
      setError(error.message || "Đã xảy ra lỗi khi tải file lên")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Kiểm tra tải lên ảnh (Phương pháp nhị phân)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="file-upload-binary" className="block text-sm font-medium">
            Chọn ảnh để tải lên
          </label>
          <Input id="file-upload-binary" type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
        </div>

        {previewUrl && (
          <div className="mt-4 border rounded-md p-2">
            <p className="text-sm font-medium mb-2">Xem trước:</p>
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              className="max-h-48 max-w-full mx-auto rounded-md"
            />
          </div>
        )}

        {selectedFile && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">File đã chọn:</p>
            <p className="text-sm">{selectedFile.name}</p>
            <p className="text-sm">Kích thước: {(selectedFile.size / 1024).toFixed(1)} KB</p>
            <p className="text-sm">Loại: {selectedFile.type}</p>
          </div>
        )}

        <Button onClick={handleUpload} disabled={isUploading || !selectedFile} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải lên...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Tải lên
            </>
          )}
        </Button>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">{uploadProgress}% hoàn thành</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {uploadResult && uploadResult.success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Tải lên thành công</AlertTitle>
            <AlertDescription>
              <div className="space-y-2 mt-2">
                <p>File đã được tải lên thành công!</p>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <a
                    href={uploadResult.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Xem trong Google Drive
                  </a>

                  <a
                    href={uploadResult.directViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Xem trực tiếp
                  </a>

                  <a
                    href={uploadResult.embedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Xem nhúng
                  </a>

                  <a
                    href={uploadResult.thumbnailLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Xem thumbnail
                  </a>
                </div>

                {uploadResult.proxyLink && (
                  <div className="mt-4">
                    <p className="text-sm font-medium">Xem qua proxy:</p>
                    <img
                      src={uploadResult.proxyLink || "/placeholder.svg"}
                      alt="Uploaded via proxy"
                      className="max-h-48 max-w-full mx-auto mt-2 rounded-md border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.onerror = null
                        target.src = "/placeholder.svg"
                        target.alt = "Không thể tải ảnh qua proxy"
                      }}
                    />
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
