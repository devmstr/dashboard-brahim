import prisma from '../lib/db' // or wherever your prisma client is

async function main() {
  await prisma.invoiceHistory.deleteMany()
  console.log('done !')
}

main().finally(() => prisma.$disconnect())
