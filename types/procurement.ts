import type { PROCUREMENT_STATUS_TYPES } from '@/config/global'
import type { Attachment } from '@/lib/procurement/validations/order'

export type ProcurementStatus = (typeof PROCUREMENT_STATUS_TYPES)[number]

export interface ProcurementRecord {
  id: string
  reference: string
  serviceName?: string
  vendor: string
  contactName: string
  contactEmail?: string
  phone?: string
  status: ProcurementStatus
  items: number
  total: number
  currency?: string
  createdAt: string
  expectedDate: string
  deliveredAt?: string
  paymentTerms?: string
  notes?: string
  attachments?: Attachment[]
  updatedAt?: string
  validator?: string
}
