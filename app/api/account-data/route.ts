import { NextResponse } from "next/server"
import { calculateAccountData } from "@/lib/data"
import { USE_MOCK_SERVICES, mockGetAccountData } from "@/lib/mock-service"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

// Ngăn chặn caching để luôn lấy dữ liệu mới nhất
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    // Lấy tham số từ URL
    const url = new URL(request.url)
    const month = Number.parseInt(url.searchParams.get("month") || "0")
    const year = Number.parseInt(url.searchParams.get("year") || "0")

    console.log(`API: Lấy dữ liệu tài khoản cho tháng ${month}/${year}`)

    // Nếu không có tháng hoặc năm, trả về lỗi
    if (!month || !year) {
      console.error("Thiếu tham số tháng hoặc năm")
      return NextResponse.json(
        {
          success: false,
          error: "Tháng và năm là bắt buộc",
        },
        { status: 400 },
      )
    }

    // Sử dụng mock data nếu USE_MOCK_SERVICES = true
    if (USE_MOCK_SERVICES) {
      console.log("Sử dụng mock data cho tài khoản")
      const mockResult = await mockGetAccountData(month, year)
      return NextResponse.json(mockResult, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
    }

    try {
      // Tính toán dữ liệu tài khoản
      const data = await calculateAccountData(month, year)
      console.log("API: Dữ liệu tài khoản đã tính toán:", data)

      // Trả về dữ liệu tài khoản - CHÚ Ý: Trả về trực tiếp trong data, không phải accountData
      return NextResponse.json(
        {
          success: true,
          data, // Trả về trực tiếp, không bọc trong accountData
          source: "calculated",
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      )
    } catch (error) {
      console.error("Lỗi khi tính toán dữ liệu tài khoản:", error)
      return NextResponse.json(
        {
          success: false,
          error: `Lỗi khi tính toán dữ liệu tài khoản: ${error.message}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Lỗi trong API route account-data:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi không xác định",
      },
      { status: 500 },
    )
  }
}
