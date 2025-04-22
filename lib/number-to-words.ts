// Hàm chuyển đổi số thành chữ tiếng Việt
export function amountToWords(amount: number): string {
  if (amount === 0) return "Không đồng"

  const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]
  const positions = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"]

  // Hàm đọc số có 3 chữ số
  const readThreeDigits = (num: number): string => {
    const hundred = Math.floor(num / 100)
    const ten = Math.floor((num % 100) / 10)
    const unit = num % 10

    let result = ""

    if (hundred > 0) {
      result += units[hundred] + " trăm "
    }

    if (ten > 0) {
      if (ten === 1) {
        result += "mười "
      } else {
        result += units[ten] + " mươi "
      }

      if (unit === 1 && ten > 1) {
        result += "mốt"
      } else if (unit === 5 && ten > 0) {
        result += "lăm"
      } else if (unit > 0) {
        result += units[unit]
      }
    } else if (unit > 0) {
      // Chỉ thêm "lẻ" khi có hàng trăm và không có hàng chục
      if (hundred > 0) {
        result += "lẻ " + units[unit]
      } else {
        // Nếu không có hàng trăm, chỉ đọc đơn vị
        result += units[unit]
      }
    }

    return result.trim()
  }

  // Chuyển số thành chuỗi và chia thành các nhóm 3 chữ số
  const amountStr = Math.floor(amount).toString()
  const groups = []

  for (let i = amountStr.length; i > 0; i -= 3) {
    const start = Math.max(0, i - 3)
    groups.unshift(Number.parseInt(amountStr.substring(start, i)))
  }

  // Đọc từng nhóm và thêm đơn vị vị trí
  let result = ""
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    const position = positions[groups.length - i - 1]

    if (group > 0) {
      result += readThreeDigits(group) + " " + position + " "
    }
  }

  return result.trim() + " đồng"
}

// Hàm tạo các gợi ý số tiền dựa trên input
export function generateAmountSuggestions(input: string): number[] {
  if (!input || input === "0") return []

  const num = Number.parseInt(input)
  if (isNaN(num)) return []

  const suggestions = []

  // Thêm các gợi ý phổ biến
  suggestions.push(num * 1000)
  suggestions.push(num * 10000)
  suggestions.push(num * 100000)

  // Nếu số nhỏ, thêm các gợi ý lớn hơn
  if (num < 100) {
    suggestions.push(num * 1000000)
  }

  return suggestions
}

// Hàm định dạng số tiền
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount)
}
