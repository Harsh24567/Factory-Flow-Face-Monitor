"use client"

import Link from "next/link"
import { ArrowLeft, Building2, Hash, Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function WorkerProfile({ worker, stats }: WorkerProfileProps) {
  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" asChild className="w-fit gap-2 text-muted-foreground">
        <Link href="/workers">
          <ArrowLeft className="h-4 w-4" />
          Back to Workers
        </Link>
      </Button>

      {/* Profile Header */}
      <Card className="border-border/50 bg-card">
        <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={worker.avatar} alt={worker.name} />
              <AvatarFallback className="bg-muted text-lg text-muted-foreground">
                {getInitials(worker.name)}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-card ${
                worker.status === "in" ? "bg-primary" : "bg-muted-foreground/40"
              }`}
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-foreground">{worker.name}</h2>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
              <span className="flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                {worker.id}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {worker.department}
              </span>
              <span className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5" />
                Punctuality Score
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Progress value={worker.punctualityScore} className="h-2 max-w-[200px] flex-1" />
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {worker.punctualityScore}/100
              </span>
            </div>
          </div>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase ${
              worker.status === "in"
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {worker.status === "in" ? "Currently IN" : "Currently OUT"}
          </span>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Attendance */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Monthly Attendance (Hours/Day)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyAttendance} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 10]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Arrival Distribution */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Arrival Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.arrivalDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Date / Time</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentActivity.slice(0, 5).map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="text-sm tabular-nums text-foreground">
                    {formatDateTime(event.timestamp)}
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
                    <span className="text-sm tabular-nums text-foreground">
                      {event.confidence}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
