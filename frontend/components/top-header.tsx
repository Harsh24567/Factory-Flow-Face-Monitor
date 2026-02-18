"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { Moon, Sun, ChevronRight, User, LogOut, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/history": "Attendance Log",
  "/workers": "Worker Profiles",
  "/analytics": "Analytics",
  "/settings": "Settings",
}

export function TopHeader() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs = segments.map((_, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/")
    const label = breadcrumbMap[href] || segments[i].charAt(0).toUpperCase() + segments[i].slice(1)
    return { href, label }
  })

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
      <div className="h-4 w-px bg-border/60" />
      <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
        <Link href="/dashboard" className="text-muted-foreground/70 hover:text-foreground transition-colors text-xs">
          Home
        </Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
            <Link href={crumb.href} className="text-xs font-medium text-foreground">
              {crumb.label}
            </Link>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <div className="ml-1 h-4 w-px bg-border/60" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 rounded-lg px-2 hover:bg-accent/50">
              <Avatar className="h-7 w-7 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary/15 text-xs font-semibold text-primary">
                  AD
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-medium text-foreground md:inline-block">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/50 bg-card/95 backdrop-blur-xl">
            <DropdownMenuItem className="rounded-lg">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem asChild className="rounded-lg">
              <Link href="/login" className="flex items-center text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
