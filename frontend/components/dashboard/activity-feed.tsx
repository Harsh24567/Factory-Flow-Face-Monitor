"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { AttendanceEvent } from "@/lib/mock-data"

interface ActivityFeedProps {
  events: AttendanceEvent[]
}

function getConfidenceMeta(score: number): { label: string; bg: string; text: string } {
  if (score >= 95) return { label: "Excellent", bg: "bg-primary/10", text: "text-primary" }
  if (score >= 90) return { label: "Good", bg: "bg-chart-2/10", text: "text-chart-2" }
  if (score >= 70) return { label: "Fair", bg: "bg-chart-3/10", text: "text-chart-3" }
  return { label: "Low", bg: "bg-destructive/10", text: "text-destructive" }
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  const recentEvents = events.slice(0, 20)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="overflow-hidden rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-border/30 p-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Activity Feed</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Latest {recentEvents.length} events
          </p>
        </div>
        <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
          {recentEvents.length} events
        </span>
      </div>

      <ScrollArea className="h-[360px]">
        <div className="p-2">
          {recentEvents.map((event, i) => {
            const confidence = getConfidenceMeta(event.confidence)
            return (
              <div
                key={event.id}
                className="group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-accent/30"
              >
                {/* Timeline dot */}
                <div className="relative flex flex-col items-center self-stretch">
                  <div className={`h-2 w-2 rounded-full ${event.event === "IN" ? "bg-primary" : "bg-muted-foreground/30"} mt-3`} />
                  {i < recentEvents.length - 1 && (
                    <div className="flex-1 w-px bg-border/40 mt-1" />
                  )}
                </div>

                <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                  <AvatarImage src={event.snapshotUrl} alt={`Snapshot of ${event.workerName}`} className="rounded-lg object-cover" />
                  <AvatarFallback className="rounded-lg bg-muted text-[9px] text-muted-foreground">?</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{event.workerName}</p>
                  <p className="text-[11px] text-muted-foreground/60">{formatTimeAgo(event.timestamp)}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      event.event === "IN"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/80 text-muted-foreground/60"
                    }`}
                  >
                    {event.event}
                  </span>
                  <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${confidence.bg} ${confidence.text}`}>
                    {event.confidence}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </motion.div>
  )
}
