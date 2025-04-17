import { NextResponse } from "next/server"
import { initGoogleAPIs, getDriveFolderId } from "@/lib/google-service"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { fileName, mimeType, base64Data } = body

    if (!fileName || !base64Data) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: fileName and base64Data",
        },
        { status: 400 },
      )
    }

    console.log(`Processing upload for ${fileName}, mime type: ${mimeType || "application/octet-stream"}`)

    // Remove the data URL prefix if present
    const base64Content = base64Data.includes("base64,") ? base64Data.split("base64,")[1] : base64Data

    // Initialize Google Drive API
    const { drive } = initGoogleAPIs()
    const DRIVE_FOLDER_ID = getDriveFolderId()

    // Upload to Google Drive
    console.log(`Uploading to Google Drive folder: ${DRIVE_FOLDER_ID}`)
    const response = await drive.files.create({
      requestBody: {
        name: `receipt_${Date.now()}_${fileName}`,
        parents: [DRIVE_FOLDER_ID],
        mimeType: mimeType || "application/octet-stream",
      },
      media: {
        mimeType: mimeType || "application/octet-stream",
        body: base64Content, // Sử dụng base64 string trực tiếp
      },
      fields: "id,webViewLink",
    })

    console.log(`File uploaded successfully, ID: ${response.data.id}`)

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    })

    console.log("File permissions updated to be publicly accessible")

    return NextResponse.json({
      success: true,
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
    })
  } catch (error) {
    console.error("Error in base64 upload:", error)

    let errorMessage = "Failed to upload file"
    let errorDetails = {}

    if (error.response) {
      errorMessage = `API Error: ${error.response.status}`
      errorDetails = error.response.data
    } else if (error.message) {
      errorMessage = error.message
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
