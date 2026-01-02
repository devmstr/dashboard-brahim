import { Card } from '@/components/card'
import prisma from '@/lib/db'
import { AuditLogTable } from '@/components/audit-log-table'

const Page = async () => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      Actor: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true
        }
      }
    },
    take: 500
  })

  const data = logs.map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    description: log.description,
    metadata: log.metadata as Record<string, unknown> | null,
    createdAt: log.createdAt.toISOString(),
    actor: log.Actor
      ? {
          id: log.Actor.id,
          username: log.Actor.username,
          email: log.Actor.email,
          role: log.Actor.role
        }
      : null
  }))

  return (
    <Card className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Journal d'audit</h1>
        <p className="text-sm text-muted-foreground">
          Suivi des actions effectuees dans l'application.
        </p>
      </div>
      <AuditLogTable data={data} />
    </Card>
  )
}

export default Page
