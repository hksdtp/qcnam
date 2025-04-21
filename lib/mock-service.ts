// Cấu hình sử dụng mock service
export const USE_MOCK_SERVICES = true

// Mock data cho tài khoản
export async function mockGetAccountData(month: number, year: number) {
  console.log(`Mock: Lấy dữ liệu tài khoản cho tháng ${month}/${year}`)

  // Tạo dữ liệu giả
  return {
    success: true,
    data: {
      totalIncome: 15000000,
      totalExpense: 8500000,
      balance: 6500000,
      categories: {
        expense: [
          { category: "Ăn uống", amount: 2500000 },
          { category: "Đi lại", amount: 1500000 },
          { category: "Mua sắm", amount: 2000000 },
          { category: "Giải trí", amount: 1000000 },
          { category: "Khác", amount: 1500000 },
        ],
        income: [
          { category: "Lương", amount: 12000000 },
          { category: "Thưởng", amount: 2000000 },
          { category: "Khác", amount: 1000000 },
        ],
      },
      source: "mock",
    },
  }
}

// Mock data cho giao dịch
export async function mockGetTransactions(month: number, year: number) {
  console.log(`Mock: Lấy giao dịch cho tháng ${month}/${year}`)

  // Tạo dữ liệu giả
  const transactions = []

  // Tạo ngày trong tháng
  const daysInMonth = new Date(year, month, 0).getDate()

  // Danh sách danh mục
  const expenseCategories = ["Ăn uống", "Đi lại", "Mua sắm", "Giải trí", "Khác"]
  const incomeCategories = ["Lương", "Thưởng", "Khác"]

  // Tạo giao dịch ngẫu nhiên
  for (let i = 0; i < 20; i++) {
    const day = Math.floor(Math.random() * daysInMonth) + 1
    const type = Math.random() > 0.7 ? "income" : "expense"
    const categories = type === "income" ? incomeCategories : expenseCategories
    const category = categories[Math.floor(Math.random() * categories.length)]

    const amount =
      type === "income" ? Math.floor(Math.random() * 5000000) + 1000000 : Math.floor(Math.random() * 1000000) + 50000

    transactions.push({
      id: i.toString(),
      rowIndex: i + 2,
      date: `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`,
      category: category,
      description: `${type === "income" ? "Thu " : "Chi "} ${category.toLowerCase()}`,
      amount: amount,
      type: type,
      receiptLink: null,
      timestamp: new Date().toISOString(),
      subCategory: null,
      fuelLiters: null,
      paymentMethod: "transfer",
    })
  }

  return {
    success: true,
    transactions: transactions,
    debug: {
      requestedMonth: month,
      requestedYear: year,
      totalRowsInSheet: transactions.length,
      source: "mock",
    },
  }
}

// Mock data cho tổng kết giao dịch
export async function mockGetTransactionSummary() {
  console.log("Mock: Lấy tổng kết giao dịch")

  return {
    totalIncome: 15000000,
    totalExpense: 8500000,
    balance: 6500000,
    source: "mock",
  }
}

// Mock data cho xe
export async function mockGetCarData() {
  console.log("Mock: Lấy dữ liệu xe")

  return {
    success: true,
    carData: {
      fuelEfficiency: "6.5",
      totalDistance: "15000",
      totalLiters: "975",
      totalCost: "24375000",
      registrationDate: "2023-12-31",
      insuranceDate: "2023-12-31",
      startKm: "12500",
      endKm: "15000",
      totalFuelMonth: "162.5",
      fuelCost: "4062500",
    },
  }
}

// Mock function cho thêm giao dịch
export async function mockAddTransaction(formData: FormData) {
  console.log("Mock: Thêm giao dịch mới")

  // Lấy dữ liệu từ formData
  const date = formData.get("date") as string
  const category = formData.get("category") as string
  const description = formData.get("description") as string
  const amountStr = formData.get("amount") as string
  const type = formData.get("type") as string
  const subCategory = (formData.get("subCategory") as string) || null
  const fuelLiters = (formData.get("fuelLiters") as string) || null
  const paymentMethod = (formData.get("paymentMethod") as string) || "transfer"

  // Chuyển đổi số tiền thành số
  const amount = Number(amountStr.replace(/[^\d]/g, ""))

  // Tạo đối tượng giao dịch để trả về
  const transaction = {
    id: Date.now().toString(),
    date,
    category,
    description,
    amount,
    type: type as "income" | "expense",
    receiptLink: null,
    timestamp: new Date().toISOString(),
    subCategory,
    fuelLiters,
    paymentMethod,
  }

  return {
    success: true,
    transaction,
  }
}

// Mock function cho cập nhật dữ liệu xe
export async function mockUpdateCarData(formData: FormData) {
  console.log("Mock: Cập nhật dữ liệu xe")

  return {
    success: true,
    message: "Dữ liệu xe đã được cập nhật thành công (mock)",
  }
}
