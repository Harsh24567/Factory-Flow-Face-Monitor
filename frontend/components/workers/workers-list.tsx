"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import type { Worker } from "@/lib/mock-data"

interface WorkersListProps {
  workers: Worker[]
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase()
}

export function WorkersList({ workers }: WorkersListProps) {
  const [search, setSearch] = useState("")

  const filtered = workers.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.department.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card pl-9"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((worker) => (
          <Link key={worker.id} href={`/workers/${worker.id}`}>
            <Card className="group border-border/50 bg-card transition-colors hover:border-primary/30 hover:bg-accent/30">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="relative">
                  <Avatar className="h-11 w-11">
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
                  <p className="truncate text-sm font-semibold text-foreground">
                    {worker.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{worker.department}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress
                      value={worker.punctualityScore}
                      className="h-1.5 flex-1"
                    />
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {worker.punctualityScore}%
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/30 transition-colors group-hover:text-primary" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
