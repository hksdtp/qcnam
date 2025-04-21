// Cấu hình sử dụng mock service
export const USE_MOCK_SERVICES = true

// Mock data cho account-data API
export async function mockGetAccountData(month: number, year: number) {
  // Tạo dữ liệu mẫu cho tài khoản
  const mockData = {
    currentBalance: 5000000, // Số dư hiện có
    totalExpense: 8500000, // Tổng chi tiêu tháng
    beginningBalance: 3000000, // Số dư đầu kỳ
    totalAdvanced: 10500000, // Tổng đã ứng tháng này
    accountRemaining: 5000000, // Tài khoản còn
    accountExpenses: 8500000, // Tài khoản chi
    cashRemaining: 2000000, // Tiền mặt còn
    cashExpenses: 0, // Tiền mặt chi
    totalFuel: 0, // Tổng lít xăng
  }

  return {
    success: true,
    data: mockData,
    source: "mock",
  }
}

// Mock data cho transactions API
export async function mockGetTransactions(month: number, year: number) {
  // Tạo dữ liệu mẫu cho giao dịch
  const mockTransactions = [
    {
      id: "1",
      date: `${month < 10 ? "0" + month : month}/04/${year}`,
      category: "Chi phí sinh hoạt",
      description: "Tiền điện tháng 4",
      amount: 500000,
      type: "expense",
      receiptLink: null,
      timestamp: new Date().toISOString(),
      paymentMethod: "card",
    },
    {
      id: "2",
      date: `${month < 10 ? "0" + month : month}/10/${year}`,
      category: "Chi phí sinh hoạt",
      description: "Tiền nước tháng 4",
      amount: 200000,
      type: "expense",
      receiptLink: null,
      timestamp: new Date().toISOString(),
      paymentMethod: "card",
    },
    {
      id: "3",
      date: `${month < 10 ? "0" + month : month}/15/${year}`,
      category: "Chi phí sinh hoạt",
      description: "Tiền internet tháng 4",
      amount: 300000,
      type: "expense",
      receiptLink: null,
      timestamp: new Date().toISOString(),
      paymentMethod: "card",
    },
    {
      id: "4",
      date: `${month < 10 ? "0" + month : month}/20/${year}`,
      category: "Chi phí sinh hoạt",
      description: "Tiền điện thoại tháng 4",
      amount: 200000,
      type: "expense",
      receiptLink: null,
      timestamp: new Date().toISOString(),
      paymentMethod: "card",
    },
    {
      id: "5",
      date: `${month < 10 ? "0" + month : month}/01/${year}`,
      category: "Lương",
      description: "Lương tháng 4",
      amount: 10500000,
      type: "income",
      receiptLink: null,
      timestamp: new Date().toISOString(),
      paymentMethod: "card",
    },
  ]

  return {
    success: true,
    transactions: mockTransactions,
  }
}

// Mock data cho transaction-summary API
export async function mockGetTransactionSummary() {
  return {
    totalIncome: 10500000,
    totalExpense: 8500000,
    balance: 2000000,
  }
}

// Mock data cho top-expense-categories API
export async function mockGetTopExpenseCategories() {
  return [
    { category: "Chi phí sinh hoạt", amount: 1200000 },
    { category: "Ăn uống", amount: 3000000 },
    { category: "Di chuyển", amount: 1500000 },
    { category: "Mua sắm", amount: 2000000 },
    { category: "Giải trí", amount: 800000 },
  ]
}

// Mock data cho car-data API
export async function mockGetCarData() {
  return {
    success: true,
    carData: {
      totalFuel: 50,
      totalDistance: 1000,
      fuelEfficiency: 20,
      totalFuelCost: 1500000,
      costPerKm: 1500,
    },
  }
}
