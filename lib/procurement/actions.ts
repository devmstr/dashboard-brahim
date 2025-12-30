'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { generateId } from '@/helpers/id-generator'
import { getCurrentUser } from '@/lib/session'
import type { Attachment } from '@/lib/procurement/validations/order'
import { deleteAttachment } from '@/lib/upload-service'
import {
  requisitionInputSchema,
  rfqInputSchema,
  purchaseOrderInputSchema,
  receiptInputSchema,
  supplierInvoiceInputSchema,
  supplierInputSchema,
  contractInputSchema,
  assetInputSchema,
  procurementItemInputSchema
} from '@/lib/procurement/validations/procurement'
import {
  ProcurementPurchaseOrderStatus,
  ProcurementSupplierInvoiceStatus,
  ProcurementReceiptStatus,
  ProcurementRequisitionStatus,
  ProcurementRfqStatus,
  ProcurementContractStatus,
  ProcurementAssetStatus
} from '@prisma/client'
import type { ProcurementRecord, ProcurementStatus } from '@/types/procurement'

type ProcurementAttachmentTarget =
  | 'requisition'
  | 'rfq'
  | 'purchaseOrder'
  | 'receipt'
  | 'supplierInvoice'
  | 'contract'
  | 'asset'

const requireUserId = async () => {
  const user = await getCurrentUser()
  if (!user?.sub) {
    throw new Error('Utilisateur non authentifie')
  }
  return user.sub
}

export const listRequisitions = async () => {
  return prisma.procurementRequisition.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      reference: true,
      title: true,
      status: true,
      neededBy: true,
      createdAt: true,
      Service: {
        select: { name: true }
      }
    }
  })
}

