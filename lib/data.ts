// Thêm 'use server' directive để đảm bảo code chỉ chạy ở server-side
"use server"

import type { Transaction } from "@/lib/types"
import { initGoogleAPIs, getSpreadsheetId } from "@/lib/google-service"

const SHEET_NAME = "Sheet1"

// Function to fetch all transactions from Google Sheets
export async function fetchAllTransactions(): Promise<Transaction[]> {
  const { sheets } = await initGoogleAPIs()
  const SPREADSHEET_ID = await getSpreadsheetId()

  try {
    console.log(`Fetching transactions from spreadsheet: ${SPREADSHEET_ID}, sheet: ${SHEET_NAME}`)

    // Fetch all transactions
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:K`, // Mở rộng range để bao gồm cả phương thức thanh toán
    })

    const rows = response.data.values || []
    console.log(`Found ${rows.length} transactions in the sheet`)

    // Map the rows to Transaction objects
    const transactions = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      // Bỏ qua hàng trống
      if (!row || !row[0]) continue

      // Xử lý amount đúng cách - đảm bảo nó là số
      let amount = 0
      try {
        // Loại bỏ dấu phẩy ngăn cách hàng nghìn nếu có
        const amountStr = (row[3] || "0").toString().replace(/,/g, "").replace(/\./g, "")
        amount = Number.parseFloat(amountStr)
        if (isNaN(amount)) amount = 0
      } catch (e) {
        console.error("Error parsing amount:", row[3], e)
      }

      // Process receipt link to ensure it's usable
      let receiptLink = row[5] || null

      // If it's a Google Drive link, convert it to use our proxy
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
        if (lowerType === "income" || lowerType === "thu nhập" || lowerType === "thu" || lowerType === "nhập tiền") {
          type = "income"
        }
      }

      // Ensure we have all required fields with proper defaults
      transactions.push({
        id: i.toString(),
        rowIndex: i + 2, // Thêm rowIndex thực tế (vị trí hàng trong bảng tính)
        date: row[0] || "",
        category: row[1] || "",
        description: row[2] || "",
        amount: amount,
        type: type,
        receiptLink: receiptLink,
        timestamp: row[6] || new Date().toISOString(),
        subCategory: row[7] || null, // Thêm subCategory nếu có
        quantity: row[8] || null, // Thêm số lượng nếu có
        paymentMethod: row[9] || "card", // Thêm phương thức thanh toán
        note: row[10] || null, // Thêm ghi chú nếu có
      })
    }

    console.log(`Processed ${transactions.length} valid transactions`)
    // Log một số giao dịch đầu tiên để debug
    if (transactions.length > 0) {
      console.log("Sample transactions:", transactions.slice(0, 3))
    }

    return transactions
  } catch (error) {
    console.error("Error fetching transactions:", error)
    console.error("Error details:", error.response?.data || error.message)
    return []
  }
}

// Hàm để phân tích ngày tháng từ chuỗi - Chuyển thành async
export async function parseDate(dateString: string): Promise<{ day: number; month: number; year: number } | null> {
  try {
    console.log(`Đang phân tích ngày: "${dateString}"`)

    // Nếu là số, có thể là định dạng Excel
    if (!isNaN(Number(dateString))) {
      const excelDate = Number(dateString)
      // Chuyển đổi từ Excel date sang JavaScript date
      const jsDate = new Date((excelDate - 25569) * 86400 * 1000)
      console.log(`  Phân tích Excel date ${excelDate} thành:`, jsDate)
      return {
        day: jsDate.getDate(),
        month: jsDate.getMonth() + 1,
        year: jsDate.getFullYear(),
      }
    }

    // Kiểm tra định dạng DD/MM/YYYY
    if (dateString.includes("/")) {
      const parts = dateString.split("/")
      if (parts.length === 3) {
        const day = Number.parseInt(parts[0], 10)
        const month = Number.parseInt(parts[1], 10)
        const year = Number.parseInt(parts[2], 10)

        // Kiểm tra tính hợp lệ
        if (!isNaN(day) && !isNaN(month) && !isNaN(year) && day > 0 && day <= 31 && month > 0 && month <= 12) {
          console.log(`  Phân tích DD/MM/YYYY thành: ${day}/${month}/${year}`)
          return { day, month, year }
        }
      }
    }

    // Kiểm tra định dạng YYYY-MM-DD
    if (dateString.includes("-")) {
      const parts = dateString.split("-")
      if (parts.length === 3) {
        const year = Number.parseInt(parts[0], 10)
        const month = Number.parseInt(parts[1], 10)
        const day = Number.parseInt(parts[2], 10)

        // Kiểm tra tính hợp lệ
        if (!isNaN(day) && !isNaN(month) && !isNaN(year) && day > 0 && day <= 31 && month > 0 && month <= 12) {
          console.log(`  Phân tích YYYY-MM-DD thành: ${day}/${month}/${year}`)
          return { day, month, year }
        }
      }
    }

    // Thử phân tích bằng Date constructor
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      console.log(
        `  Phân tích bằng Date constructor thành: ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
      )
      return {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      }
    }

    console.error(`  Không thể phân tích ngày: ${dateString}`)
    return null
  } catch (error) {
    console.error(`Error parsing date ${dateString}:`, error)
    return null
  }
}

