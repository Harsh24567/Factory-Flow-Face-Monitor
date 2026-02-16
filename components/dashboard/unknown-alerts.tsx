"use client"

import { useState } from "react"
import { AlertTriangle, UserPlus, X, Camera, MapPin, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UnknownPerson } from "@/lib/mock-data"

interface UnknownAlertsProps {
  unknownPersons: UnknownPerson[]
}

function UnknownPersonCard({
  person,
  onDismiss,
  onAdd,
}: {
  person: UnknownPerson
  onDismiss: () => void
  onAdd: () => void
}) {
  return (
    <div className="flex-shrink-0 w-72 rounded-xl border-2 border-destructive/30 bg-destructive/5 p-4 backdrop-blur-xl transition-all duration-300 hover:border-destructive/50 hover:bg-destructive/10">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="h-4 w-4 text-red-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
          Unknown Person
        </span>
      </div>

      {/* Placeholder for captured image */}
      <div className="relative mb-3 flex h-36 items-center justify-center rounded-lg bg-secondary/60 border border-border/30">
        <Camera className="h-8 w-8 text-muted-foreground/50" />
        <span className="absolute bottom-2 right-2 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          {person.id}
        </span>
      </div>

      <div className="mb-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Detected at {person.timestamp}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{person.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Confidence:</span>
          <span className={`font-semibold ${person.confidence >= 85 ? "text-red-400" : "text-amber-400"}`}>
            {person.confidence}%
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 bg-primary/20 text-primary hover:bg-primary/30 border-0"
          onClick={onAdd}
        >
          <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          Add to DB
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          onClick={onDismiss}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function UnknownAlerts({ unknownPersons: initialPersons }: UnknownAlertsProps) {
  const [persons, setPersons] = useState(initialPersons)

  const handleDismiss = (id: string) => {
    setPersons((prev) => prev.filter((p) => p.id !== id))
  }

  const handleAdd = (id: string) => {
    setPersons((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-400" />
        <h2 className="text-lg font-semibold text-foreground">Unknown Person Alerts</h2>
        {persons.length > 0 && (
          <span className="ml-2 rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-semibold text-red-400">
            {persons.length}
          </span>
        )}
      </div>

      {persons.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <ShieldAlert className="h-6 w-6 text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-emerald-400">All Clear</p>
          <p className="mt-1 text-xs text-muted-foreground">No unknown persons detected</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
          {persons.map((person) => (
            <UnknownPersonCard
              key={person.id}
              person={person}
              onDismiss={() => handleDismiss(person.id)}
              onAdd={() => handleAdd(person.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
