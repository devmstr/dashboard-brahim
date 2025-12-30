import fs from 'fs'
import path from 'path'
import {
  PrismaClient,
  Price,
  Radiator,
  Inventory,
  Invoice
} from '@prisma/client'

const DATABASE_URL = process.env.DATABASE_URL
// || 'postgres://sonerasserver:iYKzC3xpiaWece3Pmi29SD@192.168.1.199:5432/sonerasflowdb'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

const INPUT_PATH = path.join(
  process.cwd(),
  'seed',
  'radiators-with-prices.json'
)

type JsonDate = string | Date

type RadiatorSeed = Omit<Radiator, 'createdAt' | 'updatedAt'> & {
  createdAt: JsonDate
  updatedAt: JsonDate
}

type PriceSeed = Omit<Price, 'createdAt' | 'updatedAt'> & {
  createdAt: JsonDate
  updatedAt: JsonDate
}

type InventorySeed = Inventory

type InvoiceSeed = Omit<
  Invoice,
  'date' | 'createdAt' | 'updatedAt' | 'deletedAt'
> & {
  date: JsonDate | null
  createdAt: JsonDate | null
  updatedAt: JsonDate | null
  deletedAt: JsonDate | null
}

interface InvoiceItemSeed {
  id: string
  number: number
  label: string | null
  price: number | null
  amount: number | null
  quantity: number | null
  radiatorId: string | null
  invoiceId: string | null
  Invoice?: InvoiceSeed | null
}

interface RadiatorSeedEntry {
  radiator: RadiatorSeed
  price: PriceSeed | null
  inventory?: InventorySeed | null
  inventoryLevel?: number | null
  invoiceItems?: InvoiceItemSeed[]
}

function toPriceCreate(price: PriceSeed) {
  return {
    id: price.id,
    unit: price.unit,
    unitTTC: price.unitTTC,
    bulk: price.bulk,
    bulkTTC: price.bulkTTC,
    bulkThreshold: price.bulkThreshold,
    createdAt: price.createdAt,
    updatedAt: price.updatedAt
  }
}

function toPriceUpdate(price: PriceSeed) {
  return {
    unit: price.unit,
    unitTTC: price.unitTTC,
    bulk: price.bulk,
    bulkTTC: price.bulkTTC,
    bulkThreshold: price.bulkThreshold
  }
}

function toRadiatorCreate(radiator: RadiatorSeed, priceId: string | null) {
  return {
    id: radiator.id,
    partNumber: radiator.partNumber,
    category: radiator.category,
    dirId: radiator.dirId,
    cooling: radiator.cooling,
    barcode: radiator.barcode,
    label: radiator.label,
    hash: radiator.hash,
    status: radiator.status,
    type: radiator.type,
    production: radiator.production,
    fabrication: radiator.fabrication,
    fins: radiator.fins,
    pitch: radiator.pitch,
    tubeType: radiator.tubeType,
    rows: radiator.rows,
    tubeDiameter: radiator.tubeDiameter,
    betweenCollectors: radiator.betweenCollectors,
    width: radiator.width,
    position: radiator.position,
    tightening: radiator.tightening,
    perforation: radiator.perforation,
    isTinned: radiator.isTinned,
    isPainted: radiator.isPainted,
    upperCollectorLength: radiator.upperCollectorLength,
    lowerCollectorLength: radiator.lowerCollectorLength,
    upperCollectorWidth: radiator.upperCollectorWidth,
    lowerCollectorWidth: radiator.lowerCollectorWidth,
    isActive: radiator.isActive,
    inventoryId: radiator.inventoryId,
    directoryId: radiator.directoryId,
    invoiceId: radiator.invoiceId,
    priceId,
    createdAt: radiator.createdAt,
    updatedAt: radiator.updatedAt
  }
}

function toRadiatorUpdate(radiator: RadiatorSeed, priceId: string | null) {
  return {
    partNumber: radiator.partNumber,
    category: radiator.category,
    dirId: radiator.dirId,
    cooling: radiator.cooling,
    barcode: radiator.barcode,
    label: radiator.label,
    hash: radiator.hash,
    status: radiator.status,
    type: radiator.type,
    production: radiator.production,
    fabrication: radiator.fabrication,
    fins: radiator.fins,
    pitch: radiator.pitch,
    tubeType: radiator.tubeType,
    rows: radiator.rows,
    tubeDiameter: radiator.tubeDiameter,
    betweenCollectors: radiator.betweenCollectors,
    width: radiator.width,
    position: radiator.position,
    tightening: radiator.tightening,
    perforation: radiator.perforation,
    isTinned: radiator.isTinned,
    isPainted: radiator.isPainted,
    upperCollectorLength: radiator.upperCollectorLength,
    lowerCollectorLength: radiator.lowerCollectorLength,
    upperCollectorWidth: radiator.upperCollectorWidth,
    lowerCollectorWidth: radiator.lowerCollectorWidth,
    isActive: radiator.isActive,
    inventoryId: radiator.inventoryId,
    directoryId: radiator.directoryId,
    invoiceId: radiator.invoiceId,
    priceId
  }
}

