"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { HeatmapDay } from "@/lib/mock-data"

interface OccupancyHeatmapProps {
  data: HeatmapDay[]
}

function getColor(count: number): string {
  if (count === 0) return "bg-muted/40"
  if (count <= 4) return "bg-primary/20"
  if (count <= 8) return "bg-primary/40"
  if (count <= 14) return "bg-primary/60"
  return "bg-primary/90"
}

function getMonthLabels(data: HeatmapDay[]): { label: string; colStart: number }[] {
  const labels: { label: string; colStart: number }[] = []
  let lastMonth = ""
  data.forEach((d, i) => {
    const month = new Date(d.date).toLocaleString("en-US", { month: "short" })
    if (month !== lastMonth) {
      labels.push({ label: month, colStart: Math.floor(i / 7) })
      lastMonth = month
    }
  })
  return labels
}

export function OccupancyHeatmap({ data }: OccupancyHeatmapProps) {
  const weeks = useMemo(() => {
    const w: HeatmapDay[][] = []
    for (let i = 0; i < data.length; i += 7) {
      w.push(data.slice(i, i + 7))
    }
    return w
  }, [data])

  const monthLabels = useMemo(() => getMonthLabels(data), [data])

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground">
          Occupancy Heatmap
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Factory attendance density over the past 12 months.
        </p>
      </CardHeader>
      <CardContent>
        {/* Month labels */}
        <div className="mb-1 flex gap-0">
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="text-[10px] text-muted-foreground"
              style={{ marginLeft: i === 0 ? 0 : `${(m.colStart - (monthLabels[i - 1]?.colStart ?? 0)) * 14 - 28}px` }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Heatmap grid */}
        <TooltipProvider delayDuration={100}>
          <div className="flex gap-[2px] overflow-x-auto pb-2">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day) => (
                  <Tooltip key={day.date}>
                    <TooltipTrigger asChild>
                      <div
                        className={`h-[12px] w-[12px] rounded-[2px] ${getColor(day.count)} transition-colors hover:ring-1 hover:ring-foreground/30`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-medium text-foreground">{day.count} workers</p>
                      <p className="text-muted-foreground">{day.date}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-[2px]">
            <div className="h-[10px] w-[10px] rounded-[2px] bg-muted/40" />
            <div className="h-[10px] w-[10px] rounded-[2px] bg-primary/20" />
            <div className="h-[10px] w-[10px] rounded-[2px] bg-primary/40" />
            <div className="h-[10px] w-[10px] rounded-[2px] bg-primary/60" />
            <div className="h-[10px] w-[10px] rounded-[2px] bg-primary/90" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}
