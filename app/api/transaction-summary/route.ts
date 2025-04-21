import { NextResponse } from "next/server"
import { fetchTransactionSummary } from "@/lib/data"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

// Ngăn chặn caching để luôn lấy dữ liệu mới nhất
export const dynamic = "force-dynamic"
export const revalidate = 0

// Simple in-memory cache
let summaryCache = null
let lastFetched = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const forceRefresh = url.searchParams.get("refresh") === "true"
    const now = Date.now()

    // Return cached data if it's still fresh (unless force refresh is requested)
    if (!forceRefresh && summaryCache && now - lastFetched < CACHE_DURATION) {
      console.log("Using cached transaction summary")
      return NextResponse.json(summaryCache, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
    }

    console.log("Fetching fresh transaction summary")
    const summary = await fetchTransactionSummary()

    // Update cache
    summaryCache = summary
    lastFetched = now

    return NextResponse.json(summary, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error fetching transaction summary:", error)
    return NextResponse.json(
      {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        error: error.message || "Unknown error",
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

// Clear cache function for when data is modified
export function clearSummaryCache() {
  summaryCache = null
  lastFetched = 0
}
