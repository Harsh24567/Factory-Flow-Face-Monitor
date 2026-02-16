import { WorkersList } from "@/components/workers/workers-list"
import { workers } from "@/lib/mock-data"

export default function WorkersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Worker Profiles
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and manage all registered employees.
        </p>
      </div>
      <WorkersList workers={workers} />
    </div>
  )
}
