import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

export type AuditLogInput = {
  actorId?: string | null
  action: AuditAction
  entityType: string
  entityId: string
  description?: string | null
  metadata?: Record<string, unknown> | null
}

export const logAudit = async ({
  actorId,
  action,
  entityType,
  entityId,
  description,
  metadata
}: AuditLogInput) => {
  const metadataPayload = metadata
    ? (metadata as Prisma.InputJsonValue)
    : undefined

  return prisma.auditLog.create({
    data: {
      actorId: actorId ?? null,
      action,
      entityType,
      entityId,
      description: description ?? null,
      metadata: metadataPayload
    }
  })
}

export const safeLogAudit = async (input: AuditLogInput) => {
  try {
    await logAudit(input)
  } catch (error) {
    console.error('Audit log failed:', error)
  }
}