export const listProcurements = async (): Promise<ProcurementRecord[]> => {
  const procurementStatusMap: Record<
    ProcurementPurchaseOrderStatus,
    ProcurementStatus
  > = {
    DRAFT: 'CREATED',
    SENT: 'CREATED',
    CONFIRMED: 'APPROVED',
    PARTIALLY_RECEIVED: 'RECEIVED',
    RECEIVED: 'RECEIVED',
    CANCELLED: 'CANCELLED',
    CLOSED: 'PAID'
  }

  const requisitionStatusMap: Record<string, ProcurementStatus> = {
    DRAFT: 'CREATED',
    SUBMITTED: 'CREATED',
    APPROVED: 'APPROVED',
    REJECTED: 'CANCELLED',
    CANCELLED: 'CANCELLED',
    ORDERED: 'APPROVED'
  }

  const rfqStatusMap: Record<string, ProcurementStatus> = {
    DRAFT: 'CREATED',
    SENT: 'CREATED',
    RECEIVED: 'RECEIVED',
    EVALUATED: 'APPROVED',
    CLOSED: 'PAID',
    CANCELLED: 'CANCELLED'
  }

  const receiptStatusMap: Record<string, ProcurementStatus> = {
    DRAFT: 'CREATED',
    PARTIALLY_RECEIVED: 'RECEIVED',
    RECEIVED: 'RECEIVED',
    CANCELLED: 'CANCELLED'
  }

  const invoiceStatusMap: Record<string, ProcurementStatus> = {
    DRAFT: 'CREATED',
    RECEIVED: 'RECEIVED',
    APPROVED: 'APPROVED',
    PAID: 'PAID',
    CANCELLED: 'CANCELLED'
  }

  const contractStatusMap: Record<string, ProcurementStatus> = {
    DRAFT: 'CREATED',
    ACTIVE: 'APPROVED',
    EXPIRED: 'PAID',
    TERMINATED: 'CANCELLED'
  }

  const assetStatusMap: Record<string, ProcurementStatus> = {
    PLANNED: 'CREATED',
    ACTIVE: 'APPROVED',
    DISPOSED: 'PAID'
  }

  const [
    requisitions,
    rfqs,
    purchaseOrders,
    receipts,
    invoices,
    contracts,
    assets
  ] = await Promise.all([
    prisma.procurementRequisition.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reference: true,
        status: true,
        neededBy: true,
        createdAt: true,
        Service: {
          select: { name: true }
        },
        _count: { select: { Items: true } }
      }
    }),
    prisma.procurementRfq.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reference: true,
        status: true,
        neededBy: true,
        createdAt: true,
        Service: {
          select: { name: true }
        },
        _count: { select: { Lines: true } }
      }
    }),
    prisma.procurementPurchaseOrder.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reference: true,
        status: true,
        vendor: true,
        contactName: true,
        contactEmail: true,
        phone: true,
        itemsCount: true,
        total: true,
        currency: true,
        createdAt: true,
        expectedDate: true,
        deliveredAt: true,
        paymentTerms: true,
        notes: true,
        Service: {
          select: { name: true }
        },
        Supplier: {
          select: {
            name: true,
            contactName: true,
            email: true,
            phone: true
          }
        }
      }
    }),
    prisma.procurementReceipt.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reference: true,
        status: true,
        receivedAt: true,
        createdAt: true,
        Service: {
          select: { name: true }
        },
        _count: { select: { Items: true } },
        PurchaseOrder: {
          select: {
            vendor: true,
            contactName: true,
            contactEmail: true,
            phone: true,
            currency: true,
            Supplier: {
              select: {
                name: true,
                contactName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    }),
    prisma.procurementSupplierInvoice.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reference: true,
        status: true,
        invoiceDate: true,
        dueDate: true,
        total: true,
        currency: true,
        createdAt: true,
        Service: {
          select: { name: true }
        },
        Supplier: {
          select: {
            name: true,
            contactName: true,
            email: true,
            phone: true
          }
        }
      }
    }),
    prisma.procurementContract.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reference: true,
        status: true,
        startDate: true,
        endDate: true,
        value: true,
        currency: true,
        createdAt: true,
        Service: {
          select: { name: true }
        },
        Supplier: {
          select: {
            name: true,
            contactName: true,
            email: true,
            phone: true
          }
        }
      }
    }),
    prisma.procurementAsset.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reference: true,
        status: true,
        acquisitionDate: true,
        value: true,
        currency: true,
        createdAt: true,
        Service: {
          select: { name: true }
        },
        Supplier: {
          select: {
            name: true,
            contactName: true,
            email: true,
            phone: true
          }
        }
      }
    })
  ])

  const requisitionRows: ProcurementRecord[] = requisitions.map((entry) => ({
    id: entry.id,
    reference: entry.reference,
    serviceName: entry.Service?.name ?? '-',
    vendor: '-',
    contactName: '-',
    status: requisitionStatusMap[entry.status] ?? 'CREATED',
    items: entry._count.Items ?? 0,
    total: 0,
    currency: 'DZD',
    createdAt: entry.createdAt.toISOString(),
    expectedDate: (entry.neededBy ?? entry.createdAt).toISOString()
  }))

  const rfqRows: ProcurementRecord[] = rfqs.map((entry) => ({
    id: entry.id,
    reference: entry.reference,
    serviceName: entry.Service?.name ?? '-',
    vendor: '-',
    contactName: '-',
    status: rfqStatusMap[entry.status] ?? 'CREATED',
    items: entry._count.Lines ?? 0,
    total: 0,
    currency: 'DZD',
    createdAt: entry.createdAt.toISOString(),
    expectedDate: (entry.neededBy ?? entry.createdAt).toISOString()
  }))

  const purchaseOrderRows: ProcurementRecord[] = purchaseOrders.map(
    (entry) => ({
      id: entry.id,
      reference: entry.reference,
      serviceName: entry.Service?.name ?? '-',
      vendor: entry.Supplier?.name ?? entry.vendor ?? '-',
      contactName: entry.contactName ?? entry.Supplier?.contactName ?? '-',
      contactEmail: entry.contactEmail ?? entry.Supplier?.email ?? undefined,
      phone: entry.phone ?? entry.Supplier?.phone ?? undefined,
      status: procurementStatusMap[entry.status] ?? procurementStatusMap.DRAFT,
      items: entry.itemsCount ?? 0,
      total: entry.total ?? 0,
      currency: entry.currency ?? 'DZD',
      createdAt: entry.createdAt.toISOString(),
      expectedDate: (entry.expectedDate ?? entry.createdAt).toISOString(),
      deliveredAt: entry.deliveredAt?.toISOString(),
      paymentTerms: entry.paymentTerms ?? undefined,
      notes: entry.notes ?? undefined
    })
  )

  const receiptRows: ProcurementRecord[] = receipts.map((entry) => ({
    id: entry.id,
    reference: entry.reference,
    serviceName: entry.Service?.name ?? '-',
    vendor:
      entry.PurchaseOrder?.Supplier?.name ?? entry.PurchaseOrder?.vendor ?? '-',
    contactName:
      entry.PurchaseOrder?.contactName ??
      entry.PurchaseOrder?.Supplier?.contactName ??
      '-',
    contactEmail:
      entry.PurchaseOrder?.contactEmail ??
      entry.PurchaseOrder?.Supplier?.email ??
      undefined,
    phone:
      entry.PurchaseOrder?.phone ??
      entry.PurchaseOrder?.Supplier?.phone ??
      undefined,
    status: receiptStatusMap[entry.status] ?? 'CREATED',
    items: entry._count.Items ?? 0,
    total: 0,
    currency: entry.PurchaseOrder?.currency ?? 'DZD',
    createdAt: entry.createdAt.toISOString(),
    expectedDate: (entry.receivedAt ?? entry.createdAt).toISOString()
  }))

  const invoiceRows: ProcurementRecord[] = invoices.map((entry) => ({
    id: entry.id,
    reference: entry.reference,
    serviceName: entry.Service?.name ?? '-',
    vendor: entry.Supplier?.name ?? '-',
    contactName: entry.Supplier?.contactName ?? '-',
    contactEmail: entry.Supplier?.email ?? undefined,
    phone: entry.Supplier?.phone ?? undefined,
    status: invoiceStatusMap[entry.status] ?? 'CREATED',
    items: 0,
    total: entry.total ?? 0,
    currency: entry.currency ?? 'DZD',
    createdAt: entry.createdAt.toISOString(),
    expectedDate: (
      entry.dueDate ??
      entry.invoiceDate ??
      entry.createdAt
    ).toISOString()
  }))

  const contractRows: ProcurementRecord[] = contracts.map((entry) => ({
    id: entry.id,
    reference: entry.reference,
    serviceName: entry.Service?.name ?? '-',
    vendor: entry.Supplier?.name ?? '-',
    contactName: entry.Supplier?.contactName ?? '-',
    contactEmail: entry.Supplier?.email ?? undefined,
    phone: entry.Supplier?.phone ?? undefined,
    status: contractStatusMap[entry.status] ?? 'CREATED',
    items: 0,
    total: entry.value ?? 0,
    currency: entry.currency ?? 'DZD',
    createdAt: entry.createdAt.toISOString(),
    expectedDate: (
      entry.endDate ??
      entry.startDate ??
      entry.createdAt
    ).toISOString()
  }))

  const assetRows: ProcurementRecord[] = assets.map((entry) => ({
    id: entry.id,
    reference: entry.reference,
    serviceName: entry.Service?.name ?? '-',
    vendor: entry.Supplier?.name ?? '-',
    contactName: entry.Supplier?.contactName ?? '-',
    contactEmail: entry.Supplier?.email ?? undefined,
    phone: entry.Supplier?.phone ?? undefined,
    status: assetStatusMap[entry.status] ?? 'CREATED',
    items: 0,
    total: entry.value ?? 0,
    currency: entry.currency ?? 'DZD',
    createdAt: entry.createdAt.toISOString(),
    expectedDate: (entry.acquisitionDate ?? entry.createdAt).toISOString()
  }))

  const combined = [
    ...requisitionRows,
    ...rfqRows,
    ...purchaseOrderRows,
    ...receiptRows,
    ...invoiceRows,
    ...contractRows,
    ...assetRows
  ]

  return combined.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export const listProcurementServices = async () => {
  return prisma.procurementService.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true
    }
  })
}

