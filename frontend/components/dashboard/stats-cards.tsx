"use client"

import { motion } from "framer-motion"
import { Users, Clock, AlertTriangle, ShieldCheck, TrendingUp, TrendingDown } from "lucide-react"
import { useAnimatedCounter } from "@/hooks/use-animated-counter"
import type { DashboardMetrics } from "@/lib/mock-data"

interface StatsCardsProps {
  metrics: DashboardMetrics
}

function StatValue({ value, suffix = "" }: { value: number; suffix?: string }) {
  const animated = useAnimatedCounter(value, 1500)
  return (
    <span className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
      {animated}{suffix}
    </span>
  )
}

export function StatsCards({ metrics }: StatsCardsProps) {
  const cards = [
    {
      label: "Present Now",
      value: metrics.presentCount,
      suffix: "",
      subtext: `of ${metrics.totalWorkers} workers`,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      glowClass: "glow-sm",
      borderAccent: "from-primary/30 to-transparent",
      trend: null,
    },
    {
      label: "On Time Rate",
      value: metrics.onTimePercent,
      suffix: "%",
      subtext: "vs yesterday",
      icon: Clock,
      color: "text-chart-2",
      bg: "bg-chart-2/10",
      glowClass: "",
      borderAccent: "from-chart-2/30 to-transparent",
      trend: { value: metrics.onTimeTrend, up: true },
    },
    {
      label: "Unknown Alerts",
      value: metrics.unknownAlerts,
      suffix: "",
      subtext: "strangers today",
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      glowClass: "glow-destructive",
      borderAccent: "from-destructive/30 to-transparent",
      trend: null,
    },
    {
      label: "Avg Confidence",
      value: Math.floor(metrics.avgConfidence),
      suffix: "%",
      subtext: "recognition rate",
      icon: ShieldCheck,
      color: "text-chart-3",
      bg: "bg-chart-3/10",
      glowClass: "",
      borderAccent: "from-chart-3/30 to-transparent",
      trend: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
          className={`group relative overflow-hidden rounded-2xl border border-border/30 bg-card/70 p-5 backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:bg-card/90 ${card.glowClass}`}
        >
          {/* Top gradient accent line */}
          <div className={`absolute left-0 right-0 top-0 h-px bg-gradient-to-r ${card.borderAccent}`} />

          {/* Shimmer on hover */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 shimmer" />

          <div className="relative flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              {card.trend && (
                <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  card.trend.up ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                }`}>
                  {card.trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {card.trend.up ? "+" : ""}{card.trend.value}%
                </div>
              )}
            </div>

            <div>
              <StatValue value={card.value} suffix={card.suffix} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                {card.label}
              </span>
              <span className="text-[11px] text-muted-foreground/50">
                {card.subtext}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
