import { NextResponse } from "next/server"
import { calculateAccountData } from "@/lib/data"
import { revalidatePath } from "next/cache"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

// Ngăn chặn caching để luôn lấy dữ liệu mới nhất
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: Request) {
  try {
    // Lấy tham số từ body
    const body = await request.json()
    const month = body.month || new Date().getMonth() + 1
    const year = body.year || new Date().getFullYear()

    console.log(`API: Syncing account data for ${month}/${year}`)

    // Tính toán dữ liệu tài khoản trực tiếp từ Sheet1
    const accountData = await calculateAccountData(month, year)

    console.log(`API: Synced account data for ${month}/${year}:`, accountData)

    // Revalidate các trang liên quan
    revalidatePath("/")
    revalidatePath("/transactions")
    revalidatePath(`/api/account-data?month=${month}&year=${year}`)

    return NextResponse.json(
      {
        success: true,
        data: accountData,
        month,
        year,
        timestamp: Date.now(),
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
    console.error("Error in sync-account-data API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        details: error.stack,
        timestamp: Date.now(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}
