"use client"

import { Users, UserCheck, UserX, AlertTriangle, TrendingUp } from "lucide-react"

interface LiveMetricsProps {
  realtimeCount: number
  totalRegistered: number
  activePresent: number
  unknownDetections: number
  trend: string
}

function MetricCard({
  label,
  value,
  icon: Icon,
  iconColor,
  bgColor,
  badge,
  badgeColor,
  trend,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  bgColor: string
  badge?: string
  badgeColor?: string
  trend?: string
}) {
  return (
    <div className="glass-card-hover rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {badge && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeColor}`}>
            {badge}
          </span>
        )}
        {trend && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">{trend}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function LiveMetrics({
  realtimeCount,
  totalRegistered,
  activePresent,
  unknownDetections,
  trend,
}: LiveMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Real-time People Count"
        value={realtimeCount}
        icon={Users}
        iconColor="text-primary"
        bgColor="bg-primary/10"
        trend={trend}
      />
      <MetricCard
        label="Total Workers Registered"
        value={totalRegistered}
        icon={UserCheck}
        iconColor="text-indigo-400"
        bgColor="bg-indigo-500/10"
      />
      <MetricCard
        label="Active Workers Present"
        value={activePresent}
        icon={UserCheck}
        iconColor="text-emerald-400"
        bgColor="bg-emerald-500/10"
      />
      <MetricCard
        label="Unknown Detections"
        value={unknownDetections}
        icon={unknownDetections > 0 ? AlertTriangle : UserX}
        iconColor={unknownDetections > 0 ? "text-destructive" : "text-muted-foreground"}
        bgColor={unknownDetections > 0 ? "bg-destructive/10" : "bg-muted/50"}
        badge={unknownDetections > 0 ? `${unknownDetections} Alert${unknownDetections > 1 ? "s" : ""}` : undefined}
        badgeColor="bg-destructive/20 text-red-400"
      />
    </div>
  )
}
