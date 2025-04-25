import { useState, useEffect, useRef } from "react"
import { format, addMonths, subMonths, getMonth, getYear } from "date-fns"

interface IOSDatePickerProps {
  onDateSelect: (date: Date) => void;
  initialDate?: Date | string;
  onClose?: () => void;
}

// iOS/macOS style Date Picker component
const IOSDatePicker = ({ onDateSelect, initialDate = new Date(), onClose }: IOSDatePickerProps) => {
  // Đảm bảo initialDate luôn là một đối tượng Date hợp lệ
  const ensureValidDate = (date: Date | string): Date => {
    try {
      // Nếu là chuỗi, chuyển đổi thành đối tượng Date
      if (typeof date === 'string') {
        const parsedDate = new Date(date);
        // Kiểm tra xem Date có hợp lệ không
        return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      }
      
      // Nếu đã là đối tượng Date, kiểm tra tính hợp lệ
      if (date instanceof Date) {
        return isNaN(date.getTime()) ? new Date() : date;
      }
      
      // Mặc định trả về ngày hiện tại
      return new Date();
    } catch (e) {
      console.error("Lỗi khi xử lý ngày:", e);
      return new Date();
    }
  };
  
  const validInitialDate = ensureValidDate(initialDate);
  
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [currentDate, setCurrentDate] = useState(validInitialDate)
  const [currentMonth, setCurrentMonth] = useState(validInitialDate)
  const [animation, setAnimation] = useState("")
  const datePickerRef = useRef<HTMLDivElement | null>(null)

  // Generate days in month
  const getDaysInMonth = (date: Date) => {
    const year = getYear(date)
    const month = getMonth(date)
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Get the day of the week for the first day of the month (0 = Sunday)
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    const days = []
    const totalSlots = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7

    // Add empty slots for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    // Add empty slots for days after the last day of the month
    for (let i = days.length; i < totalSlots; i++) {
      days.push(null)
    }

    return days
  }

  // Generate week days header
  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

  // Format month name
  const formatMonthName = (date: Date) => {
    return `THÁNG ${format(date, "M")}`
  }

  // Go to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // Go to next month
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Animations
  const animateOut = () => {
    if (datePickerRef.current) {
      setAnimation("animate-out");
      setTimeout(() => {
        setShowDatePicker(false);
        setAnimation("");
        if (onClose) onClose();
      }, 200);
    }
  };

  const animateIn = () => {
    if (datePickerRef.current) {
      try {
        // Web Animation API có thể không được nhận dạng bởi TypeScript
        // Ép kiểu để tránh lỗi TypeScript
        (datePickerRef.current as any).animate(
          [
            { transform: "translateY(20px)", opacity: 0 },
            { transform: "translateY(0)", opacity: 1 },
          ],
          {
            duration: 300,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "forwards",
          }
        );
      } catch (e) {
        console.error("Lỗi khi thực hiện animation:", e);
      }
    }
  };

  // Open date picker with animation
  const openDatePicker = () => {
    setShowDatePicker(true)
    requestAnimationFrame(() => {
      animateIn();
    });
  }

  // Close date picker with animation
  const closeDatePicker = () => {
    animateOut();
  }

  // Handle date selection with animation
  const handleDateSelect = (day: number | null, element: HTMLElement | null) => {
    if (day) {
      // Animate the selected date with a pulse effect
      if (element) {
        try {
          // Web Animation API có thể không được nhận dạng bởi TypeScript
          // Ép kiểu để tránh lỗi TypeScript
          (element as any).animate(
            [
              { transform: "scale(1)", background: "#f3f4f6" },
              { transform: "scale(1.2)", background: "#f9fafb" },
              { transform: "scale(1)", background: "#f3f4f6" },
            ],
            {
              duration: 300,
              easing: "ease-in-out",
            }
          );
        } catch (e) {
          console.error("Lỗi khi thực hiện animation:", e);
        }
      }

      // Create new date object
      const newDate = new Date(currentMonth);
      newDate.setDate(day);
      
      // Update state
      setCurrentDate(newDate);
      
      // Callback
      onDateSelect(newDate);
      
      // Auto close after selection
      closeDatePicker();
    }
  };

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (datePickerRef.current && !(datePickerRef.current as HTMLElement).contains(event.target as Node)) {
        closeDatePicker()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDatePicker])

  const isCurrentDay = (day: number | null): boolean => {
    if (day === null) return false;
    
    try {
      const today = new Date()
      return (
        day === today.getDate() &&
        getMonth(currentMonth) === today.getMonth() &&
        getYear(currentMonth) === today.getFullYear()
      )
    } catch (e) {
      console.error("Lỗi khi kiểm tra ngày hiện tại:", e);
      return false;
    }
  }

  const isSelectedDay = (day: number | null): boolean => {
    if (day === null) return false;
    
    try {
      return (
        day === currentDate.getDate() &&
        getMonth(currentMonth) === getMonth(currentDate) &&
        getYear(currentMonth) === getYear(currentDate)
      )
    } catch (e) {
      console.error("Lỗi khi kiểm tra ngày được chọn:", e);
      return false;
    }
  }

  // Sử dụng try-catch để xử lý lỗi khi định dạng ngày
  let formattedDate = "";
  try {
    formattedDate = format(currentDate, "dd/MM/yyyy");
  } catch (e) {
    console.error("Lỗi khi định dạng ngày:", e, currentDate);
    formattedDate = format(new Date(), "dd/MM/yyyy");
  }

  const handleClick = () => {
    openDatePicker()
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={formattedDate}
        readOnly
        onClick={handleClick}
        className="w-full rounded-md h-10 text-sm border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 cursor-pointer"
      />
      {showDatePicker && (
        <div
          ref={datePickerRef}
          className={`absolute left-0 w-[330px] bg-white rounded-md shadow-lg mt-1 z-50 p-4 border border-gray-200 transition-all duration-150 ${animation}`}
          style={{
            transformOrigin: "top center",
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 12L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="text-sm font-semibold">{formatMonthName(currentMonth)}</div>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 12L10 8L6 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map((day, i) => (
              <div
                key={i}
                className="text-[10px] font-medium text-gray-500 text-center p-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((day, i) => (
              <button
                key={i}
                type="button"
                disabled={day === null}
                onClick={(e) => handleDateSelect(day, e.currentTarget)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-colors duration-200 disabled:opacity-0 relative ${
                  isSelectedDay(day)
                    ? "bg-blue-500 text-white font-medium"
                    : isCurrentDay(day)
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "hover:bg-gray-100"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={closeDatePicker}
              className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default IOSDatePicker
