// Thêm 'use server' directive để đảm bảo code chỉ chạy ở server-side
"use server"

import { google } from "googleapis"
import { JWT } from "google-auth-library"

// Cập nhật cấu hình với ID mới
const SPREADSHEET_ID = "1JwFzEMRZsxAuIzMV0XRSI5X98AXeGa9f2cXVkUzXReE"
// Cập nhật tên sheet chính xác - thường là "Sheet1" hoặc "Trang tính1"
const SHEET_NAME = "Sheet1"
// Thêm tên sheet Vi
const VI_SHEET_NAME = "Vi"
// ID thư mục Google Drive mới
const DRIVE_FOLDER_ID = "1BoiKfWBpriBmdyXhUbpv-GKM2bPmGvRn"

// Cập nhật thông tin xác thực tài khoản dịch vụ với khóa mới
const serviceAccount = {
  type: "service_account",
  project_id: "qlct-455215",
  private_key_id: "4a97b987058053d800ae226b4c3c12efc3bfac4c",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDWCPPnK2Wxdy8K\nLDWb4zsgfpM801T1ergruKeFGy3sy2PX8nbHEmY+09PKmoxYB/L0ZaxSUlzZy5/1\nN8EVzMXfSzje1gxv6PGeUiiV7oVtNveYfpJDk42moRUuffAazoJXR5G/xY+lWqSm\nqm0sYgu/GIbVV2j/NHSqX66gLg/YV5+JIdYnPEPoBqa4yNjA10+xe3LYNLYwrpYc\neFAYSh+yv3Juts1hWGVGcUGEnXIk2v2ebUAoQg8K+o4mZCnmH+DHAKcNjPdfk77F\nj3KqBeyIY1+yvvQWO9d+n/nKJe7YZX8zJRPUoyN33lqmv27At8WhKwX0sOYnsLU9\nkrc/ub7RAgMBAAECggEABWZZ99Y02+kZFJPwf+/pWGBjTqfzh+czvdWMGSEV0kzG\nDE5bLcjTRxXde7LsMrAuGzOL1NLx8b5aE1kDbhj1UZIUq6Iujd9STqgu+X1g/Bn7\nxlO4mtpM6YZUZPl4gK+KcaWJAJO3cUQzNaytUcwD/ZPog0tKHoc+2syd/osvUQ/G\ngE5rqwJLggdl8+nE1QQxVYq83JnUtLa2XrXqUb99V4+Da8gVBbBkxTwKc1mOt00v\n/vCZGtYYu/YfrtrbD/+VFx4ZAUEsBKMa7RbBnmEadidbvmprQWoR20k0fO+gscAv\nAJh13rSK5RxXDhk6UVMqgjKFlgj00cCUiRLzMzFQwwKBgQDxz0+H5Ng0W7c3MldX\nzcSNb1yeFKsWew5z60Rag1sGybcKAhqksfhshuTsOuJrCqy8amr3jtqPRjyMUHZm\nhnG2+1/g8w/2PFlb+aTMRKBPQj7Vh+Sh0LiijQPMt6cMYZVJ+8I3H2iabpCiuePN\nyFKr3Ac9p2Vfw4oKz6ny4DvxewKBgQDimGIJH7UQLjyI8l5xS6WuliQBNh5Mlg1y\nIBljEI3rY5jwZCEDgvq5oKHXFPzwzNmmRHLhqRMOQP7WkEM6nBIEE7jomsKQ6gxH\nThSj+3NgdKtbjH29oX7X+cV7EH45V+3h3d8B2x6hBL+57SqAFN9UsMnt3jJfkQoj\no3u1iU7BIwKBgQC5FqoVpsEnMpzHDy1z8/jjGb6W8dMTXhXt/MNRVQIz6+rDKmEi\nd2dkCsznVRtCO+WEQyClZR8+U9C8xkoaqAYavcbh9KrfG8p6cFgIUu8yO87Eu0Px\n6EWrhqzF4j1naLpQ6vf6IXx72O204PzR4ugEzGJuetdJue7L37CCS8kWSQKBgEgN\n/N653nHOwiEqMS4FyCHETJ61/tyLuqrX2jrOQNLhUPjgXj8nn2L32X7zhZttCKj+\niymHAjA+KstABKDWkEQLoXkV/VjnlA/4nEeo5f9+Gh96hWGPwS4clteTXxANDfAN\nBaUpcIvzXqRY7nLcMEhWD2A8j/gjvv2mNuh7STfRAoGAQGHqr6ovLR/ImndaMLiB\nHMrxn0cBoSrzCQaDbATcj95V2HBKJpXcFH9gtQ/iVvAZ9MMC6a/PSvqdS17mYI+t\nbLbmm0aHZna25lVbQgUzLXqyPnqtjoAVCVUR32AOyuhSxCu9A3rIUUQc6apBKXcJ\nIsj6XqjyLPYOv77uUPNEDZs=\n-----END PRIVATE KEY-----\n",
  client_email: "nihreport@qlct-455215.iam.gserviceaccount.com",
  client_id: "105976955157285476068",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/nihreport%40qlct-455215.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
}

// Khởi tạo Google APIs - Chuyển thành async function
export async function initGoogleAPIs() {
  try {
    console.log("Khởi tạo Google APIs với tài khoản:", serviceAccount.client_email)

    // Luôn tạo mới JWT client để tránh vấn đề với biến toàn cục trong môi trường serverless
    const auth = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"],
    })

    const sheets = google.sheets({ version: "v4", auth })
    const drive = google.drive({ version: "v3", auth })

    return { auth, sheets, drive }
  } catch (error) {
    console.error("Lỗi khởi tạo Google APIs:", error)
    throw error
  }
}

