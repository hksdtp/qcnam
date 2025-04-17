import { NextResponse } from "next/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const fileId = params.id

  if (!fileId) {
    console.error("No file ID provided")
    return new NextResponse("File ID is required", { status: 400 })
  }

  console.log("Getting image with ID:", fileId)

  try {
    // Lấy thông tin từ biến môi trường
    const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || ""
    const GOOGLE_PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n")

    // Tạo JWT client mới cho mỗi request
    console.log("Creating new JWT client for image proxy")
    const auth = new JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/drive"],
    })

    // Khởi tạo Google Drive API
    const drive = google.drive({ version: "v3", auth })

    // Kiểm tra xem file có tồn tại không
    try {
      console.log("Checking if file exists")
      const fileInfo = await drive.files.get({
        fileId: fileId,
        fields: "id,name,mimeType,size",
      })
      console.log("File info:", fileInfo.data)
    } catch (fileInfoError) {
      console.error("Error getting file info:", fileInfoError.message)

      // Thử chuyển hướng đến URL trực tiếp của Google Drive
      console.log("Redirecting to direct Google Drive URL")
      return NextResponse.redirect(`https://drive.google.com/uc?export=view&id=${fileId}`)
    }

    // Lấy nội dung file
    console.log("Fetching file content")
    try {
      const response = await drive.files.get(
        {
          fileId: fileId,
          alt: "media",
        },
        {
          responseType: "arraybuffer",
        },
      )

      const buffer = Buffer.from(response.data as ArrayBuffer)
      console.log("Got file content, size:", buffer.length, "bytes")

      // Lấy thông tin MIME type
      const fileInfo = await drive.files.get({
        fileId: fileId,
        fields: "mimeType",
      })

      // Trả về ảnh với content type phù hợp và cache control
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": fileInfo.data.mimeType || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      })
    } catch (contentError) {
      console.error("Error fetching file content:", contentError.message)

      // Thử chuyển hướng đến URL trực tiếp của Google Drive
      console.log("Redirecting to direct Google Drive URL after content error")
      return NextResponse.redirect(`https://drive.google.com/uc?export=view&id=${fileId}`)
    }
  } catch (error) {
    console.error("Error getting image:", error.message)

    // Thử phương pháp chuyển hướng nếu không lấy được trực tiếp
    try {
      const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`
      console.log("Redirecting to direct Google URL:", directUrl)
      return NextResponse.redirect(directUrl)
    } catch (redirectError) {
      console.error("Error redirecting:", redirectError.message)
    }

    return new NextResponse(`Server error getting image: ${error.message}`, { status: 500 })
  }
}
