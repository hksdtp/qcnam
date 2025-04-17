"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, ImageIcon, Maximize2, AlertCircle, Loader2, RefreshCw, Copy, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

interface ReceiptViewerProps {
  receiptLink: string | null
  size?: "sm" | "md" | "lg"
}

export function ReceiptViewer({ receiptLink, size = "md" }: ReceiptViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [googleDriveLink, setGoogleDriveLink] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const imageRef = useRef<HTMLImageElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  // Chỉ chạy useEffect ở phía client để tránh lỗi hydration
  useEffect(() => {
    if (!receiptLink) return

    console.log("Receipt link:", receiptLink)

    // Xử lý link receipt để có các tùy chọn xem tốt nhất
    let fileId = ""
    let driveLink = receiptLink
    let imageUrl = ""
    let thumbnail = ""

    try {
      // Xác định fileId từ các loại link khác nhau
      if (receiptLink.includes("drive.google.com/uc?export=view")) {
        fileId = receiptLink.split("id=")[1]?.split("&")[0] || ""
      } else if (receiptLink.includes("drive.google.com/thumbnail")) {
        fileId = receiptLink.split("id=")[1]?.split("&")[0] || ""
      } else if (receiptLink.includes("drive.google.com/file/d/")) {
        fileId = receiptLink.split("/file/d/")[1].split("/")[0]
      } else if (receiptLink.startsWith("/api/image-proxy/")) {
        fileId = receiptLink.split("/api/image-proxy/")[1]
      } else if (receiptLink.includes("id=")) {
        fileId = receiptLink.split("id=")[1]?.split("&")[0] || ""
      }

      if (fileId) {
        // Sử dụng phương thức thumbnail cho cả xem và thumbnail
        imageUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
        thumbnail = `https://drive.google.com/thumbnail?id=${fileId}&sz=w200`
        driveLink = `https://drive.google.com/file/d/${fileId}/view`

        // URL tải xuống
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
        setDownloadUrl(downloadUrl)
      } else {
        // Nếu không xác định được fileId, sử dụng link gốc
        imageUrl = receiptLink
        thumbnail = receiptLink
      }

      console.log("Image URL:", imageUrl)
      console.log("Google Drive link:", driveLink)
      console.log("File ID:", fileId)
      console.log("Thumbnail:", thumbnail)

      setCurrentImageUrl(imageUrl)
      setGoogleDriveLink(driveLink)
      setThumbnailUrl(thumbnail)
      setIsLoading(true)
      setHasError(false)
      setErrorDetails(null)
      setThumbnailLoaded(false)
      setThumbnailError(false)
    } catch (error) {
      console.error("Error processing receipt link:", error)
      setErrorDetails(`Lỗi xử lý link: ${error.message}`)
      setHasError(true)
      setIsLoading(false)
    }
  }, [receiptLink])

  // Hàm mở ảnh trong tab mới
  const openImageInNewTab = (imageUrl: string) => {
    window.open(imageUrl, "_blank")
  }

  // Hàm sao chép link vào clipboard
  const copyLinkToClipboard = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: "Đã sao chép",
        description: "Đã sao chép link vào clipboard",
      })
    })
  }

  // Hàm tải lại ảnh
  const reloadImage = () => {
    if (imageRef.current) {
      const currentSrc = imageRef.current.src
      imageRef.current.src = "about:blank"
      setTimeout(() => {
        if (imageRef.current) {
          imageRef.current.src = currentSrc
          setIsLoading(true)
          setHasError(false)
        }
      }, 100)
    }
  }

  // Hàm tải xuống ảnh
  const downloadImage = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank")
    } else if (currentImageUrl) {
      // Tạo một thẻ a tạm thời để tải xuống
      const a = document.createElement("a")
      a.href = currentImageUrl
      a.download = `receipt_${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  // Xử lý khi thumbnail tải lỗi
  const handleThumbnailError = () => {
    setThumbnailError(true)
    console.error("Error loading thumbnail:", thumbnailUrl)
  }

  // Xử lý khi thumbnail tải thành công
  const handleThumbnailLoad = () => {
    setThumbnailLoaded(true)
  }

  if (!receiptLink) {
    return <span className="text-muted-foreground">Không có</span>
  }

  const iconSize = size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6"

  return (
    <div className="flex items-center gap-2 justify-center">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full relative"
            title="Xem biên lai"
            onClick={() => setIsDialogOpen(true)}
          >
            {thumbnailUrl && !thumbnailError ? (
              <div className="relative w-6 h-6 overflow-hidden rounded-md">
                <img
                  src={thumbnailUrl || "/placeholder.svg"}
                  alt="Thumbnail"
                  className="object-cover w-full h-full"
                  onError={handleThumbnailError}
                  onLoad={handleThumbnailLoad}
                />
                {!thumbnailLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            ) : (
              <ImageIcon className={iconSize} />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl w-[90vw]">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-lg font-medium">Hình ảnh biên lai</h3>

            {isLoading && (
              <div className="w-full h-64 flex items-center justify-center bg-muted rounded-md">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div>Đang tải ảnh...</div>
                </div>
              </div>
            )}

            {hasError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p>Không thể tải hình ảnh. ID file có thể không tồn tại hoặc bạn không có quyền truy cập.</p>
                  {errorDetails && <p className="text-xs mt-1">{errorDetails}</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={reloadImage}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Tải lại ảnh
                    </Button>
                    {currentImageUrl && (
                      <Button variant="outline" size="sm" onClick={() => copyLinkToClipboard(currentImageUrl)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Sao chép link
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className={`${isLoading ? "hidden" : "block"} max-h-[70vh] overflow-auto w-full`}>
              {currentImageUrl ? (
                <img
                  ref={imageRef}
                  src={currentImageUrl || "/placeholder.svg"}
                  alt="Biên lai"
                  className="max-w-full rounded-md border mx-auto"
                  onLoad={() => {
                    setIsLoading(false)
                    setHasError(false)
                  }}
                  onError={() => {
                    console.error("Error loading image:", currentImageUrl)
                    setIsLoading(false)
                    setHasError(true)
                    setErrorDetails(`Không thể tải ảnh từ URL: ${currentImageUrl}`)
                  }}
                />
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {!hasError && currentImageUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={currentImageUrl} target="_blank" rel="noopener noreferrer">
                    <Maximize2 className="mr-2 h-4 w-4" />
                    Mở ảnh trong tab mới
                  </a>
                </Button>
              )}
              {googleDriveLink && (
                <Button asChild variant="outline" size="sm">
                  <a href={googleDriveLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Mở trong Google Drive
                  </a>
                </Button>
              )}
              {downloadUrl && (
                <Button variant="outline" size="sm" onClick={downloadImage}>
                  <Download className="mr-2 h-4 w-4" />
                  Tải xuống
                </Button>
              )}
              {currentImageUrl && (
                <Button variant="outline" size="sm" onClick={() => copyLinkToClipboard(currentImageUrl)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Sao chép link
                </Button>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
