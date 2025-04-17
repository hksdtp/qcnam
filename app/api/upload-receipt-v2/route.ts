import { NextResponse } from "next/server"
import { getDriveFolderId } from "@/lib/google-service"
import { google } from "googleapis"
import { JWT } from "google-auth-library"
import { randomUUID } from "crypto"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

// Định nghĩa các loại file được phép
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  console.log("API: upload-receipt-v2 started")

  try {
    // Log thông tin request
    console.log("Receipt upload started", {
      contentType: request.headers.get("content-type"),
      contentLength: request.headers.get("content-length"),
    })

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("No file provided in request")
      return NextResponse.json(
        {
          success: false,
          error: "Không có file được cung cấp",
        },
        { status: 400 },
      )
    }

    console.log(`Received file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)

    // Kiểm tra loại file
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      console.error(`Invalid file type: ${file.type}`)
      return NextResponse.json(
        {
          success: false,
          error: "Định dạng file không được hỗ trợ. Vui lòng sử dụng JPEG, PNG hoặc PDF.",
        },
        { status: 400 },
      )
    }

    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > MAX_FILE_SIZE) {
      console.error(`File too large: ${file.size} bytes`)
      return NextResponse.json(
        {
          success: false,
          error: "Kích thước file vượt quá 5MB",
        },
        { status: 400 },
      )
    }

    // Lấy thông tin từ biến môi trường
    const DRIVE_FOLDER_ID = getDriveFolderId()
    const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || ""
    const GOOGLE_PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n")

    console.log(`Using Drive folder ID: ${DRIVE_FOLDER_ID}`)

    // Tạo JWT client mới cho mỗi request
    console.log("Creating new JWT client")
    const auth = new JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/drive"],
    })

    // Khởi tạo Google Drive API
    console.log("Initializing Google Drive API")
    const drive = google.drive({ version: "v3", auth })

    // Chuyển file thành ArrayBuffer và Buffer
    console.log("Converting file to buffer")
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log(`Converted file to buffer, size: ${buffer.length} bytes`)

    // Xử lý file theo loại
    console.log(`Processing file of type: ${file.type}`)

    // Tạo tên file duy nhất với UUID
    const fileExtension =
      file.name.split(".").pop() ||
      (file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/png"
          ? "png"
          : file.type === "application/pdf"
            ? "pdf"
            : "bin")

    const uniqueFilename = `receipt_${Date.now()}_${randomUUID()}.${fileExtension}`
    console.log(`Generated unique filename: ${uniqueFilename}`)

    // Tạo metadata cho file
    const fileMetadata = {
      name: uniqueFilename,
      parents: [DRIVE_FOLDER_ID],
      mimeType: file.type,
    }

    // Tải lên file với metadata và dữ liệu nhị phân
    console.log("Uploading to Google Drive using direct buffer...")
    try {
      const uploadResponse = await drive.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType: file.type,
          body: buffer, // Sử dụng buffer trực tiếp thay vì base64
        },
        fields: "id,webViewLink,webContentLink",
      })

      console.log(`File uploaded successfully, ID: ${uploadResponse.data.id}`)
      const fileId = uploadResponse.data.id

      // Đặt quyền truy cập công khai
      console.log("Setting file permissions to public...")
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
        fields: "id",
      })
      console.log("File permissions updated to be publicly accessible")

      // Kiểm tra lại quyền truy cập
      const permissionsResponse = await drive.permissions.list({
        fileId: fileId,
        fields: "permissions(id,type,role)",
      })
      console.log("Current permissions:", JSON.stringify(permissionsResponse.data.permissions))

      // Tạo các URL khác nhau để truy cập ảnh
      const webViewLink = uploadResponse.data.webViewLink // Link xem trong Google Drive
      const webContentLink = uploadResponse.data.webContentLink // Link tải xuống
      const directViewLink = `https://drive.google.com/uc?export=view&id=${fileId}` // Link trực tiếp để xem ảnh
      const thumbnailLink = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000` // Link thumbnail
      const proxyLink = `/api/image-proxy/${fileId}` // Link qua proxy của ứng dụng

      console.log("Generated links:", {
        webViewLink,
        webContentLink,
        directViewLink,
        thumbnailLink,
        proxyLink,
      })

      return NextResponse.json({
        success: true,
        fileId: fileId,
        webViewLink: webViewLink,
        webContentLink: webContentLink,
        directViewLink: directViewLink,
        thumbnailLink: thumbnailLink,
        proxyLink: proxyLink,
      })
    } catch (uploadError) {
      console.error("Error during file upload to Google Drive:", uploadError)
      console.error("Error details:", uploadError.response?.data || uploadError.message)
      throw uploadError
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    console.error("Error stack:", error.stack)
    console.error("Error details:", error.response?.data || error.message)

    // Trả về thông báo lỗi thân thiện với người dùng
    return NextResponse.json(
      {
        success: false,
        error: "Lỗi xử lý hóa đơn. Vui lòng thử lại.",
        technicalDetails: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
