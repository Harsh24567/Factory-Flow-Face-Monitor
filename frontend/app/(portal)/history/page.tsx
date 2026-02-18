"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AttendanceTable } from "@/components/history/attendance-table"
import type { AttendanceEvent } from "@/lib/mock-data"
import { Loader2 } from "lucide-react"

export default function HistoryPage() {
  const [events, setEvents] = useState<AttendanceEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/attendance/raw")
        if (res.ok) {
          const data = await res.json()

          // Identify currently active workers (those with at least one active session TODAY)
          const activeWorkerIds = new Set<string>()
          const todayStr = new Date().toDateString()

          data.forEach((record: any) => {
            const recordDate = new Date(record.date).toDateString()
            if (!record.out_time && record.person_id && recordDate === todayStr) {
              activeWorkerIds.add(record.person_id)
            }
          })

          // Map API data to UI format
          const mappedEvents: AttendanceEvent[] = data.map((record: any, index: number) => {
            // Helper to clean date string
            const safeDate = (dateStr: string, timeStr: string) => {
              if (!dateStr || !timeStr) return null
              // backend might send date as "YYYY-MM-DD" and time as "HH:MM:SS"
              return `${dateStr}T${timeStr}`
            }

            const inTimeStr = safeDate(record.date, record.in_time) || new Date().toISOString()
            const outTimeStr = safeDate(record.date, record.out_time)
            const workerId = record.person_id || "Unknown"

            const recordDate = new Date(record.date).toDateString()
            const isToday = recordDate === todayStr
            const isStale = !record.out_time && !isToday

            let duration = "Ongoing"
            let status = "Active"

            if (record.out_time) {
              duration = record.duration_sec ? `${(record.duration_sec / 60).toFixed(1)} min` : "0 min"
              status = "Completed"
            } else if (isStale) {
              duration = "Did not checkout"
              status = "Incomplete"
            }

            return {
              id: `evt-${index}`,
              workerId: workerId,
              workerName: workerId.replace(/_/g, " "),
              timestamp: inTimeStr, // For sorting
              event: "IN",
              confidence: record.confidence || 98,
              inTime: inTimeStr,
              outTime: outTimeStr,
              duration: duration,
              status: status,
              currentStatus: activeWorkerIds.has(workerId) ? "Active" : "Inactive",
              profileUrl: `http://127.0.0.1:8000/api/workers/${workerId}/image`, // New Profile URL
              snapshotUrl: "", // We can keep empty or use actual snapshot if available/needed
              workerAvatar: "" // logic handled in table or redundant
            }
          })
          // Sort by date desc
          setEvents(mappedEvents.reverse())
        }
      } catch (error) {
        console.error("Failed to fetch history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
    // Poll every 5 seconds for live updates
    const interval = setInterval(fetchHistory, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance Log</h1>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Complete record of all face recognition events.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AttendanceTable events={events} />
      )}
    </div>
  )
}
