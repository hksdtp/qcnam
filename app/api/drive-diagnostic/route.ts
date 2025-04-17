import { NextResponse } from "next/server"
import { initGoogleAPIs, getDriveFolderId } from "@/lib/google-service"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

export async function GET() {
  try {
    const { drive } = await initGoogleAPIs()
    const DRIVE_FOLDER_ID = await getDriveFolderId()

    // Step 1: Check if we can authenticate with Google Drive
    console.log("Step 1: Testing Google Drive authentication...")
    const aboutResponse = await drive.about.get({
      fields: "user,storageQuota",
    })

    // Step 2: Check if we can access the folder
    console.log("Step 2: Testing folder access...")
    const folderResponse = await drive.files.get({
      fileId: DRIVE_FOLDER_ID,
      fields: "id,name,capabilities,permissions",
    })

    // Step 3: Check if we can list files in the folder
    console.log("Step 3: Testing folder listing...")
    const filesResponse = await drive.files.list({
      q: `'${DRIVE_FOLDER_ID}' in parents`,
      fields: "files(id,name,mimeType)",
      pageSize: 10,
    })

    // Step 4: Try to create a tiny test file
    console.log("Step 4: Testing file creation...")
    const testContent = "Test file - " + new Date().toISOString()
    const testFileResponse = await drive.files.create({
      requestBody: {
        name: `test-file-${Date.now()}.txt`,
        parents: [DRIVE_FOLDER_ID],
        mimeType: "text/plain",
      },
      media: {
        mimeType: "text/plain",
        body: testContent,
      },
      fields: "id,webViewLink",
    })

    // Step 5: Make the test file public
    console.log("Step 5: Testing permission setting...")
    await drive.permissions.create({
      fileId: testFileResponse.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    })

    // Step 6: Get the file to verify it's accessible
    console.log("Step 6: Verifying file access...")
    const verifyResponse = await drive.files.get({
      fileId: testFileResponse.data.id,
      fields: "id,name,webViewLink,permissions",
    })

    return NextResponse.json({
      success: true,
      diagnostics: {
        authentication: {
          success: true,
          user: aboutResponse.data.user,
        },
        folderAccess: {
          success: true,
          folder: folderResponse.data,
        },
        folderListing: {
          success: true,
          fileCount: filesResponse.data.files?.length || 0,
        },
        fileCreation: {
          success: true,
          fileId: testFileResponse.data.id,
          webViewLink: testFileResponse.data.webViewLink,
        },
        fileVerification: {
          success: true,
          file: verifyResponse.data,
        },
      },
    })
  } catch (error) {
    console.error("Drive diagnostic error:", error)

    // Determine which step failed
    let failedStep = "unknown"
    let errorDetails = {}

    if (error.message?.includes("authentication")) {
      failedStep = "authentication"
    } else if (error.message?.includes("folder")) {
      failedStep = "folderAccess"
    } else if (error.config?.url?.includes("list")) {
      failedStep = "folderListing"
    } else if (error.config?.method === "POST" && error.config?.url?.includes("files")) {
      failedStep = "fileCreation"
    } else if (error.config?.url?.includes("permissions")) {
      failedStep = "permissionSetting"
    }

    if (error.response) {
      errorDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      }
    } else {
      errorDetails = {
        message: error.message,
        stack: error.stack,
      }
    }

    return NextResponse.json(
      {
        success: false,
        failedStep,
        error: errorDetails,
      },
      { status: 500 },
    )
  }
}
