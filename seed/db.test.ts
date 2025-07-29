import prisma from '../lib/db' // or wherever your prisma client is

async function main() {
  await prisma.order.deleteMany()
  console.log('done !')
}

main().finally(() => prisma.$disconnect())
