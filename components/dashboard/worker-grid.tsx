"use client"

import { Clock, Eye, EyeOff } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Worker } from "@/lib/mock-data"

interface WorkerGridProps {
  workers: Worker[]
  onWorkerClick: (worker: Worker) => void
}

function WorkerCard({ worker, onClick }: { worker: Worker; onClick: () => void }) {
  const initials = worker.name
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <button
      onClick={onClick}
      className="glass-card-hover w-full rounded-xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 ring-2 ring-border/50">
          <AvatarFallback className={`${worker.avatarColor} text-sm font-bold text-white`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold text-foreground">{worker.name}</p>
            <Badge
              variant={worker.status === "present" ? "default" : "destructive"}
              className={
                worker.status === "present"
                  ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20 border-0"
                  : "bg-destructive/15 text-red-400 hover:bg-destructive/20 border-0"
              }
            >
              {worker.status === "present" ? (
                <Eye className="mr-1 h-3 w-3" />
              ) : (
                <EyeOff className="mr-1 h-3 w-3" />
              )}
              {worker.status === "present" ? "Present" : "Absent"}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs font-mono text-muted-foreground">{worker.id}</p>
          <p className="text-xs text-muted-foreground">{worker.department}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-secondary/50 px-3 py-2">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Duration</p>
          </div>
          <p className={`mt-0.5 text-sm font-semibold ${worker.status === "present" ? "text-primary" : "text-muted-foreground"}`}>
            {worker.presenceDuration}
          </p>
        </div>
        <div className="rounded-lg bg-secondary/50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">First Seen</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{worker.firstSeen}</p>
        </div>
        <div className="rounded-lg bg-secondary/50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Seen</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{worker.lastSeen}</p>
        </div>
      </div>
    </button>
  )
}

export function WorkerGrid({ workers, onWorkerClick }: WorkerGridProps) {
  if (workers.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">No workers match your search</p>
        <p className="mt-1 text-sm text-muted-foreground">Try a different search term</p>
      </div>
    )
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Identified Workers</h2>
        <span className="text-sm text-muted-foreground">{workers.length} workers</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workers.map((worker) => (
          <WorkerCard
            key={worker.id}
            worker={worker}
            onClick={() => onWorkerClick(worker)}
          />
        ))}
      </div>
    </section>
  )
}
