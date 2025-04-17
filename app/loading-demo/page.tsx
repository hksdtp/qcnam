"use client"

import { useState } from "react"
import { LoadingScreen } from "@/components/loading-screen"

export default function LoadingDemoPage() {
  const [showLoading, setShowLoading] = useState(true)
  const [contentLoaded, setContentLoaded] = useState(false)

  const handleLoadingComplete = () => {
    setContentLoaded(true)
  }

  const resetDemo = () => {
    setContentLoaded(false)
    setShowLoading(true)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {showLoading && (
        <LoadingScreen appName="QUẢN LÝ CHI TIÊU" backgroundColor="#E51A22" onLoadingComplete={handleLoadingComplete} />
      )}

      <div className={contentLoaded ? "block" : "hidden"}>
        <header className="bg-[#E51A22] text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <polygon points="50,0 75,50 50,100 25,50" fill="white" />
            </svg>
            <h1 className="text-xl font-bold">Quản Lý Chi Tiêu</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#E51A22] font-bold">
              NT
            </div>
            <span>Nguyễn Thành</span>
          </div>
        </header>

        <main className="container mx-auto p-4 mt-8">
          <h2 className="text-2xl font-bold mb-6">Tổng quan tài chính</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm text-gray-600">Tổng chi tiêu</h3>
              <p className="text-xl font-bold mt-1">9.450.000 ₫</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm text-gray-600">Tổng thu nhập</h3>
              <p className="text-xl font-bold mt-1">15.000.000 ₫</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm text-gray-600">Số dư</h3>
              <p className="text-xl font-bold mt-1">5.550.000 ₫</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm text-gray-600">Ngân sách còn lại</h3>
              <p className="text-xl font-bold mt-1">2.550.000 ₫</p>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <button
              onClick={resetDemo}
              className="px-6 py-3 bg-[#E51A22] text-white rounded-lg hover:bg-[#c4161d] transition-colors"
            >
              Xem lại màn hình loading
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
