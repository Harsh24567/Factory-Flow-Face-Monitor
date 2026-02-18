"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, ChevronLeft, ChevronRight, Eye, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { AttendanceEvent } from "@/lib/mock-data"

interface AttendanceTableProps {
  events: AttendanceEvent[]
}

function getConfidenceColor(score: number): string {
  if (score >= 95) return "bg-primary/10 text-primary"
  if (score >= 90) return "bg-chart-2/10 text-chart-2"
  if (score >= 70) return "bg-chart-3/10 text-chart-3"
  return "bg-destructive/10 text-destructive"
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  }
}

const PAGE_SIZE = 10

export function AttendanceTable({ events }: AttendanceTableProps) {
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [confidenceFilter, setConfidenceFilter] = useState("all")
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    let result = events
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((e) => e.workerName.toLowerCase().includes(q))
    }
    if (dateFilter !== "all") {
      const cutoff = new Date()
      if (dateFilter === "today") cutoff.setHours(0, 0, 0, 0)
      else if (dateFilter === "week") cutoff.setDate(cutoff.getDate() - 7)
      else if (dateFilter === "month") cutoff.setMonth(cutoff.getMonth() - 1)
      result = result.filter((e) => new Date(e.timestamp) >= cutoff)
    }
    if (confidenceFilter === "low") result = result.filter((e) => e.confidence < 70)
    else if (confidenceFilter === "medium") result = result.filter((e) => e.confidence >= 70 && e.confidence < 90)
    else if (confidenceFilter === "high") result = result.filter((e) => e.confidence >= 90)
    return result
  }, [events, search, dateFilter, confidenceFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const hasActiveFilters = search || dateFilter !== "all" || confidenceFilter !== "all"

  function clearFilters() {
    setSearch("")
    setDateFilter("all")
    setConfidenceFilter("all")
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="h-10 rounded-xl border-border/30 bg-card/60 pl-9 text-foreground backdrop-blur-sm placeholder:text-muted-foreground/40 focus-visible:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateFilter} onValueChange={(v) => { setDateFilter(v); setPage(0) }}>
            <SelectTrigger className="w-[130px] rounded-xl border-border/30 bg-card/60 backdrop-blur-sm">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-xl">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Select value={confidenceFilter} onValueChange={(v) => { setConfidenceFilter(v); setPage(0) }}>
            <SelectTrigger className="w-[145px] rounded-xl border-border/30 bg-card/60 backdrop-blur-sm">
              <Filter className="mr-1 h-3.5 w-3.5 text-muted-foreground/50" />
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-xl">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="high">High ({">"}90%)</SelectItem>
              <SelectItem value="medium">Medium (70-90%)</SelectItem>
              <SelectItem value="low">Low ({"<"}70%)</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 rounded-xl gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="overflow-hidden rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/30 hover:bg-transparent">
              <TableHead className="w-[50px] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Profile</TableHead>
              <TableHead className="w-[80px] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Status</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Employee</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">In Time</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Out Time</TableHead>
              <TableHead className="w-[80px] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Duration</TableHead>
              <TableHead className="w-[100px] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {pageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/20" />
                      <p className="text-sm text-muted-foreground/50">No records found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((event) => {
                  const inDt = formatDateTime(event.inTime)
                  const outDt = event.outTime ? formatDateTime(event.outTime) : null
                  const isActive = !event.outTime
                  const profileUrl = event.profileUrl || event.snapshotUrl

                  return (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group border-b border-border/20 transition-colors hover:bg-accent/20"
                    >
                      {/* Profile Image */}
                      <TableCell className="py-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="cursor-pointer transition-transform active:scale-95" aria-label={`View profile of ${event.workerName}`}>
                              <Avatar className="h-9 w-9 rounded-full ring-2 ring-border/50 transition-all hover:ring-primary/50">
                                <AvatarImage src={profileUrl} alt={event.workerName} className="object-cover" />
                                <AvatarFallback className="bg-muted text-[10px]">
                                  {event.workerName.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="glass-strong rounded-2xl sm:max-w-xs p-0 overflow-hidden border-0">
                            <div className="relative aspect-square w-full">
                              <img
                                src={profileUrl}
                                alt={event.workerName}
                                className="h-full w-full object-cover"
                                crossOrigin="anonymous"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <div className="absolute bottom-4 left-4 text-white">
                                <p className="font-bold text-lg">{event.workerName}</p>
                                <p className="text-xs opacity-80">{event.workerId}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide border ${isActive
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_8px_-2px_rgba(16,185,129,0.5)]"
                          : event.status === "Incomplete"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-muted/50 text-muted-foreground border-border/50"
                          }`}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" :
                            event.status === "Incomplete" ? "bg-destructive" :
                              "bg-muted-foreground"
                            }`} />
                          {isActive ? "Active" : event.status === "Incomplete" ? "Timeout" : "Away"}
                        </span>
                      </TableCell>

                      {/* Employee */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{event.workerName}</span>
                          <span className="text-[10px] text-muted-foreground/60">{event.workerId}</span>
                        </div>
                      </TableCell>

                      {/* In Time */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-foreground">{inDt.time}</span>
                          <span className="text-[10px] text-muted-foreground/50">{inDt.date}</span>
                        </div>
                      </TableCell>

                      {/* Out Time */}
                      <TableCell>
                        {outDt ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-foreground">{outDt.time}</span>
                            <span className="text-[10px] text-muted-foreground/40">{outDt.date}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] italic text-muted-foreground/30">
                            --
                          </span>
                        )}
                      </TableCell>

                      {/* Duration */}
                      <TableCell>
                        <span className={`text-xs tabular-nums font-medium ${event.status === "Incomplete" ? "text-destructive/70 italic" : "text-foreground"
                          }`}>{event.duration}</span>
                      </TableCell>

                      {/* Confidence */}
                      <TableCell>
                        <div className="flex items-center">
                          <span className={`text-[11px] font-bold tabular-nums ${getConfidenceColor(event.confidence).split(" ")[1]}`}>
                            {event.confidence}%
                          </span>
                        </div>
                      </TableCell>
                    </motion.tr>
                  )
                })
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </motion.div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground/50">
          Showing {filtered.length > 0 ? page * PAGE_SIZE + 1 : 0}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i).map((i) => (
            <Button
              key={i}
              variant={page === i ? "default" : "ghost"}
              size="icon"
              className={`h-8 w-8 rounded-lg text-xs ${page === i ? "bg-primary/15 text-primary hover:bg-primary/20" : ""}`}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </Button>
          ))}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
