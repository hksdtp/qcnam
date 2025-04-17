import { type NextRequest, NextResponse } from "next/server"
import { initGoogleAPIs, getDriveFolderId } from "@/lib/google-service"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Only image files are supported" }, { status: 400 })
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    const { drive } = initGoogleAPIs()
    const DRIVE_FOLDER_ID = getDriveFolderId()

    // Convert file to buffer and base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = buffer.toString("base64")

    // Generate unique filename
    const uniqueFilename = `receipt_${Date.now()}_${randomUUID()}.${file.name.split(".").pop() || "jpg"}`

    // Upload to Google Drive
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
      fields: "id,webViewLink",
    })

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    })

    return NextResponse.json({
      success: true,
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
    })
  } catch (error) {
    console.error("Error uploading file:", error)

    let errorMessage = "Failed to upload file"
    if (error.response) {
      errorMessage = `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
