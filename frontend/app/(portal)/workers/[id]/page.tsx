import { notFound } from "next/navigation"
import { workers, getWorkerStats } from "@/lib/mock-data"
import { WorkerProfile } from "@/components/workers/worker-profile"

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const worker = workers.find((w) => w.id === id)
  if (!worker) notFound()

  const stats = getWorkerStats(id)

  return <WorkerProfile worker={worker} stats={stats} />
}