export const listProcurementItems = async () => {
  return prisma.procurementItem.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      sku: true,
      unit: true,
      description: true
    }
  })
}

export const listItems = async () => {
  return prisma.procurementItem.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      sku: true,
      description: true,
      unit: true,
      isActive: true,
      createdAt: true
    }
  })
}

export const getItemById = async (id: string) => {
  return prisma.procurementItem.findUnique({
    where: { id }
  })
}

export const createItem = async (
  input: typeof procurementItemInputSchema._type
) => {
  const data = procurementItemInputSchema.parse(input)

  const item = await prisma.procurementItem.create({
    data: {
      name: data.name,
      sku: data.sku ?? generateId('PI'),
      description: data.description,
      unit: data.unit,
      isActive: data.isActive ?? true
    }
  })

  revalidatePath('/dashboard/procurement/items')
  return item
}

export const updateItem = async (
  id: string,
  input: Partial<typeof procurementItemInputSchema._type>
) => {
  const data = procurementItemInputSchema.partial().parse(input)

  const item = await prisma.procurementItem.update({
    where: { id },
    data: {
      name: data.name,
      sku: data.sku,
      description: data.description,
      unit: data.unit,
      isActive: data.isActive ?? undefined
    }
  })

  revalidatePath('/dashboard/procurement/items')
  revalidatePath(`/dashboard/procurement/items/${id}`)
  return item
}

