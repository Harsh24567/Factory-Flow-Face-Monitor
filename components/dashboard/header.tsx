"use client"

import { useState, useEffect } from "react"
import { Activity, Bell, RefreshCw, Settings, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  onSearch: (query: string) => void
  onRefresh: () => void
  isRefreshing: boolean
  alertCount: number
}

export function Header({ onSearch, onRefresh, isRefreshing, alertCount }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="glass-card rounded-lg px-6 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Factory Flow Monitor
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {currentTime
                ? `${currentTime.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })} | ${currentTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}`
                : "\u00A0"}
            </p>
          </div>
        </div>

        {/* Search and actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workers..."
              className="w-48 bg-secondary/50 pl-9 text-sm border-border/50 focus-visible:ring-primary/50 lg:w-64"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {alertCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh data</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>

          {/* System status */}
          <div className="hidden items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-dot" />
            <span className="text-xs font-medium text-emerald-400">System Online</span>
          </div>
        </div>
      </div>
    </header>
  )
}
