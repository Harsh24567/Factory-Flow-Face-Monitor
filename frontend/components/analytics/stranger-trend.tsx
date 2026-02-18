"use client"

import { motion } from "framer-motion"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface StrangerTrendProps {
  data: { day: string; count: number }[]
}

export function StrangerTrend({ data }: StrangerTrendProps) {
  const totalStranger = data.reduce((a, d) => a + d.count, 0)
  const peakDay = data.reduce((max, d) => (d.count > max.count ? d : max), data[0])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="overflow-hidden rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between border-b border-border/20 p-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Stranger Detections</h3>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">
            Unknown faces detected over the last 30 days
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums text-destructive">{totalStranger}</p>
            <p className="text-[10px] text-muted-foreground/50">Total Alerts</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold tabular-nums text-foreground">{peakDay?.count ?? 0}</p>
            <p className="text-[10px] text-muted-foreground/50">Peak Day</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 14% 14% / 0.5)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 8, fill: "hsl(220 12% 50% / 0.4)" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "hsl(220 12% 50% / 0.4)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(225 18% 9% / 0.95)",
                  border: "1px solid hsl(225 14% 14%)",
                  borderRadius: "12px",
                  color: "hsl(210 20% 94%)",
                  fontSize: "12px",
                  backdropFilter: "blur(20px)",
                }}
              />
              <Bar
                dataKey="count"
                fill="hsl(0 84% 60%)"
                radius={[4, 4, 0, 0]}
                opacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}
