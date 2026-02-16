import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Header skeleton */}
      <div className="glass-card rounded-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg bg-secondary/50" />
            <div>
              <Skeleton className="h-5 w-48 bg-secondary/50" />
              <Skeleton className="mt-1.5 h-3 w-64 bg-secondary/50" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-48 rounded-md bg-secondary/50" />
            <Skeleton className="h-9 w-9 rounded-md bg-secondary/50" />
            <Skeleton className="h-9 w-9 rounded-md bg-secondary/50" />
          </div>
        </div>
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-5">
            <Skeleton className="h-10 w-10 rounded-lg bg-secondary/50" />
            <Skeleton className="mt-4 h-8 w-16 bg-secondary/50" />
            <Skeleton className="mt-2 h-4 w-32 bg-secondary/50" />
          </div>
        ))}
      </div>

      {/* Workers skeleton */}
      <div>
        <Skeleton className="mb-4 h-6 w-40 bg-secondary/50" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full bg-secondary/50" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 bg-secondary/50" />
                  <Skeleton className="mt-1.5 h-3 w-20 bg-secondary/50" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-14 rounded-lg bg-secondary/50" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
