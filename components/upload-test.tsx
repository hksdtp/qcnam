"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"

export function UploadTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setError(null)
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

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      // Sử dụng API route mới để tải lên
      const response = await fetch("/api/upload-direct", {
        method: "POST",
        body: formData,
      })

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
        <CardTitle>Kiểm tra tải lên ảnh</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="file-upload" className="block text-sm font-medium">
            Chọn ảnh để tải lên
          </label>
          <Input id="file-upload" type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
        </div>

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
                <div className="flex flex-col gap-2 mt-2">
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
                    <ExternalLink className="h-4 w-4 mr-2" />
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
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
