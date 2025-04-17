import { NextResponse } from "next/server"
import { initGoogleAPIs, getSpreadsheetId, getDriveFolderId } from "@/lib/google-service"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

export async function GET() {
  try {
    // Kiểm tra cấu hình hiện tại
    const currentConfig = {
      spreadsheetId: getSpreadsheetId(),
      driveFolderId: getDriveFolderId(),
    }

    // Kiểm tra biến môi trường
    const envConfig = {
      spreadsheetId: process.env.SPREADSHEET_ID,
      driveFolderId: process.env.DRIVE_FOLDER_ID,
      clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
      privateKey: process.env.GOOGLE_PRIVATE_KEY ? "Đã cấu hình" : undefined,
    }

    // Kiểm tra kết nối Google APIs
    const { auth, sheets, drive } = initGoogleAPIs()

    // Kiểm tra token
    const token = await auth.getAccessToken()
    const authSuccess = !!token
    const authDetails = token ? "Token hợp lệ" : "Không lấy được token"

    // Kiểm tra kết nối Google Sheets
    let sheetSuccess = false
    let sheetError = null
    let sheetDetails = null
    try {
      const SPREADSHEET_ID = getSpreadsheetId()
      const sheetResponse = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      })

      sheetSuccess = true
      sheetDetails = {
        title: sheetResponse.data.properties?.title,
        sheets: sheetResponse.data.sheets?.map((s: any) => s.properties.title),
        spreadsheetId: sheetResponse.data.spreadsheetId,
      }
    } catch (error) {
      sheetError = error.message || "Lỗi không xác định"
      sheetDetails = error.response?.data || null
    }

    // Kiểm tra kết nối Google Drive
    let driveSuccess = false
    let driveError = null
    let driveDetails = null
    try {
      const DRIVE_FOLDER_ID = getDriveFolderId()
      const driveResponse = await drive.files.get({
        fileId: DRIVE_FOLDER_ID,
        fields: "id,name,mimeType,capabilities",
      })

      driveSuccess = true
      driveDetails = {
        name: driveResponse.data.name,
        mimeType: driveResponse.data.mimeType,
        capabilities: driveResponse.data.capabilities,
      }
    } catch (error) {
      driveError = error.message || "Lỗi không xác định"
      driveDetails = error.response?.data || null
    }

    return NextResponse.json({
      authSuccess,
      authError: authSuccess ? null : "Lỗi xác thực",
      sheetSuccess,
      sheetError,
      sheetTitle: sheetDetails?.title || null,
      driveSuccess,
      driveError,
      folderName: driveDetails?.name || null,
      details: {
        token: authDetails,
        spreadsheet: sheetDetails,
        folder: driveDetails,
      },
    })
  } catch (error) {
    console.error("Lỗi kiểm tra kết nối:", error)
    return NextResponse.json({
      authSuccess: false,
      authError: error.message || "Lỗi không xác định",
      details: {
        error: error.message,
        stack: error.stack,
      },
    })
  }
}
