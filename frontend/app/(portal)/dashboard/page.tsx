import { StatsCards } from "@/components/dashboard/stats-cards"
import { LiveStatusGrid } from "@/components/dashboard/live-status-grid"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { dashboardMetrics, workers, events } from "@/lib/mock-data"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time attendance monitoring and workforce overview.
        </p>
      </div>
      <StatsCards metrics={dashboardMetrics} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LiveStatusGrid workers={workers} />
        <ActivityFeed events={events} />
      </div>
    </div>
  )
}
