import { UploadDiagnostic } from "@/components/upload-diagnostic"

export default function DiagnosticPage() {
  return (
    <div className="container py-6 md:py-10">
      <h1 className="mb-6 text-3xl font-bold">Google Drive Diagnostic</h1>
      <p className="mb-6 text-muted-foreground">
        Use this tool to diagnose issues with Google Drive integration and test file uploads.
      </p>

      <UploadDiagnostic />
    </div>
  )
}
