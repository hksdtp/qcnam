"use client"

import { useEffect } from "react"
import { TransactionList } from "./transaction-list"

export function TransactionTest() {
  useEffect(() => {
    // Add event listener to log when transaction items are clicked
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const transactionItem = target.closest('[data-testid="transaction-item"]')
      if (transactionItem) {
        console.log("Transaction item clicked")
      }

      const editButton = target.closest('[data-testid="edit-button"]')
      if (editButton) {
        console.log("Edit button clicked")
      }

      const deleteButton = target.closest('[data-testid="delete-button"]')
      if (deleteButton) {
        console.log("Delete button clicked")
      }

      const detailEditButton = target.closest('[data-testid="detail-edit-button"]')
      if (detailEditButton) {
        console.log("Detail edit button clicked")
      }

      const detailDeleteButton = target.closest('[data-testid="detail-delete-button"]')
      if (detailDeleteButton) {
        console.log("Detail delete button clicked")
      }
    }

    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick)
    }
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Transaction Test</h1>
      <p className="mb-4 text-muted-foreground">
        Click on a transaction to view details. Use the edit and delete buttons to modify transactions.
      </p>
      <TransactionList />
    </div>
  )
}
