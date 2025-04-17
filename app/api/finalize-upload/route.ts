import { NextResponse } from "next/server"
import { initGoogleAPIs } from "@/lib/google-service"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { fileId } = await request.json()

    if (!fileId) {
      return NextResponse.json({ success: false, error: "Thiếu ID file" }, { status: 400 })
    }

    const { drive } = await initGoogleAPIs()

    // Set public permissions
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      fields: "id",
    })

    // Get file details
    const fileResponse = await drive.files.get({
      fileId: fileId,
      fields: "id,name,webViewLink,webContentLink,thumbnailLink,shared",
    })

    // Generate various URLs for accessing the file
    const webViewLink = fileResponse.data.webViewLink
    const webContentLink = fileResponse.data.webContentLink
    const thumbnailLink = fileResponse.data.thumbnailLink
    const directViewLink = `https://drive.google.com/uc?export=view&id=${fileId}`
    const proxyLink = `/api/image-proxy/${fileId}`
    const embedLink = `https://drive.google.com/file/d/${fileId}/preview`

    return NextResponse.json({
      success: true,
      fileId: fileId,
      webViewLink: webViewLink,
      webContentLink: webContentLink,
      directViewLink: directViewLink,
      thumbnailLink: thumbnailLink,
      proxyLink: proxyLink,
      embedLink: embedLink,
    })
  } catch (error) {
    console.error("Error finalizing upload:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Không thể hoàn tất quá trình tải lên",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
