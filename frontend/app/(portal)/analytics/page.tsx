import { OccupancyHeatmap } from "@/components/analytics/occupancy-heatmap"
import { StrangerTrend } from "@/components/analytics/stranger-trend"
import { getHeatmapData, getStrangerTrend } from "@/lib/mock-data"

export default function AnalyticsPage() {
  const heatmapData = getHeatmapData()
  const strangerData = getStrangerTrend()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          High-level attendance insights and security metrics.
        </p>
      </div>
      <OccupancyHeatmap data={heatmapData} />
      <StrangerTrend data={strangerData} />
    </div>
  )
}
