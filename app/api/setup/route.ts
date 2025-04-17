import { NextResponse } from "next/server"
import {
  initGoogleAPIs,
  ensureSpreadsheetSetup,
  ensureDriveFolderSetup,
  getSpreadsheetId,
  getDriveFolderId,
} from "@/lib/google-service"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

export async function GET() {
  console.log("Bắt đầu kiểm tra thiết lập Google APIs...")

  try {
    // Kiểm tra kết nối cơ bản trước
    console.log("Kiểm tra kết nối cơ bản...")
    const { sheets, drive } = initGoogleAPIs()

    // Kiểm tra kết nối với Google Sheets
    console.log("Kiểm tra kết nối với Google Sheets...")
    const SPREADSHEET_ID = getSpreadsheetId()
    try {
      const sheetResponse = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      })
      console.log("Kết nối Google Sheets thành công:", sheetResponse.data.properties?.title)
    } catch (sheetError) {
      console.error("Lỗi kết nối Google Sheets:", sheetError)
      return NextResponse.json(
        {
          success: false,
          error: "Không thể kết nối với Google Sheets",
          details: {
            message: sheetError.message,
            code: sheetError.code,
            status: sheetError.response?.status,
            statusText: sheetError.response?.statusText,
            data: sheetError.response?.data,
          },
        },
        { status: 500 },
      )
    }

    // Kiểm tra kết nối với Google Drive
    console.log("Kiểm tra kết nối với Google Drive...")
    const DRIVE_FOLDER_ID = getDriveFolderId()
    try {
      const driveResponse = await drive.files.get({
        fileId: DRIVE_FOLDER_ID,
        fields: "id,name",
      })
      console.log("Kết nối Google Drive thành công:", driveResponse.data.name)
    } catch (driveError) {
      console.error("Lỗi kết nối Google Drive:", driveError)
      return NextResponse.json(
        {
          success: false,
          error: "Không thể kết nối với Google Drive",
          details: {
            message: driveError.message,
            code: driveError.code,
            status: driveError.response?.status,
            statusText: driveError.response?.statusText,
            data: driveError.response?.data,
          },
        },
        { status: 500 },
      )
    }

    // Nếu các kiểm tra cơ bản thành công, tiếp tục với thiết lập đầy đủ
    console.log("Đảm bảo thiết lập Google Sheets...")
    await ensureSpreadsheetSetup()

    console.log("Đảm bảo thiết lập Google Drive...")
    await ensureDriveFolderSetup()

    return NextResponse.json({
      success: true,
      spreadsheetId: getSpreadsheetId(),
      folderId: getDriveFolderId(),
    })
  } catch (error) {
    console.error("Lỗi kiểm tra Google services:", error)

    // Xử lý lỗi chi tiết
    let errorMessage = "Không thể kết nối với Google APIs"
    let errorDetails = {}

    if (error.response) {
      errorMessage = `Lỗi API: ${error.response.status} - ${error.response.statusText}`
      errorDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      }
    } else if (error.message) {
      errorMessage = error.message
      errorDetails = {
        stack: error.stack,
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
