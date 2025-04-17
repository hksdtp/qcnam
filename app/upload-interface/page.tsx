"use client"

import { useState, useRef, useEffect } from "react"
import { formatFileSize } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Upload, ImageIcon, X, Eye, Trash2, CheckCircle, Package, Clock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface UploadedFile {
  id: string
  name: string
  size: number
  url: string
  type: string
  uploadedAt: Date
  fileId?: string
  webViewLink?: string
  directLink?: string
  thumbnailLink?: string
  directViewLink?: string
  exportViewLink?: string
}

export default function UploadInterface() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [viewingImage, setViewingImage] = useState<UploadedFile | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Tải danh sách ảnh đã tải lên từ localStorage khi component được mount
  useEffect(() => {
    const savedFiles = localStorage.getItem("uploadedFiles")
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles)
        // Chuyển đổi chuỗi ngày thành đối tượng Date
        const filesWithDates = parsedFiles.map((file: any) => ({
          ...file,
          uploadedAt: new Date(file.uploadedAt),
        }))
        setUploadedFiles(filesWithDates)
      } catch (e) {
        console.error("Lỗi khi đọc danh sách file từ localStorage:", e)
      }
    }
  }, [])

  // Lưu danh sách ảnh đã tải lên vào localStorage khi có thay đổi
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles))
    }
  }, [uploadedFiles])

  // Thiết lập sự kiện drag and drop
  useEffect(() => {
    const dropArea = dropAreaRef.current
    if (!dropArea) return

    const preventDefaults = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const highlight = () => {
      dropArea.classList.add("border-primary")
      dropArea.classList.add("bg-primary/5")
    }

    const unhighlight = () => {
      dropArea.classList.remove("border-primary")
      dropArea.classList.remove("bg-primary/5")
    }

    const handleDrop = (e: DragEvent) => {
      const dt = e.dataTransfer
      if (dt?.files && dt.files.length > 0) {
        handleFiles(dt.files)
      }
    }
    ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, preventDefaults, false)
    })
    ;["dragenter", "dragover"].forEach((eventName) => {
      dropArea.addEventListener(eventName, highlight, false)
    })
    ;["dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, unhighlight, false)
    })

    dropArea.addEventListener("drop", handleDrop as EventListener, false)

    return () => {
      ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        dropArea.removeEventListener(eventName, preventDefaults, false)
      })
      ;["dragenter", "dragover"].forEach((eventName) => {
        dropArea.removeEventListener(eventName, highlight, false)
      })
      ;["dragleave", "drop"].forEach((eventName) => {
        dropArea.removeEventListener(eventName, unhighlight, false)
      })

      dropArea.removeEventListener("drop", handleDrop as EventListener, false)
    }
  }, [])

  // Xử lý file được chọn
  const handleFiles = (fileList: FileList) => {
    // Lọc chỉ lấy các file ảnh
    const imageFiles = Array.from(fileList).filter((file) => file.type.startsWith("image/"))

    if (imageFiles.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file ảnh hợp lệ",
        variant: "destructive",
      })
      return
    }

    // Xử lý từng file ảnh
    imageFiles.forEach((file, index) => {
      // Hiển thị xem trước chỉ với file đầu tiên
      if (index === 0) {
        const reader = new FileReader()

        reader.onload = (e) => {
          if (e.target?.result) {
            const newPreviewFile = {
              id: "preview_" + Date.now(),
              name: file.name,
              size: file.size,
              url: e.target.result as string,
              type: file.type,
              uploadedAt: new Date(),
            }
            setPreviewFile(newPreviewFile)
          }
        }

        reader.readAsDataURL(file)
      }

      // Tự động tải lên ngay sau khi chọn
      uploadFile(file)
    })
  }

  // Tải file lên server
  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus("Đang chuẩn bị...")
    setShowSuccess(false)
    setError(null)

    try {
      // Kiểm tra kích thước file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Kích thước file vượt quá 5MB")
      }

      // Tạo FormData
      const formData = new FormData()
      formData.append("file", file)

      // Mô phỏng tiến trình tải lên
      const simulateProgress = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          if (newProgress < 90) {
            if (newProgress < 30) {
              setUploadStatus("Đang chuẩn bị...")
            } else if (newProgress < 70) {
              setUploadStatus("Đang tải lên...")
            } else {
              setUploadStatus("Đang xử lý...")
            }
            return newProgress
          }
          return prev
        })
      }, 300)

      // Gọi API tải lên với timeout dài hơn
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 giây timeout

      try {
        const response = await fetch("/api/upload-simple", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        clearInterval(simulateProgress)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Lỗi server: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success) {
          // Hoàn thành tải lên
          setUploadProgress(100)
          setUploadStatus("Hoàn thành")

          // Hiển thị biểu tượng thành công
          setShowSuccess(true)

          // Thêm file vào danh sách đã tải
          const fileURL = URL.createObjectURL(file)
          const fileId = "file_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)

          const newFile = {
            id: fileId,
            name: file.name,
            size: file.size,
            url: fileURL, // URL local cho xem trước
            type: file.type,
            uploadedAt: new Date(),
            fileId: data.fileId,
            webViewLink: data.webViewLink,
            directLink: data.directLink,
            thumbnailLink: data.thumbnailLink,
            directViewLink: data.directViewLink,
            exportViewLink: data.exportViewLink,
          }

          setUploadedFiles((prev) => [newFile, ...prev])

          // Hiển thị thông báo
          toast({
            title: "Thành công",
            description: "Tải lên thành công",
          })

          // Ẩn tiến trình và biểu tượng thành công sau 2 giây
          setTimeout(() => {
            setIsUploading(false)
            setShowSuccess(false)
          }, 2000)
        } else {
          throw new Error(data.error || "Lỗi không xác định")
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)

        if (fetchError.name === "AbortError") {
          throw new Error("Quá thời gian tải lên, vui lòng thử lại")
        } else {
          throw fetchError
        }
      }
    } catch (error) {
      console.error("Lỗi tải lên:", error)
      setUploadStatus("Lỗi tải lên")
      setUploadProgress(0)
      setError(error instanceof Error ? error.message : "Lỗi không xác định khi tải lên")

      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Lỗi không xác định khi tải lên",
        variant: "destructive",
      })

      setTimeout(() => {
        setIsUploading(false)
      }, 2000)
    }
  }

  // Xem ảnh trong modal
  const viewImage = (file: UploadedFile) => {
    setViewingImage(file)
  }

  // Xóa file
  const deleteFile = (fileId: string) => {
    const fileIndex = uploadedFiles.findIndex((f) => f.id === fileId)
    if (fileIndex === -1) return

    // Giải phóng URL của file
    URL.revokeObjectURL(uploadedFiles[fileIndex].url)

    // Xóa khỏi mảng
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))

    // Hiển thị thông báo
    toast({
      title: "Đã xóa",
      description: "Đã xóa ảnh",
    })
  }

  // Định dạng ngày tháng
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Chọn URL tốt nhất để hiển thị ảnh
  const getBestImageUrl = (file: UploadedFile): string => {
    // Ưu tiên theo thứ tự: thumbnailLink, directViewLink, exportViewLink, directLink, url local
    return file.thumbnailLink || file.directViewLink || file.exportViewLink || file.directLink || file.url
  }

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Quay lại trang chủ
          </Link>
        </Button>
      </div>
      <h1 className="mb-6 text-3xl font-bold">Tải lên ảnh biên lai</h1>

      <div className="max-w-xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-all hover:shadow-xl">
          {/* Khu vực kéo thả */}
          <div
            ref={dropAreaRef}
            className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-900 transition-all hover:border-primary hover:bg-primary/5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mb-3 text-primary transition-transform hover:scale-110" />
            <div className="text-base font-medium text-gray-700 dark:text-gray-300">Kéo & thả ảnh vào đây</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">hoặc nhấp để chọn ảnh từ thiết bị</div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </div>

          {/* Badge tự động tải lên */}
          <div className="flex items-center gap-2 bg-emerald-500 text-white text-xs font-semibold py-1 px-3 rounded-full mt-4 w-fit mx-auto">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            <span>Tự động tải lên</span>
          </div>

          {/* Xem trước ảnh */}
          {previewFile && (
            <div className="mt-6 rounded-lg overflow-hidden border dark:border-gray-700 shadow-md relative">
              <img src={previewFile.url || "/placeholder.svg"} alt="Ảnh xem trước" className="w-full h-auto" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <div className="text-white font-medium truncate">{previewFile.name}</div>
                <div className="text-white/80 text-sm">{formatFileSize(previewFile.size)}</div>
              </div>
            </div>
          )}

          {/* Thông báo lỗi */}
          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Tiến trình tải lên */}
          {isUploading && (
            <div className="mt-6">
              <Progress value={uploadProgress} className="h-2" />
              <div className="flex justify-between text-sm mt-2 text-gray-600 dark:text-gray-400">
                <span>{uploadStatus}</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
            </div>
          )}

          {/* Biểu tượng thành công */}
          {showSuccess && (
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto my-6 animate-in zoom-in-50 duration-300">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          )}

          {/* Danh sách ảnh đã tải */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Ảnh đã tải lên</h3>

            {uploadedFiles.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-500 dark:text-gray-400">
                Chưa có ảnh nào được tải lên
              </div>
            ) : (
              <ul className="space-y-3">
                {uploadedFiles.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:translate-x-1"
                  >
                    <img
                      src={getBestImageUrl(file) || "/placeholder.svg"}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded-md mr-4"
                      onError={(e) => {
                        // Fallback nếu URL chính không tải được
                        const target = e.target as HTMLImageElement
                        if (target.src !== file.url) {
                          target.src = file.url // Sử dụng URL local nếu URL từ Google Drive không hoạt động
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" /> {formatFileSize(file.size)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatDate(file.uploadedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => viewImage(file)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-primary hover:bg-primary/20"
                        title="Xem ảnh"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteFile(file.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal xem ảnh */}
      {viewingImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="icon"
              className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110"
              onClick={() => setViewingImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={getBestImageUrl(viewingImage) || "/placeholder.svg"}
              alt={viewingImage.name}
              className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
              onError={(e) => {
                // Fallback nếu URL chính không tải được
                const target = e.target as HTMLImageElement
                if (target.src !== viewingImage.url) {
                  target.src = viewingImage.url // Sử dụng URL local
                }
              }}
            />

            {/* Hiển thị các liên kết khác nhau để xem ảnh */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {viewingImage.webViewLink && (
                <Button variant="outline" size="sm" asChild className="bg-white/90 hover:bg-white">
                  <a href={viewingImage.webViewLink} target="_blank" rel="noopener noreferrer">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Xem trong Google Drive
                  </a>
                </Button>
              )}
              {viewingImage.directViewLink && (
                <Button variant="outline" size="sm" asChild className="bg-white/90 hover:bg-white">
                  <a href={viewingImage.directViewLink} target="_blank" rel="noopener noreferrer">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Xem trực tiếp
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
