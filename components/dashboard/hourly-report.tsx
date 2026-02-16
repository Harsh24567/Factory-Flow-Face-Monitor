"use client"

import { useState, useMemo } from "react"
import { Download, ChevronDown, ArrowUpDown, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { HourlySlot, Worker } from "@/lib/mock-data"

interface HourlyReportProps {
  report: HourlySlot[]
  workers: Worker[]
}

type SortKey = "time" | string
type SortDir = "asc" | "desc"

function getCellColor(value: number | null): string {
  if (value === null) return "bg-secondary/30 text-muted-foreground"
  if (value === 0) return "bg-destructive/15 text-red-400"
  if (value < 30) return "bg-amber-500/15 text-amber-400"
  return "bg-emerald-500/15 text-emerald-400"
}

export function HourlyReport({ report, workers }: HourlyReportProps) {
  const [sortKey, setSortKey] = useState<SortKey>("time")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [dateRange, setDateRange] = useState("today")

  const workerIds = workers.map((w) => w.id)

  const sortedReport = useMemo(() => {
    const sorted = [...report]
    if (sortKey === "time") {
      return sortDir === "asc" ? sorted : sorted.reverse()
    }
    return sorted.sort((a, b) => {
      const aVal = a.data[sortKey] ?? -1
      const bVal = b.data[sortKey] ?? -1
      return sortDir === "asc" ? aVal - bVal : bVal - aVal
    })
  }, [report, sortKey, sortDir])

  const totals = useMemo(() => {
    const result: Record<string, number> = {}
    workerIds.forEach((id) => {
      result[id] = report.reduce((sum, slot) => sum + (slot.data[id] ?? 0), 0)
    })
    return result
  }, [report, workerIds])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const handleExport = () => {
    const headers = ["Time Slot", ...workers.map((w) => w.name)]
    const rows = report.map((slot) => [
      slot.timeSlot,
      ...workerIds.map((id) => {
        const val = slot.data[id]
        return val === null ? "--" : `${val} min`
      }),
    ])
    const totalRow = [
      "TOTAL",
      ...workerIds.map((id) => `${Math.floor(totals[id] / 60)}h ${totals[id] % 60}m`),
    ]
    const csv = [headers, ...rows, totalRow].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hourly-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Hourly Report</h2>
        <div className="flex items-center gap-3">
          {/* Date range selector */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="border-border/50 bg-secondary/50 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              {dateRange === "today" ? "Today" : dateRange === "yesterday" ? "Yesterday" : "This Week"}
              <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={handleExport}
            className="bg-primary/20 text-primary hover:bg-primary/30 border-0"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="w-32">
                  <button
                    onClick={() => handleSort("time")}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Time Slot
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                {workers.map((w) => (
                  <TableHead key={w.id} className="text-center">
                    <button
                      onClick={() => handleSort(w.id)}
                      className="mx-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {w.name.split(" ")[0]}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedReport.map((slot, i) => (
                <TableRow key={i} className="border-border/20 hover:bg-secondary/30">
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {slot.timeSlot}
                  </TableCell>
                  {workerIds.map((id) => {
                    const val = slot.data[id]
                    return (
                      <TableCell key={id} className="text-center">
                        <span
                          className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${getCellColor(val)}`}
                        >
                          {val === null ? "--" : val === 0 ? "0 min" : `${val} min`}
                        </span>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
              {/* Summary row */}
              <TableRow className="border-t-2 border-border/40 bg-secondary/20 hover:bg-secondary/30">
                <TableCell className="font-semibold text-sm text-foreground">
                  Total
                </TableCell>
                {workerIds.map((id) => {
                  const total = totals[id]
                  const hours = Math.floor(total / 60)
                  const mins = total % 60
                  return (
                    <TableCell key={id} className="text-center">
                      <span className="text-sm font-bold text-primary">
                        {hours}h {mins}m
                      </span>
                    </TableCell>
                  )
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  )
}