export const deleteItem = async (id: string) => {
  const item = await prisma.procurementItem.delete({
    where: { id }
  })

  revalidatePath('/dashboard/procurement/items')
  return item
}

export const listProcurementSuppliers = async () => {
  return prisma.procurementSupplier.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      code: true,
      contactName: true,
      email: true,
      phone: true
    }
  })
}

export const listSuppliers = async () => {
  return prisma.procurementSupplier.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      code: true,
      contactName: true,
      email: true,
      phone: true,
      website: true,
      createdAt: true
    }
  })
}

export const getSupplierById = async (id: string) => {
  return prisma.procurementSupplier.findUnique({
    where: { id }
  })
}

export const createSupplier = async (
  input: typeof supplierInputSchema._type
) => {
  const data = supplierInputSchema.parse(input)

  const supplier = await prisma.procurementSupplier.create({
    data: {
      name: data.name,
      code: data.code,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      website: data.website,
      taxIdNumber: data.taxIdNumber,
      tradeRegisterNumber: data.tradeRegisterNumber,
      notes: data.notes
    }
  })

  revalidatePath('/dashboard/procurement/suppliers')
  return supplier
}

export const updateSupplier = async (
  id: string,
  input: Partial<typeof supplierInputSchema._type>
) => {
  const data = supplierInputSchema.partial().parse(input)

  const supplier = await prisma.procurementSupplier.update({
    where: { id },
    data: {
      name: data.name,
      code: data.code,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      website: data.website,
      taxIdNumber: data.taxIdNumber,
      tradeRegisterNumber: data.tradeRegisterNumber,
      notes: data.notes
    }
  })

  revalidatePath('/dashboard/procurement/suppliers')
  revalidatePath(`/dashboard/procurement/suppliers/${id}`)
  return supplier
}

export const deleteSupplier = async (id: string) => {
  const supplier = await prisma.procurementSupplier.delete({
    where: { id }
  })

  revalidatePath('/dashboard/procurement/suppliers')
  return supplier
}

export const listContracts = async () => {
  return prisma.procurementContract.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      reference: true,
      status: true,
      startDate: true,
      endDate: true,
      value: true,
      currency: true,
      Service: {
        select: { name: true }
      },
      Supplier: {
        select: {
          name: true
        }
      }
    }
  })
}

export const getContractById = async (id: string) => {
  return prisma.procurementContract.findUnique({
    where: { id },
    include: {
      Supplier: true,
      Attachments: true
    }
  })
}

export const createContract = async (
  input: typeof contractInputSchema._type
) => {
  const data = contractInputSchema.parse(input)
  const userId = await requireUserId()

  const contract = await prisma.procurementContract.create({
    data: {
      id: data.reference || undefined,
      reference: data.reference,
      supplierId: data.supplierId,
      serviceId: data.serviceId,
      startDate: data.startDate,
      endDate: data.endDate,
      value: data.value,
      currency: data.currency,
      notes: data.notes,
      status: ProcurementContractStatus.DRAFT,
      createdById: userId
    }
  })

  revalidatePath('/dashboard/procurement/contracts')
  return contract
}

export const updateContract = async (
  id: string,
  input: Partial<typeof contractInputSchema._type> & {
    status?: ProcurementContractStatus
  }
) => {
  const data = contractInputSchema.partial().parse(input)
  if (data.reference && data.reference !== id) {
    throw new Error("La reference doit correspondre a l'identifiant.")
  }

  const contract = await prisma.procurementContract.update({
    where: { id },
    data: {
      reference: data.reference,
      supplierId: data.supplierId,
      serviceId: data.serviceId ?? undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      value: data.value,
      currency: data.currency,
      notes: data.notes,
      status: input.status
    }
  })

  revalidatePath('/dashboard/procurement/contracts')
  revalidatePath(`/dashboard/procurement/contracts/${id}`)
  return contract
}

export const deleteContract = async (id: string) => {
  const contract = await prisma.procurementContract.delete({
    where: { id }
  })

  revalidatePath('/dashboard/procurement/contracts')
  return contract
}

export const listAssets = async () => {
  return prisma.procurementAsset.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      reference: true,
      name: true,
      status: true,
      acquisitionDate: true,
      value: true,
      currency: true,
      Service: {
        select: { name: true }
      },
      Supplier: {
        select: {
          name: true
        }
      }
    }
  })
}

