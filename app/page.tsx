"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Header } from "@/components/dashboard/header"
import { LiveMetrics } from "@/components/dashboard/live-metrics"
import { WorkerGrid } from "@/components/dashboard/worker-grid"
import { UnknownAlerts } from "@/components/dashboard/unknown-alerts"
import { HourlyReport } from "@/components/dashboard/hourly-report"
import { WorkerDetailModal } from "@/components/dashboard/worker-detail-modal"
import { DashboardSkeleton } from "@/components/dashboard/skeleton-loader"
import {
  workers as mockWorkers,
  unknownPersons as mockUnknownPersons,
  hourlyReport as mockHourlyReport,
  metrics as mockMetrics,
  type Worker,
} from "@/lib/mock-data"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Simulate initial loading and set initial timestamp on mount
  useEffect(() => {
    setLastUpdated(new Date())
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastUpdated(new Date())
    }, 1200)
  }, [])

  const filteredWorkers = useMemo(() => {
    if (!searchQuery.trim()) return mockWorkers
    const q = searchQuery.toLowerCase()
    return mockWorkers.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q) ||
        w.department.toLowerCase().includes(q)
    )
  }, [searchQuery])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="fixed inset-0 bg-gradient-to-br from-[hsl(228,30%,6%)] via-[hsl(230,25%,10%)] to-[hsl(250,20%,8%)]" />
        <div className="relative z-10">
          <DashboardSkeleton />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[hsl(228,30%,6%)] via-[hsl(230,25%,10%)] to-[hsl(250,20%,8%)]" />

      {/* Subtle grid pattern overlay */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(187 85% 53% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(187 85% 53% / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] flex flex-col gap-6 p-4 lg:p-6">
        {/* Header */}
        <Header
          onSearch={setSearchQuery}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          alertCount={mockMetrics.unknownDetections}
        />

        {/* Live Metrics */}
        <LiveMetrics
          realtimeCount={mockMetrics.realtimeCount}
          totalRegistered={mockMetrics.totalRegistered}
          activePresent={mockMetrics.activePresent}
          unknownDetections={mockMetrics.unknownDetections}
          trend={mockMetrics.trend}
        />

        {/* Unknown Alerts */}
        <UnknownAlerts unknownPersons={mockUnknownPersons} />

        {/* Worker Grid */}
        <WorkerGrid
          workers={filteredWorkers}
          onWorkerClick={setSelectedWorker}
        />

        {/* Hourly Report */}
        <HourlyReport report={mockHourlyReport} workers={mockWorkers} />

        {/* Footer */}
        <footer className="flex items-center justify-between rounded-lg border border-border/30 bg-card/30 px-6 py-3 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground">
            Factory Flow Monitor v1.0
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated:{" "}
            <span className="font-mono text-foreground">
              {lastUpdated
                ? lastUpdated.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })
                : "--:--:--"}
            </span>
          </p>
        </footer>
      </div>

      {/* Worker Detail Modal */}
      <WorkerDetailModal
        worker={selectedWorker}
        open={!!selectedWorker}
        onClose={() => setSelectedWorker(null)}
      />
    </main>
  )
}
