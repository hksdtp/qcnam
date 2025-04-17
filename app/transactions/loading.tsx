import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

      {/* Filters skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-full max-w-md mb-4" />
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      {/* Transactions list skeleton */}
      <div className="space-y-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="border rounded-lg p-4 flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
      </div>
    </div>
  )
}