// Hàm lấy token xác thực - Đã là async function
export async function getAccessToken() {
  try {
    // Luôn tạo mới JWT client để tránh vấn đề với biến toàn cục
    const { auth } = await initGoogleAPIs()

    // Lấy token mới
    const token = await auth.getAccessToken()
    if (!token || !token.token) {
      throw new Error("Không thể lấy access token: Token không hợp lệ")
    }

    return token.token
  } catch (error) {
    console.error("Lỗi lấy access token:", error)
    throw new Error(`Không thể lấy access token: ${error.message}`)
  }
}

// Lấy ID bảng tính - Chuyển thành async function
export async function getSpreadsheetId() {
  return SPREADSHEET_ID
}

// Lấy ID thư mục Drive - Chuyển thành async function
export async function getDriveFolderId() {
  return DRIVE_FOLDER_ID
}

// Đảm bảo bảng tính tồn tại và có đúng tiêu đề - Đã là async function
export async function ensureSpreadsheetSetup() {
  const { sheets } = await initGoogleAPIs()

  try {
    console.log(`Kiểm tra bảng tính ID: ${SPREADSHEET_ID}`)

    // Kiểm tra bảng tính tồn tại
    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    console.log(`Bảng tính tồn tại: ${spreadsheetResponse.data.properties?.title}`)

    // Kiểm tra sheet Transactions tồn tại
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      includeGridData: false,
    })

    // Lấy danh sách tất cả các sheet
    const allSheets = response.data.sheets.map((s: any) => s.properties.title)
    console.log("Danh sách sheet:", allSheets)

    const sheetExists = response.data.sheets.some((sheet: any) => sheet.properties.title === SHEET_NAME)
    console.log(`Sheet "${SHEET_NAME}" tồn tại: ${sheetExists}`)

    // Kiểm tra sheet Vi tồn tại
    const viSheetExists = response.data.sheets.some((sheet: any) => sheet.properties.title === VI_SHEET_NAME)
    console.log(`Sheet "${VI_SHEET_NAME}" tồn tại: ${viSheetExists}`)

    if (!sheetExists) {
      console.log(`Tạo sheet mới: ${SHEET_NAME}`)
      // Tạo sheet Transactions
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

      // Thêm tiêu đề
      console.log("Thêm tiêu đề cho sheet")
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:H1`,
        valueInputOption: "RAW",
        resource: {
          values: [["Date", "Category", "Description", "Amount", "Type", "ReceiptLink", "Timestamp", "SubCategory"]],
        },
      })

      console.log("Đã tạo sheet và thêm tiêu đề thành công")
    }

    // Tạo sheet Vi nếu chưa tồn tại
    if (!viSheetExists) {
      console.log(`Tạo sheet mới: ${VI_SHEET_NAME}`)
      // Tạo sheet Vi
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: VI_SHEET_NAME,
                },
              },
            },
          ],
        },
      })

      // Thêm tiêu đề cho sheet Vi
      console.log("Thêm tiêu đề cho sheet Vi")
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${VI_SHEET_NAME}!A1:H1`,
        valueInputOption: "RAW",
        resource: {
          values: [["Date", "Category", "Description", "Amount", "Type", "ReceiptLink", "Timestamp", "SubCategory"]],
        },
      })

      console.log(`Đã tạo sheet ${VI_SHEET_NAME} và thêm tiêu đề thành công`)
    }

    return SPREADSHEET_ID
  } catch (error) {
    console.error("Lỗi thiết lập bảng tính:", error)
    throw error
  }
}

// Đảm bảo thư mục Drive tồn tại - Đã là async function
export async function ensureDriveFolderSetup() {
  const { drive } = await initGoogleAPIs()

  try {
    console.log(`Kiểm tra thư mục Drive ID: ${DRIVE_FOLDER_ID}`)

    // Kiểm tra thư mục tồn tại
    const folderResponse = await drive.files.get({
      fileId: DRIVE_FOLDER_ID,
      fields: "id,name,mimeType",
    })

    console.log(`Thư mục tồn tại: ${folderResponse.data.name}, loại: ${folderResponse.data.mimeType}`)

    return DRIVE_FOLDER_ID
  } catch (error) {
    console.error("Lỗi kiểm tra thư mục Drive:", error)
    throw error
  }
}

export async function getGoogleSheetClient() {
  const { sheets } = await initGoogleAPIs()
  return sheets
}

// Thêm hàm kiểm tra sheet Vi
export async function checkViSheetExists() {
  try {
    const { sheets } = await initGoogleAPIs()
    const SPREADSHEET_ID = await getSpreadsheetId()

    const sheetsInfo = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    })

    const exists = sheetsInfo.data.sheets?.some((sheet) => sheet.properties?.title === VI_SHEET_NAME)
    console.log(`Sheet "${VI_SHEET_NAME}" tồn tại: ${exists}`)

    return exists
  } catch (error) {
    console.error(`Lỗi khi kiểm tra sheet ${VI_SHEET_NAME}:`, error)
    throw error
  }
}

// Thêm hàm lấy tên sheet Vi
export async function getViSheetName() {
  return VI_SHEET_NAME
}
