import { NextResponse } from "next/server"
import { initGoogleAPIs, getDriveFolderId } from "@/lib/google-service"

export async function GET() {
  const { drive } = initGoogleAPIs()
  const DRIVE_FOLDER_ID = getDriveFolderId()

  try {
    // Try to get folder details
    const folderResponse = await drive.files.get({
      fileId: DRIVE_FOLDER_ID,
      fields: "id,name,capabilities",
    })

    // Check permissions on the folder
    const permissionsResponse = await drive.permissions.list({
      fileId: DRIVE_FOLDER_ID,
      fields: "permissions(id,type,role,emailAddress)",
    })

    // Try to create a small test file
    const testFileResponse = await drive.files.create({
      requestBody: {
        name: "test-file.txt",
        parents: [DRIVE_FOLDER_ID],
        mimeType: "text/plain",
      },
      media: {
        mimeType: "text/plain",
        body: "This is a test file to check write permissions.",
      },
      fields: "id",
    })

    // Clean up the test file
    await drive.files.delete({
      fileId: testFileResponse.data.id,
    })

    return NextResponse.json({
      success: true,
      folder: folderResponse.data,
      permissions: permissionsResponse.data.permissions,
      message: "Drive folder is accessible and writable",
    })
  } catch (error) {
    console.error("Error checking Drive folder:", error)

    let errorDetails = "Unknown error"
    if (error.response) {
      errorDetails = `Status: ${error.response.status}, Message: ${JSON.stringify(error.response.data)}`
    } else if (error.message) {
      errorDetails = error.message
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to access Drive folder",
        details: errorDetails,
      },
      { status: 500 },
    )
  }
}
