"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { LiveStatusGrid } from "@/components/dashboard/live-status-grid"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import type { DashboardMetrics, Worker, AttendanceEvent } from "@/lib/mock-data"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [recentActivity, setRecentActivity] = useState<AttendanceEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel fetch
        const [metricsRes, workersRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/metrics"),
          fetch("http://127.0.0.1:8000/api/workers")
        ])

        if (metricsRes.ok && workersRes.ok) {
          const metricsData = await metricsRes.json()
          const workersData = await workersRes.json()

          // Map Metrics
          setMetrics({
            presentCount: metricsData.activePresent,
            totalWorkers: metricsData.totalRegistered,
            onTimePercent: metricsData.onTimePercentage,
            onTimeTrend: 0,
            unknownAlerts: metricsData.unknownDetections,
            avgConfidence: metricsData.avgConfidence
          })

          // Map Workers
          setWorkers(workersData.map((w: any) => ({
            id: w.id,
            name: w.name,
            department: w.department,
            avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(w.name)}&backgroundColor=1a1a2e&textColor=4ade80`,
            status: w.status.includes('present') ? 'in' : 'out',
            lastSeen: w.lastSeen,
            punctualityScore: 95
          })))

          // Set empty activity for now to remove mock data
          setRecentActivity([])
        } else {
          console.error("API Error: One or more requests failed", metricsRes.status, workersRes.status)
          // Fallback to zero values
          setMetrics({
            presentCount: 0,
            totalWorkers: 0,
            onTimePercent: 0,
            onTimeTrend: 0,
            unknownAlerts: 0,
            avgConfidence: 0
          })
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
        // Fallback to zero values on error so dashboard isn't empty
        setMetrics({
          presentCount: 0,
          totalWorkers: 0,
          onTimePercent: 0,
          onTimeTrend: 0,
          unknownAlerts: 0,
          avgConfidence: 0
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Command Center
        </h1>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Real-time attendance monitoring and workforce overview.
        </p>
      </motion.div>

      {loading && !metrics ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" suppressHydrationWarning />
        </div>
      ) : metrics ? (
        <>
          <StatsCards metrics={metrics} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <LiveStatusGrid workers={workers} />
            <ActivityFeed events={recentActivity} />
          </div>
        </>
      ) : (
        <div className="text-center p-12 text-muted-foreground">
          Failed to load data. Check backend connection.
        </div>
      )}
    </div>
  )
}
