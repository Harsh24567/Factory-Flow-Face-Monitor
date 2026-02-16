"use client"

import { useState, useMemo } from "react"
import { Search, Filter, ChevronLeft, ChevronRight, Eye } from "lucide-react"
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
  if (score >= 90) return "bg-primary/15 text-primary"
  if (score >= 70) return "bg-chart-3/15 text-chart-3"
  return "bg-destructive/15 text-destructive"
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
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
      const now = new Date()
      const cutoff = new Date()
      if (dateFilter === "today") cutoff.setHours(0, 0, 0, 0)
      else if (dateFilter === "week") cutoff.setDate(now.getDate() - 7)
      else if (dateFilter === "month") cutoff.setMonth(now.getMonth() - 1)
      result = result.filter((e) => new Date(e.timestamp) >= cutoff)
    }

    if (confidenceFilter === "low") {
      result = result.filter((e) => e.confidence < 70)
    } else if (confidenceFilter === "medium") {
      result = result.filter((e) => e.confidence >= 70 && e.confidence < 90)
    } else if (confidenceFilter === "high") {
      result = result.filter((e) => e.confidence >= 90)
    }

    return result
  }, [events, search, dateFilter, confidenceFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by employee name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className="bg-card pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={dateFilter}
            onValueChange={(v) => {
              setDateFilter(v)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[140px] bg-card">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={confidenceFilter}
            onValueChange={(v) => {
              setConfidenceFilter(v)
              setPage(0)
            }}
          >
            <SelectTrigger className="w-[150px] bg-card">
              <Filter className="mr-1 h-3.5 w-3.5" />
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="high">High ({">"}90%)</SelectItem>
              <SelectItem value="medium">Medium (70-90%)</SelectItem>
              <SelectItem value="low">Low ({"<"}70%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[60px]">Snap</TableHead>
              <TableHead>Date / Time</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead className="w-[80px]">Event</TableHead>
              <TableHead className="w-[100px]">Confidence</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((event) => (
                <TableRow key={event.id} className="group">
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="cursor-pointer" aria-label={`View snapshot of ${event.workerName}`}>
                          <Avatar className="h-8 w-8 rounded-md">
                            <AvatarImage
                              src={event.snapshotUrl}
                              alt={`Snapshot of ${event.workerName}`}
                              className="object-cover"
                            />
                            <AvatarFallback className="rounded-md bg-muted text-[10px]">?</AvatarFallback>
                          </Avatar>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-xs">
                        <DialogHeader>
                          <DialogTitle>Face Snapshot</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center">
                          <img
                            src={event.snapshotUrl}
                            alt={`Snapshot of ${event.workerName}`}
                            className="h-48 w-48 rounded-lg object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-foreground">{event.workerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(event.timestamp)} &middot; {event.confidence}% confidence
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-foreground">
                    {formatDateTime(event.timestamp)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={event.workerAvatar} alt={event.workerName} />
                        <AvatarFallback className="text-[8px] bg-muted">
                          {event.workerName.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">{event.workerName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        event.event === "IN"
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {event.event}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${getConfidenceColor(event.confidence)}`}
                    >
                      {event.confidence}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
          {filtered.length} records
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 text-xs tabular-nums text-muted-foreground">
            {page + 1} / {totalPages || 1}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
