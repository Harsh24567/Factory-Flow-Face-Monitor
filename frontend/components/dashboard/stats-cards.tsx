"use client"

import { Users, Clock, AlertTriangle, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { DashboardMetrics } from "@/lib/mock-data"

interface StatsCardsProps {
  metrics: DashboardMetrics
}

export function StatsCards({ metrics }: StatsCardsProps) {
  const cards = [
    {
      label: "Real-Time Present",
      value: metrics.presentCount,
      subtext: `of ${metrics.totalWorkers} workers`,
      icon: Users,
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
      indicator: "bg-primary",
    },
    {
      label: "On Time %",
      value: `${metrics.onTimePercent}%`,
      subtext: `+${metrics.onTimeTrend}% vs yesterday`,
      icon: Clock,
      iconBg: "bg-chart-2/15",
      iconColor: "text-chart-2",
      indicator: "bg-chart-2",
    },
    {
      label: "Unknown Alerts",
      value: metrics.unknownAlerts,
      subtext: "strangers detected today",
      icon: AlertTriangle,
      iconBg: "bg-destructive/15",
      iconColor: "text-destructive",
      indicator: "bg-destructive",
    },
    {
      label: "Avg Confidence",
      value: `${metrics.avgConfidence}%`,
      subtext: "recognition accuracy",
      icon: ShieldCheck,
      iconBg: "bg-chart-3/15",
      iconColor: "text-chart-3",
      indicator: "bg-chart-3",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="relative overflow-hidden border-border/50 bg-card">
          <CardContent className="flex items-start gap-4 p-5">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.label}
              </span>
              <span className="text-2xl font-bold tabular-nums text-foreground">
                {card.value}
              </span>
              <span className="text-xs text-muted-foreground">{card.subtext}</span>
            </div>
          </CardContent>
          <div className={`absolute bottom-0 left-0 h-0.5 w-full ${card.indicator}`} />
        </Card>
      ))}
    </div>
  )
}