export const getAssetById = async (id: string) => {
  return prisma.procurementAsset.findUnique({
    where: { id },
    include: {
      Supplier: true,
      PurchaseOrder: true,
      Item: true,
      Attachments: true
    }
  })
}

export const createAsset = async (input: typeof assetInputSchema._type) => {
  const data = assetInputSchema.parse(input)
  const userId = await requireUserId()

  const asset = await prisma.procurementAsset.create({
    data: {
      id: data.reference || undefined,
      reference: data.reference,
      name: data.name,
      supplierId: data.supplierId,
      purchaseOrderId: data.purchaseOrderId,
      itemId: data.itemId,
      serviceId: data.serviceId,
      acquisitionDate: data.acquisitionDate,
      value: data.value,
      currency: data.currency,
      notes: data.notes,
      status: ProcurementAssetStatus.PLANNED,
      createdById: userId
    }
  })

  revalidatePath('/dashboard/procurement/assets')
  return asset
}

export const updateAsset = async (
  id: string,
  input: Partial<typeof assetInputSchema._type> & {
    status?: ProcurementAssetStatus
  }
) => {
  const data = assetInputSchema.partial().parse(input)
  if (data.reference && data.reference !== id) {
    throw new Error("La reference doit correspondre a l'identifiant.")
  }

  const asset = await prisma.procurementAsset.update({
    where: { id },
    data: {
      reference: data.reference,
      name: data.name,
      supplierId: data.supplierId,
      purchaseOrderId: data.purchaseOrderId,
      itemId: data.itemId,
      serviceId: data.serviceId ?? undefined,
      acquisitionDate: data.acquisitionDate,
      value: data.value,
      currency: data.currency,
      notes: data.notes,
      status: input.status
    }
  })

  revalidatePath('/dashboard/procurement/assets')
  revalidatePath(`/dashboard/procurement/assets/${id}`)
  return asset
}

export const deleteAsset = async (id: string) => {
  const asset = await prisma.procurementAsset.delete({
    where: { id }
  })

  revalidatePath('/dashboard/procurement/assets')
  return asset
}

export const getRequisitionById = async (id: string) => {
  return prisma.procurementRequisition.findUnique({
    where: { id },
    include: {
      Items: {
        include: {
          Item: true
        }
      },
      Attachments: true
    }
  })
}

const resolveRequisitionItems = async (
  items: (typeof requisitionInputSchema._type)['items']
) => {
  if (!items?.length) return []

  return Promise.all(
    items.map(async (item) => {
      if (item.itemId) {
        return {
          itemId: item.itemId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          estimatedUnitCost: item.estimatedUnitCost,
          currency: item.currency
        }
      }

      if (!item.itemName) {
        return {
          itemId: null,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          estimatedUnitCost: item.estimatedUnitCost,
          currency: item.currency
        }
      }

      const createdItem = await prisma.procurementItem.create({
        data: {
          name: item.itemName,
          sku: generateId('PI'),
          unit: item.unit || undefined,
          description: item.description || undefined
        }
      })

      return {
        itemId: createdItem.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        estimatedUnitCost: item.estimatedUnitCost,
        currency: item.currency
      }
    })
  )
}

export const createRequisition = async (
  input: typeof requisitionInputSchema._type
) => {
  const data = requisitionInputSchema.parse(input)
  const userId = await requireUserId()
  const resolvedItems = await resolveRequisitionItems(data.items)

  const requisition = await prisma.procurementRequisition.create({
    data: {
      id: data.reference,
      reference: data.reference,
      title: data.title,
      serviceId: data.serviceId,
      neededBy: data.neededBy,
      notes: data.notes,
      status: ProcurementRequisitionStatus.DRAFT,
      createdById: userId,
      Items: resolvedItems.length
        ? {
            create: resolvedItems.map((item) => ({
              itemId: item.itemId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              estimatedUnitCost: item.estimatedUnitCost,
              currency: item.currency
            }))
          }
        : undefined
    }
  })

  revalidatePath('/dashboard/procurement/requisitions')
  return requisition
}

