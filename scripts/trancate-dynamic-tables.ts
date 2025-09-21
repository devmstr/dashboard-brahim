import prisma from '../lib/db'

async function resetUsersTable() {
  // For PostgreSQL / MySQL
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "invoices" RESTART IDENTITY CASCADE`
  )
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "order_batches" RESTART IDENTITY CASCADE`
  )
}

resetUsersTable()
  .then(() => {
    console.log('Invoices table reset successfully ✅')
    console.log('Orders table reset successfully ✅')
  })
  .catch((err) => {
    console.error('Error resetting table:', err)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
