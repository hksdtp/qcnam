import { NextResponse } from "next/server"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

export async function GET() {
  try {
    // Kiểm tra các biến môi trường
    const envVars = {
      SPREADSHEET_ID: process.env.SPREADSHEET_ID || null,
      DRIVE_FOLDER_ID: process.env.DRIVE_FOLDER_ID || null,
      GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL || null,
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? "Đã cấu hình" : null,
    }

    // Kiểm tra xem có biến môi trường nào bị thiếu không
    const missingVars = Object.entries(envVars)
      .filter(([_, value]) => value === null)
      .map(([key]) => key)

    return NextResponse.json({
      success: missingVars.length === 0,
      configured: Object.fromEntries(Object.entries(envVars).map(([key, value]) => [key, value !== null])),
      missingVars: missingVars,
      envVars: {
        ...envVars,
        GOOGLE_PRIVATE_KEY: envVars.GOOGLE_PRIVATE_KEY ? "[HIDDEN]" : null,
      },
    })
  } catch (error) {
    console.error("Lỗi kiểm tra biến môi trường:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi không xác định",
      },
      { status: 500 },
    )
  }
}
