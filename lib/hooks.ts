"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })

  if (!res.ok) {
    const error = new Error("Lỗi khi tải dữ liệu")
    error.info = await res.json()
    throw error
  }

  return res.json()
}

export function useTransactions(month: number, year: number) {
  const [isManualRefresh, setIsManualRefresh] = useState(false)
  const { data, error, mutate } = useSWR(
    `/api/transactions?month=${month}&year=${year}&timestamp=${Date.now()}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      dedupingInterval: 5000, // Giảm thời gian deduping để cập nhật nhanh hơn
      refreshInterval: 30000, // Tự động làm mới mỗi 30 giây
    },
  )

  useEffect(() => {
    setIsManualRefresh(false)
  }, [data, error])

  return {
    transactions: data?.transactions || [],
    isLoading: !error && !data,
    isError: !!error,
    errorMessage: error?.message || data?.error || null,
    mutate: () => {
      setIsManualRefresh(true)
      return mutate()
    },
  }
}

export function useAccountData(month: number, year: number) {
  const { data, error, mutate } = useSWR(
    `/api/account-data?month=${month}&year=${year}&timestamp=${Date.now()}`, // Thêm timestamp để tránh cache
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      refreshInterval: 30000, // Tự động làm mới mỗi 30 giây
      dedupingInterval: 2000, // Giảm thời gian deduping để cập nhật nhanh hơn
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    },
  )

  // Hàm làm mới dữ liệu với timestamp mới
  const refreshData = () => {
    return mutate(undefined, {
      revalidate: true,
    })
  }

  return {
    accountData: data?.data || null,
    isLoading: !error && !data,
    isError: !!error,
    errorMessage: error?.message || data?.error || null,
    mutate: refreshData, // Sử dụng hàm refreshData thay vì mutate trực tiếp
  }
}

export function useCarData(month: number, year: number) {
  const { data, error } = useSWR(`/api/car-data?timestamp=${Date.now()}`, fetcher)

  return {
    carData: data?.carData || null,
    isLoading: !error && !data,
    isError: !!error,
    errorMessage: error?.message || data?.error || null,
  }
}

export function useTransactionSummary() {
  const { data, error, mutate } = useSWR(
    `/api/transaction-summary?timestamp=${Date.now()}`, // Thêm timestamp để tránh cache
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      refreshInterval: 30000, // Tự động làm mới mỗi 30 giây
      dedupingInterval: 2000, // Giảm thời gian deduping để cập nhật nhanh hơn
    },
  )

  return {
    summary: data || { totalIncome: 0, totalExpense: 0, balance: 0 },
    isLoading: !error && !data,
    isError: !!error,
    errorMessage: error?.message || data?.error || null,
    mutate, // Thêm mutate để có thể làm mới dữ liệu theo yêu cầu
  }
}
