"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CreateSheet1Button() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)
  const { toast } = useToast()

  const handleCreateSheet1 = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/create-sheet1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      setResult(data)

      if (data.success) {
        toast({
          title: "Thành công",
          description: data.message || "Đã tạo Sheet1 thành công",
        })
      } else {
        toast({
          title: "Lỗi",
          description: data.error || "Lỗi không xác định khi tạo Sheet1",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error)
      setResult({
        success: false,
        error: error.message || "Lỗi không xác định khi gọi API",
      })

      toast({
        title: "Lỗi",
        description: "Lỗi khi kết nối đến server",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleCreateSheet1} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tạo...
          </>
        ) : (
          "Tạo Sheet1"
        )}
      </Button>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