export const updateRequisition = async (
  id: string,
  input: Partial<typeof requisitionInputSchema._type> & {
    status?: ProcurementRequisitionStatus
  }
) => {
  const data = requisitionInputSchema.partial().parse(input)
  const resolvedItems = await resolveRequisitionItems(data.items)
  if (data.reference && data.reference !== id) {
    throw new Error("La reference doit correspondre a l'identifiant.")
  }

  const requisition = await prisma.procurementRequisition.update({
    where: { id },
    data: {
      reference: data.reference,
      title: data.title,
      serviceId: data.serviceId ?? undefined,
      neededBy: data.neededBy,
      notes: data.notes,
      status: input.status,
      Items: data.items
        ? {
            deleteMany: {},
            create: resolvedItems.map((item) => ({
              itemId: item.itemId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              estimatedUnitCost: item.estimatedUnitCost,
              currency: item.currency
            }))
          }
        : undefined
    }
  })

  revalidatePath('/dashboard/procurement/requisitions')
  revalidatePath(`/dashboard/procurement/requisitions/${id}`)
  return requisition
}

export const deleteRequisition = async (id: string) => {
  const requisition = await prisma.procurementRequisition.delete({
    where: { id }
  })

  revalidatePath('/dashboard/procurement/requisitions')
  return requisition
}

export const listRfqs = async () => {
  return prisma.procurementRfq.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      reference: true,
      status: true,
      neededBy: true,
      createdAt: true,
      Service: {
        select: { name: true }
      }
    }
  })
}

export const getRfqById = async (id: string) => {
  return prisma.procurementRfq.findUnique({
    where: { id },
    include: {
      Lines: {
        include: {
          Item: true
        }
      },
      VendorQuotes: {
        include: {
          Supplier: true
        }
      },
      Attachments: true
    }
  })
}

export const createRfq = async (input: typeof rfqInputSchema._type) => {
  const data = rfqInputSchema.parse(input)
  const userId = await requireUserId()

  const rfq = await prisma.procurementRfq.create({
    data: {
      id: data.reference || undefined,
      reference: data.reference,
      requisitionId: data.requisitionId,
      serviceId: data.serviceId,
      neededBy: data.neededBy,
      notes: data.notes,
      status: ProcurementRfqStatus.DRAFT,
      createdById: userId,
      Lines: data.lines?.length
        ? {
            create: data.lines.map((line) => ({
              itemId: line.itemId,
              description: line.description,
              quantity: line.quantity,
              unit: line.unit
            }))
          }
        : undefined
    }
  })

  revalidatePath('/dashboard/procurement/rfqs')
  return rfq
}

export const updateRfq = async (
  id: string,
  input: Partial<typeof rfqInputSchema._type> & {
    status?: ProcurementRfqStatus
  }
) => {
  const data = rfqInputSchema.partial().parse(input)
  if (data.reference && data.reference !== id) {
    throw new Error("La reference doit correspondre a l'identifiant.")
  }

  const rfq = await prisma.procurementRfq.update({
    where: { id },
    data: {
      reference: data.reference,
      requisitionId: data.requisitionId,
      serviceId: data.serviceId ?? undefined,
      neededBy: data.neededBy,
      notes: data.notes,
      status: input.status,
      Lines: data.lines
        ? {
            deleteMany: {},
            create: data.lines.map((line) => ({
              itemId: line.itemId,
              description: line.description,
              quantity: line.quantity,
              unit: line.unit
            }))
          }
        : undefined
    }
  })

  revalidatePath('/dashboard/procurement/rfqs')
  revalidatePath(`/dashboard/procurement/rfqs/${id}`)
  return rfq
}

export const deleteRfq = async (id: string) => {
  const rfq = await prisma.procurementRfq.delete({
    where: { id }
  })

  revalidatePath('/dashboard/procurement/rfqs')
  return rfq
}

export const listPurchaseOrders = async () => {
  return prisma.procurementPurchaseOrder.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      reference: true,
      status: true,
      expectedDate: true,
      createdAt: true,
      vendor: true,
      Service: {
        select: { name: true }
      },
      Supplier: {
        select: {
          name: true
        }
      }
    }
  })
}

export const getPurchaseOrderById = async (id: string) => {
  return prisma.procurementPurchaseOrder.findUnique({
    where: { id },
    include: {
      Items: {
        include: {
          Item: true
        }
      },
      Supplier: true,
      Attachments: true
    }
  })
}

