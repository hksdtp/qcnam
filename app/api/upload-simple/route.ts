import { NextResponse } from "next/server"
import { getAccessToken, getDriveFolderId } from "@/lib/google-service"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

export async function POST(request: Request) {
  console.log("🔍 Bắt đầu quá trình tải lên ảnh biên lai...")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("❌ Không có file trong yêu cầu")
      return NextResponse.json({ success: false, error: "Không có file được cung cấp" }, { status: 400 })
    }

    console.log(`📁 Đã nhận file: ${file.name}, kích thước: ${file.size} bytes, loại: ${file.type}`)

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      console.log(`❌ Loại file không hợp lệ: ${file.type}`)
      return NextResponse.json({ success: false, error: "Chỉ hỗ trợ file ảnh" }, { status: 400 })
    }

    // Tạo tên file duy nhất
    const timestamp = Date.now()
    const uniqueFilename = `receipt_${timestamp}_${file.name.replace(/\s+/g, "_")}`
    console.log(`📝 Đã tạo tên file duy nhất: ${uniqueFilename}`)

    const DRIVE_FOLDER_ID = getDriveFolderId()

    // Chuyển đổi file thành ArrayBuffer và Base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = buffer.toString("base64")
    console.log(`✅ Đã chuyển đổi file thành buffer, kích thước: ${buffer.length} bytes`)

    // Lấy access token từ phương pháp xác thực tùy chỉnh
    const accessToken = await getAccessToken()
    console.log("🔑 Đã lấy access token")

    // Tải lên Google Drive sử dụng fetch API trực tiếp
    console.log("📤 Đang tải file lên Google Drive...")

    // Tạo metadata cho file
    const metadata = {
      name: uniqueFilename,
      parents: [DRIVE_FOLDER_ID],
      mimeType: file.type,
    }

    // Tạo multipart request
    const boundary = "-------314159265358979323846"
    const delimiter = "\r\n--" + boundary + "\r\n"
    const close_delim = "\r\n--" + boundary + "--"

    // Tạo body cho multipart request
    let multipartRequestBody = ""

    // Phần metadata
    multipartRequestBody += delimiter
    multipartRequestBody += "Content-Type: application/json\r\n\r\n"
    multipartRequestBody += JSON.stringify(metadata)

    // Phần nội dung file
    multipartRequestBody += delimiter
    multipartRequestBody += `Content-Type: ${file.type}\r\n`
    multipartRequestBody += "Content-Transfer-Encoding: base64\r\n\r\n"
    multipartRequestBody += base64Data
    multipartRequestBody += close_delim

    // Tải lên file sử dụng fetch API trực tiếp
    const uploadResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,thumbnailLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      },
    )

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error("❌ Lỗi khi tải lên:", uploadResponse.status, errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Lỗi khi tải lên: ${uploadResponse.status}`,
          details: errorText,
        },
        { status: 500 },
      )
    }

    const uploadData = await uploadResponse.json()
    console.log(`✅ Đã tải file lên thành công, ID: ${uploadData.id}`)
    const fileId = uploadData.id

    // Đặt quyền truy cập công khai
    console.log("🔓 Đang cấu hình quyền truy cập công khai...")
    const permissionResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
      }),
    })

    if (!permissionResponse.ok) {
      console.warn("⚠️ Cảnh báo: Không thể đặt quyền công khai:", await permissionResponse.text())
    } else {
      console.log("✅ Đã cấu hình quyền truy cập công khai")
    }

    // Tạo các liên kết xem ảnh
    const proxyLink = `/api/image-proxy/${fileId}`
    const thumbnailLink = uploadData.thumbnailLink || `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
    const directViewLink = `https://drive.google.com/uc?export=view&id=${fileId}`
    const exportViewLink = `https://drive.google.com/uc?export=download&id=${fileId}`

    return NextResponse.json({
      success: true,
      fileId: fileId,
      fileName: uploadData.name,
      mimeType: uploadData.mimeType,
      webViewLink: uploadData.webViewLink,
      directLink: proxyLink,
      thumbnailLink: thumbnailLink,
      directViewLink: directViewLink,
      exportViewLink: exportViewLink,
    })
  } catch (error) {
    console.error("❌ Lỗi khi tải file lên:", error)

    let errorMessage = "Không thể tải file lên"
    let errorDetails = {}

    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = {
        stack: error.stack,
        name: error.name,
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 },
    )
  }
}
