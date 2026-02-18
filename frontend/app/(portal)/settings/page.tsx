"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Server, Cpu, Shield, Camera, Wifi, WifiOff, Clock, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner" // Assuming sonner is installed as per package.json

interface SettingRowProps {
  label: string
  description?: string
  children: React.ReactNode
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div>
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && (
          <p className="text-[11px] text-muted-foreground/70">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    work_start_time: "09:00",
    work_end_time: "17:00"
  })

  // Fetch initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/settings")
        if (res.ok) {
          const data = await res.json()
          setSettings(prev => ({ ...prev, ...data }))
        }
      } catch (error) {
        console.error("Failed to fetch settings", error)
        toast.error("Failed to load settings from backend")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async (key: string, value: string) => {
    setSaving(true)
    try {
      const res = await fetch("http://localhost:8000/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      })

      if (!res.ok) throw new Error("Failed to save")

      setSettings(prev => ({ ...prev, [key]: value }))
      toast.success("Settings saved successfully")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Configure system preferences and attendance policies.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* Attendance Policy Implementation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="overflow-hidden rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 border-b border-border/20 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Attendance Policy</h3>
              <p className="text-[11px] text-muted-foreground/50">Remuneration & Shift Timings</p>
            </div>
          </div>
          <div className="divide-y divide-border/10 p-4">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>
            ) : (
              <>
                <SettingRow
                  label="Work Start Time"
                  description="Arrivals after this time will be marked LATE"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={settings.work_start_time}
                      onChange={(e) => setSettings(p => ({ ...p, work_start_time: e.target.value }))}
                      className="w-32 h-8 text-xs"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleSave("work_start_time", settings.work_start_time)}
                      disabled={saving}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </SettingRow>

                <SettingRow
                  label="Work End Time"
                  description="Departures before this time will be marked EARLY LEFT"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={settings.work_end_time}
                      onChange={(e) => setSettings(p => ({ ...p, work_end_time: e.target.value }))}
                      className="w-32 h-8 text-xs"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleSave("work_end_time", settings.work_end_time)}
                      disabled={saving}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </SettingRow>
              </>
            )}
          </div>
        </motion.div>

        {/* Existing Static UI (Preserved for aesthetics) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 border-b border-border/20 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chart-2/10">
              <Server className="h-4 w-4 text-chart-2" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">API Configuration</h3>
              <p className="text-[11px] text-muted-foreground/50">Backend connection settings</p>
            </div>
          </div>
          <div className="divide-y divide-border/10 p-4">
            <SettingRow label="Backend URL">
              <code className="rounded-lg bg-muted/40 px-2.5 py-1 text-[11px] font-mono text-foreground">
                http://localhost:8000
              </code>
            </SettingRow>
            <SettingRow label="Connection">
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                <Wifi className="h-3 w-3" />
                Connected
              </span>
            </SettingRow>
          </div>
        </motion.div>

        {/* Camera Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="overflow-hidden rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 border-b border-border/20 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chart-5/10">
              <Camera className="h-4 w-4 text-chart-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Camera System</h3>
              <p className="text-[11px] text-muted-foreground/50">Input device management</p>
            </div>
          </div>
          <div className="divide-y divide-border/10 p-4">
            <SettingRow label="Active Cameras">
              <span className="text-[11px] font-bold tabular-nums text-foreground">4 / 4</span>
            </SettingRow>
            <SettingRow label="Resolution">
              <span className="rounded-lg bg-muted/40 px-2.5 py-1 text-[11px] font-semibold text-foreground">1080p</span>
            </SettingRow>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
