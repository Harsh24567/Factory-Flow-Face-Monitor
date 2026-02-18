"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ScanFace, Eye, EyeOff, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (email && password) {
      router.push("/dashboard")
    } else {
      setError("Please enter your email and password.")
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background p-4">
      {/* Simple Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#888 1px, transparent 1px), linear-gradient(90deg, #888 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      <div className="relative z-10 flex w-full max-w-5xl items-center gap-16">
        {/* Left side - branding */}
        <motion.div
          className="hidden flex-1 lg:block"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary glow-md">
              <ScanFace className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">FaceGuard</span>
          </div>

          <h2 className="text-4xl font-bold leading-tight tracking-tight text-foreground text-balance">
            Face Recognition
            <br />
            <span className="text-primary">Attendance Portal</span>
          </h2>

          <p className="mt-4 max-w-md text-muted-foreground leading-relaxed">
            Secure, real-time workforce monitoring and management system.
          </p>
        </motion.div>

        {/* Right side - login form */}
        <motion.div
          className="w-full max-w-md lg:max-w-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          <div className="relative">
            {/* Card glow */}
            <div className="absolute -inset-px rounded-2xl bg-primary/10 blur-xl opacity-60" />
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-transparent" />

            <div className="glass-strong relative rounded-2xl p-8 shadow-2xl">
              {/* Mobile logo */}
              <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary glow-md">
                  <ScanFace className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">FaceGuard</span>
              </div>

              <div className="mb-6 hidden lg:block">
                <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in to the admin portal
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@faceguard.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 transition-all"
                    autoComplete="email"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 rounded-xl border-border/50 bg-background/50 pr-10 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 transition-all"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  className="mt-1 h-11 w-full gap-2 rounded-xl bg-primary text-primary-foreground font-semibold glow-sm hover:glow-md transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.span
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Authenticating...
                    </motion.span>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60 pulse-glow" />
                <span>System Operational</span>
                <span className="text-muted-foreground/30">|</span>
                <span>v2.4.0</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
