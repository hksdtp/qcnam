"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Upload } from "lucide-react"

export function UploadDiagnostic() {
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null)
  const [diagnosticLoading, setDiagnosticLoading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [base64Data, setBase64Data] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function runDiagnostic() {
    setDiagnosticLoading(true)
    setDiagnosticResult(null)

    try {
      const response = await fetch("/api/drive-diagnostic")
      const data = await response.json()
      setDiagnosticResult(data)
    } catch (error) {
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

      // Convert to base64
      const reader = new FileReader()
      reader.onload = () => {
        setBase64Data(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function uploadViaBase64() {
    if (!selectedFile || !base64Data) return

    setUploadLoading(true)
    setUploadResult(null)

    try {
      const response = await fetch("/api/upload-base64", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
          base64Data: base64Data,
        }),
      })

      const data = await response.json()
      setUploadResult(data)
    } catch (error) {
      setUploadResult({
        success: false,
        error: error.message,
      })
    } finally {
      setUploadLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Diagnostic Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="diagnostic">
          <TabsList className="mb-4">
            <TabsTrigger value="diagnostic">Drive Diagnostic</TabsTrigger>
            <TabsTrigger value="upload">Test Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostic">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This tool will check your Google Drive connection and permissions.
              </p>

              <Button onClick={runDiagnostic} disabled={diagnosticLoading}>
                {diagnosticLoading ? "Running Diagnostic..." : "Run Diagnostic"}
              </Button>

              {diagnosticResult && (
                <div className="mt-4">
                  <Alert variant={diagnosticResult.success ? "default" : "destructive"}>
                    {diagnosticResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
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
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select Image File</Label>
                <Input id="file" type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
              </div>

              {selectedFile && (
                <div className="rounded-md bg-muted p-2 text-sm">
                  <p>Selected file: {selectedFile.name}</p>
                  <p>Size: {(selectedFile.size / 1024).toFixed(1)} KB</p>
                  <p>Type: {selectedFile.type}</p>
                </div>
              )}

              <Button onClick={uploadViaBase64} disabled={uploadLoading || !selectedFile} className="mt-4">
                <Upload className="mr-2 h-4 w-4" />
                {uploadLoading ? "Uploading..." : "Upload via Base64"}
              </Button>

              {uploadResult && (
                <Alert variant={uploadResult.success ? "default" : "destructive"}>
                  {uploadResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>{uploadResult.success ? "Upload Successful" : "Upload Failed"}</AlertTitle>
                  <AlertDescription>
                    {uploadResult.success ? (
                      <div>
                        <p>File uploaded successfully!</p>
                        <p className="mt-2">
                          <a
                            href={uploadResult.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Uploaded File
                          </a>
                        </p>
                      </div>
                    ) : (
                      <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                        {JSON.stringify(uploadResult, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
