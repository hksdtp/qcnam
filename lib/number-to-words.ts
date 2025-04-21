export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"]

function amountToWords(amount: number): string {
  if (amount === 0) {
    return "không đồng"
  }

  let words = ""
  let groupIndex = 0
  let remaining = amount

  while (remaining > 0) {
    const groupValue = remaining % 1000
    remaining = Math.floor(remaining / 1000)

    if (groupValue > 0) {
      const groupWords = readGroup(groupValue)
      words = `${groupWords} ${units[groupIndex]} ${words}`
    }

    groupIndex++
  }

  return words.trim() + " đồng"
}

function readGroup(number: number): string {
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

  let result = ""
  const hundreds = Math.floor(number / 100)
  const remainder = number % 100

  if (hundreds > 0) {
    result += `${ones[hundreds]} trăm `
  }

  if (remainder > 0) {
    if (remainder < 10) {
      if (hundreds > 0) result += "lẻ "
      result += ones[remainder]
    } else if (remainder < 20) {
      result = result + teens[remainder - 10]
    } else {
      const ten = Math.floor(remainder / 10)
      const one = remainder % 10
      result += tens[ten] + " "
      if (one > 0) {
        result += "lẻ " + ones[one]
      }
    }
  }

  return result.trim()
}

function generateAmountSuggestions(amount: string): number[] {
  const baseAmount = Number(amount)
  if (isNaN(baseAmount)) {
    return []
  }

  const suggestions = [10000, 50000, 100000, 200000, 500000]
  return suggestions.map((suggestion) => Math.round(baseAmount / suggestion) * suggestion)
}

export { amountToWords, generateAmountSuggestions }
