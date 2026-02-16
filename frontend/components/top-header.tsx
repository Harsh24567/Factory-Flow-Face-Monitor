"use client"

import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { Moon, Sun, ChevronRight, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
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

  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs = segments.map((_, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/")
    const label = breadcrumbMap[href] || segments[i].charAt(0).toUpperCase() + segments[i].slice(1)
    return { href, label }
  })

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-5" />
      <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          Home
        </Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <Link
              href={crumb.href}
              className="text-foreground font-medium"
            >
              {crumb.label}
            </Link>
          </span>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">AD</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline-block">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
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
