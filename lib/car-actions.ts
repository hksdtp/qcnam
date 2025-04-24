"use server"

import { revalidatePath } from "next/cache"
import { initGoogleAPIs, getSpreadsheetId } from "@/lib/google-service"

// Hàm đảm bảo sheet Xe tồn tại
export async function ensureCarSheetSetup() {
  try {
    const { sheets } = await initGoogleAPIs()
    const SPREADSHEET_ID = await getSpreadsheetId()
    const SHEET_NAME = "Xe"

    console.log(`Kiểm tra sheet ${SHEET_NAME} trong bảng tính ID: ${SPREADSHEET_ID}`)

    // Kiểm tra sheet Xe tồn tại
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      includeGridData: false,
    })

    // Lấy danh sách tất cả các sheet
    const allSheets = response.data.sheets.map((s: any) => s.properties.title)
    console.log("Danh sách sheet:", allSheets)

    const sheetExists = response.data.sheets.some((sheet: any) => sheet.properties.title === SHEET_NAME)
    console.log(`Sheet "${SHEET_NAME}" tồn tại: ${sheetExists}`)

    if (!sheetExists) {
      console.log(`Tạo sheet mới: ${SHEET_NAME}`)
      // Tạo sheet Xe
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: SHEET_NAME,
                },
              },
            },
          ],
        },
      })

      // Thêm tiêu đề và dữ liệu mẫu
      console.log("Thêm tiêu đề và dữ liệu mẫu cho sheet")
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:B15`,
        valueInputOption: "RAW",
        resource: {
          values: [
            ["Thông số", "Giá trị"],
            ["Tiêu hao nhiên liệu", "7.50"],
            ["Tổng quãng đường", "1300.0"],
            ["Tổng số lít xăng đã đổ", "95"],
            ["Tổng tiền xăng đã đổ", "3600000"],
            ["Hạn đăng kiểm", "1/4/2025"],
            ["Hạn bảo hiểm thân vỏ", "1/4/2025"],
            ["Cập nhật lần cuối", new Date().toISOString()],
            ["Km đầu tháng", "1200"],
            ["Km cuối tháng", "1300"],
            ["Xăng đã đổ tháng này", "7.5"],
            ["Chi phí xăng tháng này", "285000"],
          ],
        },
      })

      console.log("Đã tạo sheet và thêm dữ liệu mẫu thành công")
    }

    return { success: true, message: "Sheet Xe đã được thiết lập" }
  } catch (error) {
    console.error("Lỗi thiết lập sheet Xe:", error)
    return { success: false, error: error.message || "Lỗi không xác định" }
  }
}

// Hàm lấy dữ liệu xe
export async function getCarData() {
  try {
    // Đảm bảo sheet Xe tồn tại
    const setupResult = await ensureCarSheetSetup()
    if (!setupResult.success) {
      throw new Error(setupResult.error || "Không thể thiết lập sheet Xe")
    }

    const { sheets } = await initGoogleAPIs()
    const SPREADSHEET_ID = await getSpreadsheetId()
    const SHEET_NAME = "Xe"
    const TRANSACTIONS_SHEET = "Sheet1"

    // Lấy dữ liệu từ sheet Xe
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:B15`,
    })

    const values = response.data.values || []
    console.log("Dữ liệu xe:", values)

    // Chuyển đổi dữ liệu thành đối tượng
    const carData: Record<string, string> = {}
    for (let i = 1; i < values.length; i++) {
      if (values[i] && values[i].length >= 2) {
        carData[values[i][0]] = values[i][1]
      }
    }

    // Lấy tháng và năm hiện tại
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1 // JS months are 0-indexed
    const currentYear = currentDate.getFullYear()

    // Lấy tất cả giao dịch xăng trong tháng hiện tại
    try {
      const transactionResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${TRANSACTIONS_SHEET}!A2:K`,
      })

      const transactionRows = transactionResponse.data.values || []
      let totalFuelLiters = 0
      let totalFuelCost = 0

      for (const row of transactionRows) {
        // Skip rows that are too short
        if (row.length < 8) continue;

        // Parse date format dd/mm/yyyy
        const dateStr = row[0];
        const dateParts = dateStr.split('/');
        if (dateParts.length === 3) {
          const transactionDay = parseInt(dateParts[0], 10);
          const transactionMonth = parseInt(dateParts[1], 10);
          const transactionYear = parseInt(dateParts[2], 10);

          // Check if transaction is from current month
          if (transactionMonth === currentMonth && transactionYear === currentYear) {
            const category = row[1] || "";
            const subCategory = row[7] || "";
            
            // Check if it's a fuel transaction (car expense category and fuel subcategory)
            if (category === "Chi phí xe ô tô" && subCategory === "Xăng") {
              const amount = parseFloat(row[3] || "0");
              const fuelLiters = parseFloat(row[8] || "0");
              
              if (!isNaN(amount)) {
                totalFuelCost += amount;
              }
              
              if (!isNaN(fuelLiters)) {
                totalFuelLiters += fuelLiters;
              }
            }
          }
        }
      }

      console.log(`Tháng ${currentMonth}: tổng ${totalFuelLiters} lít, tổng chi phí ${totalFuelCost}`);

      // Tính số ngày còn lại cho hạn đăng kiểm và bảo hiểm
      const today = new Date()
      const registrationDate = parseVietnameseDate(carData["Hạn đăng kiểm"] || "")
      const insuranceDate = parseVietnameseDate(carData["Hạn bảo hiểm thân vỏ"] || "")

      const registrationDaysLeft = registrationDate
        ? Math.ceil((registrationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      const insuranceDaysLeft = insuranceDate
        ? Math.ceil((insuranceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      // Cập nhật dữ liệu xăng từ giao dịch nếu có
      const syncedFuelMonth = totalFuelLiters > 0 ? totalFuelLiters : parseFloat(carData["Xăng đã đổ tháng này"] || "0") 
      const syncedFuelCost = totalFuelCost > 0 ? totalFuelCost : parseFloat(carData["Chi phí xăng tháng này"] || "0")

      // Tính toán tiêu hao nhiên liệu thực tế
      const startKm = parseFloat(carData["Km đầu tháng"] || "0")
      const endKm = parseFloat(carData["Km cuối tháng"] || "0")
      const distance = endKm - startKm
      const actualEfficiency = distance > 0 && syncedFuelMonth > 0 ? (syncedFuelMonth / distance) * 100 : 0

      return {
        success: true,
        carData: {
          // Dữ liệu tổng thể
          fuelEfficiency: parseFloat(carData["Tiêu hao nhiên liệu"] || "0"),
          totalDistance: parseFloat(carData["Tổng quãng đường"] || "0"),
          totalLiters: parseFloat(carData["Tổng số lít xăng đã đổ"] || "0"),
          totalCost: parseFloat(carData["Tổng tiền xăng đã đổ"] || "0"),
          registrationDate: carData["Hạn đăng kiểm"] || "",
          registrationDaysLeft,
          insuranceDate: carData["Hạn bảo hiểm thân vỏ"] || "",
          insuranceDaysLeft,
          lastUpdated: carData["Cập nhật lần cuối"] || new Date().toISOString(),
          // Dữ liệu tháng
          startKm: parseFloat(carData["Km đầu tháng"] || "0"),
          endKm: parseFloat(carData["Km cuối tháng"] || "0"),
          totalFuelMonth: syncedFuelMonth, // Synchronized with transactions
          fuelCost: syncedFuelCost, // Synchronized with transactions
          actualEfficiency: actualEfficiency,
          // Transaction sync data for debugging
          transactionSyncData: {
            totalFuelLiters,
            totalFuelCost,
            monthDistance: distance
          }
        },
      }
    } catch (transactionError) {
      console.error("Lỗi khi đồng bộ dữ liệu giao dịch:", transactionError);
      // Fallback to original data if transaction syncing fails
      return {
        success: true,
        carData: {
          fuelEfficiency: parseFloat(carData["Tiêu hao nhiên liệu"] || "0"),
          totalDistance: parseFloat(carData["Tổng quãng đường"] || "0"),
          totalLiters: parseFloat(carData["Tổng số lít xăng đã đổ"] || "0"),
          totalCost: parseFloat(carData["Tổng tiền xăng đã đổ"] || "0"),
          registrationDate: carData["Hạn đăng kiểm"] || "",
          registrationDaysLeft,
          insuranceDate: carData["Hạn bảo hiểm thân vỏ"] || "",
          insuranceDaysLeft,
          lastUpdated: carData["Cập nhật lần cuối"] || new Date().toISOString(),
          // Monthly data
          startKm: parseFloat(carData["Km đầu tháng"] || "0"),
          endKm: parseFloat(carData["Km cuối tháng"] || "0"),
          totalFuelMonth: parseFloat(carData["Xăng đã đổ tháng này"] || "0"),
          fuelCost: parseFloat(carData["Chi phí xăng tháng này"] || "0"),
        },
      }
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu xe:", error)
    return {
      success: false,
      error: error.message || "Lỗi không xác định khi lấy dữ liệu xe",
    }
  }
}

// Hàm cập nhật dữ liệu xe
export async function updateCarData(formData: FormData) {
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

// Hàm hỗ trợ phân tích ngày định dạng Việt Nam (DD/MM/YYYY)
function parseVietnameseDate(dateString: string): Date | null {
  if (!dateString) return null

  const parts = dateString.split("/")
  if (parts.length !== 3) return null

  const day = Number.parseInt(parts[0], 10)
  const month = Number.parseInt(parts[1], 10) - 1 // Tháng trong JavaScript bắt đầu từ 0
  const year = Number.parseInt(parts[2], 10)

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null

  return new Date(year, month, day)
}
