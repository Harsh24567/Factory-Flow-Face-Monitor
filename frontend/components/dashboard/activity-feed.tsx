"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { AttendanceEvent } from "@/lib/mock-data"

interface ActivityFeedProps {
  events: AttendanceEvent[]
}

function getConfidenceColor(score: number): string {
  if (score >= 90) return "bg-primary/15 text-primary"
  if (score >= 70) return "bg-chart-3/15 text-chart-3"
  return "bg-destructive/15 text-destructive"
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
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Activity Feed
          </CardTitle>
          <span className="text-xs text-muted-foreground">Last 20 events</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[340px]">
          <div className="flex flex-col">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 border-b border-border/30 px-4 py-3 transition-colors last:border-0 hover:bg-accent/30"
              >
                <Avatar className="h-8 w-8 shrink-0 rounded-md">
                  <AvatarImage
                    src={event.snapshotUrl}
                    alt={`Snapshot of ${event.workerName}`}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-md bg-muted text-[10px] text-muted-foreground">
                    ?
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-medium text-foreground">
                    {event.workerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(event.timestamp)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      event.event === "IN"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {event.event}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${getConfidenceColor(
                      event.confidence
                    )}`}
                  >
                    {event.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
