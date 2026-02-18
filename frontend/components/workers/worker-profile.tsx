"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Building2, Hash, Trophy, Clock } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import type { Worker, WorkerStats } from "@/lib/mock-data"

interface WorkerProfileProps {
  worker: Worker
  stats: WorkerStats
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase()
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

const tooltipStyle = {
  backgroundColor: "hsl(225 18% 9% / 0.95)",
  border: "1px solid hsl(225 14% 14%)",
  borderRadius: "12px",
  color: "hsl(210 20% 94%)",
  fontSize: "12px",
  backdropFilter: "blur(20px)",
}

export function WorkerProfile({ worker, stats }: WorkerProfileProps) {
  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" asChild className="w-fit gap-2 rounded-xl text-muted-foreground hover:text-foreground">
        <Link href="/workers">
          <ArrowLeft className="h-4 w-4" />
          Back to Workers
        </Link>
      </Button>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm"
      >
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5" />

        <div className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start">
          <div className="relative">
            <Avatar className="h-20 w-20 rounded-2xl ring-2 ring-border/20">
              <AvatarImage src={worker.avatar} alt={worker.name} className="rounded-2xl" />
              <AvatarFallback className="rounded-2xl bg-muted text-lg text-muted-foreground">
                {getInitials(worker.name)}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 h-5 w-5 rounded-lg border-2 border-card ${
                worker.status === "in" ? "bg-primary" : "bg-muted-foreground/40"
              }`}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{worker.name}</h2>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              {[
                { icon: Hash, label: worker.id },
                { icon: Building2, label: worker.department },
                { icon: Clock, label: `Last seen ${new Date(worker.lastSeen).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}` },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                  <Icon className="h-3 w-3" />
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 sm:max-w-xs">
              <Trophy className="h-4 w-4 text-chart-3 shrink-0" />
              <Progress value={worker.punctualityScore} className="h-2 flex-1 [&>div]:bg-primary" />
              <span className="text-sm font-bold tabular-nums text-foreground">{worker.punctualityScore}%</span>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide ${
              worker.status === "in"
                ? "bg-primary/10 text-primary glow-sm"
                : "bg-muted/60 text-muted-foreground"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${worker.status === "in" ? "bg-primary animate-pulse" : "bg-muted-foreground/40"}`} />
            {worker.status === "in" ? "Currently IN" : "Currently OUT"}
          </span>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm"
        >
          <div className="border-b border-border/20 p-4">
            <h3 className="text-sm font-semibold text-foreground">Monthly Attendance</h3>
            <p className="text-[11px] text-muted-foreground/60">Hours worked per day this month</p>
          </div>
          <div className="p-4">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyAttendance} barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 14% 14% / 0.5)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(220 12% 50% / 0.5)" }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(220 12% 50% / 0.5)" }} tickLine={false} axisLine={false} domain={[0, 10]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="hours" fill="hsl(160 84% 40%)" radius={[6, 6, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="overflow-hidden rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm"
        >
          <div className="border-b border-border/20 p-4">
            <h3 className="text-sm font-semibold text-foreground">Arrival Distribution</h3>
            <p className="text-[11px] text-muted-foreground/60">When this worker typically checks in</p>
          </div>
          <div className="p-4">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.arrivalDistribution}>
                  <defs>
                    <linearGradient id="arrivalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 14% 14% / 0.5)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: "hsl(220 12% 50% / 0.5)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "hsl(220 12% 50% / 0.5)" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="count" stroke="hsl(199 89% 48%)" strokeWidth={2} fill="url(#arrivalGradient)" dot={{ fill: "hsl(199 89% 48%)", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, stroke: "hsl(199 89% 48%)", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="overflow-hidden rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm"
      >
        <div className="border-b border-border/20 p-4">
          <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          <p className="text-[11px] text-muted-foreground/60">Last 5 attendance events</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/20 hover:bg-transparent">
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40">Timestamp</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40">Event</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40">Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.recentActivity.slice(0, 5).map((event) => (
              <TableRow key={event.id} className="border-b border-border/10 hover:bg-accent/20">
                <TableCell className="text-sm tabular-nums text-foreground">{formatDateTime(event.timestamp)}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    event.event === "IN" ? "bg-primary/10 text-primary" : "bg-muted/60 text-muted-foreground/60"
                  }`}>
                    {event.event}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-16 rounded-full bg-muted/40 overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${event.confidence}%` }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-foreground">{event.confidence}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  )
}