export const createPurchaseOrder = async (
  input: typeof purchaseOrderInputSchema._type
) => {
  const data = purchaseOrderInputSchema.parse(input)
  const userId = await requireUserId()

  const purchaseOrder = await prisma.procurementPurchaseOrder.create({
    data: {
      id: data.reference,
      reference: data.reference,
      supplierId: data.supplierId,
      requisitionId: data.requisitionId,
      rfqId: data.rfqId,
      serviceId: data.serviceId,
      vendor: data.vendor,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      phone: data.phone,
      currency: data.currency,
      expectedDate: data.expectedDate,
      paymentTerms: data.paymentTerms,
      notes: data.notes,
      itemsCount: data.itemsCount,
      status: ProcurementPurchaseOrderStatus.DRAFT,
      createdById: userId,
      Items: data.items?.length
        ? {
            create: data.items.map((item) => ({
              itemId: item.itemId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              total: item.total
            }))
          }
        : undefined
    }
  })

  revalidatePath('/dashboard/procurement/purchase-orders')
  return purchaseOrder
}

export const updatePurchaseOrder = async (
  id: string,
  input: Partial<typeof purchaseOrderInputSchema._type> & {
    status?: ProcurementPurchaseOrderStatus
  }
) => {
  const data = purchaseOrderInputSchema.partial().parse(input)
  if (data.reference && data.reference !== id) {
    throw new Error("La reference doit correspondre a l'identifiant.")
  }

  const purchaseOrder = await prisma.procurementPurchaseOrder.update({
    where: { id },
    data: {
      reference: data.reference,
      supplierId: data.supplierId,
      requisitionId: data.requisitionId,
      rfqId: data.rfqId,
      serviceId: data.serviceId ?? undefined,
      vendor: data.vendor,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      phone: data.phone,
      currency: data.currency,
      expectedDate: data.expectedDate,
      paymentTerms: data.paymentTerms,
      notes: data.notes,
      itemsCount: data.itemsCount,
      status: input.status,
      Items: data.items
        ? {
            deleteMany: {},
            create: data.items.map((item) => ({
              itemId: item.itemId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              total: item.total
            }))
          }
        : undefined
    }
  })

  revalidatePath('/dashboard/procurement/purchase-orders')
  revalidatePath(`/dashboard/procurement/purchase-orders/${id}`)
  return purchaseOrder
}

export const deletePurchaseOrder = async (id: string) => {
  const purchaseOrder = await prisma.procurementPurchaseOrder.delete({
    where: { id }
  })

  revalidatePath('/dashboard/procurement/purchase-orders')
  return purchaseOrder
}

export const listReceipts = async () => {
  return prisma.procurementReceipt.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      reference: true,
      status: true,
      receivedAt: true,
      createdAt: true,
      Service: {
        select: { name: true }
      },
      PurchaseOrder: {
        select: {
          reference: true,
          vendor: true
        }
      }
    }
  })
}

export const getReceiptById = async (id: string) => {
  return prisma.procurementReceipt.findUnique({
    where: { id },
    include: {
      PurchaseOrder: true,
      Items: {
        include: {
          Item: true,
          PurchaseOrderItem: true
        }
      },
      Attachments: true
    }
  })
}

export const createReceipt = async (input: typeof receiptInputSchema._type) => {
  const data = receiptInputSchema.parse(input)
  const userId = await requireUserId()

  const receipt = await prisma.procurementReceipt.create({
    data: {
      id: data.reference || undefined,
      reference: data.reference,
      purchaseOrderId: data.purchaseOrderId,
      serviceId: data.serviceId,
      receivedAt: data.receivedAt,
      notes: data.notes,
      status: ProcurementReceiptStatus.DRAFT,
      createdById: userId,
      Items: data.items?.length
        ? {
            create: data.items.map((item) => ({
              purchaseOrderItemId: item.purchaseOrderItemId,
              itemId: item.itemId,
              quantityReceived: item.quantityReceived,
              condition: item.condition,
              notes: item.notes
            }))
          }
        : undefined
    }
  })

  revalidatePath('/dashboard/procurement/receipts')
  return receipt
}

export const updateReceipt = async (
  id: string,
  input: Partial<typeof receiptInputSchema._type> & {
    status?: ProcurementReceiptStatus
  }
) => {
  const data = receiptInputSchema.partial().parse(input)

  const receipt = await prisma.procurementReceipt.update({
    where: { id },
    data: {
      reference: data.reference,
      purchaseOrderId: data.purchaseOrderId,
      serviceId: data.serviceId ?? undefined,
      receivedAt: data.receivedAt,
      notes: data.notes,
      status: input.status,
      Items: data.items
        ? {
            deleteMany: {},
            create: data.items.map((item) => ({
              purchaseOrderItemId: item.purchaseOrderItemId,
              itemId: item.itemId,
              quantityReceived: item.quantityReceived,
              condition: item.condition,
              notes: item.notes
            }))
          }
        : undefined
    }
  })

  revalidatePath('/dashboard/procurement/receipts')
  revalidatePath(`/dashboard/procurement/receipts/${id}`)
  return receipt
}

