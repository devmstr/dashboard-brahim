import {
  PrismaClient,
  ProcurementAssetStatus,
  ProcurementContractStatus,
  ProcurementPurchaseOrderStatus,
  ProcurementReceiptStatus,
  ProcurementRequisitionStatus,
  ProcurementRfqStatus,
  ProcurementSupplierInvoiceStatus,
  type ProcurementRequisition,
  type ProcurementRfq,
  type ProcurementPurchaseOrder,
  type ProcurementReceipt
} from '@prisma/client'
import { generateId } from '../helpers/id-generator'

const prisma = new PrismaClient()

const addDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

const requireUserId = async () => {
  const user = await prisma.user.findFirst({ select: { id: true } })
  if (!user?.id) {
    throw new Error('Aucun utilisateur trouve. Lancez seed:users avant.')
  }
  return user.id
}

const requireItems = async () => {
  const items = await prisma.procurementItem.findMany({
    orderBy: { createdAt: 'asc' },
    take: 6
  })
  if (items.length < 3) {
    throw new Error(
      'Pas assez d’articles procurement. Lancez seed:procurement d’abord.'
    )
  }
  return items
}

const requireSuppliers = async () => {
  const suppliers = await prisma.procurementSupplier.findMany({
    orderBy: { createdAt: 'asc' },
    take: 4
  })
  if (suppliers.length < 2) {
    throw new Error(
      'Pas assez de fournisseurs. Lancez seed:suppliers d’abord.'
    )
  }
  return suppliers
}

