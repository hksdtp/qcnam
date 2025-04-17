"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, ImageIcon, Maximize2, AlertCircle, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DirectReceiptViewerProps {
  receiptLink: string | null
  size?: "sm" | "md" | "lg"
}

export function DirectReceiptViewer({ receiptLink, size = "md" }: DirectReceiptViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [fileId, setFileId] = useState<string | null>(null)

  useEffect(() => {
    if (!receiptLink) return

    // Extract file ID from various Google Drive URL formats
    let extractedFileId = null

    if (receiptLink.includes("drive.google.com/file/d/")) {
      extractedFileId = receiptLink.split("/file/d/")[1].split("/")[0]
    } else if (receiptLink.includes("id=")) {
      extractedFileId = receiptLink.split("id=")[1]?.split("&")[0]
    } else if (receiptLink.startsWith("/api/image-proxy/")) {
      extractedFileId = receiptLink.split("/api/image-proxy/")[1]
    } else if (receiptLink.startsWith("receipt_")) {
      // Đây là đường dẫn tương đối, không thể sử dụng trực tiếp
      console.warn("Đường dẫn ảnh không hợp lệ:", receiptLink)
      // Không có fileId để sử dụng
    }

    setFileId(extractedFileId)
  }, [receiptLink])

  if (!receiptLink) {
    return <span className="text-muted-foreground">Không có</span>
  }

  const iconSize = size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6"
  const embedUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null

  return (
    <div className="flex items-center gap-2 justify-center">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full" title="Xem biên lai">
            <ImageIcon className={iconSize} />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl w-[90vw]">
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-lg font-medium">Hình ảnh biên lai</h3>

            {embedUrl ? (
              <div className="w-full h-[60vh]">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  allow="autoplay"
                  className="border-0 rounded-md"
                ></iframe>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Không thể tạo link nhúng cho file này.</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-2">
              {fileId && (
                <>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`https://drive.google.com/file/d/${fileId}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Mở trong Google Drive
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`https://drive.google.com/uc?export=download&id=${fileId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Tải xuống
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hiển thị biểu tượng xem nhanh bên ngoài */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          setIsOpen(true)
        }}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        title="Xem nhanh biên lai"
      >
        <Maximize2 className={iconSize} />
      </a>
    </div>
  )
}
