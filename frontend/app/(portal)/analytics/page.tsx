"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { OccupancyHeatmap } from "@/components/analytics/occupancy-heatmap"
import { StrangerTrend } from "@/components/analytics/stranger-trend"
import type { HeatmapDay } from "@/lib/mock-data"

export default function AnalyticsPage() {
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([])
  const [strangerData, setStrangerData] = useState<{ day: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [occupancyRes, unknownRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/reports/daily?days=365"),
          fetch("http://127.0.0.1:8000/api/unknown")
        ])

        if (occupancyRes.ok && unknownRes.ok) {
          const occupancy = await occupancyRes.json()
          const unknown = await unknownRes.json()

          // --- Process Heatmap Data ---
          const heatmap: HeatmapDay[] = occupancy.map((day: any) => ({
            date: day.date,
            count: day.count,
            intensity: day.count > 10 ? 4 : day.count > 5 ? 3 : day.count > 2 ? 2 : 1
          }))

          setHeatmapData(heatmap)

          // --- Process Stranger Trend ---

          // FIX: If we want a trend, we need dates. Since backend is simple, 
          // let's simulate a trend if data is empty, OR just show today's count.
          // Real approach: Group by whatever time info we have.

          // Since unknown tracker is in-memory and only has time, we can only show Today.
          // We will mock a "past 7 days" with 0 and put all current ones in "Today".
          const todayStr = new Date().toISOString().split('T')[0]

          const trend = [
            { day: "Today", count: unknown.length }
          ]
          setStrangerData(trend)
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground/70">
          High-level attendance insights and security metrics.
        </p>
      </motion.div>
      <OccupancyHeatmap data={heatmapData} />
      <StrangerTrend data={strangerData} />
    </div>
  )
}
