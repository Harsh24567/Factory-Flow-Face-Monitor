"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { HeatmapDay } from "@/lib/mock-data"

interface OccupancyHeatmapProps {
  data: HeatmapDay[]
}

function getColor(count: number): string {
  if (count === 0) return "bg-muted/20"
  if (count <= 4) return "bg-primary/15"
  if (count <= 8) return "bg-primary/30"
  if (count <= 14) return "bg-primary/55"
  return "bg-primary/85"
}

function getMonthLabels(data: HeatmapDay[]): { label: string; colStart: number }[] {
  const labels: { label: string; colStart: number }[] = []
  let lastMonth = ""
  let lastIndex = -999

  data.forEach((d, i) => {
    const month = new Date(d.date).toLocaleString("en-US", { month: "short" })
    const currentIndex = Math.floor(i / 7)

    // Check if new month AND sufficient space (at least 3 weeks/columns) has passed
    if (month !== lastMonth && (currentIndex - lastIndex) >= 3) {
      labels.push({ label: month, colStart: currentIndex })
      lastMonth = month
      lastIndex = currentIndex
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
  const totalDays = data.filter((d) => d.count > 0).length
  const avgOccupancy = totalDays > 0 ? (data.reduce((a, d) => a + d.count, 0) / totalDays).toFixed(1) : "0"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between border-b border-border/20 p-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Occupancy Heatmap</h3>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">
            Factory attendance density over the past year
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums text-foreground">{totalDays}</p>
            <p className="text-[10px] text-muted-foreground/50">Active Days</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums text-primary">{avgOccupancy}</p>
            <p className="text-[10px] text-muted-foreground/50">Avg Workers/Day</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Month labels */}
        <div className="mb-2 relative h-4 w-full">
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="absolute text-[9px] font-medium text-muted-foreground/40"
              style={{ left: `${m.colStart * 14}px` }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Heatmap grid */}
        <TooltipProvider delayDuration={50}>
          <div className="flex gap-[3px] overflow-x-auto pb-2">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <Tooltip key={day.date}>
                    <TooltipTrigger asChild>
                      <div
                        className={`h-[11px] w-[11px] rounded-[3px] ${getColor(day.count)} transition-all duration-150 hover:scale-150 hover:ring-1 hover:ring-primary/40`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="rounded-lg border-border/40 bg-card/95 backdrop-blur-xl text-xs">
                      <p className="font-semibold text-foreground">{day.count} workers</p>
                      <p className="text-muted-foreground/60">{day.date}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground/40">
          <span>Less</span>
          <div className="flex gap-[3px]">
            {["bg-muted/20", "bg-primary/15", "bg-primary/30", "bg-primary/55", "bg-primary/85"].map((c, i) => (
              <div key={i} className={`h-[10px] w-[10px] rounded-[3px] ${c}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </motion.div>
  )
}