function toInvoiceCreate(
  invoice: InvoiceSeed,
  clientId: string | null,
  orderId: string | null
) {
  return {
    id: invoice.id,
    reference: invoice.reference,
    date: invoice.date,
    name: invoice.name,
    address: invoice.address,
    tradeRegisterNumber: invoice.tradeRegisterNumber,
    registrationArticle: invoice.registrationArticle,
    taxIdNumber: invoice.taxIdNumber,
    type: invoice.type,
    status: invoice.status,
    paymentMode: invoice.paymentMode,
    purchaseOrder: invoice.purchaseOrder,
    deliverySlip: invoice.deliverySlip,
    discountRate: invoice.discountRate,
    discount: invoice.discount,
    refundRate: invoice.refundRate,
    refund: invoice.refund,
    stampTaxRate: invoice.stampTaxRate,
    stampTax: invoice.stampTax,
    vatRate: invoice.vatRate,
    vat: invoice.vat,
    offerValidity: invoice.offerValidity,
    guaranteeTime: invoice.guaranteeTime,
    deliveryTime: invoice.deliveryTime,
    note: invoice.note,
    total: invoice.total,
    subtotal: invoice.subtotal,
    orderId,
    clientId,
    deletedAt: invoice.deletedAt,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt
  }
}

function toInvoiceUpdate(
  invoice: InvoiceSeed,
  clientId: string | null,
  orderId: string | null
) {
  return {
    reference: invoice.reference,
    date: invoice.date,
    name: invoice.name,
    address: invoice.address,
    tradeRegisterNumber: invoice.tradeRegisterNumber,
    registrationArticle: invoice.registrationArticle,
    taxIdNumber: invoice.taxIdNumber,
    type: invoice.type,
    status: invoice.status,
    paymentMode: invoice.paymentMode,
    purchaseOrder: invoice.purchaseOrder,
    deliverySlip: invoice.deliverySlip,
    discountRate: invoice.discountRate,
    discount: invoice.discount,
    refundRate: invoice.refundRate,
    refund: invoice.refund,
    stampTaxRate: invoice.stampTaxRate,
    stampTax: invoice.stampTax,
    vatRate: invoice.vatRate,
    vat: invoice.vat,
    offerValidity: invoice.offerValidity,
    guaranteeTime: invoice.guaranteeTime,
    deliveryTime: invoice.deliveryTime,
    note: invoice.note,
    total: invoice.total,
    subtotal: invoice.subtotal,
    orderId,
    clientId,
    deletedAt: invoice.deletedAt,
    updatedAt: invoice.updatedAt
  }
}

