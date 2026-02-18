"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, ArrowUpRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import type { Worker } from "@/lib/mock-data"

interface WorkersListProps {
  workers: Worker[]
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase()
}

function getPunctualityColor(score: number): string {
  if (score >= 95) return "text-primary"
  if (score >= 85) return "text-chart-2"
  return "text-chart-3"
}

export function WorkersList({ workers }: WorkersListProps) {
  const [search, setSearch] = useState("")

  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.department.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
        <Input
          placeholder="Search by name or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 rounded-xl border-border/30 bg-card/60 pl-9 backdrop-blur-sm placeholder:text-muted-foreground/40 focus-visible:ring-primary/30"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((worker, i) => (
          <motion.div
            key={worker.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.03, ease: "easeOut" }}
          >
            <Link href={`/workers/${worker.id}`}>
              <div className="group relative overflow-hidden rounded-2xl border border-border/30 bg-card/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5">
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 shimmer" />

                <div className="relative flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-11 w-11 rounded-xl ring-1 ring-border/20">
                      <AvatarImage src={worker.avatar} alt={worker.name} className="rounded-xl" />
                      <AvatarFallback className="rounded-xl bg-muted text-xs font-semibold text-muted-foreground">
                        {getInitials(worker.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${worker.status === "in" ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-semibold text-foreground">{worker.name}</p>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/20 transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <p className="text-[11px] text-muted-foreground/60">{worker.department}</p>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {worker.is_late && (
                        <span className="inline-flex items-center rounded-md bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-500 ring-1 ring-inset ring-red-500/20">
                          Late
                        </span>
                      )}
                      {worker.left_early && (
                        <span className="inline-flex items-center rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500 ring-1 ring-inset ring-amber-500/20">
                          Early Left
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Progress value={worker.punctualityScore} className="h-1 flex-1 [&>div]:bg-primary/60" />
                      <span className={`text-[11px] font-bold tabular-nums ${getPunctualityColor(worker.punctualityScore)}`}>
                        {worker.punctualityScore}%
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground/40">Punctuality Score</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
