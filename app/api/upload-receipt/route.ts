import { NextResponse } from "next/server"
import { getDriveFolderId, initGoogleAPIs } from "@/lib/google-service"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

export async function POST(request: Request) {
  console.log("API: upload-receipt started")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("No file provided in request")
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    console.log(`Received file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      console.error(`Invalid file type: ${file.type}`)
      return NextResponse.json({ success: false, error: "Only image files are supported" }, { status: 400 })
    }

    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error(`File too large: ${file.size} bytes`)
      return NextResponse.json({ success: false, error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Khởi tạo Google APIs trực tiếp để đảm bảo auth được tạo mới
    const { drive } = await initGoogleAPIs()
    const DRIVE_FOLDER_ID = await getDriveFolderId()
    console.log(`Using Drive folder ID: ${DRIVE_FOLDER_ID}`)

    // Chuyển file thành ArrayBuffer và Base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log(`Converted file to buffer, size: ${buffer.length} bytes`)

    // Tạo tên file duy nhất
    const uniqueFilename = `receipt_${Date.now()}_${file.name.replace(/\s+/g, "_")}`
    console.log(`Generated unique filename: ${uniqueFilename}`)

    // Sử dụng drive API trực tiếp thay vì fetch
    console.log("Uploading to Google Drive using drive API...")

    try {
      // Tải lên file sử dụng buffer trực tiếp
      const uploadResponse = await drive.files.create({
        requestBody: {
          name: uniqueFilename,
          parents: [DRIVE_FOLDER_ID],
          mimeType: file.type,
        },
        media: {
          mimeType: file.type,
          body: buffer, // Sử dụng buffer trực tiếp thay vì base64
        },
        fields: "id,webViewLink,webContentLink",
      })

      console.log(`File uploaded successfully, ID: ${uploadResponse.data.id}`)
      const fileId = uploadResponse.data.id

      // Đặt quyền truy cập công khai với quyền cao nhất
      console.log("Setting file permissions to public with maximum access...")
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
        fields: "id",
      })

      // Thêm quyền truy cập cho domain cụ thể nếu cần
      try {
        await drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: "reader",
            type: "domain",
            domain: "gmail.com", // Thay đổi thành domain của bạn nếu cần
          },
        })
        console.log("Added domain-specific permission")
      } catch (domainError) {
        console.warn("Could not add domain permission:", domainError.message)
      }

      console.log("File permissions updated to be publicly accessible")

      // Kiểm tra lại quyền truy cập
      const permissionsResponse = await drive.permissions.list({
        fileId: fileId,
        fields: "permissions(id,type,role,emailAddress,domain)",
      })
      console.log("Current permissions:", permissionsResponse.data.permissions)

      // Tạo các link khác nhau để truy cập ảnh
      const webViewLink = uploadResponse.data.webViewLink // Link xem trong Google Drive
      const webContentLink = uploadResponse.data.webContentLink // Link tải xuống
      const directViewLink = `https://drive.google.com/uc?export=view&id=${fileId}` // Link trực tiếp để xem ảnh
      const thumbnailLink = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000` // Link thumbnail
      const proxyLink = `/api/image-proxy/${fileId}` // Link qua proxy của ứng dụng
      const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}` // Link tải xuống trực tiếp

      console.log(`Generated links:
        - Web View: ${webViewLink}
        - Web Content: ${webContentLink}
        - Direct View: ${directViewLink}
        - Thumbnail: ${thumbnailLink}
        - Proxy: ${proxyLink}
        - Download: ${downloadLink}
      `)

      return NextResponse.json({
        success: true,
        fileId: fileId,
        webViewLink: webViewLink,
        webContentLink: webContentLink,
        directViewLink: directViewLink,
        thumbnailLink: thumbnailLink,
        proxyLink: proxyLink,
        downloadLink: downloadLink,
      })
    } catch (driveError) {
      console.error("Error using drive API:", driveError)
      throw driveError // Ném lỗi để xử lý ở catch bên ngoài
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    console.error("Error details:", error.response?.data || error.message)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        details: error.stack || "No stack trace available",
      },
      { status: 500 },
    )
  }
}
