"use server"
import { initGoogleAPIs, getSpreadsheetId } from "@/lib/google-service"
import { revalidatePath } from "next/cache"
import { calculateAccountData } from "@/lib/data"
import { clearTransactionsCache } from "@/app/api/transactions/route"
import { clearSummaryCache } from "@/app/api/transaction-summary/route"
import { USE_MOCK_SERVICES, mockAddTransaction, mockUpdateCarData } from "@/lib/mock-service"

// Cache for Sheet1 existence check
let sheet1ExistsCache = null
let sheet1LastChecked = 0
const SHEET1_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Hàm tự động tính toán lại dữ liệu tài khoản cho tháng hiện tại
async function autoRecalculateAccountData() {
  try {
    const currentDate = new Date()
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()

    console.log(`Tự động tính toán lại dữ liệu tài khoản cho tháng ${month}/${year}`)

    // Tính toán dữ liệu tài khoản
    const accountData = await calculateAccountData(month, year)

    console.log("Dữ liệu tài khoản đã được tính toán lại:", accountData)

    // Revalidate các trang liên quan để cập nhật UI
    revalidatePath("/")
    revalidatePath("/transactions")

    // Clear caches to force refresh on next request
    clearTransactionsCache(month, year)
    clearSummaryCache()

    return { success: true, accountData }
  } catch (error) {
    console.error("Lỗi khi tự động tính toán lại dữ liệu tài khoản:", error)
    return {
      success: false,
      error: error.message || "Lỗi không xác định khi tính toán lại dữ liệu tài khoản",
    }
  }
}

// Hàm kiểm tra Sheet1 với caching
async function checkSheet1Exists() {
  // Nếu đang sử dụng mock services, luôn trả về true
  if (USE_MOCK_SERVICES) {
    return true
  }

  const now = Date.now()

  // Return cached result if it's still fresh
  if (sheet1ExistsCache !== null && now - sheet1LastChecked < SHEET1_CACHE_DURATION) {
    console.log("Using cached Sheet1 existence check:", sheet1ExistsCache)
    return sheet1ExistsCache
  }

  try {
    const { sheets } = await initGoogleAPIs()
    const SPREADSHEET_ID = await getSpreadsheetId()

    const sheetsInfo = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    const exists = sheetsInfo.data.sheets?.some((sheet) => sheet.properties?.title === "Sheet1")

    // Update cache
    sheet1ExistsCache = exists
    sheet1LastChecked = now

    console.log("Fresh Sheet1 existence check:", exists)
    return exists
  } catch (error) {
    console.error("Error checking Sheet1:", error)
    throw error
  }
}

