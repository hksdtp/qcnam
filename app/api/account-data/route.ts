import { type NextRequest, NextResponse } from "next/server"
import { calculateAccountData } from "@/lib/data"
import { USE_MOCK_SERVICES } from "@/lib/mock-service"

// Ngăn chặn caching để luôn lấy dữ liệu mới nhất
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // Lấy tham số tháng và năm từ query string
    const searchParams = request.nextUrl.searchParams
    const monthParam = searchParams.get("month")
    const yearParam = searchParams.get("year")

    if (!monthParam || !yearParam) {
      return NextResponse.json(
        {
          success: false,
          error: "Thiếu tham số tháng hoặc năm",
        },
        { status: 400 },
      )
    }

    const month = Number.parseInt(monthParam)
    const year = Number.parseInt(yearParam)

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      return NextResponse.json(
        {
          success: false,
          error: "Tham số tháng hoặc năm không hợp lệ",
        },
        { status: 400 },
      )
    }

    console.log(`Đang tính toán dữ liệu tài khoản cho tháng ${month}/${year}`)

    // Nếu đang sử dụng mock service, trả về dữ liệu mẫu
    if (USE_MOCK_SERVICES) {
      // Dữ liệu mẫu cho tháng 4/2025
      if (month === 4 && year === 2025) {
        return NextResponse.json(
          {
            success: true,
            data: {
              currentBalance: -123409,
              totalExpense: 469087,
              beginningBalance: 0,
              totalAdvanced: 0,
              accountRemaining: -123409,
              accountExpenses: 123409,
              cashRemaining: 1654322,
              cashExpenses: 345678,
              totalFuel: 80,
              timestamp: new Date().toISOString(),
            },
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          },
        )
      }

      // Dữ liệu mẫu cho các tháng khác
      return NextResponse.json(
        {
          success: true,
          data: {
            currentBalance: 5000000,
            totalExpense: 2500000,
            beginningBalance: 3000000,
            totalAdvanced: 4500000,
            accountRemaining: 5000000,
            accountExpenses: 2500000,
            cashRemaining: 2000000,
            cashExpenses: 500000,
            totalFuel: 50,
            timestamp: new Date().toISOString(),
          },
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      )
    }

    // Tính toán dữ liệu tài khoản từ Sheet1
    const accountData = await calculateAccountData(month, year)

    console.log(`Dữ liệu tài khoản đã tính toán:`, accountData)

    return NextResponse.json(
      {
        success: true,
        data: accountData,
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
    console.error("Error in account-data API:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Đã xảy ra lỗi khi lấy dữ liệu tài khoản",
      },
      { status: 500 },
    )
  }
}
