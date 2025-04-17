import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Category Demo</h1>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-full max-w-md" />
          <Skeleton className="h-8 w-full max-w-md" />
          <Skeleton className="h-8 w-full max-w-md" />
          <Skeleton className="h-8 w-full max-w-md" />
        </div>
      </div>
    </div>
  )
}
