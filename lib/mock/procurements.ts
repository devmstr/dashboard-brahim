import { STATUS_TYPES } from '@/config/global'
import type { Attachment } from '@/lib/procurement/validations/order'
import type { ProcurementRecord } from '@/types/procurement'

const procurementRecords: ProcurementRecord[] = [
  {
    id: 'PR-24001',
    reference: 'RFQ-2024-091',
    vendor: 'Atlas Metals & Supply',
    contactName: 'Nadia Benali',
    contactEmail: 'nadia@atlasmetals.dz',
    phone: '+213 555 120 330',
    status: 'CREATED',
    items: 12,
    total: 1845000,
    currency: 'DZD',
    createdAt: '2024-04-02T09:00:00Z',
    expectedDate: '2024-05-18T10:00:00Z',
    paymentTerms: '50% à la commande, 50% à la livraison',
    notes:
      'Lots de cuivre conformes aux spécifications EN 13602, livraison palette protégée.',
    attachments: [
      {
        id: 'INV-PR-24001-01',
        name: 'proforma.pdf',
        uniqueName: 'proforma-PR-24001.pdf',
        path: 'uploads/procurement/PR-24001/proforma-PR-24001.pdf',
        url: '/uploads/procurement/PR-24001/proforma-PR-24001.pdf',
        type: 'application/pdf'
      }
    ]
  },
  {
    id: 'PR-24002',
    reference: 'PO-2024-144',
    vendor: 'SudTech Components',
    contactName: 'Khaled Bensalem',
    contactEmail: 'k.bensalem@sudtech.dz',
    phone: '+213 541 933 110',
    status: 'CREATED',
    items: 7,
    total: 965000,
    currency: 'DZD',
    createdAt: '2024-04-10T10:30:00Z',
    expectedDate: '2024-05-05T12:00:00Z',
    paymentTerms: 'Net 30',
    notes: "Inclure certificat d'origine et test de conformité thermique.",
    attachments: []
  },
  {
    id: 'PR-24003',
    reference: 'RFQ-2024-162',
    vendor: 'Global Coolant Imports',
    contactName: 'Sana Touati',
    contactEmail: 'sana.touati@gcoolant.com',
    phone: '+33 6 33 21 00 81',
    status: 'CREATED',
    items: 4,
    total: 1230000,
    currency: 'EUR',
    createdAt: '2024-03-22T14:15:00Z',
    expectedDate: '2024-04-30T08:00:00Z',
    paymentTerms: '30% avance, solde à réception',
    notes: 'Transport maritime assuré, prévoir contrôle qualité renforcé.',
    attachments: []
  },
  {
    id: 'PR-24004',
    reference: 'PO-2024-177',
    vendor: 'Nordic Fasteners',
    contactName: 'Lina Solberg',
    contactEmail: 'lina.solberg@nordicfasteners.no',
    phone: '+47 482 19 020',
    status: 'CREATED',
    items: 18,
    total: 2100000,
    currency: 'EUR',
    createdAt: '2024-03-01T11:00:00Z',
    expectedDate: '2024-03-28T09:00:00Z',
    deliveredAt: '2024-03-26T15:30:00Z',
    paymentTerms: 'Paiement à 45 jours fin de mois',
    notes: 'Tous les colis reçus, facturation finale en attente.',
    attachments: [
      {
        id: 'INV-PR-24004-01',
        name: 'invoice.pdf',
        uniqueName: 'invoice-PR-24004.pdf',
        path: 'uploads/procurement/PR-24004/invoice-PR-24004.pdf',
        url: '/uploads/procurement/PR-24004/invoice-PR-24004.pdf',
        type: 'application/pdf'
      }
    ]
  }
]

export const getProcurements = async (): Promise<ProcurementRecord[]> => {
  return procurementRecords
}

export const getProcurementById = async (
  id: string
): Promise<ProcurementRecord | null> => {
  return procurementRecords.find((record) => record.id === id) ?? null
}

export const updateProcurement = async (
  id: string,
  data: Partial<ProcurementRecord>
): Promise<ProcurementRecord | null> => {
  const index = procurementRecords.findIndex((record) => record.id === id)
  if (index === -1) return null

  procurementRecords[index] = {
    ...procurementRecords[index],
    ...data,
    updatedAt: new Date().toISOString()
  }

  return procurementRecords[index]
}

export const addAttachmentToProcurement = async (
  id: string,
  attachment: Attachment
): Promise<ProcurementRecord | null> => {
  const record = procurementRecords.find((entry) => entry.id === id)
  if (!record) return null

  record.attachments = [...(record.attachments || []), attachment]
  record.updatedAt = new Date().toISOString()
  return record
}
