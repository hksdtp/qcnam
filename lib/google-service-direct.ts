import { google } from "googleapis"
import { JWT } from "google-auth-library"

// Lấy thông tin từ biến môi trường
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || ""
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || ""
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || ""
const GOOGLE_PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n")

// Biến lưu trữ token và thời gian hết hạn
let accessToken: string | null = null
let tokenExpiry = 0

// Tạo JWT client sử dụng thông tin xác thực tài khoản dịch vụ
let auth: JWT | null = null
let sheets: any = null
let drive: any = null

// Khởi tạo Google APIs
export function initGoogleAPIs() {
  try {
    if (!auth) {
      console.log("Khởi tạo Google APIs với tài khoản:", GOOGLE_CLIENT_EMAIL)

      auth = new JWT({
        email: GOOGLE_CLIENT_EMAIL,
        key: GOOGLE_PRIVATE_KEY,
        scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"],
      })

      sheets = google.sheets({ version: "v4", auth })
      drive = google.drive({ version: "v3", auth })
    }

    return { auth, sheets, drive }
  } catch (error) {
    console.error("Lỗi khởi tạo Google APIs:", error)
    throw error
  }
}

// Hàm lấy token xác thực
export async function getAccessToken() {
  try {
    // Kiểm tra nếu token hiện tại vẫn còn hiệu lực
    const currentTime = Math.floor(Date.now() / 1000)
    if (accessToken && tokenExpiry > currentTime + 300) {
      return accessToken
    }

    // Lấy token mới
    const token = await auth?.getAccessToken()
    if (token) {
      accessToken = token.token || ""
      tokenExpiry = currentTime + (token.expiresIn || 3600)
      return accessToken
    }

    throw new Error("Không thể lấy access token")
  } catch (error) {
    console.error("Lỗi lấy access token:", error)
    throw error
  }
}

// Lấy ID bảng tính
export function getSpreadsheetId() {
  return SPREADSHEET_ID
}

// Lấy ID thư mục Drive
export function getDriveFolderId() {
  return DRIVE_FOLDER_ID
}
