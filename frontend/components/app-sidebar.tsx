"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  ScanFace,
  Zap,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Attendance Log", href: "/history", icon: ClipboardList },
  { title: "Worker Profiles", href: "/workers", icon: Users },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [workerCount, setWorkerCount] = useState<number | null>(null)

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/metrics")
      .then(res => res.json())
      .then(data => setWorkerCount(data.totalRegistered))
      .catch(err => console.error("Sidebar stats error:", err))
  }, [])

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4 pb-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary glow-sm">
            <ScanFace className="h-5 w-5 text-primary-foreground" suppressHydrationWarning />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-foreground">FaceGuard</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-primary/70">Admin Portal</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`relative h-10 rounded-xl transition-all duration-200 ${isActive
                        ? "bg-primary/10 text-primary font-medium glow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }`}
                    >
                      <Link href={item.href}>
                        <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} suppressHydrationWarning />
                        <span>{item.title}</span>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <Zap className="h-3.5 w-3.5" suppressHydrationWarning />
            System Active
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            All cameras online. {workerCount !== null ? workerCount : "..."} workers enrolled.
          </p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
