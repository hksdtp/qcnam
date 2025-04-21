export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"]

export function amountToWords(amount: number): string {
  if (amount === 0) {
    return "không đồng"
  }

  let words = ""
  let remaining = amount
  let unitIndex = 0

  while (remaining > 0) {
    const segment = remaining % 1000
    if (segment > 0) {
      const segmentWords = readSegment(segment)
      words = `${segmentWords} ${units[unitIndex]} ${words}`
    }
    remaining = Math.floor(remaining / 1000)
    unitIndex++
  }

  return words.trim() + " đồng"
}

function readSegment(segment: number): string {
  const ones = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]
  const teens = [
    "mười",
    "mười một",
    "mười hai",
    "mười ba",
    "mười bốn",
    "mười lăm",
    "mười sáu",
    "mười bảy",
    "mười tám",
    "mười chín",
  ]
  const tens = ["", "", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"]

  let words = ""
  const hundred = Math.floor(segment / 100)
  if (hundred > 0) {
    words += `${ones[hundred]} trăm `
  }

  const remainder = segment % 100
  if (remainder > 0) {
    if (remainder < 10) {
      if (hundred > 0) words += "lẻ "
      words += ones[remainder]
    } else if (remainder < 20) {
      words += teens[remainder - 10]
    } else {
      const ten = Math.floor(remainder / 10)
      words += tens[ten] + " "
      const one = remainder % 10
      if (one > 0) {
        words += one === 5 ? "lăm" : ones[one]
      }
    }
  }

  return words
}

export function generateAmountSuggestions(amountStr: string): number[] {
  const amount = Number(amountStr)
  if (isNaN(amount)) {
    return []
  }

  const base = Math.pow(10, amountStr.length - 1)
  return [base, base * 2, base * 5]
}
