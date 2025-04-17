import { NextResponse } from "next/server"
import { initGoogleAPIs, getSpreadsheetId } from "@/lib/google-service"
import { USE_MOCK_SERVICES, mockGetTransactions } from "@/lib/mock-service"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

// Ngăn chặn caching để luôn lấy dữ liệu mới nhất
export const dynamic = "force-dynamic"
export const revalidate = 0

// Simple in-memory cache to reduce API calls
const cache = {
  data: new Map<string, any>(),
  timestamp: new Map<string, number>(),
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

// Hàm chuyển đổi số Excel thành ngày JavaScript
function excelDateToJSDate(excelDate: number) {
  // Excel bắt đầu từ ngày 1/1/1900, nhưng có lỗi năm nhuận nên cần trừ 1
  // JavaScript bắt đầu từ 1/1/1970
  const millisecondsPerDay = 24 * 60 * 60 * 1000
  const offsetDays = excelDate - 25569 // 25569 là số ngày từ 1/1/1900 đến 1/1/1970
  return new Date(offsetDays * millisecondsPerDay)
}

// Hàm phân tích ngày tháng từ nhiều định dạng
function parseDate(dateStr: string) {
  // Kiểm tra xem dateStr có phải là số không
  const excelDate = Number(dateStr)
  if (!isNaN(excelDate)) {
    // Nếu là số Excel, chuyển đổi thành đối tượng Date
    const jsDate = excelDateToJSDate(excelDate)
    return {
      day: jsDate.getDate(),
      month: jsDate.getMonth() + 1, // getMonth() trả về 0-11
      year: jsDate.getFullYear(),
    }
  }

  // Nếu không phải số, thử phân tích từ chuỗi DD/MM/YYYY
  const dateParts = dateStr.split("/")
  if (dateParts.length === 3) {
    return {
      day: Number.parseInt(dateParts[0]),
      month: Number.parseInt(dateParts[1]),
      year: Number.parseInt(dateParts[2]),
    }
  }

  // Nếu không phân tích được, trả về null
  return null
}

export async function GET(request: Request) {
  try {
    // Lấy tham số từ URL
    const url = new URL(request.url)
    const month = Number.parseInt(url.searchParams.get("month") || "0")
    const year = Number.parseInt(url.searchParams.get("year") || "0")
    const forceRefresh = url.searchParams.get("refresh") === "true"

    console.log(`API: Fetching transactions for ${month}/${year}${forceRefresh ? " (forced refresh)" : ""}`)

    // Nếu không có tháng hoặc năm, trả về lỗi
    if (!month || !year) {
      console.error("Missing month or year parameters")
      return NextResponse.json(
        {
          success: false,
          error: "Month and year are required",
        },
        { status: 400 },
      )
    }

    // Sử dụng mock data nếu USE_MOCK_SERVICES = true
    if (USE_MOCK_SERVICES) {
      console.log("Sử dụng mock data cho giao dịch")
      const mockResult = await mockGetTransactions(month, year)
      return NextResponse.json(mockResult, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
    }

    // Check cache first (unless force refresh is requested)
    const cacheKey = `transactions-${month}-${year}`
    const now = Date.now()

    if (!forceRefresh && cache.data.has(cacheKey) && now - (cache.timestamp.get(cacheKey) || 0) < CACHE_DURATION) {
      console.log(`Using cached data for ${month}/${year}`)
      return NextResponse.json(cache.data.get(cacheKey), {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
    }

    try {
      // Lấy dữ liệu từ Google Sheets - Thêm await để đảm bảo xác thực hoàn tất
      const { sheets } = await initGoogleAPIs()
      const SPREADSHEET_ID = await getSpreadsheetId()
      const SHEET_NAME = "Sheet1"

      console.log(`Fetching data from spreadsheet: ${SPREADSHEET_ID}, sheet: ${SHEET_NAME}`)

      try {
        // Lấy tất cả dữ liệu từ sheet
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A2:K`, // Mở rộng range để bao gồm cả subCategory và paymentMethod
        })

        const rows = response.data.values || []
        console.log(`Found ${rows.length} rows in the sheet`)

        // Debug: In ra một số hàng đầu tiên để kiểm tra
        if (rows.length > 0) {
          console.log("First few rows:", JSON.stringify(rows.slice(0, 3)))
        }

        // Chuyển đổi dữ liệu thành mảng giao dịch
        const transactions = []
        const allTransactions = [] // Lưu tất cả giao dịch để debug

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i]

          // Bỏ qua hàng trống
          if (!row || !row[0]) {
            console.log(`Skipping empty row at index ${i}`)
            continue
          }

          // Phân tích ngày tháng
          const dateInfo = parseDate(row[0])

          // Nếu không phân tích được ngày, bỏ qua
          if (!dateInfo) {
            console.log(`Cannot parse date at row ${i}: ${row[0]}`)
            continue
          }

          const transactionMonth = dateInfo.month
          const transactionYear = dateInfo.year

          // Định dạng lại ngày tháng để hiển thị
          const formattedDate = `${dateInfo.day.toString().padStart(2, "0")}/${dateInfo.month.toString().padStart(2, "0")}/${dateInfo.year}`

          // Xử lý amount đúng cách - đảm bảo nó là số
          let amount = 0
          try {
            // Loại bỏ dấu phẩy ngăn cách hàng nghìn nếu có
            const amountStr = (row[3] || "0").toString().replace(/,/g, "").replace(/\s/g, "")
            amount = Number.parseFloat(amountStr)
            if (isNaN(amount)) amount = 0
          } catch (e) {
            console.error(`Error parsing amount at row ${i}:`, row[3], e)
          }

          // Xử lý receiptLink
          let receiptLink = row[5] || null
          if (receiptLink) {
            let fileId = null
            // Extract file ID from various Google Drive URL formats
            if (receiptLink.includes("drive.google.com/file/d/")) {
              fileId = receiptLink.split("/file/d/")[1].split("/")[0]
            } else if (receiptLink.includes("drive.google.com") && receiptLink.includes("id=")) {
              fileId = receiptLink.split("id=")[1]?.split("&")[0]
            } else if (receiptLink.includes("drive.google.com/thumbnail")) {
              fileId = receiptLink.split("id=")[1]?.split("&")[0]
            }

            // If we extracted a file ID, use our proxy
            if (fileId) {
              receiptLink = `/api/image-proxy/${fileId}`
            }
          }

          // Xác định loại giao dịch
          let type = "expense"
          if (row[4] && typeof row[4] === "string") {
            const lowerType = row[4].toLowerCase().trim()
            if (
              lowerType === "income" ||
              lowerType === "thu nhập" ||
              lowerType === "thu" ||
              lowerType === "nhập tiền"
            ) {
              type = "income"
            }
          }

          // Lấy phương thức thanh toán
          const paymentMethod = row[9] || "transfer"

          // Tính toán rowIndex thực tế (vị trí hàng trong bảng tính)
          const actualRowIndex = i + 2 // +2 vì hàng đầu tiên là tiêu đề và index bắt đầu từ 0

          const transaction = {
            id: i.toString(),
            rowIndex: actualRowIndex, // Thêm rowIndex thực tế
            date: formattedDate, // Sử dụng định dạng ngày đã chuẩn hóa
            category: row[1] || "",
            description: row[2] || "",
            amount: amount,
            type: type,
            receiptLink: receiptLink,
            timestamp: row[6] || new Date().toISOString(),
            subCategory: row[7] || null, // Thêm subCategory nếu có
            fuelLiters: row[8] || null, // Thêm số lít xăng nếu có
            paymentMethod: paymentMethod, // Thêm phương thức thanh toán
          }

          // Thêm vào danh sách tất cả giao dịch để debug
          allTransactions.push({
            ...transaction,
            parsedMonth: transactionMonth,
            parsedYear: transactionYear,
            matchesFilter: transactionMonth === month && transactionYear === year,
          })

          // Chỉ thêm vào danh sách giao dịch nếu khớp với tháng và năm
          if (transactionMonth === month && transactionYear === year) {
            console.log(`Adding transaction for ${month}/${year}:`, transaction)
            transactions.push(transaction)
          }
        }

        console.log(`Returning ${transactions.length} transactions for ${month}/${year}`)

        // Prepare response data
        const responseData = {
          success: true,
          transactions,
          debug: {
            requestedMonth: month,
            requestedYear: year,
            totalRowsInSheet: rows.length,
            allTransactions: allTransactions.slice(0, 10), // Chỉ gửi 10 giao dịch đầu tiên để tránh quá nhiều dữ liệu
          },
        }

        // Update cache
        cache.data.set(cacheKey, responseData)
        cache.timestamp.set(cacheKey, now)

        // Trả về cả danh sách giao dịch đã lọc và tất cả giao dịch để debug
        return NextResponse.json(responseData, {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })
      } catch (sheetsError) {
        console.error("Error fetching from Google Sheets:", sheetsError)
        return NextResponse.json(
          {
            success: false,
            error: `Error fetching from Google Sheets: ${sheetsError.message}`,
            details: sheetsError.stack,
          },
          { status: 500 },
        )
      }
    } catch (googleApiError) {
      console.error("Error initializing Google APIs:", googleApiError)
      return NextResponse.json(
        {
          success: false,
          error: `Error initializing Google APIs: ${googleApiError.message}`,
          details: googleApiError.stack,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in transactions API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        details: error.stack,
      },
      { status: 500 },
    )
  }
}

// Clear cache function for when data is modified
export function clearTransactionsCache(month?: number, year?: number) {
  if (month && year) {
    // Clear specific month/year cache
    const cacheKey = `transactions-${month}-${year}`
    cache.data.delete(cacheKey)
    cache.timestamp.delete(cacheKey)
  } else {
    // Clear all cache
    cache.data.clear()
    cache.timestamp.clear()
  }
}
