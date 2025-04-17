import { NextResponse } from "next/server"
import { initGoogleAPIs, getDriveFolderId } from "@/lib/google-service"
import { randomUUID } from "crypto"

// Ensure this API route runs in Node.js runtime
export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { fileName, fileType, fileSize } = await request.json()

    if (!fileName || !fileType) {
      return NextResponse.json({ success: false, error: "Thiếu thông tin file" }, { status: 400 })
    }

    // Validate file type
    const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"]
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Định dạng file không được hỗ trợ. Vui lòng sử dụng JPEG, PNG hoặc PDF.",
        },
        { status: 400 },
      )
    }

    // Validate file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "Kích thước file vượt quá 5MB" }, { status: 400 })
    }

    // Initialize Google APIs
    const { drive } = await initGoogleAPIs()
    const DRIVE_FOLDER_ID = await getDriveFolderId()

    // Generate a unique filename
    const fileExtension =
      fileName.split(".").pop() ||
      (fileType === "image/jpeg"
        ? "jpg"
        : fileType === "image/png"
          ? "png"
          : fileType === "application/pdf"
            ? "pdf"
            : "bin")

    const uniqueFileName = `receipt_${Date.now()}_${randomUUID()}.${fileExtension}`

    // Create a file in Google Drive
    const fileMetadata = {
      name: uniqueFileName,
      parents: [DRIVE_FOLDER_ID],
      mimeType: fileType,
    }

    // Create the file first to get its ID
    const file = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id",
      supportsAllDrives: true,
    })

    const fileId = file.data.id

    if (!fileId) {
      throw new Error("Không thể tạo file trong Google Drive")
    }

    // Now create a direct upload URL for this file
    // For Google Drive, we'll use a simpler approach since it doesn't support true presigned URLs
    // We'll use the direct upload API endpoint

    // Return the file ID and other necessary information
    return NextResponse.json({
      success: true,
      fileId: fileId,
      fileName: uniqueFileName,
      // Instead of a presigned URL, we'll use our own API endpoint for uploading
      uploadUrl: `/api/upload-to-drive/${fileId}`,
    })
  } catch (error) {
    console.error("Error generating upload URL:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tạo URL tải lên",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
