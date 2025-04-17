import { NextResponse } from "next/server"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const imageUrl = url.searchParams.get("url")

  if (!imageUrl) {
    return NextResponse.json(
      {
        success: false,
        error: "Thiếu tham số url",
      },
      { status: 400 },
    )
  }

  console.log(`Kiểm tra URL ảnh: ${imageUrl}`)

  try {
    // Kiểm tra xem URL có thể truy cập được không
    const response = await fetch(imageUrl, { method: "HEAD" })

    return NextResponse.json({
      success: true,
      url: imageUrl,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
    })
  } catch (error) {
    console.error(`Lỗi khi kiểm tra URL: ${error.message}`)

    return NextResponse.json(
      {
        success: false,
        url: imageUrl,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
