import { NextResponse } from "next/server"
import { initGoogleAPIs, getSpreadsheetId, getDriveFolderId } from "@/lib/google-service"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

export async function POST(request: Request) {
  console.log("🔍 Bắt đầu quá trình kiểm tra tải lên...")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("❌ Không có file trong yêu cầu")
      return NextResponse.json({ success: false, error: "Không có file được cung cấp" }, { status: 400 })
    }

    console.log(`📁 Đã nhận file: ${file.name}, kích thước: ${file.size} bytes, loại: ${file.type}`)

    // Khởi tạo Google APIs
    const { drive, sheets } = initGoogleAPIs()
    const DRIVE_FOLDER_ID = getDriveFolderId()
    const SPREADSHEET_ID = getSpreadsheetId()
    const SHEET_NAME = "Sheet1"

    // Bước 1: Kiểm tra kết nối Google Drive API
    console.log("Bước 1: Kiểm tra kết nối Google Drive API...")
    try {
      const aboutResponse = await drive.about.get({
        fields: "user,storageQuota",
      })
      console.log("✅ Kết nối Google Drive API thành công")
      console.log(`👤 Người dùng: ${aboutResponse.data.user?.displayName}`)
    } catch (error) {
      console.error("❌ Kết nối Google Drive API thất bại:", error)
      return NextResponse.json(
        {
          success: false,
          step: "drive_connection",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Bước 2: Kiểm tra kết nối Google Sheets API
    console.log("Bước 2: Kiểm tra kết nối Google Sheets API...")
    try {
      const sheetResponse = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      })
      console.log("✅ Kết nối Google Sheets API thành công")
      console.log(`📊 Tiêu đề bảng tính: ${sheetResponse.data.properties?.title}`)
    } catch (error) {
      console.error("❌ Kết nối Google Sheets API thất bại:", error)
      return NextResponse.json(
        {
          success: false,
          step: "sheets_connection",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Bước 3: Kiểm tra quyền truy cập thư mục Drive
    console.log("Bước 3: Kiểm tra quyền truy cập thư mục Drive...")
    try {
      const folderResponse = await drive.files.get({
        fileId: DRIVE_FOLDER_ID,
        fields: "id,name,capabilities",
      })
      console.log("✅ Truy cập thư mục Drive thành công")
      console.log(`📁 Tên thư mục: ${folderResponse.data.name}`)
      console.log(`🔑 Có thể chỉnh sửa: ${folderResponse.data.capabilities?.canEdit}`)
    } catch (error) {
      console.error("❌ Truy cập thư mục Drive thất bại:", error)
      return NextResponse.json(
        {
          success: false,
          step: "folder_access",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Bước 4: Chuyển đổi file thành buffer và base64
    console.log("Bước 4: Chuyển đổi file thành buffer và base64...")
    let fileBuffer: Buffer
    let base64Data: string
    try {
      const arrayBuffer = await file.arrayBuffer()
      fileBuffer = Buffer.from(arrayBuffer)
      base64Data = fileBuffer.toString("base64")
      console.log(`✅ Đã chuyển đổi file thành buffer, kích thước: ${fileBuffer.length} bytes`)
    } catch (error) {
      console.error("❌ Chuyển đổi file thất bại:", error)
      return NextResponse.json(
        {
          success: false,
          step: "file_conversion",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Bước 5: Tải lên Google Drive
    console.log("Bước 5: Đang tải lên Google Drive...")
    let fileId: string
    let webViewLink: string
    try {
      // Giữ nguyên tên file gốc nhưng thêm tiền tố để dễ nhận biết
      const originalFileName = file.name
      const uniqueFilename = `test_${Date.now()}_${originalFileName}`

      // Sử dụng phương pháp tải lên với base64 string
      const response = await drive.files.create({
        requestBody: {
          name: uniqueFilename,
          parents: [DRIVE_FOLDER_ID],
          mimeType: file.type,
        },
        media: {
          mimeType: file.type,
          body: base64Data, // Sử dụng base64 string thay vì buffer
        },
        fields: "id,webViewLink,webContentLink",
      })

      fileId = response.data.id
      webViewLink = response.data.webViewLink
      console.log(`✅ Đã tải file lên thành công, ID: ${fileId}`)
      console.log(`🔗 Link xem web: ${webViewLink}`)
    } catch (error) {
      console.error("❌ Tải file lên thất bại:", error)
      console.error("Chi tiết lỗi:", error.message)
      return NextResponse.json(
        {
          success: false,
          step: "file_upload",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Bước 6: Đặt quyền truy cập file
    console.log("Bước 6: Đặt quyền truy cập file...")
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
        fields: "id",
      })
      console.log("✅ Đặt quyền truy cập file thành công")
    } catch (error) {
      console.error("❌ Đặt quyền truy cập file thất bại:", error)
      return NextResponse.json(
        {
          success: false,
          step: "set_permissions",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Bước 7: Xác minh khả năng truy cập file
    console.log("Bước 7: Xác minh khả năng truy cập file...")
    try {
      const verifyResponse = await drive.files.get({
        fileId: fileId,
        fields: "id,name,webViewLink,shared,thumbnailLink",
      })
      console.log("✅ Xác minh file thành công")
      console.log(`🔒 File đã được chia sẻ: ${verifyResponse.data.shared}`)
      console.log(`🖼️ Thumbnail link: ${verifyResponse.data.thumbnailLink || "Không có"}`)
    } catch (error) {
      console.error("❌ Xác minh file thất bại:", error)
      return NextResponse.json(
        {
          success: false,
          step: "verify_file",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Bước 8: Thêm mục thử nghiệm vào Google Sheets
    console.log("Bước 8: Thêm mục thử nghiệm vào Google Sheets...")
    try {
      const today = new Date().toISOString().split("T")[0]
      // Sử dụng định dạng link thumbnail để xem trực tiếp
      const directLink = `/api/image-proxy/${fileId}`

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:G`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: [[today, "Test", "Test Upload", "1000", "expense", directLink, new Date().toISOString()]],
        },
      })
      console.log("✅ Đã thêm mục thử nghiệm vào Google Sheets")
    } catch (error) {
      console.error("❌ Thêm mục thử nghiệm thất bại:", error)
      return NextResponse.json(
        {
          success: false,
          step: "add_sheet_entry",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Tạo các link trực tiếp với các định dạng khác nhau để tương thích tốt hơn
    const proxyLink = `/api/image-proxy/${fileId}`
    const thumbnailLink = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
    const directViewLink = `https://drive.google.com/uc?export=view&id=${fileId}`

    return NextResponse.json({
      success: true,
      fileId: fileId,
      webViewLink: webViewLink,
      directLink: proxyLink,
      // Giữ các link khác để tham khảo
      thumbnailLink: thumbnailLink,
      altDirectLink: directViewLink,
      message: "Tất cả các bước kiểm tra đã thành công!",
    })
  } catch (error) {
    console.error("❌ Lỗi không mong đợi:", error)

    return NextResponse.json(
      {
        success: false,
        step: "unexpected",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
