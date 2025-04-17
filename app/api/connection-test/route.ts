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
    const { sheets, drive } = initGoogleAPIs()

    // Kiểm tra kết nối Google Sheets
    let sheetsConnection = { success: false, error: null, details: null }
    try {
      const sheetResponse = await sheets.spreadsheets.get({
        spreadsheetId: currentConfig.spreadsheetId,
      })

      sheetsConnection = {
        success: true,
        error: null,
        details: {
          title: sheetResponse.data.properties?.title,
          sheets: sheetResponse.data.sheets?.map((s: any) => s.properties.title),
          spreadsheetId: sheetResponse.data.spreadsheetId,
        },
      }
    } catch (error) {
      sheetsConnection = {
        success: false,
        error: error.message || "Lỗi không xác định",
        details: error.response?.data || null,
      }
    }

    // Kiểm tra kết nối Google Drive
    let driveConnection = { success: false, error: null, details: null }
    try {
      const driveResponse = await drive.files.get({
        fileId: currentConfig.driveFolderId,
        fields: "id,name,mimeType,capabilities",
      })

      driveConnection = {
        success: true,
        error: null,
        details: {
          name: driveResponse.data.name,
          mimeType: driveResponse.data.mimeType,
          capabilities: driveResponse.data.capabilities,
        },
      }
    } catch (error) {
      driveConnection = {
        success: false,
        error: error.message || "Lỗi không xác định",
        details: error.response?.data || null,
      }
    }

    return NextResponse.json({
      success: sheetsConnection.success && driveConnection.success,
      currentConfig,
      envConfig,
      sheetsConnection,
      driveConnection,
    })
  } catch (error) {
    console.error("Lỗi kiểm tra kết nối:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi không xác định",
      },
      { status: 500 },
    )
  }
}