async function main() {
  console.log('🌱 Seeding radiators from JSON...')

  if (!fs.existsSync(INPUT_PATH)) {
    throw new Error(`Seed file not found: ${INPUT_PATH}`)
  }

  const raw = fs.readFileSync(INPUT_PATH, 'utf-8')
  const entries = JSON.parse(raw) as RadiatorSeedEntry[]

  const seedInvoiceIdSet = new Set<string>()
  for (const entry of entries) {
    for (const item of entry.invoiceItems ?? []) {
      if (item.Invoice?.id) {
        seedInvoiceIdSet.add(item.Invoice.id)
      }
    }
  }

  const [inventoryIds, directoryIds, invoiceIds, clientIds, orderIds] =
    await Promise.all([
    prisma.inventory.findMany({ select: { id: true } }),
    prisma.directory.findMany({ select: { id: true } }),
    prisma.invoice.findMany({ select: { id: true } }),
    prisma.client.findMany({ select: { id: true } }),
    prisma.order.findMany({ select: { id: true } })
  ])

  const inventoryIdSet = new Set(inventoryIds.map((item) => item.id))
  const directoryIdSet = new Set(directoryIds.map((item) => item.id))
  const invoiceIdSet = new Set(invoiceIds.map((item) => item.id))
  const clientIdSet = new Set(clientIds.map((item) => item.id))
  const orderIdSet = new Set(orderIds.map((item) => item.id))

  let processedCount = 0
  let skippedCount = 0

  for (const entry of entries) {
    try {
      const priceId = entry.price?.id ?? null
      let inventoryId: string | null = null

      if (entry.price) {
        await prisma.price.upsert({
          where: { id: entry.price.id },
          update: toPriceUpdate(entry.price),
          create: toPriceCreate(entry.price)
        })
      }

      if (entry.inventory) {
        await prisma.inventory.upsert({
          where: { id: entry.inventory.id },
          update: {
            level: entry.inventory.level,
            alertAt: entry.inventory.alertAt,
            maxLevel: entry.inventory.maxLevel,
            location: entry.inventory.location
          },
          create: {
            id: entry.inventory.id,
            level: entry.inventory.level,
            alertAt: entry.inventory.alertAt,
            maxLevel: entry.inventory.maxLevel,
            location: entry.inventory.location
          }
        })
        inventoryId = entry.inventory.id
      } else if (
        typeof entry.inventoryLevel === 'number' &&
        entry.radiator.inventoryId
      ) {
        if (inventoryIdSet.has(entry.radiator.inventoryId)) {
          await prisma.inventory.update({
            where: { id: entry.radiator.inventoryId },
            data: { level: entry.inventoryLevel }
          })
          inventoryId = entry.radiator.inventoryId
        }
      }

      const radiator = entry.radiator
      const normalizedInventoryId =
        inventoryId ??
        (radiator.inventoryId && inventoryIdSet.has(radiator.inventoryId)
          ? radiator.inventoryId
          : null)

      const normalizedDirectoryId =
        radiator.directoryId && directoryIdSet.has(radiator.directoryId)
          ? radiator.directoryId
          : null
      const normalizedInvoiceId =
        radiator.invoiceId &&
        (invoiceIdSet.has(radiator.invoiceId) ||
          seedInvoiceIdSet.has(radiator.invoiceId))
          ? radiator.invoiceId
          : null

      const radiatorCreate = toRadiatorCreate(
        {
          ...radiator,
          inventoryId: normalizedInventoryId,
          directoryId: normalizedDirectoryId,
          invoiceId: normalizedInvoiceId
        },
        priceId
      )

      const radiatorUpdate = toRadiatorUpdate(
        {
          ...radiator,
          inventoryId: normalizedInventoryId,
          directoryId: normalizedDirectoryId,
          invoiceId: normalizedInvoiceId
        },
        priceId
      )

      await prisma.radiator.upsert({
        where: { id: radiator.id },
        update: radiatorUpdate,
        create: radiatorCreate
      })

      for (const invoiceItem of entry.invoiceItems ?? []) {
        const invoiceData = invoiceItem.Invoice
        const rawInvoiceId = invoiceData?.id ?? invoiceItem.invoiceId ?? null
        const normalizedInvoiceId =
          rawInvoiceId &&
          (invoiceIdSet.has(rawInvoiceId) || seedInvoiceIdSet.has(rawInvoiceId))
            ? rawInvoiceId
            : null

        if (invoiceData) {
          const normalizedClientId =
            invoiceData.clientId && clientIdSet.has(invoiceData.clientId)
              ? invoiceData.clientId
              : null
          const normalizedOrderId =
            invoiceData.orderId && orderIdSet.has(invoiceData.orderId)
              ? invoiceData.orderId
              : null

          await prisma.invoice.upsert({
            where: { id: invoiceData.id },
            update: toInvoiceUpdate(
              invoiceData,
              normalizedClientId,
              normalizedOrderId
            ),
            create: toInvoiceCreate(
              invoiceData,
              normalizedClientId,
              normalizedOrderId
            )
          })
          invoiceIdSet.add(invoiceData.id)
        }

        await prisma.invoiceItem.upsert({
          where: { id: invoiceItem.id },
          update: {
            number: invoiceItem.number,
            label: invoiceItem.label,
            price: invoiceItem.price,
            amount: invoiceItem.amount,
            quantity: invoiceItem.quantity,
            radiatorId: radiator.id,
            invoiceId: normalizedInvoiceId
          },
          create: {
            id: invoiceItem.id,
            number: invoiceItem.number,
            label: invoiceItem.label,
            price: invoiceItem.price,
            amount: invoiceItem.amount,
            quantity: invoiceItem.quantity,
            radiatorId: radiator.id,
            invoiceId: normalizedInvoiceId
          }
        })
      }

      processedCount++
      if (processedCount % 100 === 0) {
        console.log(
          `✅ Processed ${processedCount}/${entries.length} radiators`
        )
      }
    } catch (error) {
      skippedCount++
      console.error('❌ Error processing radiator:', error)
    }
  }

  console.log('✨ Seeding completed!')
  console.log(`📊 Processed: ${processedCount}`)
  console.log(`⚠️  Skipped: ${skippedCount}`)
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
