import { NextResponse } from "next/server"
import { getCarData } from "@/lib/car-actions"
import { USE_MOCK_SERVICES, mockGetCarData } from "@/lib/mock-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    // Sử dụng mock data nếu USE_MOCK_SERVICES = true
    if (USE_MOCK_SERVICES) {
      console.log("Sử dụng mock data cho xe")
      const mockResult = await mockGetCarData()
      return NextResponse.json(mockResult, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
    }

    const result = await getCarData()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Lỗi không xác định khi lấy dữ liệu xe",
        },
        { status: 500 },
      )
    }

    // Add default values for new fields if they don't exist
    const carData = {
      ...result.carData,
      startKm: result.carData.startKm || 0,
      endKm: result.carData.endKm || 0,
      totalFuelMonth: result.carData.totalFuelMonth || 0,
      fuelCost: result.carData.fuelCost || 0,
    }

    return NextResponse.json({
      success: true,
      carData: carData,
    })
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu xe:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi không xác định",
      },
      { status: 500 },
    )
  }
}