export async function addTransaction(formData: FormData) {
  console.log("Server Action: Thêm giao dịch mới")

  // Sử dụng mock service nếu USE_MOCK_SERVICES = true
  if (USE_MOCK_SERVICES) {
    console.log("Sử dụng mock service cho thêm giao dịch")
    const result = await mockAddTransaction(formData)

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/transactions")

    return result
  }

  try {
    // Lấy dữ liệu từ formData
    const date = formData.get("date") as string
    const category = formData.get("category") as string
    const description = formData.get("description") as string
    const amountStr = formData.get("amount") as string
    const type = formData.get("type") as string
    const subCategory = (formData.get("subCategory") as string) || null
    const fuelLiters = (formData.get("fuelLiters") as string) || null
    const paymentMethod = (formData.get("paymentMethod") as string) || "transfer"

    // Lấy các link hóa đơn nếu có
    const fileId = (formData.get("fileId") as string) || null
    const webViewLink = (formData.get("webViewLink") as string) || null

    // Kiểm tra dữ liệu đầu vào
    if (!date || !category || !description || !amountStr || !type) {
      console.error("Thiếu thông tin bắt buộc:", { date, category, description, amountStr, type })
      return {
        success: false,
        error: "Vui lòng điền đầy đủ thông tin bắt buộc",
      }
    }

    // Chuyển đổi số tiền thành số
    const amount = Number(amountStr.replace(/[^\d]/g, ""))
    if (isNaN(amount)) {
      console.error("Số tiền không hợp lệ:", amountStr)
      return {
        success: false,
        error: "Số tiền không hợp lệ",
      }
    }

    // Khởi tạo Google APIs
    const { sheets } = await initGoogleAPIs()
    const SPREADSHEET_ID = await getSpreadsheetId()

    // Kiểm tra xem Sheet1 có tồn tại không - sử dụng cache
    try {
      const sheet1Exists = await checkSheet1Exists()

      if (!sheet1Exists) {
        console.error("Sheet1 không tồn tại")
        return {
          success: false,
          error: "Sheet1 không tồn tại. Vui lòng tạo Sheet1 trước.",
        }
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra Sheet1:", error)
      return {
        success: false,
        error: `Lỗi khi kiểm tra Sheet1: ${error.message || "Lỗi không xác định"}`,
      }
    }

    // Chuẩn bị dữ liệu để thêm vào Sheet1
    const timestamp = new Date().toISOString()
    const rowData = [
      date,
      category,
      description,
      amount.toString(),
      type,
      webViewLink || "",
      timestamp,
      subCategory || "",
      fuelLiters || "",
      paymentMethod || "transfer",
      "", // Ghi chú (để trống)
    ]

    console.log("Dữ liệu sẽ thêm vào Sheet1:", rowData)

    // Thêm dữ liệu vào Sheet1
    try {
      const appendResult = await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "Sheet1!A:K",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: [rowData],
        },
      })

      console.log("Đã thêm giao dịch thành công:", appendResult.data)

      // Tạo đối tượng giao dịch để trả về
      const transaction = {
        id: Date.now().toString(),
        date,
        category,
        description,
        amount,
        type: type as "income" | "expense",
        receiptLink: webViewLink,
        timestamp,
        subCategory,
        fuelLiters,
        paymentMethod,
      }

      // Tự động tính toán lại dữ liệu tài khoản
      await autoRecalculateAccountData()

      // Revalidate các trang liên quan
      revalidatePath("/")
      revalidatePath("/transactions")

      // Clear caches
      const dateObj = new Date(date.split("/").reverse().join("-"))
      clearTransactionsCache(dateObj.getMonth() + 1, dateObj.getFullYear())
      clearSummaryCache()

      return {
        success: true,
        transaction,
      }
    } catch (error) {
      console.error("Lỗi khi thêm giao dịch vào Sheet1:", error)
      return {
        success: false,
        error: `Lỗi khi thêm giao dịch: ${error.message || "Lỗi không xác định"}`,
      }
    }
  } catch (error) {
    console.error("Lỗi không xác định khi thêm giao dịch:", error)
    return {
      success: false,
      error: `Lỗi không xác định: ${error.message || "Lỗi không xác định"}`,
    }
  }
}

// API endpoint để tính toán dữ liệu tài khoản theo yêu cầu
export async function syncAccountData(month: number, year: number) {
  try {
    // Tính toán dữ liệu tài khoản trực tiếp từ Sheet1
    const accountData = await calculateAccountData(month, year)

    console.log(`Kết quả tính toán cho tháng ${month}/${year}:`, accountData)

    // Revalidate các trang liên quan
    revalidatePath("/")
    revalidatePath("/transactions")

    // Clear caches
    clearTransactionsCache(month, year)
    clearSummaryCache()

    return {
      success: true,
      data: accountData,
    }
  } catch (error) {
    console.error("Lỗi khi tính toán dữ liệu tài khoản:", error)
    return {
      success: false,
      error: error.message || "Lỗi không xác định khi tính toán dữ liệu tài khoản",
    }
  }
}

