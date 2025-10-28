import fs from 'fs'
import { PrismaClient, Invoice } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log(`Start Geting all invoices  ...`)

  const invoices = await prisma.invoice.findMany({
    select: {
      id: true,
      reference: true,
      date: true,
      name: true,
      address: true,
      tradeRegisterNumber: true,
      registrationArticle: true,
      taxIdNumber: true,
      type: true,
      status: true,
      paymentMode: true,
      purchaseOrder: true,
      deliverySlip: true,
      discountRate: true,
      refundRate: true,
      stampTaxRate: true,
      vat: true,
      offerValidity: true,
      guaranteeTime: true,
      deliveryTime: true,
      note: true,
      total: true,
      subtotal: true,
      orderId: true,
      clientId: true,
      deletedAt: true,
      createdAt: true,
      updatedAt: true,
      Client: true,
      items: true,
      histories: true
    }
  })

  console.log(`Found ${invoices.length} invoices.`)
  // save invoices as json file in /seeds/data
  fs.writeFileSync(
    `${process.cwd()}/seed/inoices.json`,
    JSON.stringify(invoices, null, 2)
  )
}

main().finally(() => prisma.$disconnect())
