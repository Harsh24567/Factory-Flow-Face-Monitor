"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function LiveStatusGrid({ workers }: LiveStatusGridProps) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Live Status
          </CardTitle>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Live
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[340px]">
          <div className="grid grid-cols-1 gap-px bg-border/40 sm:grid-cols-2">
            {workers.map((worker) => (
              <Link
                key={worker.id}
                href={`/workers/${worker.id}`}
                className="flex items-center gap-3 bg-card p-3 transition-colors hover:bg-accent/50"
              >
                <div className="relative">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={worker.avatar} alt={worker.name} />
                    <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                      {getInitials(worker.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                      worker.status === "in" ? "bg-primary" : "bg-muted-foreground/40"
                    }`}
                  />
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-medium text-foreground">
                    {worker.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {worker.department}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      worker.status === "in"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {worker.status === "in" ? "IN" : "OUT"}
                  </span>
                  <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
                    {formatTime(worker.lastSeen)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