// Thêm hàm cập nhật giao dịch
export async function editTransaction(formData: FormData) {
  console.log("Server Action: Cập nhật giao dịch")

  // Sử dụng mock service nếu USE_MOCK_SERVICES = true
  if (USE_MOCK_SERVICES) {
    console.log("Sử dụng mock service cho cập nhật giao dịch")

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/transactions")

    return { success: true }
  }

  try {
    // Lấy dữ liệu từ formData
    const rowIndex = formData.get("rowIndex") as string
    const date = formData.get("date") as string
    const category = formData.get("category") as string
    const description = formData.get("description") as string
    const amountStr = formData.get("amount") as string
    const type = formData.get("type") as string
    const subCategory = (formData.get("subCategory") as string) || null
    const fuelLiters = (formData.get("fuelLiters") as string) || null
    const paymentMethod = (formData.get("paymentMethod") as string) || "transfer"

    // Kiểm tra dữ liệu đầu vào
    if (!rowIndex || !date || !category || !description || !amountStr || !type) {
      console.error("Thiếu thông tin bắt buộc:", { rowIndex, date, category, description, amountStr, type })
      return {
        success: false,
        error: "Vui lòng điền đầy đủ thông tin bắt buộc",
      }
    }

    // Chuyển đổi số tiền thành số
    const amount = Number(amountStr.replace(/[^\d]/g, ""))
    if (isNaN(amount)) {
      console.error("Số tiền không hợp lệ:", amountStr)
      return {
        success: false,
        error: "Số tiền không hợp lệ",
      }
    }

    // Khởi tạo Google APIs
    const { sheets } = await initGoogleAPIs()
    const SPREADSHEET_ID = await getSpreadsheetId()

    // Chuẩn bị dữ liệu để cập nhật
    const rowData = [
      date,
      category,
      description,
      amount.toString(),
      type,
      "", // Giữ nguyên link hóa đơn
      "", // Giữ nguyên timestamp
      subCategory || "",
      fuelLiters || "",
      paymentMethod || "transfer",
      "", // Ghi chú (để trống)
    ]

    console.log(`Cập nhật giao dịch tại hàng ${rowIndex}:`, rowData)

    // Cập nhật dữ liệu trong Sheet1
    try {
      const updateResult = await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Sheet1!A${rowIndex}:K${rowIndex}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [rowData],
        },
      })

      console.log("Đã cập nhật giao dịch thành công:", updateResult.data)

      // Tự động tính toán lại dữ liệu tài khoản
      await autoRecalculateAccountData()

      // Revalidate các trang liên quan
      revalidatePath("/")
      revalidatePath("/transactions")

      // Clear caches
      const dateObj = new Date(date.split("/").reverse().join("-"))
      clearTransactionsCache(dateObj.getMonth() + 1, dateObj.getFullYear())
      clearSummaryCache()

      return {
        success: true,
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật giao dịch:", error)
      return {
        success: false,
        error: `Lỗi khi cập nhật giao dịch: ${error.message || "Lỗi không xác định"}`,
      }
    }
  } catch (error) {
    console.error("Lỗi không xác định khi cập nhật giao dịch:", error)
    return {
      success: false,
      error: `Lỗi không xác định: ${error.message || "Lỗi không xác định"}`,
    }
  }
}