// Các hàm khác giữ nguyên
export async function fetchTransactionSummary() {
  try {
    const transactions = await fetchAllTransactions()

    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    return {
      totalIncome,
      totalExpense,
      balance,
      timestamp: new Date().toISOString(), // Thêm timestamp để biết thời điểm tính toán
    }
  } catch (error) {
    console.error("Error calculating transaction summary:", error)
    return {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      timestamp: new Date().toISOString(),
    }
  }
}

export async function fetchTopExpenseCategories() {
  try {
    const transactions = await fetchAllTransactions()

    const categoryMap: Record<string, number> = {}

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
      })

    return Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  } catch (error) {
    console.error("Error fetching top expense categories:", error)
    return []
  }
}

export async function fetchRecentTransactions() {
  try {
    const transactions = await fetchAllTransactions()

    return [...transactions]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  } catch (error) {
    console.error("Error fetching recent transactions:", error)
    return []
  }
}

export async function fetchFilteredTransactions(filters?: {
  type?: string
  category?: string
  startDate?: string
  endDate?: string
}) {
  try {
    let transactions = await fetchAllTransactions()

    if (filters) {
      if (filters.type && filters.type !== "all") {
        transactions = transactions.filter((t) => t.type === filters.type)
      }

      if (filters.category && filters.category !== "all") {
        transactions = transactions.filter((t) => t.category === filters.category)
      }

      if (filters.startDate) {
        transactions = transactions.filter((t) => new Date(t.date) >= new Date(filters.startDate!))
      }

      if (filters.endDate) {
        transactions = transactions.filter((t) => new Date(t.date) <= new Date(filters.endDate!))
      }
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error("Error fetching filtered transactions:", error)
    return []
  }
}

// Thêm hàm mới để tính toán dữ liệu tài khoản trực tiếp từ Sheet1
export async function calculateAccountData(month: number, year: number) {
  try {
    console.log(`Calculating account data for ${month}/${year}`)
    const transactions = await fetchAllTransactions()
    console.log(`Total transactions for calculation: ${transactions.length}`)

    // Lọc giao dịch theo tháng/năm
    const filteredTransactions = []

    for (const transaction of transactions) {
      if (!transaction.date) continue

      // Phân tích ngày tháng - sử dụng await vì parseDate giờ là async
      const dateInfo = await parseDate(transaction.date)
      if (!dateInfo) continue

      // So sánh tháng và năm
      if (dateInfo.month === month && dateInfo.year === year) {
        filteredTransactions.push(transaction)
      }
    }

    console.log(`Filtered transactions for ${month}/${year}: ${filteredTransactions.length}`)
    if (filteredTransactions.length > 0) {
      console.log("Sample filtered transaction:", filteredTransactions[0])
    }

    // Tính toán các giá trị
    let totalAdvancedAccount = 0 // Tổng tiền ứng tài khoản
    let totalAdvancedCash = 0 // Tổng tiền ứng tiền mặt
    let accountExpenses = 0 // Chi tiêu tài khoản
    let cashExpenses = 0 // Chi tiêu tiền mặt
    let totalFuel = 0 // Tổng lít xăng

    filteredTransactions.forEach((transaction) => {
      const isCash =
        transaction.paymentMethod === "cash" ||
        (transaction.category && transaction.category.toLowerCase().includes("tiền mặt"))

      console.log(
        `Processing transaction: ${transaction.description}, Amount: ${transaction.amount}, Type: ${transaction.type}, Cash: ${isCash}`,
      )

      // Kiểm tra loại giao dịch
      if (transaction.type === "income") {
        // Giao dịch thu nhập/ứng tiền
        if (isCash) {
          totalAdvancedCash += transaction.amount
          console.log(`  -> Added to totalAdvancedCash: ${transaction.amount}`)
        } else {
          totalAdvancedAccount += transaction.amount
          console.log(`  -> Added to totalAdvancedAccount: ${transaction.amount}`)
        }
      } else {
        // Giao dịch chi tiêu
        if (isCash) {
          cashExpenses += transaction.amount
          console.log(`  -> Added to cashExpenses: ${transaction.amount}`)
        } else {
          accountExpenses += transaction.amount
          console.log(`  -> Added to accountExpenses: ${transaction.amount}`)
        }

        // Kiểm tra nếu là giao dịch đổ xăng và có số lượng
        if (
          transaction.category &&
          transaction.category.toLowerCase().includes("chi phí xe") &&
          transaction.subCategory === "Xăng" &&
          transaction.quantity
        ) {
          const fuelAmount = Number.parseFloat(transaction.quantity.toString())
          if (!isNaN(fuelAmount)) {
            totalFuel += fuelAmount
            console.log(`  -> Added to totalFuel: ${fuelAmount}`)
          }
        }
      }
    })

    // Tính toán số dư đầu kỳ (từ tháng trước)
    let beginningBalance = 0

    // Lấy tháng trước và năm trước
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year

    // Lọc tất cả giao dịch từ đầu đến hết tháng trước
    const prevTransactions = []

    for (const transaction of transactions) {
      if (!transaction.date) continue

      // Phân tích ngày tháng - sử dụng await vì parseDate giờ là async
      const dateInfo = await parseDate(transaction.date)
      if (!dateInfo) continue

      // Giao dịch trước hoặc trong tháng trước
      if (dateInfo.year < prevYear || (dateInfo.year === prevYear && dateInfo.month <= prevMonth)) {
        prevTransactions.push(transaction)
      }
    }

    console.log(`Previous transactions count: ${prevTransactions.length}`)

    // Tính số dư đầu kỳ từ tất cả giao dịch trước đó
    let totalPrevIncome = 0
    let totalPrevExpense = 0

    prevTransactions.forEach((transaction) => {
      const isCash =
        transaction.paymentMethod === "cash" ||
        (transaction.category && transaction.category.toLowerCase().includes("tiền mặt"))

      // Chỉ tính các giao dịch tài khoản (không phải tiền mặt)
      if (!isCash) {
        if (transaction.type === "income") {
          totalPrevIncome += transaction.amount
        } else {
          totalPrevExpense += transaction.amount
        }
      }
    })

    beginningBalance = totalPrevIncome - totalPrevExpense
    console.log(`Beginning balance: ${beginningBalance}`)

    // Tính toán các giá trị còn lại
    const currentBalance = beginningBalance + totalAdvancedAccount - accountExpenses
    const totalExpense = accountExpenses + cashExpenses
    const accountRemaining = currentBalance
    const cashRemaining = totalAdvancedCash - cashExpenses

    const result = {
      currentBalance,
      totalExpense,
      beginningBalance,
      totalAdvanced: totalAdvancedAccount,
      accountRemaining,
      accountExpenses,
      cashRemaining,
      cashExpenses,
      totalFuel,
      timestamp: new Date().toISOString(), // Thêm timestamp để biết thời điểm tính toán
    }

    console.log("Calculated account data:", result)
    return result
  } catch (error) {
    console.error("Error calculating account data:", error)
    return {
      currentBalance: 0,
      totalExpense: 0,
      beginningBalance: 0,
      totalAdvanced: 0,
      accountRemaining: 0,
      accountExpenses: 0,
      cashRemaining: 0,
      cashExpenses: 0,
      totalFuel: 0,
      timestamp: new Date().toISOString(),
    }
  }
}
