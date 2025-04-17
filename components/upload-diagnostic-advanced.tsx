"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Upload, Loader2, FileText, Database, FolderOpen, ExternalLink } from "lucide-react"

export function UploadDiagnosticAdvanced() {
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null)
  const [diagnosticLoading, setDiagnosticLoading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [simpleUploadResult, setSimpleUploadResult] = useState<any>(null)
  const [simpleUploadLoading, setSimpleUploadLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sheetsData, setSheetsData] = useState<any>(null)
  const [sheetsLoading, setSheetsLoading] = useState(false)
  const [driveData, setDriveData] = useState<any>(null)
  const [driveLoading, setDriveLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function runDiagnostic() {
    setDiagnosticLoading(true)
    setDiagnosticResult(null)
    setLogs([])

    try {
      addLog("Starting diagnostic...")
      const response = await fetch("/api/drive-diagnostic")
      const data = await response.json()
      setDiagnosticResult(data)

      if (data.success) {
        addLog("✅ All diagnostic tests passed!")
      } else {
        addLog(`❌ Diagnostic failed at step: ${data.failedStep}`)
      }
    } catch (error) {
      addLog(`❌ Error running diagnostic: ${error.message}`)
      setDiagnosticResult({
        success: false,
        error: error.message,
      })
    } finally {
      setDiagnosticLoading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      addLog(`Selected file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
    }
  }

  async function runTestUpload() {
    if (!selectedFile) {
      addLog("❌ No file selected")
      return
    }

    setUploadLoading(true)
    setUploadResult(null)
    setLogs([])

    try {
      addLog("Starting test upload process...")

      const formData = new FormData()
      formData.append("file", selectedFile)

      addLog(`Uploading ${selectedFile.name}...`)
      const response = await fetch("/api/test-upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setUploadResult(data)

      if (data.success) {
        addLog("✅ Test upload completed successfully!")
        addLog(`File ID: ${data.fileId}`)
        addLog(`Web View Link: ${data.webViewLink}`)
        addLog(`Direct Link: ${data.directLink}`)
      } else {
        addLog(`❌ Test upload failed at step: ${data.step}`)
        addLog(`Error: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ Error during test upload: ${error.message}`)
      setUploadResult({
        success: false,
        error: error.message,
      })
    } finally {
      setUploadLoading(false)
    }
  }

  async function runSimpleUpload() {
    if (!selectedFile) {
      addLog("❌ No file selected")
      return
    }

    setSimpleUploadLoading(true)
    setSimpleUploadResult(null)
    setLogs([])

    try {
      addLog("Starting simple upload process...")

      const formData = new FormData()
      formData.append("file", selectedFile)

      addLog(`Uploading ${selectedFile.name}...`)
      const response = await fetch("/api/upload-simple", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      setSimpleUploadResult(data)

      if (data.success) {
        addLog("✅ Simple upload completed successfully!")
        addLog(`File ID: ${data.fileId}`)
        addLog(`Web View Link: ${data.webViewLink}`)
        addLog(`Direct Link: ${data.directLink}`)
      } else {
        addLog(`❌ Simple upload failed`)
        addLog(`Error: ${data.error}`)
        if (data.details) {
          addLog(`Details: ${data.details}`)
        }
      }
    } catch (error) {
      addLog(`❌ Error during simple upload: ${error.message}`)
      setSimpleUploadResult({
        success: false,
        error: error.message,
      })
    } finally {
      setSimpleUploadLoading(false)
    }
  }

  async function fetchSheetsData() {
    setSheetsLoading(true)
    setSheetsData(null)
    setLogs([])

    try {
      addLog("Fetching Google Sheets data...")
      const response = await fetch("/api/sheets-data")
      const data = await response.json()
      setSheetsData(data)

      if (data.success) {
        addLog(`✅ Found ${data.rows?.length || 0} rows in the sheet`)

        // Log the last few rows
        const lastRows = data.rows?.slice(-5) || []
        addLog(`Last ${lastRows.length} rows:`)
        lastRows.forEach((row: any, index: number) => {
          addLog(`Row ${data.rows.length - lastRows.length + index + 1}: ${JSON.stringify(row)}`)
        })
      } else {
        addLog(`❌ Failed to fetch sheets data: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ Error fetching sheets data: ${error.message}`)
      setSheetsData({
        success: false,
        error: error.message,
      })
    } finally {
      setSheetsLoading(false)
    }
  }

  async function fetchDriveData() {
    setDriveLoading(true)
    setDriveData(null)
    setLogs([])

    try {
      addLog("Fetching Google Drive data...")
      const response = await fetch("/api/drive-files")
      const data = await response.json()
      setDriveData(data)

      if (data.success) {
        addLog(`✅ Found ${data.files?.length || 0} files in the folder`)

        // Log the last few files
        const lastFiles = data.files?.slice(-5) || []
        addLog(`Last ${lastFiles.length} files:`)
        lastFiles.forEach((file: any) => {
          addLog(`${file.name}: ${file.webViewLink || "No link"}`)
        })
      } else {
        addLog(`❌ Failed to fetch drive data: ${data.error}`)
      }
    } catch (error) {
      addLog(`❌ Error fetching drive data: ${error.message}`)
      setDriveData({
        success: false,
        error: error.message,
      })
    } finally {
      setDriveLoading(false)
    }
  }

  function addLog(message: string) {
    setLogs((prev) => [...prev, message])
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Advanced Diagnostic Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="test-upload">
          <TabsList className="mb-4">
            <TabsTrigger value="test-upload">Test Upload</TabsTrigger>
            <TabsTrigger value="simple-upload">Simple Upload</TabsTrigger>
            <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
            <TabsTrigger value="drive">Google Drive</TabsTrigger>
            <TabsTrigger value="diagnostic">Drive Diagnostic</TabsTrigger>
          </TabsList>

          <TabsContent value="test-upload">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This tool will test the entire upload process from start to finish, including Google Drive upload and
                Google Sheets integration.
              </p>

              <div className="space-y-2">
                <Label htmlFor="test-file">Select Image File</Label>
                <Input id="test-file" type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
              </div>

              {selectedFile && (
                <div className="rounded-md bg-muted p-2 text-sm">
                  <p>Selected file: {selectedFile.name}</p>
                  <p>Size: {(selectedFile.size / 1024).toFixed(1)} KB</p>
                  <p>Type: {selectedFile.type}</p>
                </div>
              )}

              <Button onClick={runTestUpload} disabled={uploadLoading || !selectedFile} className="mt-4">
                {uploadLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Upload...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Run Test Upload
                  </>
                )}
              </Button>

              {uploadResult && (
                <Alert variant={uploadResult.success ? "default" : "destructive"}>
                  {uploadResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>
                    {uploadResult.success
                      ? "Test Upload Successful"
                      : `Failed at: ${uploadResult.step || "Unknown step"}`}
                  </AlertTitle>
                  <AlertDescription>
                    {uploadResult.success ? (
                      <div className="space-y-2">
                        <p>All steps completed successfully!</p>
                        <div className="flex flex-col gap-1 mt-2">
                          <a
                            href={uploadResult.directLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Image (via Proxy)
                          </a>
                          <a
                            href={uploadResult.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View in Google Drive
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p>Error: {uploadResult.error}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="simple-upload">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This tool uses a simplified upload approach that might work better with the Google Drive API.
              </p>

              <div className="space-y-2">
                <Label htmlFor="simple-file">Select Image File</Label>
                <Input id="simple-file" type="file" accept="image/*" onChange={handleFileChange} />
              </div>

              {selectedFile && (
                <div className="rounded-md bg-muted p-2 text-sm">
                  <p>Selected file: {selectedFile.name}</p>
                  <p>Size: {(selectedFile.size / 1024).toFixed(1)} KB</p>
                  <p>Type: {selectedFile.type}</p>
                </div>
              )}

              <Button onClick={runSimpleUpload} disabled={simpleUploadLoading || !selectedFile} className="mt-4">
                {simpleUploadLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Run Simple Upload
                  </>
                )}
              </Button>

              {simpleUploadResult && (
                <Alert variant={simpleUploadResult.success ? "default" : "destructive"}>
                  {simpleUploadResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{simpleUploadResult.success ? "Upload Successful" : "Upload Failed"}</AlertTitle>
                  <AlertDescription>
                    {simpleUploadResult.success ? (
                      <div className="space-y-2">
                        <p>File uploaded successfully!</p>
                        <div className="flex flex-col gap-1 mt-2">
                          <a
                            href={simpleUploadResult.directLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Image (via Proxy)
                          </a>
                          <a
                            href={simpleUploadResult.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View in Google Drive
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p>Error: {simpleUploadResult.error}</p>
                        {simpleUploadResult.details && (
                          <p className="mt-2 text-xs">Details: {simpleUploadResult.details}</p>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sheets">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This tool will fetch and display the data from your Google Sheets to verify that receipt links are being
                saved correctly.
              </p>

              <Button onClick={fetchSheetsData} disabled={sheetsLoading}>
                {sheetsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Data...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Fetch Sheets Data
                  </>
                )}
              </Button>

              {sheetsData && (
                <Alert variant={sheetsData.success ? "default" : "destructive"}>
                  {sheetsData.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>{sheetsData.success ? "Google Sheets Data" : "Failed to Fetch Data"}</AlertTitle>
                  <AlertDescription>
                    {sheetsData.success ? (
                      <div>
                        <p>Found {sheetsData.rows?.length || 0} rows in the sheet.</p>
                        {sheetsData.rows?.length > 0 && (
                          <div className="mt-2 max-h-60 overflow-auto">
                            <table className="min-w-full text-xs">
                              <thead>
                                <tr className="border-b">
                                  <th className="px-2 py-1 text-left">Date</th>
                                  <th className="px-2 py-1 text-left">Category</th>
                                  <th className="px-2 py-1 text-left">Description</th>
                                  <th className="px-2 py-1 text-right">Amount</th>
                                  <th className="px-2 py-1 text-left">Type</th>
                                  <th className="px-2 py-1 text-left">Receipt Link</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sheetsData.rows.slice(-10).map((row: any, index: number) => (
                                  <tr key={index} className="border-b">
                                    <td className="px-2 py-1">{row[0]}</td>
                                    <td className="px-2 py-1">{row[1]}</td>
                                    <td className="px-2 py-1">{row[2]}</td>
                                    <td className="px-2 py-1 text-right">{row[3]}</td>
                                    <td className="px-2 py-1">{row[4]}</td>
                                    <td className="px-2 py-1 truncate max-w-[200px]">
                                      {row[5] ? (
                                        <a
                                          href={row[5]}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                        >
                                          {row[5].substring(0, 30)}...
                                        </a>
                                      ) : (
                                        "None"
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>Error: {sheetsData.error}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="drive">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This tool will fetch and display the files in your Google Drive folder to verify that images are being
                uploaded correctly.
              </p>

              <Button onClick={fetchDriveData} disabled={driveLoading}>
                {driveLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Files...
                  </>
                ) : (
                  <>
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Fetch Drive Files
                  </>
                )}
              </Button>

              {driveData && (
                <Alert variant={driveData.success ? "default" : "destructive"}>
                  {driveData.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>{driveData.success ? "Google Drive Files" : "Failed to Fetch Files"}</AlertTitle>
                  <AlertDescription>
                    {driveData.success ? (
                      <div>
                        <p>Found {driveData.files?.length || 0} files in the folder.</p>
                        {driveData.files?.length > 0 && (
                          <div className="mt-2 max-h-60 overflow-auto">
                            <table className="min-w-full text-xs">
                              <thead>
                                <tr className="border-b">
                                  <th className="px-2 py-1 text-left">Name</th>
                                  <th className="px-2 py-1 text-left">Type</th>
                                  <th className="px-2 py-1 text-left">Created</th>
                                  <th className="px-2 py-1 text-left">Link</th>
                                </tr>
                              </thead>
                              <tbody>
                                {driveData.files.slice(-10).map((file: any) => (
                                  <tr key={file.id} className="border-b">
                                    <td className="px-2 py-1">{file.name}</td>
                                    <td className="px-2 py-1">{file.mimeType}</td>
                                    <td className="px-2 py-1">{new Date(file.createdTime).toLocaleString()}</td>
                                    <td className="px-2 py-1">
                                      {file.webViewLink ? (
                                        <a
                                          href={file.webViewLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline"
                                        >
                                          View
                                        </a>
                                      ) : (
                                        "No link"
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>Error: {driveData.error}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="diagnostic">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This tool will check your Google Drive connection and permissions.
              </p>

              <Button onClick={runDiagnostic} disabled={diagnosticLoading}>
                {diagnosticLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Diagnostic...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Run Diagnostic
                  </>
                )}
              </Button>

              {diagnosticResult && (
                <Alert variant={diagnosticResult.success ? "default" : "destructive"}>
                  {diagnosticResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>
                    {diagnosticResult.success
                      ? "All Tests Passed"
                      : `Failed at: ${diagnosticResult.failedStep || "Unknown step"}`}
                  </AlertTitle>
                  <AlertDescription>
                    {diagnosticResult.success ? (
                      <div className="text-sm">
                        <p>✅ Authentication: Successful</p>
                        <p>✅ Folder Access: Successful</p>
                        <p>✅ File Listing: Found {diagnosticResult.diagnostics.folderListing.fileCount} files</p>
                        <p>✅ File Creation: Successful</p>
                        <p>✅ File Verification: Successful</p>
                        <p className="mt-2">
                          <a
                            href={diagnosticResult.diagnostics.fileCreation.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Test File
                          </a>
                        </p>
                      </div>
                    ) : (
                      <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                        {JSON.stringify(diagnosticResult, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {logs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Logs</h3>
            <div className="bg-black text-white p-3 rounded-md text-xs font-mono h-60 overflow-auto">
              {logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