// Thêm hàm xóa giao dịch
export async function deleteTransaction(formData: FormData) {
  console.log("Server Action: Xóa giao dịch")

  // Sử dụng mock service nếu USE_MOCK_SERVICES = true
  if (USE_MOCK_SERVICES) {
    console.log("Sử dụng mock service cho xóa giao dịch")

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/transactions")

    return { success: true }
  }

  try {
    // Lấy rowIndex từ formData
    const rowIndex = formData.get("rowIndex") as string

    if (!rowIndex) {
      console.error("Thiếu rowIndex")
      return {
        success: false,
        error: "Thiếu thông tin hàng cần xóa",
      }
    }

    // Khởi tạo Google APIs
    const { sheets } = await initGoogleAPIs()
    const SPREADSHEET_ID = await getSpreadsheetId()

    console.log(`Xóa giao dịch tại hàng ${rowIndex}`)

    // Xóa dữ liệu trong Sheet1 bằng cách ghi đè bằng hàng trống
    try {
      const deleteResult = await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `Sheet1!A${rowIndex}:K${rowIndex}`,
      })

      console.log("Đã xóa giao dịch thành công:", deleteResult.data)

      // Tự động tính toán lại dữ liệu tài khoản
      await autoRecalculateAccountData()

      // Revalidate các trang liên quan
      revalidatePath("/")
      revalidatePath("/transactions")

      // Clear all caches since we don't know which month/year was affected
      clearTransactionsCache()
      clearSummaryCache()

      return {
        success: true,
      }
    } catch (error) {
      console.error("Lỗi khi xóa giao dịch:", error)
      return {
        success: false,
        error: `Lỗi khi xóa giao dịch: ${error.message || "Lỗi không xác định"}`,
      }
    }
  } catch (error) {
    console.error("Lỗi không xác định khi xóa giao dịch:", error)
    return {
      success: false,
      error: `Lỗi không xác định: ${error.message || "Lỗi không xác định"}`,
    }
  }
}

// Update car data
export async function updateCarData(formData: FormData) {
  // Sử dụng mock service nếu USE_MOCK_SERVICES = true
  if (USE_MOCK_SERVICES) {
    console.log("Sử dụng mock service cho cập nhật dữ liệu xe")
    const result = await mockUpdateCarData(formData)

    // Revalidate the dashboard page
    revalidatePath("/")

    return result
  }

  try {
    // Đảm bảo sheet Xe tồn tại
    const setupResult = await ensureCarSheetSetup()
    if (!setupResult.success) {
      throw new Error(setupResult.error || "Không thể thiết lập sheet Xe")
    }

    // Extract form data
    const fuelEfficiency = formData.get("fuelEfficiency") as string
    const totalDistance = formData.get("totalDistance") as string
    const totalLiters = formData.get("totalLiters") as string
    const totalCost = formData.get("totalCost") as string
    const registrationDate = formData.get("registrationDate") as string
    const insuranceDate = formData.get("insuranceDate") as string

    // New fields
    const startKm = formData.get("startKm") as string
    const endKm = formData.get("endKm") as string
    const totalFuelMonth = formData.get("totalFuelMonth") as string
    const fuelCost = formData.get("fuelCost") as string

    const { sheets } = await initGoogleAPIs()
    const SPREADSHEET_ID = await getSpreadsheetId()
    const SHEET_NAME = "Xe"

    // Cập nhật dữ liệu trong sheet Xe
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:B15`,
      valueInputOption: "RAW",
      resource: {
        values: [
          ["Thông số", "Giá trị"],
          ["Tiêu hao nhiên liệu", fuelEfficiency],
          ["Tổng quãng đường", totalDistance],
          ["Tổng số lít xăng đã đổ", totalLiters],
          ["Tổng tiền xăng đã đổ", totalCost],
          ["Hạn đăng kiểm", registrationDate],
          ["Hạn bảo hiểm thân vỏ", insuranceDate],
          ["Cập nhật lần cuối", new Date().toISOString()],
          ["Km đầu tháng", startKm],
          ["Km cuối tháng", endKm],
          ["Xăng đã đổ tháng này", totalFuelMonth],
          ["Chi phí xăng tháng này", fuelCost],
        ],
      },
    })

    // Revalidate the dashboard page
    revalidatePath("/")

    return {
      success: true,
      message: "Dữ liệu xe đã được cập nhật thành công",
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật dữ liệu xe:", error)
    return {
      success: false,
      error: error.message || "Lỗi không xác định khi cập nhật dữ liệu xe",
    }
  }
}

// Placeholder function for car sheet setup
async function ensureCarSheetSetup() {
  // Nếu đang sử dụng mock services, luôn trả về true
  if (USE_MOCK_SERVICES) {
    return { success: true }
  }

  // Implement actual sheet setup logic here
  return { success: true }
}
