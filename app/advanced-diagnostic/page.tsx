import { UploadDiagnosticAdvanced } from "@/components/upload-diagnostic-advanced"

export default function AdvancedDiagnosticPage() {
  return (
    <div className="container py-6 md:py-10">
      <h1 className="mb-6 text-3xl font-bold">Advanced Diagnostic Tool</h1>
      <p className="mb-6 text-muted-foreground">
        Use this tool to diagnose issues with Google Drive and Google Sheets integration, test file uploads, and view
        data.
      </p>

      <UploadDiagnosticAdvanced />
    </div>
  )
}
