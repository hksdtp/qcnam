import { NextResponse } from "next/server"
import { initGoogleAPIs, getDriveFolderId } from "@/lib/google-service"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

export async function GET() {
  console.log("Fetching Google Drive files...")

  try {
    const { drive } = initGoogleAPIs()
    const DRIVE_FOLDER_ID = getDriveFolderId()

    // Fetch files from the folder
    const response = await drive.files.list({
      q: `'${DRIVE_FOLDER_ID}' in parents`,
      fields: "files(id,name,mimeType,webViewLink,createdTime,size)",
      orderBy: "createdTime desc",
    })

    const files = response.data.files || []
    console.log(`Found ${files.length} files in the folder`)

    return NextResponse.json({
      success: true,
      files: files,
    })
  } catch (error) {
    console.error("Error fetching drive files:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
