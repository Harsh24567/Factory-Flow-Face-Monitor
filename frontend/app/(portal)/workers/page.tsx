"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { WorkersList } from "@/components/workers/workers-list"
import type { Worker } from "@/lib/mock-data"
import { Loader2 } from "lucide-react"

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/workers")
        if (res.ok) {
          const data = await res.json()
          // Map API data to Worker interface if needed
          // API returns keys like "presenceDuration", "presenceMinutes" etc.
          // We need to match with Worker interface in mock-data
          const mappedWorkers: Worker[] = data.map((w: any) => ({
            id: w.id,
            name: w.name,
            department: w.department,
            avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(w.name)}&backgroundColor=1a1a2e&textColor=4ade80`, // Generate avatar if missing
            status: w.status.includes('Active') ? 'in' : 'out', // Only show green dot if currently Active
            lastSeen: w.lastSeen,
            punctualityScore: 95, // API doesn't have this yet, default to high
            is_late: w.is_late,
            left_early: w.left_early
          }))
          setWorkers(mappedWorkers)
        }
      } catch (error) {
        console.error("Failed to fetch workers", error)
      } finally {
        setLoading(false)
      }
    }
    fetchWorkers()

    // Optional: Poll every 5 seconds
    const interval = setInterval(fetchWorkers, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Worker Profiles</h1>
          <p className="mt-1 text-sm text-muted-foreground/70">
            {workers.length} employees enrolled in the system.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary">
              {workers.filter((w) => w.status === "in").length} Online
            </span>
          </div>
        </div>
      </motion.div>

      {loading && workers.length === 0 ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <WorkersList workers={workers} />
      )}
    </div>
  )
}
