"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Worker } from "@/lib/mock-data"

interface LiveStatusGridProps {
  workers: Worker[]
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase()
}

function formatTime(iso: string): string {
  if (!iso) return "--:--"
  // If it's just a time string like "14:30:00", append date to make it parseable
  if (iso.includes(":") && !iso.includes("T") && !iso.includes("-")) {
    return new Date(`2000-01-01T${iso}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  }
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export function LiveStatusGrid({ workers }: LiveStatusGridProps) {
  const presentCount = workers.filter((w) => w.status === "in").length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="overflow-hidden rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-border/30 p-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Live Status</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {presentCount} of {workers.length} present
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-[11px] font-semibold text-primary">LIVE</span>
        </div>
      </div>

      <ScrollArea className="h-[360px]">
        <div className="p-2">
          {workers.map((worker, i) => (
            <Link
              key={worker.id}
              href={`/workers/${worker.id}`}
              className="group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-accent/40"
            >
              <div className="relative">
                <Avatar className="h-9 w-9 rounded-lg">
                  <AvatarImage src={worker.avatar} alt={worker.name} className="rounded-lg" />
                  <AvatarFallback className="rounded-lg bg-muted text-[10px] font-semibold text-muted-foreground">
                    {getInitials(worker.name)}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${worker.status === "in" ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{worker.name}</p>
                <p className="text-[11px] text-muted-foreground/70">{worker.department}</p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${worker.status === "in"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/80 text-muted-foreground/60"
                    }`}
                >
                  {worker.status === "in" ? "IN" : "OUT"}
                </span>
                <span className="text-[10px] tabular-nums text-muted-foreground/50">
                  {formatTime(worker.lastSeen)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  )
}
