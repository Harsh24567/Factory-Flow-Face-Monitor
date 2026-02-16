"use client"

import { Clock, MapPin, Calendar, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Worker } from "@/lib/mock-data"

interface WorkerDetailModalProps {
  worker: Worker | null
  open: boolean
  onClose: () => void
}

const mockTimeline = [
  { time: "09:02 AM", event: "Entered via Gate A", type: "entry" },
  { time: "09:05 AM", event: "Checked in at Assembly Line A", type: "checkin" },
  { time: "12:00 PM", event: "Break - Cafeteria", type: "break" },
  { time: "12:30 PM", event: "Returned to Assembly Line A", type: "checkin" },
  { time: "02:15 PM", event: "Moved to Quality Control", type: "movement" },
  { time: "03:47 PM", event: "Last detected at Assembly Line A", type: "detection" },
]

export function WorkerDetailModal({ worker, open, onClose }: WorkerDetailModalProps) {
  if (!worker) return null

  const initials = worker.name
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/50 max-w-lg sm:max-w-xl bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Worker Details</DialogTitle>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-border/50">
              <AvatarFallback className={`${worker.avatarColor} text-lg font-bold text-white`}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{worker.name}</h2>
              <p className="text-sm font-mono text-muted-foreground">{worker.id}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge
                  className={
                    worker.status === "present"
                      ? "bg-emerald-500/15 text-emerald-400 border-0"
                      : "bg-destructive/15 text-red-400 border-0"
                  }
                >
                  {worker.status === "present" ? "Present" : "Absent"}
                </Badge>
                <Badge variant="outline" className="border-border/50 text-muted-foreground">
                  {worker.department}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <Clock className="mx-auto h-4 w-4 text-primary" />
            <p className="mt-1 text-lg font-bold text-foreground">{worker.presenceDuration}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Duration</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <Calendar className="mx-auto h-4 w-4 text-primary" />
            <p className="mt-1 text-lg font-bold text-foreground">{worker.firstSeen}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">First Seen</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3 text-center">
            <MapPin className="mx-auto h-4 w-4 text-primary" />
            <p className="mt-1 text-lg font-bold text-foreground">{worker.lastSeen}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Seen</p>
          </div>
        </div>

        {/* Timeline */}
        {worker.status === "present" && (
          <div className="mt-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Activity Timeline</h3>
            <div className="space-y-0">
              {mockTimeline.map((item, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="flex flex-col items-center">
                    <div className={`h-2.5 w-2.5 rounded-full mt-1.5 ${
                      item.type === "entry" ? "bg-emerald-400" :
                      item.type === "break" ? "bg-amber-400" :
                      "bg-primary"
                    }`} />
                    {index < mockTimeline.length - 1 && (
                      <div className="w-px h-8 bg-border/50" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-foreground">{item.event}</p>
                    <p className="text-xs font-mono text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-2 flex justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1.5 h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
