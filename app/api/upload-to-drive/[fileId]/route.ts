import { type NextRequest, NextResponse } from "next/server"
import { initGoogleAPIs } from "@/lib/google-service"
import { Readable } from "stream"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Hàm chuyển đổi ReadableStream thành Node.js Readable
async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  return Buffer.concat(chunks)
}

export async function PUT(request: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    const fileId = params.fileId
    if (!fileId) {
      return NextResponse.json({ success: false, error: "Thiếu ID file" }, { status: 400 })
    }

    // Lấy content-type từ request
    const contentType = request.headers.get("content-type") || "application/octet-stream"

    // Chuyển đổi request body thành buffer
    const buffer = await streamToBuffer(request.body as ReadableStream)

    // Khởi tạo Google APIs
    const { drive } = await initGoogleAPIs()

    // Tạo một Readable stream từ buffer
    const readable = new Readable()
    readable.push(buffer)
    readable.push(null) // Đánh dấu kết thúc stream

    // Cập nhật nội dung file trong Google Drive
    await drive.files.update({
      fileId: fileId,
      media: {
        mimeType: contentType,
        body: readable,
      },
      supportsAllDrives: true,
    })

    // Thiết lập quyền truy cập cho file (ai có link đều có thể xem)
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      supportsAllDrives: true,
    })

    // Lấy thông tin chi tiết về file
    const fileInfo = await drive.files.get({
      fileId: fileId,
      fields: "id,name,mimeType,webViewLink,thumbnailLink",
      supportsAllDrives: true,
    })

    // Tạo direct view link
    const directViewLink = `https://drive.google.com/uc?export=view&id=${fileId}`

    // Tạo proxy link để tránh CORS
    const proxyLink = `/api/image-proxy/${fileId}`

    return NextResponse.json({
      success: true,
      fileId: fileId,
      name: fileInfo.data.name,
      mimeType: fileInfo.data.mimeType,
      webViewLink: fileInfo.data.webViewLink,
      thumbnailLink: fileInfo.data.thumbnailLink,
      directViewLink: directViewLink,
      proxyLink: proxyLink,
    })
  } catch (error) {
    console.error("Error uploading to Drive:", error)
    return NextResponse.json({ success: false, error: "Lỗi khi tải lên file", details: error.message }, { status: 500 })
  }
}
