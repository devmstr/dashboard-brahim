import prisma from '../lib/db'
import invoices from '../seed/invoices.json'

async function main() {
  console.log(`Start seeding ...`)
  // Clear existing users
  await prisma.invoiceItem.deleteMany()
  await prisma.invoice.deleteMany()
  console.log(`Deleted all existing Invoices.`)

  // Create new users

  for (const data of invoices) {
    try {
      const { Client, items, histories, clientId, ...invoiceData } = data
      const invoice = await prisma.invoice.create({
        data: {
          ...invoiceData,
          orderId: undefined,
          items: {
            createMany: {
              data: items
            }
          }
        }
      })
      console.log(`Invoice ${invoice.reference} created successfully!`)
    } catch (error) {
      console.log({ message: `Invoice Creation error !`, error })
    }
  }
}

main()
