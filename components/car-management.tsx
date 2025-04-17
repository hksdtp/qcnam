"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDate } from "@/lib/date-context"
import { Button } from "@/components/ui/button"
import { updateCarData } from "@/lib/car-actions"
import { useToast } from "@/hooks/use-toast"
import { useCarData } from "@/lib/hooks"
import { Skeleton } from "@/components/ui/skeleton"
import { DropletIcon, BanknoteIcon, CarIcon, ShieldCheckIcon, CalendarIcon, ClockIcon } from "lucide-react"

export function CarManagement() {
  const { currentDate } = useDate()
  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()

  const { carData, isLoading } = useCarData(month, year)
  const [showEditForm, setShowEditForm] = useState(false)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount)
  }

  // Calculate monthly distance
  const monthlyDistance = carData ? carData.endKm - carData.startKm : 0

  // Calculate actual fuel efficiency for the month
  const actualFuelEfficiency =
    monthlyDistance > 0 && carData?.totalFuelMonth > 0 ? (carData.totalFuelMonth / monthlyDistance) * 100 : 0

  if (isLoading) {
    return (
      <Card className="shadow-techcom hover:shadow-techcom-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center">
            <CarIcon className="h-4 w-4 mr-2" />
            Quản lý xe
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Skeleton className="h-16 rounded-lg" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If no car data, show a simplified card
  if (!carData) {
    return (
      <Card className="shadow-techcom hover:shadow-techcom-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center">
            <CarIcon className="h-4 w-4 mr-2" />
            Quản lý xe
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">Chưa có dữ liệu xe. Vui lòng thiết lập dữ liệu xe.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-techcom hover:shadow-techcom-lg overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium flex items-center">
          <CarIcon className="h-4 w-4 mr-2" />
          Quản lý xe
        </CardTitle>
        <Button
          variant="default"
          size="sm"
          className="h-8 text-xs bg-red-500 hover:bg-red-600 text-white"
          onClick={() => setShowEditForm(!showEditForm)}
        >
          {showEditForm ? "Đóng" : "Chỉnh sửa"}
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {showEditForm ? (
          <EditCarDataForm carData={carData} onClose={() => setShowEditForm(false)} />
        ) : (
          <div className="space-y-3">
            {/* Monthly distance stats */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-muted-foreground">Quãng đường tháng này</div>
                  <div className="text-xl font-semibold">{formatCurrency(monthlyDistance)} km</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Tiêu hao thực tế</div>
                  <div className="text-xl font-semibold">{actualFuelEfficiency.toFixed(1)} lít/100km</div>
                </div>
              </div>
            </div>

            {/* Odometer readings */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 dark:bg-gray-800/20 p-2 rounded-lg">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <CarIcon className="h-3 w-3" />
                  <span>Km đầu tháng</span>
                </div>
                <div className="text-sm font-medium">{formatCurrency(carData.startKm)} km</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/20 p-2 rounded-lg">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <CarIcon className="h-3 w-3" />
                  <span>Km cuối tháng</span>
                </div>
                <div className="text-sm font-medium">{formatCurrency(carData.endKm)} km</div>
              </div>
            </div>

            {/* Fuel stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 dark:bg-gray-800/20 p-2 rounded-lg">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <DropletIcon className="h-3 w-3" />
                  <span>Xăng đã đổ tháng này</span>
                </div>
                <div className="text-sm font-medium">{carData.totalFuelMonth.toFixed(1)} lít</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/20 p-2 rounded-lg">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <BanknoteIcon className="h-3 w-3" />
                  <span>Chi phí xăng tháng này</span>
                </div>
                <div className="text-sm font-medium">{formatCurrency(carData.fuelCost)} đ</div>
              </div>
            </div>

            {/* Overall stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 dark:bg-gray-800/20 p-2 rounded-lg">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <DropletIcon className="h-3 w-3" />
                  <span>Tiêu hao trung bình</span>
                </div>
                <div className="text-sm font-medium">{carData.fuelEfficiency.toFixed(1)} lít/100km</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/20 p-2 rounded-lg">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <CarIcon className="h-3 w-3" />
                  <span>Tổng quãng đường</span>
                </div>
                <div className="text-sm font-medium">{formatCurrency(carData.totalDistance)} km</div>
              </div>
            </div>

            {/* Deadlines - moved to bottom */}
            <div className="grid grid-cols-2 gap-2">
              {/* Registration deadline */}
              <div className="bg-gray-50 dark:bg-gray-800/20 p-2 rounded-lg">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>Đăng kiểm</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{carData.registrationDate}</div>
                  <div
                    className={`text-xs px-1.5 py-0.5 rounded ${carData.registrationDaysLeft < 30 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}
                  >
                    {carData.registrationDaysLeft} ngày
                  </div>
                </div>
              </div>

              {/* Insurance deadline */}
              <div className="bg-gray-50 dark:bg-gray-800/20 p-2 rounded-lg">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <ShieldCheckIcon className="h-3 w-3" />
                  <span>Bảo hiểm</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{carData.insuranceDate}</div>
                  <div
                    className={`text-xs px-1.5 py-0.5 rounded ${carData.insuranceDaysLeft < 30 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}
                  >
                    {carData.insuranceDaysLeft} ngày
                  </div>
                </div>
              </div>
            </div>

            {/* Last updated */}
            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-1">
              <ClockIcon className="h-3 w-3" />
              <span>Cập nhật: {new Date(carData.lastUpdated).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Component form chỉnh sửa dữ liệu xe
function EditCarDataForm({ carData, onClose }: { carData: any; onClose: () => void }) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      const response = await updateCarData(formData)

      if (response.success) {
        toast({
          title: "Thành công",
          description: "Dữ liệu xe đã được cập nhật",
        })
        onClose()
      } else {
        toast({
          title: "Lỗi",
          description: response.error || "Không thể cập nhật dữ liệu xe",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật dữ liệu xe",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        {/* Monthly odometer readings */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="startKm" className="text-xs font-medium">
              Km đầu tháng
            </label>
            <input
              id="startKm"
              name="startKm"
              type="number"
              step="0.1"
              defaultValue={carData.startKm}
              className="w-full p-1.5 text-sm border rounded-md mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="endKm" className="text-xs font-medium">
              Km cuối tháng
            </label>
            <input
              id="endKm"
              name="endKm"
              type="number"
              step="0.1"
              defaultValue={carData.endKm}
              className="w-full p-1.5 text-sm border rounded-md mt-1"
              required
            />
          </div>
        </div>

        {/* Monthly fuel data */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="totalFuelMonth" className="text-xs font-medium">
              Xăng đã đổ tháng này (lít)
            </label>
            <input
              id="totalFuelMonth"
              name="totalFuelMonth"
              type="number"
              step="0.1"
              defaultValue={carData.totalFuelMonth}
              className="w-full p-1.5 text-sm border rounded-md mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="fuelCost" className="text-xs font-medium">
              Chi phí xăng tháng này
            </label>
            <input
              id="fuelCost"
              name="fuelCost"
              type="number"
              defaultValue={carData.fuelCost}
              className="w-full p-1.5 text-sm border rounded-md mt-1"
              required
            />
          </div>
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="fuelEfficiency" className="text-xs font-medium">
              Tiêu hao trung bình (lít/100km)
            </label>
            <input
              id="fuelEfficiency"
              name="fuelEfficiency"
              type="number"
              step="0.01"
              defaultValue={carData.fuelEfficiency}
              className="w-full p-1.5 text-sm border rounded-md mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="totalDistance" className="text-xs font-medium">
              Tổng quãng đường (km)
            </label>
            <input
              id="totalDistance"
              name="totalDistance"
              type="number"
              step="0.1"
              defaultValue={carData.totalDistance}
              className="w-full p-1.5 text-sm border rounded-md mt-1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="totalLiters" className="text-xs font-medium">
              Tổng số lít xăng đã đổ
            </label>
            <input
              id="totalLiters"
              name="totalLiters"
              type="number"
              defaultValue={carData.totalLiters}
              className="w-full p-1.5 text-sm border rounded-md mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="totalCost" className="text-xs font-medium">
              Tổng tiền xăng đã đổ
            </label>
            <input
              id="totalCost"
              name="totalCost"
              type="number"
              defaultValue={carData.totalCost}
              className="w-full p-1.5 text-sm border rounded-md mt-1"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="registrationDate" className="text-xs font-medium">
              Hạn đăng kiểm (DD/MM/YYYY)
            </label>
            <input
              id="registrationDate"
              name="registrationDate"
              type="text"
              defaultValue={carData.registrationDate}
              className="w-full p-1.5 text-sm border rounded-md mt-1"
              required
              pattern="\d{1,2}/\d{1,2}/\d{4}"
            />
          </div>
          <div>
            <label htmlFor="insuranceDate" className="text-xs font-medium">
              Hạn bảo hiểm (DD/MM/YYYY)
            </label>
            <input
              id="insuranceDate"
              name="insuranceDate"
              type="text"
              defaultValue={carData.insuranceDate}
              className="w-full p-1.5 text-sm border rounded-md mt-1"
              required
              pattern="\d{1,2}/\d{1,2}/\d{4}"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="h-8">
          Hủy
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 bg-red-500 hover:bg-red-600 text-white">
          {isSubmitting ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </form>
  )
}