export const deleteReceipt = async (id: string) => {
  const receipt = await prisma.procurementReceipt.delete({
    where: { id }
  })

  revalidatePath('/dashboard/procurement/receipts')
  return receipt
}

export const listSupplierInvoices = async () => {
  return prisma.procurementSupplierInvoice.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      reference: true,
      status: true,
      invoiceDate: true,
      total: true,
      Service: {
        select: { name: true }
      },
      Supplier: {
        select: {
          name: true
        }
      }
    }
  })
}

export const getSupplierInvoiceById = async (id: string) => {
  return prisma.procurementSupplierInvoice.findUnique({
    where: { id },
    include: {
      Supplier: true,
      PurchaseOrder: true,
      Receipt: true,
      Attachments: true
    }
  })
}

export const createSupplierInvoice = async (
  input: typeof supplierInvoiceInputSchema._type
) => {
  const data = supplierInvoiceInputSchema.parse(input)
  const userId = await requireUserId()

  const invoice = await prisma.procurementSupplierInvoice.create({
    data: {
      id: data.reference || undefined,
      reference: data.reference,
      supplierId: data.supplierId,
      purchaseOrderId: data.purchaseOrderId,
      receiptId: data.receiptId,
      serviceId: data.serviceId,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      paidAt: data.paidAt,
      currency: data.currency,
      subtotal: data.subtotal,
      taxes: data.taxes,
      total: data.total,
      notes: data.notes,
      status: ProcurementSupplierInvoiceStatus.DRAFT,
      createdById: userId
    }
  })

  revalidatePath('/dashboard/procurement/invoices')
  return invoice
}

export const updateSupplierInvoice = async (
  id: string,
  input: Partial<typeof supplierInvoiceInputSchema._type> & {
    status?: ProcurementSupplierInvoiceStatus
  }
) => {
  const data = supplierInvoiceInputSchema.partial().parse(input)
  if (data.reference && data.reference !== id) {
    throw new Error("La reference doit correspondre a l'identifiant.")
  }

  const invoice = await prisma.procurementSupplierInvoice.update({
    where: { id },
    data: {
      reference: data.reference,
      supplierId: data.supplierId,
      purchaseOrderId: data.purchaseOrderId,
      receiptId: data.receiptId,
      serviceId: data.serviceId ?? undefined,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      paidAt: data.paidAt,
      currency: data.currency,
      subtotal: data.subtotal,
      taxes: data.taxes,
      total: data.total,
      notes: data.notes,
      status: input.status
    }
  })

  revalidatePath('/dashboard/procurement/invoices')
  revalidatePath(`/dashboard/procurement/invoices/${id}`)
  return invoice
}

export const deleteSupplierInvoice = async (id: string) => {
  const invoice = await prisma.procurementSupplierInvoice.delete({
    where: { id }
  })

  revalidatePath('/dashboard/procurement/invoices')
  return invoice
}

export const createProcurementAttachment = async (
  target: ProcurementAttachmentTarget,
  targetId: string,
  attachment: Attachment
) => {
  const data = {
    name: attachment.name ?? 'attachment',
    uniqueName: attachment.uniqueName ?? generateId('FL'),
    url: attachment.url ?? '',
    type: attachment.type ?? 'application/octet-stream'
  }

  const relationData =
    target === 'requisition'
      ? { procurementRequisitionId: targetId }
      : target === 'rfq'
      ? { procurementRfqId: targetId }
      : target === 'purchaseOrder'
      ? { procurementPurchaseOrderId: targetId }
      : target === 'receipt'
      ? { procurementReceiptId: targetId }
      : target === 'supplierInvoice'
      ? { procurementSupplierInvoiceId: targetId }
      : target === 'contract'
      ? { procurementContractId: targetId }
      : { procurementAssetId: targetId }

  return prisma.attachment.create({
    data: {
      ...data,
      ...relationData
    }
  })
}

export const deleteProcurementAttachment = async (attachmentId: string) => {
  const deleted = await deleteAttachment(attachmentId)
  if (!deleted) {
    throw new Error('Impossible de supprimer la piece jointe.')
  }
  return { success: true }
}
