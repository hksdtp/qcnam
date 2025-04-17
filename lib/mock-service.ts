// Cấu hình để bật/tắt mock services
export const USE_MOCK_SERVICES = true

// Mock data cho tài khoản
const mockAccountData = {
  currentBalance: 5250000,
  totalExpense: 3750000,
  beginningBalance: 9000000,
  totalAdvanced: 0,
  accountRemaining: 5250000,
  accountExpenses: 3750000,
  cashRemaining: 0,
  cashExpenses: 0,
}

// Mock data cho giao dịch
const mockTransactions = [
  {
    id: "1",
    rowIndex: 2,
    date: "15/04/2025",
    category: "Nhà hàng",
    description: "Ăn tối với gia đình",
    amount: 850000,
    type: "expense",
    receiptLink: null,
    timestamp: new Date().toISOString(),
    subCategory: null,
    fuelLiters: null,
    paymentMethod: "transfer",
  },
  {
    id: "2",
    rowIndex: 3,
    date: "12/04/2025",
    category: "Chi phí xe ô tô",
    description: "Đổ xăng",
    amount: 500000,
    type: "expense",
    receiptLink: null,
    timestamp: new Date().toISOString(),
    subCategory: "Xăng",
    fuelLiters: "10.5",
    paymentMethod: "transfer",
  },
  {
    id: "3",
    rowIndex: 4,
    date: "10/04/2025",
    category: "Mua đồ/dịch vụ",
    description: "Mua quần áo",
    amount: 1200000,
    type: "expense",
    receiptLink: null,
    timestamp: new Date().toISOString(),
    subCategory: null,
    fuelLiters: null,
    paymentMethod: "transfer",
  },
  {
    id: "4",
    rowIndex: 5,
    date: "05/04/2025",
    category: "Ứng tài khoản",
    description: "Lương tháng 4",
    amount: 9000000,
    type: "income",
    receiptLink: null,
    timestamp: new Date().toISOString(),
    subCategory: null,
    fuelLiters: null,
    paymentMethod: "transfer",
  },
  {
    id: "5",
    rowIndex: 6,
    date: "03/04/2025",
    category: "Chi phí khác",
    description: "Tiền điện nước",
    amount: 1200000,
    type: "expense",
    receiptLink: null,
    timestamp: new Date().toISOString(),
    subCategory: null,
    fuelLiters: null,
    paymentMethod: "transfer",
  },
]

// Mock data cho tổng kết giao dịch
const mockTransactionSummary = {
  success: true,
  totalIncome: 9000000,
  totalExpense: 3750000,
  currentBalance: 5250000,
  currentMonth: {
    income: 9000000,
    expense: 3750000,
    balance: 5250000,
  },
  lastMonth: {
    income: 8500000,
    expense: 3200000,
    balance: 5300000,
  },
  percentChange: -0.94,
}

// Mock data cho xe
const mockCarData = {
  success: true,
  carData: {
    fuelEfficiency: 7.5,
    totalDistance: 1300,
    totalLiters: 95,
    totalCost: 3600000,
    registrationDate: "01/04/2025",
    registrationDaysLeft: 365,
    insuranceDate: "01/04/2025",
    insuranceDaysLeft: 365,
    lastUpdated: new Date().toISOString(),
    startKm: 1200,
    endKm: 1300,
    totalFuelMonth: 7.5,
    fuelCost: 285000,
  },
}

// Mock functions
export async function mockGetAccountData(month: number, year: number) {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Giả lập độ trễ mạng
  return {
    success: true,
    data: mockAccountData,
    source: "mock",
  }
}

export async function mockGetTransactions(month: number, year: number) {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Giả lập độ trễ mạng
  return {
    success: true,
    transactions: mockTransactions,
  }
}

export async function mockGetTransactionSummary() {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Giả lập độ trễ mạng
  return mockTransactionSummary
}

export async function mockAddTransaction(formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Giả lập độ trễ mạng

  const date = formData.get("date") as string
  const category = formData.get("category") as string
  const description = formData.get("description") as string
  const amountStr = formData.get("amount") as string
  const type = formData.get("type") as string
  const subCategory = (formData.get("subCategory") as string) || null
  const fuelLiters = (formData.get("fuelLiters") as string) || null
  const paymentMethod = (formData.get("paymentMethod") as string) || "transfer"

  const amount = Number(amountStr.replace(/[^\d]/g, ""))

  const newTransaction = {
    id: Date.now().toString(),
    rowIndex: mockTransactions.length + 2,
    date,
    category,
    description,
    amount,
    type,
    receiptLink: null,
    timestamp: new Date().toISOString(),
    subCategory,
    fuelLiters,
    paymentMethod,
  }

  // Thêm giao dịch mới vào danh sách mock
  mockTransactions.unshift(newTransaction)

  // Cập nhật số dư
  if (type === "income") {
    mockAccountData.currentBalance += amount
  } else {
    mockAccountData.currentBalance -= amount
    mockAccountData.totalExpense += amount
    mockAccountData.accountExpenses += amount
  }

  return {
    success: true,
    transaction: newTransaction,
  }
}

export async function mockUpdateCarData(formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Giả lập độ trễ mạng

  // Cập nhật dữ liệu xe trong mock
  mockCarData.carData.fuelEfficiency = Number(formData.get("fuelEfficiency") as string)
  mockCarData.carData.totalDistance = Number(formData.get("totalDistance") as string)
  mockCarData.carData.totalLiters = Number(formData.get("totalLiters") as string)
  mockCarData.carData.totalCost = Number(formData.get("totalCost") as string)
  mockCarData.carData.registrationDate = formData.get("registrationDate") as string
  mockCarData.carData.insuranceDate = formData.get("insuranceDate") as string
  mockCarData.carData.startKm = Number(formData.get("startKm") as string)
  mockCarData.carData.endKm = Number(formData.get("endKm") as string)
  mockCarData.carData.totalFuelMonth = Number(formData.get("totalFuelMonth") as string)
  mockCarData.carData.fuelCost = Number(formData.get("fuelCost") as string)
  mockCarData.carData.lastUpdated = new Date().toISOString()

  return {
    success: true,
    message: "Dữ liệu xe đã được cập nhật thành công",
  }
}

export async function mockGetCarData() {
  await new Promise((resolve) => setTimeout(resolve, 500)) // Giả lập độ trễ mạng
  return mockCarData
}
