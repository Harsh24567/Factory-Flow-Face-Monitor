import { AttendanceTable } from "@/components/history/attendance-table"
import { events } from "@/lib/mock-data"

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Attendance Log
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deep dive into attendance records with advanced filtering.
        </p>
      </div>
      <AttendanceTable events={events} />
    </div>
  )
}
