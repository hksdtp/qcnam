"use client"

import { useState, useEffect, useRef } from "react"
import { format, addMonths, subMonths, getMonth, getYear } from "date-fns"

// iOS/macOS style Date Picker component
const IOSDatePickerComponent = ({ onDateSelect, initialDate = new Date(), onClose }) => {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [currentMonth, setCurrentMonth] = useState(initialDate)
  const [animation, setAnimation] = useState("")
  const datePickerRef = useRef(null)

  // Generate days in month
  const getDaysInMonth = (date) => {
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
  const formatMonthName = (date) => {
    return `THÁNG ${format(date, "M")}`
  }

  // Handle month navigation with enhanced animations
  const prevMonth = () => {
    // Don't use setAnimation here which affects entire grid visibility

    // Animate the calendar container for a smoother transition
    const calendarGrid = document.querySelector(".calendar-grid")
    if (calendarGrid) {
      calendarGrid.animate(
        [
          { transform: "translateX(0)", opacity: 1 },
          { transform: "translateX(8%)", opacity: 0.3 },
        ],
        {
          duration: 150,
          easing: "ease-out",
          fill: "forwards",
        },
      )
    }

    setTimeout(() => {
      setCurrentMonth(subMonths(currentMonth, 1))

      // Animate the new month coming in
      if (calendarGrid) {
        calendarGrid.animate(
          [
            { transform: "translateX(-8%)", opacity: 0.3 },
            { transform: "translateX(0)", opacity: 1 },
          ],
          {
            duration: 200,
            easing: "ease-out",
            fill: "forwards",
          },
        )
      }
    }, 150)
  }

  const nextMonth = () => {
    // Don't use setAnimation here which affects entire grid visibility

    // Animate the calendar container for a smoother transition
    const calendarGrid = document.querySelector(".calendar-grid")
    if (calendarGrid) {
      calendarGrid.animate(
        [
          { transform: "translateX(0)", opacity: 1 },
          { transform: "translateX(-8%)", opacity: 0.3 },
        ],
        {
          duration: 150,
          easing: "ease-out",
          fill: "forwards",
        },
      )
    }

    setTimeout(() => {
      setCurrentMonth(addMonths(currentMonth, 1))

      // Animate the new month coming in
      if (calendarGrid) {
        calendarGrid.animate(
          [
            { transform: "translateX(8%)", opacity: 0.3 },
            { transform: "translateX(0)", opacity: 1 },
          ],
          {
            duration: 200,
            easing: "ease-out",
            fill: "forwards",
          },
        )
      }
    }, 150)
  }

  // Handle date selection with animation
  const handleDateSelect = (day, element) => {
    if (day) {
      // Animate the selected date with a pulse effect
      if (element) {
        element.animate(
          [
            { transform: "scale(1)", backgroundColor: "rgba(239, 68, 68, 0.8)" },
            { transform: "scale(1.1)", backgroundColor: "rgba(239, 68, 68, 1)" },
            { transform: "scale(1)", backgroundColor: "rgba(239, 68, 68, 0.9)" },
          ],
          {
            duration: 300,
            easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            fill: "forwards",
          },
        )
      }

      const selectedDate = new Date(getYear(currentMonth), getMonth(currentMonth), day)
      setCurrentDate(selectedDate)

      // Delay closing slightly to see the selection animation
      setTimeout(() => {
        if (onDateSelect) {
          onDateSelect(selectedDate)
        }
        closeDatePicker()
      }, 250)
    }
  }

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target) && showDatePicker) {
        closeDatePicker()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDatePicker])

  // Open date picker with enhanced animation
  const openDatePicker = () => {
    setShowDatePicker(true)
    // Use a very short timeout to ensure the DOM is updated before animation starts
    setTimeout(() => {
      setAnimation("fade-in")
    }, 10)

    // Add spring-like bounce animation to the date picker
    const element = datePickerRef.current
    if (element) {
      element.animate(
        [
          { transform: "scale(0.95)", opacity: 0 },
          { transform: "scale(1.02)", opacity: 1, offset: 0.7 },
          { transform: "scale(1)", opacity: 1 },
        ],
        {
          duration: 350,
          easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", // Spring-like easing
          fill: "forwards",
        },
      )
    }
  }

  // Close date picker with enhanced animation
  const closeDatePicker = () => {
    setAnimation("fade-out")

    // Add closing animation
    const element = datePickerRef.current
    if (element) {
      element.animate(
        [
          { transform: "scale(1)", opacity: 1 },
          { transform: "scale(0.95)", opacity: 0 },
        ],
        {
          duration: 250,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          fill: "forwards",
        },
      )
    }

    setTimeout(() => {
      setShowDatePicker(false)
      if (onClose) {
        onClose()
      }
    }, 300)
  }

  const isCurrentDay = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      getMonth(currentMonth) === today.getMonth() &&
      getYear(currentMonth) === today.getYear()
    )
  }

  const isSelectedDay = (day) => {
    return (
      day === currentDate.getDate() &&
      getMonth(currentMonth) === getMonth(currentDate) &&
      getYear(currentMonth) === getYear(currentDate)
    )
  }

  const formattedDate = format(currentDate, "dd/MM/yyyy")

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
        className="w-full rounded-lg h-11 bg-white text-xs border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
        style={{ fontSize: "16px" }} // Ngăn iOS zoom vào input
      />
      {/* Modal Backdrop with Enhanced Blur Effect */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md z-40 flex items-center justify-center transition-all duration-500">
          {/* Calendar Card */}
          <div
            ref={datePickerRef}
            className={`bg-white bg-opacity-95 rounded-2xl p-4 absolute z-50 transition-all duration-300 transform ${
              animation === "fade-in"
                ? "opacity-100 scale-100"
                : animation === "fade-out"
                  ? "opacity-0 scale-95"
                  : "opacity-0 scale-95"
            }`}
            style={{
              maxWidth: "340px",
              boxShadow:
                "0 10px 30px rgba(0, 0, 0, 0.15), 0 1px 5px rgba(0, 0, 0, 0.08), 0 20px 40px rgba(0, 0, 0, 0.08)",
            }}
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100 transition" type="button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-medium text-red-500">{formatMonthName(currentMonth)}</h2>
              <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100 transition" type="button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map((day, index) => (
                <div key={index} className="text-center text-sm font-medium text-gray-700 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="calendar-grid grid grid-cols-7 gap-1 transition-all duration-300">
              {getDaysInMonth(currentMonth).map((day, index) => (
                <div
                  key={`${getMonth(currentMonth)}-${getYear(currentMonth)}-${index}`}
                  className={`
                    text-center py-1 text-base select-none
                    ${day ? "cursor-pointer" : ""}
                    ${isCurrentDay(day) ? "text-blue-500 font-semibold" : "text-gray-800"}
                  `}
                  onClick={(e) => day && handleDateSelect(day, e.currentTarget.querySelector("div"))}
                >
                  {day && (
                    <div
                      className={`
                        w-10 h-10 mx-auto flex items-center justify-center rounded-full transition-colors
                        ${isSelectedDay(day) ? "bg-red-500 text-white" : "hover:bg-gray-100"}
                      `}
                    >
                      {day}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Today Button */}
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  const today = new Date()
                  setCurrentMonth(today)
                  handleDateSelect(today.getDate(), null)
                }}
                className="text-red-500 font-medium text-sm hover:underline"
                type="button"
              >
                Hôm nay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Thêm cả default export và named export
export default IOSDatePickerComponent
export const IOSDatePicker = IOSDatePickerComponent
