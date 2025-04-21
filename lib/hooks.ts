"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useTransactions(month: number, year: number) {
  const [isManualRefresh, setIsManualRefresh] = useState(false)
  const { data, error, mutate } = useSWR(
    `/api/transactions?month=${month}&year=${year}&refresh=${isManualRefresh}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      dedupingInterval: 5000, // Giảm thời gian deduping để cập nhật nhanh hơn
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
    mutate,
  }
}

export function useAccountData(month: number, year: number) {
  const { data, error, mutate } = useSWR(
    `/api/account-data?month=${month}&year=${year}&timestamp=${Date.now()}`, // Thêm timestamp để tránh cache
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      refreshInterval: 10000, // Tự động làm mới mỗi 10 giây
      dedupingInterval: 2000, // Giảm thời gian deduping để cập nhật nhanh hơn
    },
  )

  return {
    accountData: data?.data || null,
    isLoading: !error && !data,
    isError: !!error,
    errorMessage: error?.message || data?.error || null,
    mutate, // Thêm mutate để có thể làm mới dữ liệu theo yêu cầu
  }
}

export function useCarData(month: number, year: number) {
  const { data, error } = useSWR(`/api/car-data`, fetcher)

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
      refreshInterval: 10000, // Tự động làm mới mỗi 10 giây
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
