import { NextResponse } from "next/server"
import { initGoogleAPIs, getDriveFolderId } from "@/lib/google-service"
import { randomUUID } from "crypto"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

export async function POST(request: Request) {
  console.log("Bắt đầu quá trình tải lên nhị phân...")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("Không có file trong yêu cầu")
      return NextResponse.json({ success: false, error: "Không có file được cung cấp" }, { status: 400 })
    }

    console.log(`Đã nhận file: ${file.name}, kích thước: ${file.size} bytes, loại: ${file.type}`)

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      console.log(`Loại file không hợp lệ: ${file.type}`)
      return NextResponse.json({ success: false, error: "Chỉ hỗ trợ file ảnh" }, { status: 400 })
    }

    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log(`File quá lớn: ${file.size} bytes`)
      return NextResponse.json({ success: false, error: "Kích thước file vượt quá 5MB" }, { status: 400 })
    }

    const { drive } = await initGoogleAPIs()
    const DRIVE_FOLDER_ID = await getDriveFolderId()

    // Lấy dữ liệu nhị phân của file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Tạo tên file duy nhất với UUID để tránh trùng lặp
    const fileExtension = file.name.split(".").pop() || "jpg"
    const uniqueFilename = `receipt_${Date.now()}_${randomUUID()}.${fileExtension}`
    console.log(`Tạo tên file duy nhất: ${uniqueFilename}`)

    // Tải lên Google Drive sử dụng buffer trực tiếp
    console.log(`Tải lên Google Drive thư mục: ${DRIVE_FOLDER_ID}...`)

    // Tạo metadata cho file
    const fileMetadata = {
      name: uniqueFilename,
      parents: [DRIVE_FOLDER_ID],
      mimeType: file.type,
    }

    // Tải lên file với metadata và dữ liệu nhị phân
    const uploadResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: file.type,
        body: buffer,
      },
      fields: "id,webViewLink,webContentLink",
    })

    console.log(`File đã tải lên thành công, ID: ${uploadResponse.data.id}`)
    const fileId = uploadResponse.data.id

    // Đặt quyền truy cập công khai
    console.log("Đặt quyền truy cập công khai...")
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      fields: "id",
    })
    console.log("Đã cập nhật quyền truy cập công khai cho file")

    // Xác minh file đã tải lên
    console.log("Xác minh file đã tải lên...")
    const verifyResponse = await drive.files.get({
      fileId: fileId,
      fields: "id,name,webViewLink,webContentLink,thumbnailLink,shared",
    })

    console.log("Thông tin file:", JSON.stringify(verifyResponse.data, null, 2))

    // Tạo các URL khác nhau để truy cập file
    const webViewLink = verifyResponse.data.webViewLink
    const webContentLink = verifyResponse.data.webContentLink
    const thumbnailLink = verifyResponse.data.thumbnailLink
    const directViewLink = `https://drive.google.com/uc?export=view&id=${fileId}`
    const proxyLink = `/api/image-proxy/${fileId}`
    const embedLink = `https://drive.google.com/file/d/${fileId}/preview`

    return NextResponse.json({
      success: true,
      fileId: fileId,
      fileName: uniqueFilename,
      mimeType: file.type,
      webViewLink: webViewLink,
      webContentLink: webContentLink,
      thumbnailLink: thumbnailLink,
      directViewLink: directViewLink,
      proxyLink: proxyLink,
      embedLink: embedLink,
    })
  } catch (error) {
    console.error("Lỗi khi tải file lên:", error)

    let errorMessage = "Không thể tải file lên"
    let errorDetails = {}

    if (error.response) {
      errorMessage = `Lỗi API: ${error.response.status}`
      errorDetails = {
        status: error.response.status,
        data: error.response.data,
      }
      console.error("Chi tiết lỗi API:", JSON.stringify(errorDetails, null, 2))
    } else if (error.message) {
      errorMessage = error.message
      console.error("Thông báo lỗi:", error.message)
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