async function main() {
  console.log('Seeding procurement module data...')

  console.log('Clearing procurement tables...')
  await prisma.procurementReceiptItem.deleteMany()
  await prisma.procurementReceipt.deleteMany()
  await prisma.procurementPurchaseOrderItem.deleteMany()
  await prisma.procurementSupplierInvoice.deleteMany()
  await prisma.procurementPurchaseOrder.deleteMany()
  await prisma.procurementRfqVendorQuoteLine.deleteMany()
  await prisma.procurementRfqVendorQuote.deleteMany()
  await prisma.procurementRfqLine.deleteMany()
  await prisma.procurementRfq.deleteMany()
  await prisma.procurementRequisitionItem.deleteMany()
  await prisma.procurementRequisition.deleteMany()
  await prisma.procurementContract.deleteMany()
  await prisma.procurementAsset.deleteMany()

  const [userId, items, suppliers] = await Promise.all([
    requireUserId(),
    requireItems(),
    requireSuppliers()
  ])

  const requisitions = [
    {
      reference: generateId('PR'),
      title: 'Maintenance ligne production',
      neededBy: addDays(10),
      notes: 'Remplacement consommables et pieces critiques.',
      status: ProcurementRequisitionStatus.SUBMITTED,
      items: [
        {
          itemId: items[0].id,
          description: items[0].description,
          quantity: 10,
          unit: items[0].unit,
          estimatedUnitCost: 4500,
          currency: 'DZD'
        },
        {
          itemId: items[1].id,
          description: items[1].description,
          quantity: 5,
          unit: items[1].unit,
          estimatedUnitCost: 12000,
          currency: 'DZD'
        }
      ]
    },
    {
      reference: generateId('PR'),
      title: 'Pieces de rechange atelier',
      neededBy: addDays(20),
      notes: 'Priorite aux articles standard.',
      status: ProcurementRequisitionStatus.APPROVED,
      items: [
        {
          itemId: items[2].id,
          description: items[2].description,
          quantity: 25,
          unit: items[2].unit,
          estimatedUnitCost: 1800,
          currency: 'DZD'
        },
        {
          itemId: items[3].id,
          description: items[3].description,
          quantity: 12,
          unit: items[3].unit,
          estimatedUnitCost: 5200,
          currency: 'DZD'
        }
      ]
    }
  ]

  const requisitionResults: ProcurementRequisition[] = []
  for (const requisition of requisitions) {
    const result = await prisma.procurementRequisition.upsert({
      where: { reference: requisition.reference },
      create: {
        id: requisition.reference,
        reference: requisition.reference,
        title: requisition.title,
        neededBy: requisition.neededBy,
        notes: requisition.notes,
        status: requisition.status,
        createdById: userId,
        Items: {
          create: requisition.items.map((item) => ({
            itemId: item.itemId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            estimatedUnitCost: item.estimatedUnitCost,
            currency: item.currency
          }))
        }
      },
      update: {
        title: requisition.title,
        neededBy: requisition.neededBy,
        notes: requisition.notes,
        status: requisition.status,
        Items: {
          deleteMany: {},
          create: requisition.items.map((item) => ({
            itemId: item.itemId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            estimatedUnitCost: item.estimatedUnitCost,
            currency: item.currency
          }))
        }
      }
    })
    requisitionResults.push(result)
    console.log(`Requisition: ${result.reference}`)
  }

  const rfqs = [
    {
      reference: generateId('RF'),
      requisitionId: requisitionResults[0]?.id,
      neededBy: addDays(12),
      notes: 'Demande de devis fournisseurs locaux.',
      status: ProcurementRfqStatus.SENT,
      lines: [
        {
          itemId: items[0].id,
          description: items[0].description,
          quantity: 10,
          unit: items[0].unit
        },
        {
          itemId: items[1].id,
          description: items[1].description,
          quantity: 5,
          unit: items[1].unit
        }
      ]
    },
    {
      reference: generateId('RF'),
      requisitionId: requisitionResults[1]?.id,
      neededBy: addDays(22),
      notes: 'RFQ pour pieces atelier.',
      status: ProcurementRfqStatus.RECEIVED,
      lines: [
        {
          itemId: items[2].id,
          description: items[2].description,
          quantity: 25,
          unit: items[2].unit
        }
      ]
    }
  ]

  const rfqResults: ProcurementRfq[] = []
  for (const rfq of rfqs) {
    const result = await prisma.procurementRfq.upsert({
      where: { reference: rfq.reference },
      create: {
        id: rfq.reference,
        reference: rfq.reference,
        requisitionId: rfq.requisitionId,
        neededBy: rfq.neededBy,
        notes: rfq.notes,
        status: rfq.status,
        createdById: userId,
        Lines: {
          create: rfq.lines.map((line) => ({
            itemId: line.itemId,
            description: line.description,
            quantity: line.quantity,
            unit: line.unit
          }))
        }
      },
      update: {
        requisitionId: rfq.requisitionId,
        neededBy: rfq.neededBy,
        notes: rfq.notes,
        status: rfq.status,
        Lines: {
          deleteMany: {},
          create: rfq.lines.map((line) => ({
            itemId: line.itemId,
            description: line.description,
            quantity: line.quantity,
            unit: line.unit
          }))
        }
      }
    })
    rfqResults.push(result)
    console.log(`RFQ: ${result.reference}`)
  }

  const purchaseOrders = [
    {
      reference: generateId('PO'),
      supplierId: suppliers[0].id,
      requisitionId: requisitionResults[0]?.id,
      rfqId: rfqResults[0]?.id,
      vendor: suppliers[0].name,
      contactName: suppliers[0].contactName,
      contactEmail: suppliers[0].email,
      phone: suppliers[0].phone,
      currency: 'DZD',
      expectedDate: addDays(18),
      paymentTerms: 'Net 30',
      notes: 'Livraison partielle autorisee.',
      status: ProcurementPurchaseOrderStatus.CONFIRMED,
      items: [
        {
          itemId: items[0].id,
          description: items[0].description,
          quantity: 10,
          unit: items[0].unit,
          unitPrice: 4800,
          total: 48000
        },
        {
          itemId: items[1].id,
          description: items[1].description,
          quantity: 5,
          unit: items[1].unit,
          unitPrice: 12500,
          total: 62500
        }
      ]
    },
    {
      reference: generateId('PO'),
      supplierId: suppliers[1].id,
      requisitionId: requisitionResults[1]?.id,
      rfqId: rfqResults[1]?.id,
      vendor: suppliers[1].name,
      contactName: suppliers[1].contactName,
      contactEmail: suppliers[1].email,
      phone: suppliers[1].phone,
      currency: 'DZD',
      expectedDate: addDays(28),
      paymentTerms: 'Net 45',
      notes: 'Urgent pour atelier.',
      status: ProcurementPurchaseOrderStatus.SENT,
      items: [
        {
          itemId: items[2].id,
          description: items[2].description,
          quantity: 25,
          unit: items[2].unit,
          unitPrice: 1900,
          total: 47500
        }
      ]
    }
  ]

  const purchaseOrderResults: ProcurementPurchaseOrder[] = []
  for (const order of purchaseOrders) {
    const result = await prisma.procurementPurchaseOrder.upsert({
      where: { reference: order.reference },
      create: {
        id: order.reference,
        reference: order.reference,
        supplierId: order.supplierId,
        requisitionId: order.requisitionId,
        rfqId: order.rfqId,
        vendor: order.vendor,
        contactName: order.contactName,
        contactEmail: order.contactEmail,
        phone: order.phone,
        currency: order.currency,
        expectedDate: order.expectedDate,
        paymentTerms: order.paymentTerms,
        notes: order.notes,
        itemsCount: order.items.length,
        status: order.status,
        createdById: userId,
        Items: {
          create: order.items.map((item) => ({
            itemId: item.itemId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total
          }))
        }
      },
      update: {
        supplierId: order.supplierId,
        requisitionId: order.requisitionId,
        rfqId: order.rfqId,
        vendor: order.vendor,
        contactName: order.contactName,
        contactEmail: order.contactEmail,
        phone: order.phone,
        currency: order.currency,
        expectedDate: order.expectedDate,
        paymentTerms: order.paymentTerms,
        notes: order.notes,
        itemsCount: order.items.length,
        status: order.status,
        Items: {
          deleteMany: {},
          create: order.items.map((item) => ({
            itemId: item.itemId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total
          }))
        }
      }
    })
    purchaseOrderResults.push(result)
    console.log(`Purchase order: ${result.reference}`)
  }

  const receipts = [
    {
      reference: generateId('RC'),
      purchaseOrderId: purchaseOrderResults[0]?.id,
      receivedAt: addDays(19),
      notes: 'Reception partielle.',
      status: ProcurementReceiptStatus.PARTIALLY_RECEIVED,
      items: [
        {
          itemId: items[0].id,
          quantityReceived: 6,
          condition: 'Bon',
          notes: 'RAS'
        }
      ]
    }
  ]

  const receiptResults: ProcurementReceipt[] = []
  for (const receipt of receipts) {
    const result = await prisma.procurementReceipt.upsert({
      where: { reference: receipt.reference },
      create: {
        id: receipt.reference,
        reference: receipt.reference,
        purchaseOrderId: receipt.purchaseOrderId,
        receivedAt: receipt.receivedAt,
        notes: receipt.notes,
        status: receipt.status,
        createdById: userId,
        Items: {
          create: receipt.items.map((item) => ({
            itemId: item.itemId,
            quantityReceived: item.quantityReceived,
            condition: item.condition,
            notes: item.notes
          }))
        }
      },
      update: {
        purchaseOrderId: receipt.purchaseOrderId,
        receivedAt: receipt.receivedAt,
        notes: receipt.notes,
        status: receipt.status,
        Items: {
          deleteMany: {},
          create: receipt.items.map((item) => ({
            itemId: item.itemId,
            quantityReceived: item.quantityReceived,
            condition: item.condition,
            notes: item.notes
          }))
        }
      }
    })
    receiptResults.push(result)
    console.log(`Receipt: ${result.reference}`)
  }

  const invoices = [
    {
      reference: generateId('SI'),
      supplierId: suppliers[0].id,
      purchaseOrderId: purchaseOrderResults[0]?.id,
      receiptId: receiptResults[0]?.id,
      invoiceDate: addDays(21),
      dueDate: addDays(45),
      currency: 'DZD',
      subtotal: 110000,
      taxes: 21000,
      total: 131000,
      notes: 'Facture fournisseur.',
      status: ProcurementSupplierInvoiceStatus.RECEIVED
    }
  ]

  for (const invoice of invoices) {
    const result = await prisma.procurementSupplierInvoice.upsert({
      where: { reference: invoice.reference },
      create: {
        id: invoice.reference,
        reference: invoice.reference,
        supplierId: invoice.supplierId,
        purchaseOrderId: invoice.purchaseOrderId,
        receiptId: invoice.receiptId,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        taxes: invoice.taxes,
        total: invoice.total,
        notes: invoice.notes,
        status: invoice.status,
        createdById: userId
      },
      update: {
        supplierId: invoice.supplierId,
        purchaseOrderId: invoice.purchaseOrderId,
        receiptId: invoice.receiptId,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        taxes: invoice.taxes,
        total: invoice.total,
        notes: invoice.notes,
        status: invoice.status
      }
    })
    console.log(`Supplier invoice: ${result.reference}`)
  }

  const contracts = [
    {
      reference: generateId('CT'),
      supplierId: suppliers[0].id,
      startDate: addDays(-20),
      endDate: addDays(340),
      value: 520000,
      currency: 'DZD',
      notes: 'Contrat annuel maintenance.',
      status: ProcurementContractStatus.ACTIVE
    }
  ]

  for (const contract of contracts) {
    const result = await prisma.procurementContract.upsert({
      where: { reference: contract.reference },
      create: {
        id: contract.reference,
        reference: contract.reference,
        supplierId: contract.supplierId,
        startDate: contract.startDate,
        endDate: contract.endDate,
        value: contract.value,
        currency: contract.currency,
        notes: contract.notes,
        status: contract.status,
        createdById: userId
      },
      update: {
        supplierId: contract.supplierId,
        startDate: contract.startDate,
        endDate: contract.endDate,
        value: contract.value,
        currency: contract.currency,
        notes: contract.notes,
        status: contract.status
      }
    })
    console.log(`Contract: ${result.reference}`)
  }

  const assets = [
    {
      reference: generateId('AS'),
      name: 'Poste de soudure MIG',
      supplierId: suppliers[1].id,
      purchaseOrderId: purchaseOrderResults[1]?.id,
      itemId: items[2].id,
      acquisitionDate: addDays(-5),
      value: 320000,
      currency: 'DZD',
      notes: 'Materiel atelier.',
      status: ProcurementAssetStatus.ACTIVE
    }
  ]

  for (const asset of assets) {
    const result = await prisma.procurementAsset.upsert({
      where: { reference: asset.reference },
      create: {
        id: asset.reference,
        reference: asset.reference,
        name: asset.name,
        supplierId: asset.supplierId,
        purchaseOrderId: asset.purchaseOrderId,
        itemId: asset.itemId,
        acquisitionDate: asset.acquisitionDate,
        value: asset.value,
        currency: asset.currency,
        notes: asset.notes,
        status: asset.status,
        createdById: userId
      },
      update: {
        name: asset.name,
        supplierId: asset.supplierId,
        purchaseOrderId: asset.purchaseOrderId,
        itemId: asset.itemId,
        acquisitionDate: asset.acquisitionDate,
        value: asset.value,
        currency: asset.currency,
        notes: asset.notes,
        status: asset.status
      }
    })
    console.log(`Asset: ${result.reference}`)
  }

  console.log('Procurement seeding completed.')
}

main()
  .catch((error) => {
    console.error('Procurement seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
