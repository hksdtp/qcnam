"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function SetupCheck() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("Checking Google API connection...")
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null)
  const [folderId, setFolderId] = useState<string | null>(null)
  const [driveStatus, setDriveStatus] = useState<"loading" | "success" | "error" | null>(null)
  const [driveMessage, setDriveMessage] = useState<string | null>(null)

  async function checkSetup() {
    setStatus("loading")
    setMessage("Checking Google API connection...")

    try {
      const response = await fetch("/api/setup")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setSpreadsheetId(data.spreadsheetId)
        setFolderId(data.folderId)
        setMessage("Connected to Google APIs successfully!")

        // Now check Drive permissions
        checkDrivePermissions()
      } else {
        setStatus("error")
        setMessage("Failed to connect to Google APIs. Please check your configuration.")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to connect to Google APIs. Please check your configuration.")
    }
  }

  async function checkDrivePermissions() {
    setDriveStatus("loading")
    setDriveMessage("Checking Drive folder permissions...")

    try {
      const response = await fetch("/api/check-drive")
      const data = await response.json()

      if (data.success) {
        setDriveStatus("success")
        setDriveMessage("Drive folder is accessible and writable")
      } else {
        setDriveStatus("error")
        setDriveMessage(`Drive folder access error: ${data.details}`)
      }
    } catch (error) {
      setDriveStatus("error")
      setDriveMessage("Failed to check Drive folder permissions")
    }
  }

  useEffect(() => {
    checkSetup()
  }, [])

  return (
    <div className="space-y-4">
      <Alert variant={status === "error" ? "destructive" : status === "success" ? "default" : "outline"}>
        {status === "loading" ? (
          <AlertCircle className="h-4 w-4" />
        ) : status === "success" ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertTitle>
          {status === "loading" ? "Checking Setup" : status === "success" ? "Setup Complete" : "Setup Error"}
        </AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span>{message}</span>
            {status === "error" && (
              <Button variant="outline" size="sm" onClick={checkSetup}>
                Retry
              </Button>
            )}
          </div>

          {status === "success" && (
            <div className="text-xs text-muted-foreground">
              <p>Spreadsheet ID: {spreadsheetId}</p>
              <p>Drive Folder ID: {folderId}</p>
            </div>
          )}
        </AlertDescription>
      </Alert>

      {driveStatus && (
        <Alert variant={driveStatus === "error" ? "destructive" : driveStatus === "success" ? "default" : "outline"}>
          {driveStatus === "loading" ? (
            <AlertCircle className="h-4 w-4" />
          ) : driveStatus === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {driveStatus === "loading"
              ? "Checking Drive"
              : driveStatus === "success"
                ? "Drive Access OK"
                : "Drive Access Error"}
          </AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{driveMessage}</span>
            {driveStatus === "error" && (
              <Button variant="outline" size="sm" onClick={checkDrivePermissions}>
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
