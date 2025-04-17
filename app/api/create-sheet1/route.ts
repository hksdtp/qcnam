import { NextResponse } from "next/server"
import { initGoogleAPIs, getSpreadsheetId } from "@/lib/google-service"

// Đảm bảo API route này chạy trong Node.js runtime
export const runtime = "nodejs"

// Ngăn chặn caching để luôn lấy dữ liệu mới nhất
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: Request) {
  try {
    console.log("API: Tạo Sheet1")

    // Khởi tạo Google APIs
    const { sheets } = await initGoogleAPIs()
    const SPREADSHEET_ID = await getSpreadsheetId()

    // Kiểm tra xem Sheet1 đã tồn tại chưa
    const sheetsInfo = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    const sheet1Exists = sheetsInfo.data.sheets?.some((sheet) => sheet.properties?.title === "Sheet1")

    if (sheet1Exists) {
      console.log("Sheet1 đã tồn tại, cập nhật tiêu đề")

      // Cập nhật tiêu đề cho Sheet1
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: "Sheet1!A1:K1",
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [
            [
              "Ngày",
              "Danh mục",
              "Mô tả",
              "Số tiền",
              "Loại",
              "Link hóa đơn",
              "Thời gian",
              "Danh mục phụ",
              "Số lượng",
              "Phương thức thanh toán",
              "Ghi chú",
            ],
          ],
        },
      })

      return NextResponse.json({
        success: true,
        message: "Đã cập nhật tiêu đề Sheet1 thành công",
      })
    }

    // Nếu Sheet1 chưa tồn tại, tạo mới
    console.log("Sheet1 chưa tồn tại, tạo mới")

    // Tạo Sheet1
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: "Sheet1",
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 11,
                },
              },
            },
          },
        ],
      },
    })

    // Thêm tiêu đề cho Sheet1
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A1:K1",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          [
            "Ngày",
            "Danh mục",
            "Mô tả",
            "Số tiền",
            "Loại",
            "Link hóa đơn",
            "Thời gian",
            "Danh mục phụ",
            "Số lượng",
            "Phương thức thanh toán",
            "Ghi chú",
          ],
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Đã tạo và thiết lập Sheet1 thành công",
    })
  } catch (error) {
    console.error("Lỗi khi tạo Sheet1:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi không xác định khi tạo Sheet1",
      },
      { status: 500 },
    )
  }
}
