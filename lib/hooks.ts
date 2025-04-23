"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useTransactions(month: number, year: number) {
  const [isManualRefresh, setIsManualRefresh] = useState(false)
  const { data, error, mutate } = useSWR(
    `/api/transactions?month=${month}&year=${year}&refresh=${isManualRefresh}`,
    fetcher,
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
  const { data, error } = useSWR(`/api/account-data?month=${month}&year=${year}`, fetcher)

  return {
    accountData: data?.data || null,
    isLoading: !error && !data,
    isError: !!error,
    errorMessage: error?.message || data?.error || null,
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
  const { data, error } = useSWR("/api/transaction-summary", fetcher)

  return {
    summary: data || { totalIncome: 0, totalExpense: 0, balance: 0 },
    isLoading: !error && !data,
    isError: !!error,
    errorMessage: error?.message || data?.error || null,
  }
}
