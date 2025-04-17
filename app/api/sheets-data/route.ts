import { NextResponse } from "next/server"
import { initGoogleAPIs } from "@/lib/google-service"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

export async function GET() {
  console.log("Fetching Google Sheets data...")

  try {
    const { sheets } = initGoogleAPIs()
    const SPREADSHEET_ID = "1PymuTjpxz35dIG8Ekn4DS2LtOg1D71M2W7cbyeHLdUM"
    const SHEET_NAME = "Transactions"

    // Fetch all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:G`,
    })

    const rows = response.data.values || []
    console.log(`Found ${rows.length} rows in the sheet`)

    return NextResponse.json({
      success: true,
      rows: rows,
    })
  } catch (error) {
    console.error("Error fetching sheets data:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
